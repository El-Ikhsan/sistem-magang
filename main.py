import os
import cv2
import numpy as np
import re
import pandas as pd
from ultralytics import YOLO
import pytesseract
import uvicorn
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, List, Optional
from difflib import SequenceMatcher
from datetime import datetime
import json
import logging
import Levenshtein
import easyocr
from PIL import Image, ImageEnhance, ImageFilter
from io import BytesIO
import textdistance
from scipy.ndimage import rotate

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Field mapping
FIELD_MAP = {
    "prov_kab": "provinsi_kabupaten",
    "nik": "nik",
    "nama": "nama",
    "ttl": "tempat_tanggal_lahir",
    "jk": "jenis_kelamin",
    "alamat": "alamat",
    "rt_rw": "rt_rw",
    "kel_desa": "kelurahan_desa",
    "kecamatan": "kecamatan",
    "agama": "agama",
    "perkawinan": "status_perkawinan",
    "pekerjaan": "pekerjaan",
    "kwg": "kewarganegaraan",
    "berlaku_hingga": "berlaku_hingga",
    "gol_darah": "golongan_darah",
    "tempat_diterbitkan": "tempat_diterbitkan",
    "tgl_diterbitkan": "tanggal_diterbitkan"
}

MODEL_PATH = "models/best.pt"

# Initialize EasyOCR reader
try:
    easyocr_reader = easyocr.Reader(['id'])
except Exception as e:
    logger.error(f"Failed to initialize EasyOCR: {e}")
    easyocr_reader = None

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"],
)

class DatasetLoader:
    def __init__(self, data_dir="data/"):
        self.data_dir = data_dir
        self.datasets = {}
        self.province_codes = {}
        self.regency_codes = {}
        self.load_datasets()
        self.load_region_codes()
    
    def load_region_codes(self):
        """Load province and regency codes for NIK validation"""
        try:
            # Load provinsi codes
            prov_file = os.path.join(self.data_dir, 'kode_provinsi.csv')
            if os.path.exists(prov_file):
                df_prov = pd.read_csv(prov_file)
                for _, row in df_prov.iterrows():
                    code = str(row['kode']).zfill(2)
                    self.province_codes[code] = row['nama'].upper()
            
            # Load kabupaten/kota codes
            kab_file = os.path.join(self.data_dir, 'kode_kabupaten.csv')
            if os.path.exists(kab_file):
                df_kab = pd.read_csv(kab_file)
                for _, row in df_kab.iterrows():
                    prov_code = str(row['kode_provinsi']).zfill(2)
                    kab_code = str(row['kode_kabupaten']).zfill(2)
                    full_code = prov_code + kab_code
                    self.regency_codes[full_code] = row['nama'].upper()
                    
        except Exception as e:
            logger.error(f"Error loading region codes: {e}")
    
    def load_datasets(self):
        """Load all CSV datasets with flexible column detection"""
        try:
            csv_files = {
                'pekerjaan': 'daftar_pekerjaan.csv',
                'desa_kelurahan': 'data_desakelurahan.csv',
                'kecamatan': 'data_kecamatan.csv',
                'kabupaten_kota': 'nama_kotakab.csv',
                'provinsi': 'data_provinsi.csv',
                'agama': 'data_agama.csv',
                'kewarganegaraan': 'data_kewarganegaraan.csv',
                'golongan_darah': 'data_goldar.csv',
                'status_perkawinan': 'status_perkawinan.csv',
                'jenis_kelamin': 'JENIS_KELAMIN.csv',
            }
            
            for key, filename in csv_files.items():
                file_path = os.path.join(self.data_dir, filename)
                if os.path.exists(file_path):
                    try:
                        df = pd.read_csv(file_path)
                        
                        column_name = df.columns[0]
                        
                        # Load data and clean
                        data = df[column_name].dropna().astype(str).str.upper().str.strip().tolist()
                        self.datasets[key] = list(set(data))  # Remove duplicates
                        
                        logger.info(f"Loaded {len(self.datasets[key])} entries for {key}")
                        
                    except Exception as e:
                        logger.error(f"Error loading {file_path}: {e}")
                        self.datasets[key] = []
                else:
                    logger.warning(f"File not found: {file_path}")
                    self.datasets[key] = []
                    
        except Exception as e:
            logger.error(f"Error in load_datasets: {e}")
            for key in csv_files.keys():
                self.datasets[key] = []

    def find_best_match(self, text: str, dataset_key: str, threshold: float = 0.7) -> str:
        """Enhanced fuzzy string matching using Levenshtein distance"""
        if not text or dataset_key not in self.datasets or not self.datasets[dataset_key]:
            return text
        
        text_upper = text.upper().strip()
        best_match = text_upper
        best_score = 0
        
        if text_upper in self.datasets[dataset_key]:
            return text_upper
        
        for item in self.datasets[dataset_key]:
            score = Levenshtein.ratio(text_upper, item)
            
            if score > best_score and score >= threshold:
                best_score = score
                best_match = item
        
        return best_match if best_score > threshold else text_upper

dataset_loader = DatasetLoader()

def correct_skew(img_blur, delta=1, limit=90):
    """Correct image skew using rotation"""
    def determine_score(arr, angle):
        data = rotate(arr, angle, reshape=False, order=0)
        histogram = np.sum(data, axis=1, dtype=float)
        score = np.sum((histogram[1:] - histogram[:-1]) ** 2, dtype=float)
        return histogram, score

    gray = cv2.cvtColor(img_blur, cv2.COLOR_BGR2GRAY)
    thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)[1]

    scores = []
    angles = np.arange(-limit, limit + delta, delta)
    for angle in angles:
        histogram, score = determine_score(thresh, angle)
        scores.append(score)

    best_angle = angles[scores.index(max(scores))]

    (h, w) = img_blur.shape[:2]
    center = (w // 2, h // 2)
    M = cv2.getRotationMatrix2D(center, best_angle, 1.0)
    corrected = cv2.warpAffine(img_blur, M, (w, h), flags=cv2.INTER_CUBIC, \
                                borderMode=cv2.BORDER_REPLICATE)

    return best_angle, corrected

def enhance_image_quality(image):
    """Enhanced image preprocessing for better OCR"""
    # Convert to grayscale
    if len(image.shape) == 3:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    else:
        gray = image.copy()
    
    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8,8))
    enhanced = clahe.apply(gray)
    
    blurred = cv2.GaussianBlur(enhanced, (1, 1), 0)
    
    kernel = np.array([[-1,-1,-1], [-1,9,-1], [-1,-1,-1]])
    sharpened = cv2.filter2D(blurred, -1, kernel)
    
    return sharpened

def advanced_preprocess_roi(roi, field_type="general"):
    """Advanced preprocessing based on field type with multiple techniques"""
    
    enhanced = enhance_image_quality(roi)
    
    if field_type == "nik":
        scale_factor = 3
        roi_resized = cv2.resize(enhanced, None, fx=scale_factor, fy=scale_factor, interpolation=cv2.INTER_CUBIC)
        _, roi_thresh = cv2.threshold(roi_resized, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
    elif field_type == "name":
        scale_factor = 2.5
        roi_resized = cv2.resize(enhanced, None, fx=scale_factor, fy=scale_factor, interpolation=cv2.INTER_CUBIC)
        roi_thresh = cv2.adaptiveThreshold(roi_resized, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)
        
    elif field_type == "address":
        scale_factor = 2
        roi_resized = cv2.resize(enhanced, None, fx=scale_factor, fy=scale_factor, interpolation=cv2.INTER_CUBIC)
        roi_thresh = cv2.adaptiveThreshold(roi_resized, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 15, 5)
        
    elif field_type == "date":
        scale_factor = 3
        roi_resized = cv2.resize(enhanced, None, fx=scale_factor, fy=scale_factor, interpolation=cv2.INTER_CUBIC)
        _, roi_thresh = cv2.threshold(roi_resized, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
    else:
        scale_factor = 2.5
        roi_resized = cv2.resize(enhanced, None, fx=scale_factor, fy=scale_factor, interpolation=cv2.INTER_CUBIC)
        roi_thresh = cv2.adaptiveThreshold(roi_resized, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)
    
    return roi_thresh

def clean_text(text: str, field_type: str = "") -> str:
    """Clean and validate text based on field type"""
    text = text.strip()
    
    text = re.sub(r'[^\w\s/\-.,]', '', text)
    text = re.sub(r'\s+', ' ', text)
    
    if field_type == "nik":
        # NIK harus 16 digits
        text = re.sub(r'\D', '', text)
        if len(text) > 16:
            text = text[:16]
        elif len(text) < 16:
            text = text.ljust(16, '0')[:16]
        return clean_nik(text)
    
    elif field_type == "rt_rw":
        # Format RT/RW (e.g., 001/005)
        text = re.sub(r'[^\d/]', '', text)
        parts = text.split('/')
        if len(parts) == 2:
            rt, rw = parts
            rt = rt.zfill(3)
            rw = rw.zfill(3)
            text = f"{rt}/{rw}"
        return clean_rt_rw(text)
    
    elif field_type == "golongan_darah":
        # Goloongan darah harus A, B, AB, or O
        text = text.upper()
        if re.match(r'^(A|B|AB|O)[+\-]?$', text):
            return text
        else:
            return "-"  # Default
    
    elif field_type == "ttl":
        # Format: Tempat, DD-MM-YYYY
        text = re.sub(r'[^\w\s,-]', '', text)
    
    elif field_type in ["tanggal_diterbitkan", "berlaku_hingga"]:
        # Date format: DD-MM-YYYY
        text = re.sub(r'[^\d-]', '', text)
        if re.match(r'\d{2}-\d{2}-\d{4}', text):
            return text
    
    elif field_type == "jenis_kelamin":
        # Gender harus LAKI-LAKI or PEREMPUAN
        text = text.upper()
        if "LAKI" in text or "PRIA" in text:
            return "LAKI-LAKI"
        elif "PEREMPUAN" in text or "WANITA" in text:
            return "PEREMPUAN"
    
    elif field_type == "status_perkawinan":
        # status
        text = text.upper()
        if "KAWIN" in text:
            return "KAWIN"
        elif "BELUM" in text:
            return "BELUM KAWIN"
        elif "CERAI" in text:
            if "HIDUP" in text:
                return "CERAI HIDUP"
            elif "MATI" in text:
                return "CERAI MATI"
            return "CERAI"
    
    elif field_type == "kewarganegaraan":
        return clean_kewarganegaraan(text)
    
    return text

def clean_nik(text: str) -> str:
    """Enhanced NIK cleaning with better OCR error handling"""
    nik = re.sub(r'\D', '', text)
    
    # Fix OCR errors in numbers
    nik = (nik.replace('O', '0').replace('o', '0')
              .replace('l', '1').replace('I', '1')
              .replace('Z', '2').replace('z', '2')
              .replace('S', '5').replace('s', '5')
              .replace('B', '8').replace('b', '8')
              .replace('!', '1').replace(')', '1')
              .replace('|', '1').replace(']', '1')
              .replace('b', '6').replace('?', '7')
              .replace('D', '0'))
    
    if len(nik) > 16:
        nik = nik[:16]
    elif len(nik) < 16:
        if len(nik) == 15:
            nik = '3' + nik  
        elif len(nik) == 14:
            nik = nik.ljust(16, '0')[:16]
        else:
            return nik
    
    return nik

def clean_rt_rw(text: str) -> str:
    """Enhanced RT/RW cleaning with better OCR error handling"""
    text = re.sub(r'[^\d/]', '', text)
    
    text = (text.replace('O', '0').replace('o', '0')
              .replace('l', '1').replace('I', '1')
              .replace('Z', '2').replace('z', '2')
              .replace('S', '5').replace('s', '5')
              .replace('B', '8').replace('b', '8'))
    
    if '/' in text:
        parts = text.split('/')
        if len(parts) == 2:
            rt, rw = parts
            rt = rt.zfill(3)[:3]
            rw = rw.zfill(3)[:3]
            return f"{rt}/{rw}"
        else:
            rt = parts[0].zfill(3)[:3] if len(parts) > 0 else "000"
            rw = parts[1].zfill(3)[:3] if len(parts) > 1 else "000"
            return f"{rt}/{rw}"
    else:
        if len(text) >= 6:
            rt = text[:3].zfill(3)
            rw = text[3:6].zfill(3)
            return f"{rt}/{rw}"
        elif len(text) >= 3:
            rt = text[:3].zfill(3)
            rw = "000"  
            return f"{rt}/{rw}"
        else:
            rt = text.zfill(3)[:3] if text else "000"
            return f"{rt}/000"

def clean_kewarganegaraan(text: str) -> str:
    """Enhanced citizenship cleaning with better pattern matching"""
    text = text.upper().strip()
    
    corrections = {
        'HM': 'WNI',
        'WN': 'WNI', 
        'W': 'WNI',
        'H': 'WNI',
        'M': 'WNI',
        'N': 'WNI',
        'NI': 'WNI'
    }
    
    if text in ['WNI', 'WARGA NEGARA INDONESIA']:
        return "WNI"
    elif text in ['WNA', 'WARGA NEGARA ASING']:
        return "WNA"
    
    if re.search(r'WNI|INDONESIA|WN\s*I', text):
        return "WNI"
    elif re.search(r'WNA|ASING|FOREIGN', text):
        return "WNA"
    
    for error, correction in corrections.items():
        if text == error:
            return correction
    
    if len(text) == 1 and text in ['W', 'N', 'I', 'H', 'M']:
        return "WNI"
    
    return "WNI"

def validate_nik(nik: str) -> bool:
    """Enhanced NIK validation with region code checking"""
    if not nik or len(nik) != 16 or not nik.isdigit():
        return False
    
    try:
        prov_code = nik[:2]
        if prov_code not in dataset_loader.province_codes:
            return False
        
        regency_code = nik[:4]
        if regency_code not in dataset_loader.regency_codes:
            return False
        
        day = int(nik[6:8])
        if not (1 <= day <= 71): 
            return False
        
        month = int(nik[8:10])
        if not (1 <= month <= 12):
            return False
        
        year = int(nik[10:12])
        current_year = datetime.now().year % 100
        if not (0 <= year <= current_year + 10):
            return False
        
        return True
    except:
        return False

def clean_nama(text: str) -> str:
    """Enhanced name cleaning"""
    text = re.sub(r'\s+', ' ', text).strip()
    
    text = text.upper()
    
    text = re.sub(r"[^A-Z\s\.',-]", "", text)
    
    corrections = {
        '1': 'I', '0': 'O', '5': 'S', '3': 'E', 
        '4': 'A', '7': 'T', '8': 'B', '2': 'Z'
    }
    
    for wrong, right in corrections.items():
        text = text.replace(wrong, right)
    
    text = text.replace(":", "")
    
    words = text.split()
    filtered_words = []
    for word in words:
        if len(word) > 1 or word in ['A', 'I']:
            filtered_words.append(word)
    
    result = ' '.join(filtered_words)
    
    result = re.sub(r'[.,]+$', '', result)
    
    return result.strip()

def extract_date(date_text):
    """Extract date from text with various formats"""
    try:
        match = re.search(r"(\d{1,2})([-/\.])(\d{2})\2(\d{4})", date_text)
        if match:
            day, month, year = int(match.group(1)), int(match.group(3)), int(match.group(4))
            return datetime(year, month, day)
        parsed_date = datetime.strptime(date_text, "%Y %m-%d")
        return parsed_date
    except ValueError:
        pass

    date_pattern = r"(\d{1,4})(?:[-/\.])(\d{1,2})(?:[-/\.])(\d{2,4})"
    match = re.search(date_pattern, date_text)
    if match:
        day, month, year = map(lambda x: int(x) if 1 <= int(x) <= 31 else None, match.groups())
        if day is not None and month is not None and year is not None:
            try:
                return datetime(year, month, day)
            except ValueError:
                return None
    return None

def parse_ttl(text: str) -> Dict[str, str]:
    """Parse tempat tanggal lahir and return both place and date separately"""
    text = text.replace('\n', ' ').strip().upper()
    
    place_corrections = {
        'JKT': 'JAKARTA', 'JKRTA': 'JAKARTA', 'JKR': 'JAKARTA',
        'SBY': 'SURABAYA', 'SRBY': 'SURABAYA',
        'BDG': 'BANDUNG', 'BDNG': 'BANDUNG',
        'MDN': 'MEDAN', 'SMG': 'SEMARANG',
        'DPS': 'DENPASAR', 'YGY': 'YOGYAKARTA',
        'YOGYA': 'YOGYAKARTA', 'JOGJA': 'YOGYAKARTA'
    }
    
    date_patterns = [
        r"(\d{1,2})([-/\.])(\d{1,2})\2(\d{2,4})",
        r"(\d{1,2})\s+(\w+)\s+(\d{4})",
        r"(\d{1,2})[-/\.](\d{1,2})[-/\.](\d{2,4})"
    ]
    
    for pattern in date_patterns:
        match = re.search(pattern, text)
        if match:
            date_part = match.group(0)
            
            place = text.replace(date_part, '').strip()
            
            place = re.sub(r'\s+', ' ', place)
            place = re.sub(r'[,-]+$', '', place).strip()
            
            for abbrev, full_name in place_corrections.items():
                if place == abbrev or abbrev in place:
                    place = full_name
                    break
            
            date_obj = extract_date(date_part)
            if date_obj:
                return {
                    "tempat_lahir": place,
                    "tgl_lahir": date_obj.strftime('%d-%m-%Y')
                }
    
    place_match = re.search(r"([A-Z][A-Z\s]*)", text)
    if place_match:
        place = place_match.group(1).strip()
        for abbrev, full_name in place_corrections.items():
            if place == abbrev:
                return {"tempat_lahir": full_name, "tgl_lahir": ""}
        return {"tempat_lahir": place, "tgl_lahir": ""}
    
    return {"tempat_lahir": text, "tgl_lahir": ""}

def clean_alamat(text: str) -> str:
    """Enhanced address cleaning"""
    text = re.sub(r'\s+', ' ', text).strip().upper()

    corrections = {
        'JL.': 'JALAN', 'JL': 'JALAN', 'JLN': 'JALAN', 'JALAN.': 'JALAN',
        'GG.': 'GANG', 'GG': 'GANG', 'GANG.': 'GANG',
        'NO.': 'NO', 'NMR': 'NO', 'NOMOR': 'NO',
        'RT.': 'RT', 'RW.': 'RW',
        'KEL.': 'KELURAHAN', 'KEC.': 'KECAMATAN',
        'DS.': 'DESA', 'KP.': 'KAMPUNG', 'KMP': 'KAMPUNG'
    }
    
    for abbrev, full_form in corrections.items():
        text = re.sub(r'\b' + re.escape(abbrev) + r'\b', full_form, text)
    
    text = re.sub(r'[|]', 'I', text)  
    text = re.sub(r'[0O](?=[A-Z])', 'O', text)  
    
    return text.strip()

def clean_field_with_dataset(text: str, field_type: str) -> str:
    """Clean field using dataset matching"""
    text = re.sub(r'\s+', ' ', text).strip().upper()
    
    text = re.sub(r'[|]', 'I', text)
    text = re.sub(r'[0](?=[A-Z])', 'O', text)
    
    return dataset_loader.find_best_match(text, field_type, threshold=0.7)

def extract_text_with_ocr(roi, field_type="", ocr_choice="pytesseract"):
    """Extract text using specified OCR engine"""
    try:
        if ocr_choice == "pytesseract":
            roi_processed = cv2.resize(roi, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)
            gray = cv2.cvtColor(roi_processed, cv2.COLOR_BGR2GRAY)
            _, threshed = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
            
            config = "--oem 3 --psm 6"
            if field_type in ["nik", "rt_rw"]:
                config = "--oem 3 --psm 8 -c tessedit_char_whitelist=0123456789/"
            elif field_type in ["golongan_darah"]:
                config = "--oem 3 --psm 8 -c tessedit_char_whitelist=ABO+-"
            
            extracted_text = pytesseract.image_to_string(threshed, lang="ind", config=config)
            
        elif ocr_choice == "easyocr" and easyocr_reader:
            ocr_result = easyocr_reader.readtext(roi, workers=0)
            extracted_text = " ".join([detection[1] for detection in ocr_result])
        else:
            extracted_text = ""
            
        return clean_text(extracted_text, field_type)
        
    except Exception as e:
        logger.error(f"OCR error for {field_type}: {e}")
        return ""

def field_specific_ocr(field: str, roi: np.ndarray, ocr_choice: str = "pytesseract") -> str:
    """Enhanced field-specific OCR with multiple attempts"""
    
    result = extract_text_with_ocr(roi, field, ocr_choice)
    
    if not result or (field == "nik" and len(result) != 16):
        alternative_choice = "easyocr" if ocr_choice == "pytesseract" else "pytesseract"
        alternative_result = extract_text_with_ocr(roi, field, alternative_choice)
        
        if field == "nik":
            if validate_nik(alternative_result):
                result = alternative_result
        elif len(alternative_result) > len(result):
            result = alternative_result
    
    if field == "nik":
        return clean_nik(result)
    elif field == "nama":
        return clean_nama(result)
    elif field in ["ttl", "tempat_tanggal_lahir"]:
        return result  
    elif field == "alamat":
        return clean_alamat(result)
    elif field == "rt_rw":
        return clean_rt_rw(result)
    elif field == "kelurahan_desa":
        return clean_field_with_dataset(result, 'desa_kelurahan')
    elif field == "kecamatan":
        return clean_field_with_dataset(result, 'kecamatan')
    elif field == "provinsi_kabupaten":
        kabupaten_match = clean_field_with_dataset(result, 'kabupaten_kota')
        provinsi_match = clean_field_with_dataset(result, 'provinsi')
        
        if len(kabupaten_match) > len(provinsi_match):
            return kabupaten_match
        else:
            return provinsi_match if provinsi_match != result else kabupaten_match
    elif field == "pekerjaan":
        return clean_field_with_dataset(result, 'pekerjaan')
    elif field == "jenis_kelamin":
        text_upper = result.upper().strip()
        if textdistance.levenshtein(text_upper, "LAKI-LAKI") < textdistance.levenshtein(text_upper, "PEREMPUAN"):
            return "LAKI-LAKI"
        else:
            return "PEREMPUAN"
    elif field == "agama":
        return clean_field_with_dataset(result, 'agama')
    elif field == "status_perkawinan":
        text_upper = result.upper().strip()
        if "KAWIN" in text_upper and "BELUM" not in text_upper:
            return "KAWIN"
        elif "BELUM" in text_upper:
            return "BELUM KAWIN"
        elif "CERAI" in text_upper:
            return "CERAI HIDUP" if "HIDUP" in text_upper else "CERAI MATI"
        return clean_field_with_dataset(result, 'status_perkawinan')
    elif field == "kewarganegaraan":
        text_upper = result.upper().strip()
        if "WNI" in text_upper or "INDONESIA" in text_upper:
            return "WNI"
        elif "WNA" in text_upper:
            return "WNA"
        return clean_field_with_dataset(result, 'kewarganegaraan')
    elif field == "golongan_darah":
        match = re.search(r'([ABO]|AB)[\s]*([+-]?)', result.upper())
        if match:
            blood_type = match.group(1)
            rh_factor = match.group(2) if match.group(2) else "+"
            return f"{blood_type}{rh_factor}"
        return clean_field_with_dataset(result, 'golongan_darah')
    elif field == "berlaku_hingga":
        text_upper = result.upper().strip()
        if "SEUMUR" in text_upper or "HIDUP" in text_upper:
            return "SEUMUR HIDUP"
        date_match = re.search(r'(\d{2}[-/]\d{2}[-/]\d{4})', result)
        if date_match:
            return date_match.group(1).replace('/', '-')
        return result.strip()
    else:
        return re.sub(r'\s+', ' ', result).strip()

def post_process_extraction(extracted: Dict) -> Dict:
    """Enhanced post-processing with cross-validation"""
    
    if "nik" in extracted and len(extracted["nik"]) == 16 and extracted["nik"].isdigit():
        try:
            day = int(extracted["nik"][6:8])
            if day > 40:
                nik_gender = "PEREMPUAN"
                day = day - 40  
            else:
                nik_gender = "LAKI-LAKI"
            
            if not extracted.get("jenis_kelamin") or extracted["jenis_kelamin"] not in ["LAKI-LAKI", "PEREMPUAN"]:
                extracted["jenis_kelamin"] = nik_gender
                
            if not extracted.get("tgl_lahir"):
                year = int(extracted["nik"][10:12])
                month = int(extracted["nik"][8:10])
                
                current_year = datetime.now().year
                if year <= (current_year % 100):
                    full_year = 2000 + year
                else:
                    full_year = 1900 + year
                
                birth_date = f"{day:02d}-{month:02d}-{full_year}"
                extracted["tgl_lahir"] = birth_date
                        
        except:
            pass
    
    prov_kab = extracted.get("provinsi_kabupaten", "")
    kabupaten = ""
    provinsi = prov_kab
    
    if "KOTA" in prov_kab:
        provinsi, kabupaten = prov_kab.split("KOTA", 1)
        kabupaten = "KOTA " + kabupaten.strip()
    elif "KABUPATEN" in prov_kab:
        provinsi, kabupaten = prov_kab.split("KABUPATEN", 1)
        kabupaten = "KABUPATEN " + kabupaten.strip()
    elif "JAKARTA" in prov_kab:
        provinsi, kabupaten = prov_kab.split("JAKARTA", 1)
        kabupaten = kabupaten.strip()
        provinsi = "PROVINSI DKI JAKARTA"
    
    extracted["provinsi"] = provinsi.strip()
    extracted["kabupaten"] = kabupaten.strip()
    
    ttl_text = extracted.get("tempat_tanggal_lahir", "")
    if ttl_text:
        ttl_parts = parse_ttl(ttl_text)
        extracted["tempat_lahir"] = ttl_parts.get("tempat_lahir", "")
        if not extracted.get("tgl_lahir"):
            extracted["tgl_lahir"] = ttl_parts.get("tgl_lahir", "")
    
    for field, value in extracted.items():
        if not field.startswith('_confidence_'):
            if not value or str(value).strip() == "":
                extracted[field] = ""
            else:
                extracted[field] = str(value).strip()
    
    return extracted

def extract_fields(image_path: str, model_path: str, ocr_choice: str = "pytesseract") -> Dict:
    """Main extraction function with improved processing"""
    try:
        model = YOLO(model_path)
        
        img = cv2.imread(image_path)
        if img is None:
            raise ValueError("Could not load image")
        
        img = cv2.resize(img, (640, 480))
        img_blur = cv2.GaussianBlur(img, (3, 3), 0)
        
        angle, corrected = correct_skew(img_blur)
        logger.info(f'Rotate angle: {angle}')
        
        img_pil = Image.fromarray(cv2.cvtColor(corrected, cv2.COLOR_BGR2RGB))
        img_pil = img_pil.filter(ImageFilter.SHARPEN)
        enhancer = ImageEnhance.Contrast(img_pil)
        img_pil = enhancer.enhance(2)
        img_cv2 = cv2.cvtColor(np.array(img_pil), cv2.COLOR_RGB2BGR)
        
        results = model.predict(np.array(img_cv2), imgsz=(480, 640), iou=0.7, conf=0.5)
        pil_img = Image.fromarray(cv2.cvtColor(img_cv2, cv2.COLOR_BGR2RGB))

        extracted = {}
        
        for result in results:
            for box in result.boxes:
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)
                class_id = box.cls[0].item()
                confidence = box.conf[0].item()
                class_name = model.names[class_id]
                fieldname = FIELD_MAP.get(class_name)

                if fieldname is None:
                    continue

                cropped_img_pil = pil_img.crop((x1, y1, x2, y2))
                cropped_img_cv2 = cv2.cvtColor(np.array(cropped_img_pil), cv2.COLOR_RGB2BGR)

                try:
                    value = field_specific_ocr(fieldname, cropped_img_cv2, ocr_choice)
                    
                    logger.info(f"Extracted {fieldname}: '{value}' (confidence: {confidence:.2f})")
                    
                    if fieldname not in extracted or confidence > extracted.get(f"_confidence_{fieldname}", 0):
                        extracted[fieldname] = value
                        extracted[f"_confidence_{fieldname}"] = confidence
                                
                except Exception as e:
                    logger.error(f"Error processing field {fieldname}: {e}")
                    continue
        
        for fieldname in FIELD_MAP.values():
            if fieldname not in extracted:
                extracted[fieldname] = ""
        
        extracted = post_process_extraction(extracted)
        
        result = {k: v for k, v in extracted.items() if not k.startswith('_confidence_')}
        
        logger.info(f"Final extraction results: {result}")
        return result
        
    except Exception as e:
        logger.error(f"Error in extract_fields: {e}")
        return {fieldname: "" for fieldname in FIELD_MAP.values()}

@app.post("/extract-ktp")
async def extract_ktp(file: UploadFile = File(...), ocr_choice: str = "pytesseract"):
    """API endpoint for KTP extraction with enhanced error handling"""
    temp_path = None
    
    try:
        if not file.content_type or not file.content_type.startswith('image/'):
            return {"success": False, "message": "File must be an image", "data": {}}
        
        if ocr_choice not in ["pytesseract", "easyocr"]:
            return {"success": False, "message": "Invalid OCR choice. Use 'pytesseract' or 'easyocr'", "data": {}}
        
        temp_path = f"tmp_ktp_{file.filename}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        with open(temp_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        logger.info(f"Processing uploaded file: {file.filename} with OCR: {ocr_choice}")
        
        extracted = extract_fields(temp_path, MODEL_PATH, ocr_choice)
        
        response_data = {
            "nik": extracted.get('nik', ''),
            "nama": extracted.get('nama', ''),
            "tempat_lahir": extracted.get('tempat_lahir', ''),
            "tgl_lahir": extracted.get('tgl_lahir', ''),
            "tempat_tanggal_lahir": extracted.get('tempat_tanggal_lahir', ''), 
            "jenis_kelamin": extracted.get('jenis_kelamin', ''),
            "agama": extracted.get('agama', ''),
            "status_perkawinan": extracted.get('status_perkawinan', ''),
            "pekerjaan": extracted.get('pekerjaan', ''),
            "alamat": extracted.get('alamat', ''),
            "rt_rw": extracted.get('rt_rw', ''),
            "kel_desa": extracted.get('kelurahan_desa', ''),
            "kecamatan": extracted.get('kecamatan', ''),
            "kabupaten": extracted.get('kabupaten', ''),
            "provinsi": extracted.get('provinsi', ''),
            "provinsi_kabupaten": extracted.get('provinsi_kabupaten', ''), 
            "kewarganegaraan": extracted.get('kewarganegaraan', ''),
            "golongan_darah": extracted.get('golongan_darah', ''),
            "berlaku_hingga": extracted.get('berlaku_hingga', ''),
            "tempat_diterbitkan": extracted.get('tempat_diterbitkan', ''),
            "tanggal_diterbitkan": extracted.get('tanggal_diterbitkan', '')
        }
        
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)
        
        return {"success": True, "message": "OCR Success!", "data": response_data}
        
    except Exception as e:
        logger.error(f"Error in extract_ktp: {e}")
        
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except:
                pass
        
        return {"success": False, "message": f"Error processing image: {str(e)}", "data": {}}

@app.get("/health")
async def health():
    """Health check endpoint with detailed status"""
    return {
        "status": "ok",
        "datasets_loaded": len([k for k, v in dataset_loader.datasets.items() if v]),
        "model_path": MODEL_PATH,
        "model_exists": os.path.exists(MODEL_PATH),
        "easyocr_available": easyocr_reader is not None
    }

if __name__ == "__main__":
    print("=" * 50)
    print("KTP Extraction Service Starting...")
    print("=" * 50)
    print(f"Model path: {MODEL_PATH}")
    print(f"Model exists: {os.path.exists(MODEL_PATH)}")
    print(f"Datasets loaded: {len([k for k, v in dataset_loader.datasets.items() if v])}")
    print(f"EasyOCR available: {easyocr_reader is not None}")
    
    for key, data in dataset_loader.datasets.items():
        print(f"  - {key}: {len(data)} entries")
    
    print("=" * 50)
    
    uvicorn.run("main:app", host="0.0.0.0", port=8100, reload=False)
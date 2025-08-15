import React, { useState, useCallback, useRef } from 'react';
import { Button } from 'primereact/button';
import { FileUpload } from 'primereact/fileupload';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { scanKtp } from '../services/api.js';
import { InputTextarea } from 'primereact/inputtextarea';

function KtpScannerModal({ visible, onClose, onSave }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useRef(null);

  const handleFileSelect = (e) => {
    if (e.files && e.files.length > 0) {
      setSelectedFile(e.files[0]);
    }
  };

  const handleScanClick = useCallback(async () => {
    if (!selectedFile) {
      toast.current.show({ severity: 'warn', summary: 'Peringatan', detail: 'Silakan pilih file KTP.' });
      return;
    }
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('ktp_image', selectedFile);
      const dataFromApi = await scanKtp(formData);
      setExtractedData(dataFromApi);
    } catch (err) {
      toast.current.show({ severity: 'error', summary: 'Error', detail: err.message });
    } finally {
      setIsLoading(false);
    }
  }, [selectedFile]);

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setExtractedData(prev => ({ ...prev, [name]: value }));
  };

  const handleFinalSave = () => {
    onSave(extractedData); // Kirim data kembali ke halaman utama
    onClose(); // Tutup modal
  };

  const footerContent = (
    <div>
      <Button label="Batal" icon="pi pi-times" onClick={onClose} className="p-button-text" />
      <Button label="Gunakan Data Ini" icon="pi pi-check" onClick={handleFinalSave} autoFocus disabled={!extractedData} />
    </div>
  );

  return (
    <>
      <Toast ref={toast} />
      <Dialog header="Scan KTP" visible={visible} style={{ width: '50vw' }} onHide={onClose} footer={footerContent}>
        {!extractedData ? (
          <div className="text-center">
            <p className="mb-4">Upload gambar KTP untuk mengisi form secara otomatis.</p>
            <FileUpload
              name="ktp_scan"
              accept="image/*"
              maxFileSize={5000000}
              customUpload
              uploadHandler={handleFileSelect}
              chooseLabel={selectedFile ? selectedFile.name : "Pilih Gambar"}
              mode="basic"
            />
            <Button label={isLoading ? 'Memindai...' : 'Scan KTP'} icon="pi pi-camera" onClick={handleScanClick} disabled={isLoading || !selectedFile} className="mt-4" />
          </div>
        ) : (
         <div>
            <p className="mb-4">Periksa data hasil scan, perbaiki jika perlu.</p>
            <div className="p-fluid formgrid grid">
                <div className="field col-12 md:col-6">
                <label htmlFor="nik">NIK</label>
                <InputText id="nik" name="nik" value={extractedData.nik || ''} onChange={handleFormChange} />
                </div>
                <div className="field col-12 md:col-6">
                <label htmlFor="nama">Nama Lengkap</label>
                <InputText id="nama" name="nama" value={extractedData.nama || ''} onChange={handleFormChange} />
                </div>
                <div className="field col-12">
                <label htmlFor="tempat_tgl_lahir">Tempat/Tgl Lahir</label>
                <InputText id="tempat_tgl_lahir" name="tempat_tgl_lahir" value={extractedData.tempat_tgl_lahir || ''} onChange={handleFormChange} />
                </div>
                <div className="field col-12">
                <label htmlFor="alamat">Alamat</label>
                <InputTextarea id="alamat" name="alamat" value={extractedData.alamat || ''} onChange={handleFormChange} rows={3} />
                </div>
                <div className="field col-12 md:col-6">
                <label htmlFor="rt_rw">RT/RW</label>
                <InputText id="rt_rw" name="rt_rw" value={extractedData.rt_rw || ''} onChange={handleFormChange} />
                </div>
                <div className="field col-12 md:col-6">
                <label htmlFor="kecamatan">Kecamatan</label>
                <InputText id="kecamatan" name="kecamatan" value={extractedData.kecamatan || ''} onChange={handleFormChange} />
                </div>
                <div className="field col-12 md:col-6">
                <label htmlFor="agama">Agama</label>
                <InputText id="agama" name="agama" value={extractedData.agama || ''} onChange={handleFormChange} />
                </div>
                <div className="field col-12 md:col-6">
                <label htmlFor="status_perkawinan">Status Perkawinan</label>
                <InputText id="status_perkawinan" name="status_perkawinan" value={extractedData.status_perkawinan || ''} onChange={handleFormChange} />
                </div>
                <div className="field col-12">
                <label htmlFor="pekerjaan">Pekerjaan</label>
                <InputText id="pekerjaan" name="pekerjaan" value={extractedData.pekerjaan || ''} onChange={handleFormChange} />
                </div>
                <div className="field col-12 md:col-4">
                <label htmlFor="kewarganegaraan">Kewarganegaraan</label>
                <InputText id="kewarganegaraan" name="kewarganegaraan" value={extractedData.kewarganegaraan || ''} onChange={handleFormChange} />
                </div>
                <div className="field col-12 md:col-4">
                <label htmlFor="gol_darah">Gol. Darah</label>
                <InputText id="gol_darah" name="gol_darah" value={extractedData.gol_darah || ''} onChange={handleFormChange} />
                </div>
                <div className="field col-12 md:col-4">
                <label htmlFor="berlaku_hingga">Berlaku Hingga</label>
                <InputText id="berlaku_hingga" name="berlaku_hingga" value={extractedData.berlaku_hingga || ''} onChange={handleFormChange} />
                </div>
            </div>
            </div>
        )}
      </Dialog>
    </>
  );
}

export default KtpScannerModal;

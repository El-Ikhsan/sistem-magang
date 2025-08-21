import React, { useState, useCallback, useRef } from 'react';
import { Button } from 'primereact/button';
import { FileUpload } from 'primereact/fileupload';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { scanKtp } from '../services/api';
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
      toast.current.show({
        severity: 'warn',
        summary: 'Peringatan',
        detail: 'Silakan pilih file KTP terlebih dahulu.',
        life: 3000
      });
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      const response = await scanKtp(formData);
      if (response.success) {
        setExtractedData(response.data);
        toast.current.show({
          severity: 'success',
          summary: 'Berhasil',
          detail: 'Data KTP berhasil diekstrak',
          life: 3000
        });
      } else {
        throw new Error(response.message || 'Gagal mengekstrak data KTP');
      }
    } catch (err) {
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: err.message || 'Terjadi kesalahan saat memindai KTP',
        life: 5000
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedFile]);

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setExtractedData(prev => ({ ...prev, [name]: value }));
  };

  const handleFinalSave = () => {
    if (extractedData) {
      onSave(extractedData);
      toast.current.show({
        severity: 'success',
        summary: 'Berhasil',
        detail: 'Data KTP berhasil digunakan'
      });
      onClose();
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setExtractedData(null);
  };

  const footerContent = (
    <div className="flex justify-content-between">
      <Button
        label="Batal"
        icon="pi pi-times"
        onClick={onClose}
        className="p-button-text"
      />
      <div>
        {extractedData && (
          <Button
            label="Scan Ulang"
            icon="pi pi-refresh"
            onClick={handleReset}
            className="p-button-secondary mr-2"
          />
        )}
        <Button
          label="Gunakan Data Ini"
          icon="pi pi-check"
          onClick={handleFinalSave}
          autoFocus
          disabled={!extractedData}
          className="p-button-primary"
        />
      </div>
    </div>
  );

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        header="Scan KTP Otomatis"
        visible={visible}
        style={{ width: '70vw', maxWidth: '800px' }}
        onHide={onClose}
        footer={footerContent}
        maximizable
      >
        {!extractedData ? (
          <div className="text-center p-4">
            <div className="mb-4">
              <i className="pi pi-camera" style={{ fontSize: '3rem', color: '#6366f1' }}></i>
            </div>
            <h4>Upload Gambar KTP</h4>
            <p className="mb-4 text-600">
              Upload gambar KTP untuk mengisi form secara otomatis menggunakan AI
            </p>
            <div className="mb-4">
              <FileUpload
                name="ktp_scan"
                accept="image/*"
                maxFileSize={10000000}
                customUpload
                uploadHandler={handleFileSelect}
                chooseLabel={selectedFile ? selectedFile.name : "Pilih Gambar KTP"}
                mode="basic"
                className="mr-2"
              />
            </div>
            {selectedFile && (
              <div className="mb-4">
                <p className="text-sm text-500">
                  File dipilih: <strong>{selectedFile.name}</strong>
                </p>
                <p className="text-sm text-500">
                  Ukuran: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            )}
            <Button
              label={isLoading ? 'Memindai KTP...' : 'Mulai Scan KTP'}
              icon={isLoading ? 'pi pi-spin pi-spinner' : 'pi pi-search'}
              onClick={handleScanClick}
              disabled={isLoading || !selectedFile}
              className="p-button-lg"
              loading={isLoading}
            />
          </div>
        ) : (
          <div>
            <div className="mb-4 p-3 bg-green-50 border-round">
              <div className="flex align-items-center">
                <i className="pi pi-check-circle text-green-500 mr-2"></i>
                <span className="text-green-700">
                  Data KTP berhasil diekstrak! Periksa dan edit jika diperlukan.
                </span>
              </div>
            </div>
            <div className="p-fluid formgrid grid">
              <div className="field col-12 md:col-6">
                <label htmlFor="nik" className="font-semibold">NIK *</label>
                <InputText
                  id="nik"
                  name="nik"
                  value={extractedData.nik || ''}
                  onChange={handleFormChange}
                  placeholder="Nomor Induk Kependudukan"
                />
              </div>
              <div className="field col-12 md:col-6">
                <label htmlFor="nama" className="font-semibold">Nama Lengkap *</label>
                <InputText
                  id="nama"
                  name="nama"
                  value={extractedData.nama || ''}
                  onChange={handleFormChange}
                  placeholder="Nama lengkap sesuai KTP"
                />
              </div>
              <div className="field col-12 md:col-8">
                <label htmlFor="tempat_tanggal_lahir" className="font-semibold">Tempat, Tanggal Lahir</label>
                <InputText
                  id="tempat_tanggal_lahir"
                  name="tempat_tanggal_lahir"
                  value={`${extractedData.tempat_lahir || ''}, ${extractedData.tgl_lahir || ''}`}
                  onChange={handleFormChange}
                  placeholder="Contoh: JAKARTA, 01-01-1990"
                />
              </div>
              <div className="field col-12 md:col-4">
                <label htmlFor="jenis_kelamin" className="font-semibold">Jenis Kelamin</label>
                <InputText
                  id="jenis_kelamin"
                  name="jenis_kelamin"
                  value={extractedData.jenis_kelamin || ''}
                  onChange={handleFormChange}
                  placeholder="LAKI-LAKI / PEREMPUAN"
                />
              </div>
              <div className="field col-12">
                <label htmlFor="alamat" className="font-semibold">Alamat</label>
                <InputTextarea
                  id="alamat"
                  name="alamat"
                  value={extractedData.alamat || ''}
                  onChange={handleFormChange}
                  rows={3}
                  placeholder="Alamat lengkap sesuai KTP"
                />
              </div>
              <div className="field col-12 md:col-4">
                <label htmlFor="rt_rw" className="font-semibold">RT/RW</label>
                <InputText
                  id="rt_rw"
                  name="rt_rw"
                  value={extractedData.rt_rw || ''}
                  onChange={handleFormChange}
                  placeholder="000/000"
                />
              </div>
              <div className="field col-12 md:col-4">
                <label htmlFor="kelurahan_desa" className="font-semibold">Kelurahan/Desa</label>
                <InputText
                  id="kelurahan_desa"
                  name="kelurahan_desa"
                  value={extractedData.kel_desa || ''}
                  onChange={handleFormChange}
                  placeholder="Nama kelurahan/desa"
                />
              </div>
              <div className="field col-12 md:col-4">
                <label htmlFor="kecamatan" className="font-semibold">Kecamatan</label>
                <InputText
                  id="kecamatan"
                  name="kecamatan"
                  value={extractedData.kecamatan || ''}
                  onChange={handleFormChange}
                  placeholder="Nama kecamatan"
                />
              </div>
              <div className="field col-12 md:col-6">
                <label htmlFor="provinsi_kabupaten" className="font-semibold">Provinsi/Kabupaten</label>
                <InputText
                  id="provinsi_kabupaten"
                  name="provinsi_kabupaten"
                  value={`${extractedData.provinsi || ''} - ${extractedData.kabupaten || ''}`}
                  onChange={handleFormChange}
                  placeholder="Provinsi dan kabupaten/kota"
                />
              </div>
              <div className="field col-12 md:col-6">
                <label htmlFor="agama" className="font-semibold">Agama</label>
                <InputText
                  id="agama"
                  name="agama"
                  value={extractedData.agama || ''}
                  onChange={handleFormChange}
                  placeholder="Agama"
                />
              </div>
              <div className="field col-12 md:col-6">
                <label htmlFor="status_perkawinan" className="font-semibold">Status Perkawinan</label>
                <InputText
                  id="status_perkawinan"
                  name="status_perkawinan"
                  value={extractedData.status_perkawinan || ''}
                  onChange={handleFormChange}
                  placeholder="BELUM KAWIN / KAWIN / CERAI"
                />
              </div>
              <div className="field col-12 md:col-6">
                <label htmlFor="pekerjaan" className="font-semibold">Pekerjaan</label>
                <InputText
                  id="pekerjaan"
                  name="pekerjaan"
                  value={extractedData.pekerjaan || ''}
                  onChange={handleFormChange}
                  placeholder="Pekerjaan"
                />
              </div>
              <div className="field col-12 md:col-4">
                <label htmlFor="kewarganegaraan" className="font-semibold">Kewarganegaraan</label>
                <InputText
                  id="kewarganegaraan"
                  name="kewarganegaraan"
                  value={extractedData.kewarganegaraan || ''}
                  onChange={handleFormChange}
                  placeholder="WNI"
                />
              </div>
              <div className="field col-12 md:col-4">
                <label htmlFor="golongan_darah" className="font-semibold">Golongan Darah</label>
                <InputText
                  id="golongan_darah"
                  name="golongan_darah"
                  value={extractedData.golongan_darah || ''}
                  onChange={handleFormChange}
                  placeholder="A/B/AB/O"
                />
              </div>
              <div className="field col-12 md:col-4">
                <label htmlFor="berlaku_hingga" className="font-semibold">Berlaku Hingga</label>
                <InputText
                  id="berlaku_hingga"
                  name="berlaku_hingga"
                  value={extractedData.berlaku_hingga || ''}
                  onChange={handleFormChange}
                  placeholder="DD-MM-YYYY"
                />
              </div>
              <div className="field col-12 md:col-6">
                <label htmlFor="tempat_diterbitkan" className="font-semibold">Tempat Diterbitkan</label>
                <InputText
                  id="tempat_diterbitkan"
                  name="tempat_diterbitkan"
                  value={extractedData.tempat_diterbitkan || ''}
                  onChange={handleFormChange}
                  placeholder="Kota/kabupaten penerbit"
                />
              </div>
              <div className="field col-12 md:col-6">
                <label htmlFor="tanggal_diterbitkan" className="font-semibold">Tanggal Diterbitkan</label>
                <InputText
                  id="tanggal_diterbitkan"
                  name="tanggal_diterbitkan"
                  value={extractedData.tanggal_diterbitkan || ''}
                  onChange={handleFormChange}
                  placeholder="DD-MM-YYYY"
                />
              </div>
            </div>
          </div>
        )}
      </Dialog>
    </>
  );
}

export default KtpScannerModal;
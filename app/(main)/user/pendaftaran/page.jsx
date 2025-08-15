"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext'; // Impor InputText
import { InputTextarea } from 'primereact/inputtextarea';
import { Calendar } from 'primereact/calendar';
import { FileUpload } from 'primereact/fileupload';
import { Toast } from 'primereact/toast';
import { getPendaftaranStatus, submitPendaftaran } from './services/api.js';
import KtpScannerModal from './components/KtpScannerModal.jsx'; // Impor komponen modal

const UserPendaftaran = () => {
    // State untuk data pendaftaran (motivasi, tanggal)
    const [formData, setFormData] = useState({
        motivation_letter: '',
        start_date: null,
        end_date: null,
    });

    // State untuk data diri yang diisi oleh scanner KTP
    const [personalData, setPersonalData] = useState({
        nik: '',
        nama: '',
        alamat: '',
        tempat_tgl_lahir: '',
        // tambahkan field lain dari KTP sesuai kebutuhan
    });

    // State untuk menampung file yang di-upload
    const [ktpFile, setKtpFile] = useState(null);
    const [cvFile, setCvFile] = useState(null);
    const [sertifikatFile, setSertifikatFile] = useState(null);

    // State untuk UI/UX
    const [loading, setLoading] = useState(true); // Mulai dengan true untuk checkStatus
    const [pendaftaranData, setPendaftaranData] = useState(null);
    const [isKtpModalOpen, setIsKtpModalOpen] = useState(false);
    const toast = useRef(null);

    // Mengecek status pendaftaran saat komponen pertama kali dimuat
    const checkStatus = useCallback(async () => {
        try {
            const data = await getPendaftaranStatus();
            if (data) {
                setPendaftaranData(data);
            }
        } catch (error) {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: error.message
            });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        checkStatus();
    }, [checkStatus]);

    // Fungsi untuk menangani submit form utama
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!cvFile) {
            toast.current.show({ severity: 'warn', summary: 'Peringatan', detail: 'File CV wajib diisi.' });
            return;
        }

        setLoading(true);

        const submissionData = new FormData();

        // --- Menambahkan semua data ke FormData ---
        // 1. Data Diri (dari scan KTP)
        submissionData.append('nik', personalData.nik);
        submissionData.append('nama', personalData.nama);
        submissionData.append('alamat', personalData.alamat);
        submissionData.append('tempat_tgl_lahir', personalData.tempat_tgl_lahir);

        // 2. Data Pendaftaran Magang
        submissionData.append('motivation_letter', formData.motivation_letter);
        submissionData.append('start_date', formData.start_date.toISOString().split('T')[0]);
        submissionData.append('end_date', formData.end_date.toISOString().split('T')[0]);

        // 3. File
        submissionData.append('cv', cvFile);
        if (ktpFile) {
          submissionData.append('ktp', ktpFile); // KTP dari pendaftaran, bukan dari scanner
        }
        if (sertifikatFile) {
            submissionData.append('certificate', sertifikatFile);
        }

        try {
            const result = await submitPendaftaran(submissionData);
            setPendaftaranData(result); // Update tampilan ke halaman status
            toast.current.show({
                severity: 'success',
                summary: 'Berhasil',
                detail: 'Pendaftaran berhasil dikirim!'
            });
        } catch (error) {
            toast.current.show({
                severity: 'error',
                summary: 'Gagal',
                detail: error.message || 'Gagal mengirim pendaftaran.'
            });
        } finally {
            setLoading(false);
        }
    };

    // Handler umum untuk komponen FileUpload PrimeReact
    const fileHandler = (e, setFileState) => {
        if (e.files && e.files.length > 0) {
            setFileState(e.files[0]);
        }
    };

    return (
        <div className="grid">
            <Toast ref={toast} />

            {/* Render Modal KTP (tidak akan terlihat sampai isKtpModalOpen true) */}
            <KtpScannerModal
              visible={isKtpModalOpen}
              onClose={() => setIsKtpModalOpen(false)}
              onSave={(scannedData) => {
                setPersonalData(scannedData); // Update state form utama dengan data hasil scan
                toast.current.show({ severity: 'success', summary: 'Sukses', detail: 'Data KTP berhasil di-scan!' });
              }}
            />

            <div className="col-12">
                <Card title="Pendaftaran Magang">
                    {loading && <p>Memuat data pendaftaran Anda...</p>}

                    {!loading && pendaftaranData ? (
                        // Tampilan jika pendaftaran sudah ada
                        <div className="text-center p-4">
                            <i className={`pi ${pendaftaranData.status === 'approved' ? 'pi-check-circle text-green-500' : pendaftaranData.status === 'rejected' ? 'pi-times-circle text-red-500' : 'pi-info-circle text-orange-500'} text-6xl mb-4`}></i>
                            <h3>Pendaftaran Anda Sudah Kami Terima</h3>
                            <p className="text-color-secondary mb-4">
                                Status: <span className={`font-bold ${pendaftaranData.status === 'approved' ? 'text-green-500' : pendaftaranData.status === 'rejected' ? 'text-red-500' : 'text-orange-500'}`}>
                                    {pendaftaranData.status === 'approved' ? 'Disetujui' :
                                     pendaftaranData.status === 'rejected' ? 'Ditolak' : 'Menunggu Review'}
                                </span>
                            </p>
                            {pendaftaranData.admin_notes && <p><strong>Catatan dari Admin:</strong> {pendaftaranData.admin_notes}</p>}
                        </div>
                    ) : (
                        // Tampilan form jika belum mendaftar
                        <form onSubmit={handleSubmit} className="p-fluid">

                            <div className="field">
                                <h5>Data Diri</h5>
                                <p className="text-color-secondary mb-3">Isi data diri Anda. Gunakan fitur Scan KTP untuk pengisian otomatis.</p>
                                <Button
                                  type="button"
                                  icon="pi pi-camera"
                                  className="p-button-info p-button-outlined mb-3"
                                  label="Scan KTP untuk Isi Otomatis"
                                  onClick={() => setIsKtpModalOpen(true)}
                                />
                                <div className="formgrid grid">
                                  <div className="field col-12 md:col-6">
                                    <label htmlFor="nik">NIK</label>
                                    <InputText id="nik" value={personalData.nik} onChange={(e) => setPersonalData({...personalData, nik: e.target.value})} required />
                                  </div>
                                  <div className="field col-12 md:col-6">
                                    <label htmlFor="nama">Nama Lengkap</label>
                                    <InputText id="nama" value={personalData.nama} onChange={(e) => setPersonalData({...personalData, nama: e.target.value})} required />
                                  </div>
                                  <div className="field col-12">
                                    <label htmlFor="ttl">Tempat/Tgl Lahir</label>
                                    <InputText id="ttl" value={personalData.tempat_tgl_lahir} onChange={(e) => setPersonalData({...personalData, tempat_tgl_lahir: e.target.value})} />
                                  </div>
                                  <div className="field col-12">
                                    <label htmlFor="alamat">Alamat</label>
                                    <InputTextarea id="alamat" value={personalData.alamat} onChange={(e) => setPersonalData({...personalData, alamat: e.target.value})} rows={3} />
                                  </div>
                                </div>
                            </div>

                            <div className="field">
                                <h5>Detail Pendaftaran Magang</h5>
                                <label htmlFor="motivation">Surat Motivasi *</label>
                                <InputTextarea id="motivation" value={formData.motivation_letter} onChange={(e) => setFormData({...formData, motivation_letter: e.target.value})} rows={5} placeholder="Jelaskan motivasi Anda..." required />
                            </div>

                            <div className="formgrid grid">
                                <div className="field col-12 md:col-6">
                                    <label htmlFor="startDate">Tanggal Mulai *</label>
                                    <Calendar id="startDate" value={formData.start_date} onChange={(e) => setFormData({...formData, start_date: e.value})} showIcon dateFormat="dd/mm/yy" placeholder="dd/mm/yyyy" required />
                                </div>
                                <div className="field col-12 md:col-6">
                                    <label htmlFor="endDate">Tanggal Selesai *</label>
                                    <Calendar id="endDate" value={formData.end_date} onChange={(e) => setFormData({...formData, end_date: e.value})} showIcon dateFormat="dd/mm/yy" placeholder="dd/mm/yyyy" required />
                                </div>
                            </div>

                            <div className="field">
                                <h5>Upload Dokumen Pendukung</h5>
                                <div className="formgrid grid">
                                    <div className="field col-12 md:col-4">
                                        <label className="block text-sm font-medium mb-2">KTP (File Scan)</label>
                                        <FileUpload mode="basic" name="ktp" accept="image/*,.pdf" maxFileSize={5000000} customUpload uploadHandler={(e) => fileHandler(e, setKtpFile)} chooseLabel={ktpFile ? ktpFile.name : 'Pilih File KTP'} className="w-full"/>
                                    </div>
                                    <div className="field col-12 md:col-4">
                                        <label className="block text-sm font-medium mb-2">CV *</label>
                                        <FileUpload mode="basic" name="cv" accept=".pdf" maxFileSize={5000000} customUpload uploadHandler={(e) => fileHandler(e, setCvFile)} chooseLabel={cvFile ? cvFile.name : 'Pilih File CV'} className="w-full" required />
                                    </div>
                                    <div className="field col-12 md:col-4">
                                        <label className="block text-sm font-medium mb-2">Sertifikat (Opsional)</label>
                                        <FileUpload mode="basic" name="certificate" accept=".pdf,image/*" maxFileSize={5000000} customUpload uploadHandler={(e) => fileHandler(e, setSertifikatFile)} chooseLabel={sertifikatFile ? sertifikatFile.name : 'Pilih Sertifikat'} className="w-full" />
                                    </div>
                                </div>
                            </div>

                            <div className="field mt-4">
                                <Button type="submit" label="Submit Pendaftaran" loading={loading} className="w-full" />
                            </div>
                        </form>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default UserPendaftaran;

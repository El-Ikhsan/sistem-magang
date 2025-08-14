"use client";

import React, { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Calendar } from 'primereact/calendar';
import { FileUpload } from 'primereact/fileupload';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';

const UserPendaftaran = () => {
    const [formData, setFormData] = useState({
        motivation_letter: '',
        start_date: null,
        end_date: null
    });
    const [loading, setLoading] = useState(false);
    const [pendaftaranStatus, setPendaftaranStatus] = useState(null);
    const toast = useRef(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Implementasi submit pendaftaran
            toast.current.show({
                severity: 'success',
                summary: 'Berhasil',
                detail: 'Pendaftaran berhasil disubmit'
            });
        } catch (error) {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Gagal submit pendaftaran'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid">
            <Toast ref={toast} />

            <div className="col-12">
                <Card title="Pendaftaran Magang">
                    {pendaftaranStatus ? (
                        <div className="text-center">
                            <div className="mb-4">
                                <i className="pi pi-check-circle text-6xl text-green-500"></i>
                            </div>
                            <h3>Pendaftaran Sudah Disubmit</h3>
                            <p className="text-color-secondary mb-4">
                                Status: <span className={`font-bold ${pendaftaranStatus === 'approved' ? 'text-green-500' : pendaftaranStatus === 'rejected' ? 'text-red-500' : 'text-orange-500'}`}>
                                    {pendaftaranStatus === 'approved' ? 'Disetujui' :
                                     pendaftaranStatus === 'rejected' ? 'Ditolak' : 'Menunggu Review'}
                                </span>
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="p-fluid">
                            <div className="field">
                                <label htmlFor="motivation">Surat Motivasi *</label>
                                <InputTextarea
                                    id="motivation"
                                    value={formData.motivation_letter}
                                    onChange={(e) => setFormData({...formData, motivation_letter: e.target.value})}
                                    rows={5}
                                    placeholder="Jelaskan motivasi Anda untuk magang di perusahaan ini..."
                                    required
                                />
                            </div>

                            <div className="formgrid grid">
                                <div className="field col">
                                    <label htmlFor="startDate">Tanggal Mulai *</label>
                                    <Calendar
                                        id="startDate"
                                        value={formData.start_date}
                                        onChange={(e) => setFormData({...formData, start_date: e.value})}
                                        showIcon
                                        dateFormat="dd/mm/yy"
                                        placeholder="Pilih tanggal mulai"
                                        required
                                    />
                                </div>
                                <div className="field col">
                                    <label htmlFor="endDate">Tanggal Selesai *</label>
                                    <Calendar
                                        id="endDate"
                                        value={formData.end_date}
                                        onChange={(e) => setFormData({...formData, end_date: e.value})}
                                        showIcon
                                        dateFormat="dd/mm/yy"
                                        placeholder="Pilih tanggal selesai"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="field">
                                <label>Upload Dokumen</label>
                                <div className="grid">
                                    <div className="col-12 md:col-4">
                                        <label className="block text-sm font-medium mb-2">KTP</label>
                                        <FileUpload
                                            mode="basic"
                                            accept="image/*,.pdf"
                                            maxFileSize={5000000}
                                            chooseLabel="Pilih File KTP"
                                            className="w-full"
                                        />
                                    </div>
                                    <div className="col-12 md:col-4">
                                        <label className="block text-sm font-medium mb-2">CV</label>
                                        <FileUpload
                                            mode="basic"
                                            accept=".pdf"
                                            maxFileSize={5000000}
                                            chooseLabel="Pilih File CV"
                                            className="w-full"
                                        />
                                    </div>
                                    <div className="col-12 md:col-4">
                                        <label className="block text-sm font-medium mb-2">Sertifikat</label>
                                        <FileUpload
                                            mode="basic"
                                            accept=".pdf,image/*"
                                            maxFileSize={5000000}
                                            chooseLabel="Pilih Sertifikat"
                                            className="w-full"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="field">
                                <Button
                                    type="submit"
                                    label="Submit Pendaftaran"
                                    loading={loading}
                                    className="w-full"
                                />
                            </div>
                        </form>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default UserPendaftaran;

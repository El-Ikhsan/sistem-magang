"use client";

import React, { useState, useRef } from 'react';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';

const UserLogbook = () => {
    const [logbooks, setLogbooks] = useState([
        {
            id: 1,
            tanggal: new Date('2024-01-15'),
            kehadiran: 'WFO',
            kegiatan: 'Meeting tim proyek',
            deskripsi: 'Menghadiri meeting tim untuk membahas progress proyek',
            jam_mulai: '08:00',
            jam_selesai: '17:00',
            status: 'validated',
            admin_feedback: 'Baik, terus pertahankan'
        },
        {
            id: 2,
            tanggal: new Date('2024-01-16'),
            kehadiran: 'WFH',
            kegiatan: 'Development fitur login',
            deskripsi: 'Mengembangkan fitur autentikasi untuk aplikasi',
            jam_mulai: '09:00',
            jam_selesai: '17:00',
            status: 'pending',
            admin_feedback: null
        }
    ]);

    const [showDialog, setShowDialog] = useState(false);
    const [formData, setFormData] = useState({
        tanggal: new Date(),
        kehadiran: '',
        kegiatan: '',
        deskripsi: '',
        jam_mulai: '',
        jam_selesai: ''
    });
    const [loading, setLoading] = useState(false);
    const toast = useRef(null);

    const kehadiranOptions = [
        { label: 'Work From Office (WFO)', value: 'WFO' },
        { label: 'Work From Home (WFH)', value: 'WFH' },
        { label: 'Izin', value: 'izin' },
        { label: 'Sakit', value: 'sakit' }
    ];

    const statusBodyTemplate = (rowData) => {
        const severity = rowData.status === 'validated' ? 'success' :
                        rowData.status === 'rejected' ? 'danger' : 'warning';
        const label = rowData.status === 'validated' ? 'Tervalidasi' :
                     rowData.status === 'rejected' ? 'Ditolak' : 'Menunggu';

        return <Tag value={label} severity={severity} />;
    };

    const dateBodyTemplate = (rowData) => {
        return rowData.tanggal.toLocaleDateString('id-ID');
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <div className="flex gap-2">
                <Button
                    icon="pi pi-eye"
                    size="small"
                    className="p-button-outlined"
                    tooltip="Lihat Detail"
                />
                {rowData.status === 'pending' && (
                    <Button
                        icon="pi pi-pencil"
                        size="small"
                        className="p-button-outlined p-button-warning"
                        tooltip="Edit"
                    />
                )}
            </div>
        );
    };

    const handleSubmit = async () => {
        setLoading(true);

        try {
            // Implementasi submit logbook
            const newLogbook = {
                id: logbooks.length + 1,
                ...formData,
                status: 'pending',
                admin_feedback: null
            };

            setLogbooks([...logbooks, newLogbook]);
            setShowDialog(false);
            setFormData({
                tanggal: new Date(),
                kehadiran: '',
                kegiatan: '',
                deskripsi: '',
                jam_mulai: '',
                jam_selesai: ''
            });

            toast.current.show({
                severity: 'success',
                summary: 'Berhasil',
                detail: 'Logbook berhasil ditambahkan'
            });
        } catch (error) {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Gagal menambah logbook'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid">
            <Toast ref={toast} />

            <div className="col-12">
                <Card
                    title="Logbook Harian"
                    subTitle="Catat aktivitas harian magang Anda"
                >
                    <div className="mb-4">
                        <Button
                            label="Tambah Logbook"
                            icon="pi pi-plus"
                            onClick={() => setShowDialog(true)}
                        />
                    </div>

                    <DataTable
                        value={logbooks}
                        paginator
                        rows={10}
                        dataKey="id"
                        emptyMessage="Belum ada data logbook"
                        className="p-datatable-gridlines"
                    >
                        <Column field="tanggal" header="Tanggal" body={dateBodyTemplate} sortable />
                        <Column field="kehadiran" header="Kehadiran" sortable />
                        <Column field="kegiatan" header="Kegiatan" sortable />
                        <Column field="jam_mulai" header="Jam Mulai" />
                        <Column field="jam_selesai" header="Jam Selesai" />
                        <Column field="status" header="Status" body={statusBodyTemplate} />
                        <Column body={actionBodyTemplate} header="Aksi" />
                    </DataTable>
                </Card>
            </div>

            <Dialog
                visible={showDialog}
                style={{ width: '50vw' }}
                header="Tambah Logbook"
                modal
                onHide={() => setShowDialog(false)}
                footer={
                    <div>
                        <Button
                            label="Batal"
                            icon="pi pi-times"
                            className="p-button-text"
                            onClick={() => setShowDialog(false)}
                        />
                        <Button
                            label="Simpan"
                            icon="pi pi-check"
                            loading={loading}
                            onClick={handleSubmit}
                        />
                    </div>
                }
            >
                <div className="p-fluid">
                    <div className="field">
                        <label htmlFor="tanggal">Tanggal *</label>
                        <Calendar
                            id="tanggal"
                            value={formData.tanggal}
                            onChange={(e) => setFormData({...formData, tanggal: e.value})}
                            showIcon
                            dateFormat="dd/mm/yy"
                            required
                        />
                    </div>

                    <div className="field">
                        <label htmlFor="kehadiran">Kehadiran *</label>
                        <Dropdown
                            id="kehadiran"
                            value={formData.kehadiran}
                            onChange={(e) => setFormData({...formData, kehadiran: e.value})}
                            options={kehadiranOptions}
                            placeholder="Pilih status kehadiran"
                            required
                        />
                    </div>

                    <div className="field">
                        <label htmlFor="kegiatan">Kegiatan *</label>
                        <InputText
                            id="kegiatan"
                            value={formData.kegiatan}
                            onChange={(e) => setFormData({...formData, kegiatan: e.target.value})}
                            placeholder="Masukkan kegiatan yang dilakukan"
                            required
                        />
                    </div>

                    <div className="field">
                        <label htmlFor="deskripsi">Deskripsi *</label>
                        <InputTextarea
                            id="deskripsi"
                            value={formData.deskripsi}
                            onChange={(e) => setFormData({...formData, deskripsi: e.target.value})}
                            rows={3}
                            placeholder="Deskripsikan detail kegiatan yang dilakukan"
                            required
                        />
                    </div>

                    <div className="formgrid grid">
                        <div className="field col">
                            <label htmlFor="jam_mulai">Jam Mulai *</label>
                            <InputText
                                id="jam_mulai"
                                type="time"
                                value={formData.jam_mulai}
                                onChange={(e) => setFormData({...formData, jam_mulai: e.target.value})}
                                required
                            />
                        </div>
                        <div className="field col">
                            <label htmlFor="jam_selesai">Jam Selesai *</label>
                            <InputText
                                id="jam_selesai"
                                type="time"
                                value={formData.jam_selesai}
                                onChange={(e) => setFormData({...formData, jam_selesai: e.target.value})}
                                required
                            />
                        </div>
                    </div>
                </div>
            </Dialog>
        </div>
    );
};

export default UserLogbook;

"use client";

import React, { useState } from 'react';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Message } from 'primereact/message';

const UserSertifikat = () => {
    const [sertifikats] = useState([
        {
            id: 1,
            certificate_number: 'CERT-2024-001',
            description: 'Sertifikat Penyelesaian Magang Program Development',
            issued_date: new Date('2024-03-01'),
            file_url: '/certificates/cert-001.pdf',
            status: 'issued'
        }
    ]);

    const dateBodyTemplate = (rowData) => {
        return rowData.issued_date.toLocaleDateString('id-ID');
    };

    const statusBodyTemplate = (rowData) => {
        const severity = rowData.status === 'issued' ? 'success' : 'warning';
        const label = rowData.status === 'issued' ? 'Tersedia' : 'Pending';

        return <Tag value={label} severity={severity} />;
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <div className="flex gap-2">
                <Button
                    icon="pi pi-download"
                    size="small"
                    className="p-button-outlined p-button-success"
                    tooltip="Download Sertifikat"
                    onClick={() => {
                        // Implementasi download
                        window.open(rowData.file_url, '_blank');
                    }}
                />
                <Button
                    icon="pi pi-eye"
                    size="small"
                    className="p-button-outlined"
                    tooltip="Preview Sertifikat"
                />
            </div>
        );
    };

    return (
        <div className="grid">
            <div className="col-12">
                <Card
                    title="Sertifikat Magang"
                    subTitle="Kelola dan unduh sertifikat magang Anda"
                >
                    {sertifikats.length === 0 ? (
                        <Message
                            severity="info"
                            text="Sertifikat akan tersedia setelah Anda menyelesaikan program magang"
                        />
                    ) : (
                        <DataTable
                            value={sertifikats}
                            dataKey="id"
                            emptyMessage="Belum ada sertifikat yang tersedia"
                            className="p-datatable-gridlines"
                        >
                            <Column field="certificate_number" header="Nomor Sertifikat" sortable />
                            <Column field="description" header="Deskripsi" sortable />
                            <Column field="issued_date" header="Tanggal Terbit" body={dateBodyTemplate} sortable />
                            <Column field="status" header="Status" body={statusBodyTemplate} />
                            <Column body={actionBodyTemplate} header="Aksi" />
                        </DataTable>
                    )}
                </Card>
            </div>

            <div className="col-12">
                <Card title="Informasi Sertifikat">
                    <div className="grid">
                        <div className="col-12 md:col-6">
                            <h6>Syarat Mendapatkan Sertifikat:</h6>
                            <ul className="line-height-3">
                                <li>Menyelesaikan minimal 80% kehadiran</li>
                                <li>Logbook harian tervalidasi lengkap</li>
                                <li>Evaluasi akhir dari mentor</li>
                                <li>Laporan akhir magang telah disetujui</li>
                            </ul>
                        </div>
                        <div className="col-12 md:col-6">
                            <h6>Format Sertifikat:</h6>
                            <ul className="line-height-3">
                                <li>Format PDF digital</li>
                                <li>Tanda tangan elektronik resmi</li>
                                <li>QR Code untuk verifikasi</li>
                                <li>Logo dan kop perusahaan</li>
                            </ul>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default UserSertifikat;

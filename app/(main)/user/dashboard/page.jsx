"use client";

import React from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';

const UserDashboard = () => {
    return (
        <div className="grid">
            <div className="col-12">
                <div className="card">
                    <h5>Dashboard User</h5>
                    <p>Selamat datang di dashboard user sistem magang!</p>
                </div>
            </div>

            <div className="col-12 md:col-6 lg:col-3">
                <div className="surface-0 shadow-2 p-3 border-1 border-50 border-round">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">Pendaftaran</span>
                            <div className="text-900 font-medium text-xl">Status</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-blue-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-user-edit text-blue-500 text-xl" />
                        </div>
                    </div>
                    <span className="text-green-500 font-medium">Aktif </span>
                    <span className="text-500">sejak minggu lalu</span>
                </div>
            </div>

            <div className="col-12 md:col-6 lg:col-3">
                <div className="surface-0 shadow-2 p-3 border-1 border-50 border-round">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">Logbook</span>
                            <div className="text-900 font-medium text-xl">5</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-orange-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-book text-orange-500 text-xl" />
                        </div>
                    </div>
                    <span className="text-green-500 font-medium">+12% </span>
                    <span className="text-500">dari bulan lalu</span>
                </div>
            </div>

            <div className="col-12 md:col-6 lg:col-3">
                <div className="surface-0 shadow-2 p-3 border-1 border-50 border-round">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">Sertifikat</span>
                            <div className="text-900 font-medium text-xl">0</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-cyan-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-award text-cyan-500 text-xl" />
                        </div>
                    </div>
                    <span className="text-pink-500 font-medium">Menunggu </span>
                    <span className="text-500">persetujuan</span>
                </div>
            </div>

            <div className="col-12 md:col-6 lg:col-3">
                <div className="surface-0 shadow-2 p-3 border-1 border-50 border-round">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">Progress</span>
                            <div className="text-900 font-medium text-xl">75%</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-purple-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-chart-line text-purple-500 text-xl" />
                        </div>
                    </div>
                    <span className="text-green-500 font-medium">Baik </span>
                    <span className="text-500">sesuai target</span>
                </div>
            </div>

            <div className="col-12 lg:col-8">
                <Card title="Aktivitas Terbaru" className="h-full">
                    <div className="flex flex-column gap-3">
                        <div className="flex align-items-center gap-3 p-3 border-1 border-200 border-round">
                            <i className="pi pi-check-circle text-green-500"></i>
                            <div className="flex-1">
                                <div className="font-medium">Logbook harian berhasil disubmit</div>
                                <div className="text-sm text-500">2 jam yang lalu</div>
                            </div>
                        </div>
                        <div className="flex align-items-center gap-3 p-3 border-1 border-200 border-round">
                            <i className="pi pi-info-circle text-blue-500"></i>
                            <div className="flex-1">
                                <div className="font-medium">Tugas baru telah diberikan</div>
                                <div className="text-sm text-500">5 jam yang lalu</div>
                            </div>
                        </div>
                        <div className="flex align-items-center gap-3 p-3 border-1 border-200 border-round">
                            <i className="pi pi-calendar text-orange-500"></i>
                            <div className="flex-1">
                                <div className="font-medium">Reminder: Meeting evaluasi besok</div>
                                <div className="text-sm text-500">1 hari yang lalu</div>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="col-12 lg:col-4">
                <Card title="Menu Cepat" className="h-full">
                    <div className="flex flex-column gap-3">
                        <Button
                            label="Buat Logbook"
                            icon="pi pi-plus"
                            className="p-button-outlined w-full"
                            onClick={() => {/* Navigate to create logbook */}}
                        />
                        <Button
                            label="Lihat Pendaftaran"
                            icon="pi pi-eye"
                            className="p-button-outlined w-full"
                            onClick={() => {/* Navigate to view registration */}}
                        />
                        <Button
                            label="Download Sertifikat"
                            icon="pi pi-download"
                            className="p-button-outlined w-full"
                            onClick={() => {/* Navigate to download certificate */}}
                        />
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default UserDashboard;

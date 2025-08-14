"use client";

import React, { useState, useRef } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Avatar } from 'primereact/avatar';
import { FileUpload } from 'primereact/fileupload';
import { Toast } from 'primereact/toast';
import { Divider } from 'primereact/divider';

const UserProfile = () => {
    const [profileData, setProfileData] = useState({
        id: '22222222-2222-2222-2222-222222222222',
        name: 'Budi Santoso',
        email: 'user@example.com',
        role: 'user',
        status: 'active',
        avatar_url: null,
        created_at: '2024-01-15'
    });

    const [institutionData, setInstitutionData] = useState({
        type: 'universitas',
        name: 'Universitas Negeri Contoh',
        email: 'info@uncontoh.ac.id',
        address: 'Jl. Pendidikan No. 123, Kota Contoh',
        lecturer_name: 'Dr. Ahmad Fauzi, M.Kom',
        whatsapp_supervisor: '081234567891',
        student_id_number: 'NIM20240001'
    });

    const [loading, setLoading] = useState(false);
    const toast = useRef(null);

    const handleUpdateProfile = async () => {
        setLoading(true);

        try {
            // Implementasi update profile
            toast.current.show({
                severity: 'success',
                summary: 'Berhasil',
                detail: 'Profil berhasil diperbarui'
            });
        } catch (error) {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Gagal memperbarui profil'
            });
        } finally {
            setLoading(false);
        }
    };

    const onAvatarUpload = () => {
        toast.current.show({
            severity: 'info',
            summary: 'Info',
            detail: 'Avatar berhasil diupload'
        });
    };

    return (
        <div className="grid">
            <Toast ref={toast} />

            <div className="col-12 md:col-4">
                <Card title="Foto Profil">
                    <div className="text-center">
                        <Avatar
                            image={profileData.avatar_url || "/demo/images/avatar/avatar-default.png"}
                            size="xlarge"
                            shape="circle"
                            className="mb-3"
                        />
                        <h5 className="mt-0">{profileData.name}</h5>
                        <p className="text-color-secondary mb-4">{profileData.email}</p>

                        <FileUpload
                            mode="basic"
                            accept="image/*"
                            maxFileSize={2000000}
                            onUpload={onAvatarUpload}
                            chooseLabel="Ganti Foto"
                            className="w-full"
                        />
                    </div>
                </Card>
            </div>

            <div className="col-12 md:col-8">
                <Card title="Informasi Pribadi">
                    <div className="p-fluid">
                        <div className="field">
                            <label htmlFor="name">Nama Lengkap</label>
                            <InputText
                                id="name"
                                value={profileData.name}
                                onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                            />
                        </div>

                        <div className="field">
                            <label htmlFor="email">Email</label>
                            <InputText
                                id="email"
                                value={profileData.email}
                                onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                                type="email"
                            />
                        </div>

                        <div className="formgrid grid">
                            <div className="field col">
                                <label htmlFor="role">Role</label>
                                <InputText
                                    id="role"
                                    value={profileData.role}
                                    disabled
                                />
                            </div>
                            <div className="field col">
                                <label htmlFor="status">Status</label>
                                <InputText
                                    id="status"
                                    value={profileData.status}
                                    disabled
                                />
                            </div>
                        </div>

                        <Button
                            label="Perbarui Profil"
                            loading={loading}
                            onClick={handleUpdateProfile}
                        />
                    </div>
                </Card>
            </div>

            <div className="col-12">
                <Card title="Informasi Institusi">
                    <div className="p-fluid">
                        <div className="formgrid grid">
                            <div className="field col">
                                <label htmlFor="institutionType">Jenis Institusi</label>
                                <InputText
                                    id="institutionType"
                                    value={institutionData.type}
                                    onChange={(e) => setInstitutionData({...institutionData, type: e.target.value})}
                                />
                            </div>
                            <div className="field col">
                                <label htmlFor="institutionName">Nama Institusi</label>
                                <InputText
                                    id="institutionName"
                                    value={institutionData.name}
                                    onChange={(e) => setInstitutionData({...institutionData, name: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="field">
                            <label htmlFor="institutionEmail">Email Institusi</label>
                            <InputText
                                id="institutionEmail"
                                value={institutionData.email}
                                onChange={(e) => setInstitutionData({...institutionData, email: e.target.value})}
                                type="email"
                            />
                        </div>

                        <div className="field">
                            <label htmlFor="institutionAddress">Alamat Institusi</label>
                            <InputText
                                id="institutionAddress"
                                value={institutionData.address}
                                onChange={(e) => setInstitutionData({...institutionData, address: e.target.value})}
                            />
                        </div>

                        <div className="formgrid grid">
                            <div className="field col">
                                <label htmlFor="lecturerName">Nama Dosen/Guru Pembimbing</label>
                                <InputText
                                    id="lecturerName"
                                    value={institutionData.lecturer_name}
                                    onChange={(e) => setInstitutionData({...institutionData, lecturer_name: e.target.value})}
                                />
                            </div>
                            <div className="field col">
                                <label htmlFor="whatsappSupervisor">WhatsApp Pembimbing</label>
                                <InputText
                                    id="whatsappSupervisor"
                                    value={institutionData.whatsapp_supervisor}
                                    onChange={(e) => setInstitutionData({...institutionData, whatsapp_supervisor: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="field">
                            <label htmlFor="studentId">NIM/NIS</label>
                            <InputText
                                id="studentId"
                                value={institutionData.student_id_number}
                                onChange={(e) => setInstitutionData({...institutionData, student_id_number: e.target.value})}
                            />
                        </div>

                        <Button
                            label="Perbarui Informasi Institusi"
                            className="p-button-outlined"
                            onClick={() => {
                                toast.current.show({
                                    severity: 'success',
                                    summary: 'Berhasil',
                                    detail: 'Informasi institusi berhasil diperbarui'
                                });
                            }}
                        />
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default UserProfile;

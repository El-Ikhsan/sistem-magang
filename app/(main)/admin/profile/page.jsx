"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Avatar } from 'primereact/avatar';
import { FileUpload } from 'primereact/fileupload';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { useAuth } from "../../../../layout/context/AuthContext"; // Sesuaikan path jika perlu

// --- KOMPONЕН ANAK ---

// 1. Komponen Popup untuk Upload Avatar
const AvatarUploadDialog = ({ visible, onHide, onConfirmUpload }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileSelect = (file) => {
        if (file) {
            // Validasi file type
            if (!file.type.startsWith('image/')) {
                alert('Hanya file gambar yang diperbolehkan');
                return;
            }

            // Validasi file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                alert('Ukuran file maksimal 2MB');
                return;
            }

            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleFileInputChange = (e) => {
        const file = e.target.files[0];
        handleFileSelect(file);
    };

    const handleConfirm = () => {
        if (selectedFile) {
            onConfirmUpload(selectedFile);
            resetDialog();
        }
    };

    const resetDialog = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setIsDragging(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleClose = () => {
        resetDialog();
        onHide();
    };

    const dialogFooter = (
        <div className="flex justify-content-end gap-2">
            <Button
                label="Batal"
                icon="pi pi-times"
                onClick={handleClose}
                className="p-button-text"
            />
            <Button
                label="Upload"
                icon="pi pi-check"
                onClick={handleConfirm}
                autoFocus
                disabled={!selectedFile}
            />
        </div>
    );

    return (
        <Dialog
            header="Ganti Foto Profil"
            visible={visible}
            style={{ width: '400px', maxWidth: '90vw' }}
            onHide={handleClose}
            modal
            footer={dialogFooter}
            className="avatar-upload-dialog"
        >
            <div className="flex flex-column gap-3">
                {/* Preview Area */}
                <div className="text-center">
                    <div
                        className={`preview-container ${isDragging ? 'dragging' : ''} ${previewUrl ? 'has-image' : ''}`}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                            border: isDragging ? '2px dashed #3B82F6' : '2px dashed #dee2e6',
                            borderRadius: '8px',
                            padding: '2rem',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            backgroundColor: isDragging ? '#f0f9ff' : '#f8f9fa'
                        }}
                    >
                        {previewUrl ? (
                            <img
                                src={previewUrl}
                                alt="Preview"
                                style={{
                                    width: '120px',
                                    height: '120px',
                                    borderRadius: '50%',
                                    objectFit: 'cover',
                                    marginBottom: '1rem'
                                }}
                            />
                        ) : (
                            <div className="flex flex-column align-items-center">
                                <i
                                    className="pi pi-cloud-upload"
                                    style={{ fontSize: '3rem', color: '#6c757d', marginBottom: '1rem' }}
                                />
                                <p className="text-color-secondary m-0">
                                    {isDragging ? 'Lepaskan file di sini' : 'Klik atau drag gambar ke sini'}
                                </p>
                                <small className="text-color-secondary">
                                    Format: JPG, PNG, GIF • Maks: 2MB
                                </small>
                            </div>
                        )}
                    </div>
                </div>

                {/* File Input (Hidden) */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileInputChange}
                    style={{ display: 'none' }}
                />

                {/* Action Buttons */}
                {previewUrl && (
                    <div className="flex justify-content-center gap-2">
                        <Button
                            label="Pilih File Lain"
                            icon="pi pi-refresh"
                            onClick={() => fileInputRef.current?.click()}
                            className="p-button-outlined p-button-secondary"
                        />
                        <Button
                            label="Hapus"
                            icon="pi pi-trash"
                            onClick={() => {
                                setSelectedFile(null);
                                setPreviewUrl(null);
                                if (fileInputRef.current) {
                                    fileInputRef.current.value = '';
                                }
                            }}
                            className="p-button-outlined p-button-danger"
                        />
                    </div>
                )}

                {!previewUrl && (
                    <div className="text-center">
                        <Button
                            label="Pilih File"
                            icon="pi pi-image"
                            onClick={() => fileInputRef.current?.click()}
                            className="p-button-outlined"
                        />
                    </div>
                )}
            </div>
        </Dialog>
    );
};


// 2. Komponen Kartu Foto Profil
const ProfileAvatarCard = ({ user, onGantiFotoClick, avatarPreview }) => (
    <Card title="Foto Profil" className="h-full shadow-2">
        <div className="text-center flex flex-column h-full">
            <Avatar
                image={avatarPreview || user.avatar_url || "/demo/images/avatar/avatar-default.png"}
                size="xlarge"
                shape="circle"
                className="mb-3 mx-auto"
            />
            <h5 className="mt-0 mb-1">{user.name}</h5>
            <p className="text-color-secondary mt-0">{user.email}</p>
            <div className="mt-auto">
                <Button label="Ganti Foto" icon="pi pi-camera" className="w-full" outlined onClick={onGantiFotoClick} />
            </div>
        </div>
    </Card>
);

// 3. Komponen Form Informasi Pribadi
const ProfileInformationForm = ({ formData, handleInputChange, onUpdate, loading }) => (
    <Card title="Informasi Pribadi" className="h-full shadow-2">
        <div className="p-fluid flex flex-column h-full">
            <div className="field">
                <label htmlFor="name">Nama Lengkap</label>
                <InputText id="name" value={formData.name} onChange={handleInputChange} />
            </div>
            <div className="field">
                <label htmlFor="email">Email</label>
                <InputText id="email" value={formData.email} onChange={handleInputChange} type="email" />
            </div>
            <div className="formgrid grid">
                <div className="field col"><label htmlFor="role">Role</label><InputText id="role" value={formData.role} disabled /></div>
                <div className="field col"><label htmlFor="status">Status</label><InputText id="status" value={formData.status} disabled /></div>
            </div>
            <div className="mt-auto flex justify-content-end">
                <Button label="Update Pribadi" icon="pi pi-check" loading={loading} onClick={onUpdate} />
            </div>
        </div>
    </Card>
);

// --- KOMPONEN UTAMA ---
const AdminProfile = () => {
    const { accessToken, user, refreshUserData } = useAuth();
    const toast = useRef(null);
    const [formData, setFormData] = useState({});
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [pageLoading, setPageLoading] = useState(true);
    const [profileUpdateLoading, setProfileUpdateLoading] = useState(false);
    const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                role: user.role || '',
                status: user.status || '',
                avatar_url: user.avatar_url || null,
            });
            setPageLoading(false);
        }
    }, [user]);

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleConfirmAvatarUpload = async (file) => {
        if (!file || !accessToken) return;

        setIsAvatarDialogOpen(false);
        const avatarFormData = new FormData();
        avatarFormData.append('avatar', file);

        try {
            // Menggunakan endpoint admin
            await fetch('/api/admin/profile', {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${accessToken}` },
                body: avatarFormData
            });
            toast.current.show({ severity: 'success', summary: 'Berhasil', detail: 'Foto profil berhasil diperbarui' });
            await refreshUserData();
            setAvatarPreview(null);
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: error.message });
            setAvatarPreview(null);
        }
    };

    const handleUpdateProfileInfo = async () => {
        setProfileUpdateLoading(true);
        const dataToUpdate = new FormData();
        dataToUpdate.append('name', formData.name);
        dataToUpdate.append('email', formData.email);
        try {
            // Menggunakan endpoint admin
            await fetch('/api/admin/profile', { method: 'PATCH', headers: { 'Authorization': `Bearer ${accessToken}` }, body: dataToUpdate });
            toast.current.show({ severity: 'success', summary: 'Berhasil', detail: 'Informasi pribadi berhasil diperbarui' });
            await refreshUserData();
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: error.message });
        } finally {
            setProfileUpdateLoading(false);
        }
    };

    if (pageLoading) return <p>Loading profile...</p>;

    return (
        <div className="p-fluid">
            <Toast ref={toast} />
            <div className="grid">
                <div className="col-12 md:col-4">
                    <ProfileAvatarCard
                        user={formData}
                        onGantiFotoClick={() => setIsAvatarDialogOpen(true)}
                        avatarPreview={avatarPreview}
                    />
                </div>
                <div className="col-12 md:col-8">
                    <ProfileInformationForm
                        formData={formData}
                        handleInputChange={handleInputChange}
                        onUpdate={handleUpdateProfileInfo}
                        loading={profileUpdateLoading}
                    />
                </div>
            </div>

            <AvatarUploadDialog
                visible={isAvatarDialogOpen}
                onHide={() => {
                    setIsAvatarDialogOpen(false);
                    setAvatarPreview(null);
                }}
                onFileSelect={(file) => setAvatarPreview(URL.createObjectURL(file))}
                onConfirmUpload={handleConfirmAvatarUpload}
            />
        </div>
    );
};

export default AdminProfile;

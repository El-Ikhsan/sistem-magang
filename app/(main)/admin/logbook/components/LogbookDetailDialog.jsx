"use client";

import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { Divider } from "primereact/divider";

const LogbookDetailDialog = ({ visible, onHide, logbook }) => {

    if (!logbook) {
        return null;
    }

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("id-ID", {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (timeString) => {
        if (!timeString) return "N/A";
        // Mengambil jam dan menit saja
        return timeString.substring(0, 5);
    };

    const statusBodyTemplate = (status) => {
        const statusColors = {
            pending: "warning",
            validated: "success",
            rejected: "danger"
        };
        const statusText = status ? status.charAt(0).toUpperCase() + status.slice(1) : "Pending";
        return (
            <Tag
                value={statusText}
                severity={statusColors[status] || "info"}
                className="text-md"
            />
        );
    };

    const footerContent = (
        <div>
            <Button label="Tutup" icon="pi pi-times" onClick={onHide} className="p-button-text" />
        </div>
    );

    return (
        <Dialog
            header="Detail Logbook"
            visible={visible}
            style={{ width: '50vw' }}
            onHide={onHide}
            modal
            footer={footerContent}
        >
            <div className="p-fluid">
                <div className="field grid">
                    <label className="col-12 mb-2 md:col-3 md:mb-0 font-semibold">Nama Mahasiswa</label>
                    <div className="col-12 md:col-9">
                        <p>{logbook.user_name || 'N/A'}</p>
                    </div>
                </div>
                <div className="field grid">
                    <label className="col-12 mb-2 md:col-3 md:mb-0 font-semibold">Institusi</label>
                    <div className="col-12 md:col-9">
                        <p>{logbook.institution_name || 'N/A'}</p>
                    </div>
                </div>
                <div className="field grid">
                    <label className="col-12 mb-2 md:col-3 md:mb-0 font-semibold">Tanggal</label>
                    <div className="col-12 md:col-9">
                        <p>{formatDate(logbook.tanggal)}</p>
                    </div>
                </div>
                 <div className="field grid">
                    <label className="col-12 mb-2 md:col-3 md:mb-0 font-semibold">Waktu Pengerjaan</label>
                    <div className="col-12 md:col-9">
                        <p>{formatTime(logbook.jam_mulai)} - {formatTime(logbook.jam_selesai)}</p>
                    </div>
                </div>
                <div className="field grid">
                    <label className="col-12 mb-2 md:col-3 md:mb-0 font-semibold">Status</label>
                    <div className="col-12 md:col-9">
                        {statusBodyTemplate(logbook.status)}
                    </div>
                </div>

                <Divider />

                <div className="field grid">
                    <label className="col-12 mb-2 md:col-3 md:mb-0 font-semibold">Kegiatan</label>
                    <div className="col-12 md:col-9">
                        <p style={{ whiteSpace: 'pre-wrap' }}>
                            {logbook.kegiatan || 'N/A'}
                        </p>
                    </div>
                </div>
                <div className="field grid">
                    <label className="col-12 mb-2 md:col-3 md:mb-0 font-semibold">Deskripsi</label>
                    <div className="col-12 md:col-9">
                        <p style={{ whiteSpace: 'pre-wrap' }}>
                            {logbook.deskripsi || 'N/A'}
                        </p>
                    </div>
                </div>

                {logbook.admin_feedback && (
                    <div className="field grid mt-3">
                        <label className="col-12 mb-2 md:col-3 md:mb-0 font-semibold text-red-500">Feedback Admin</label>
                        <div className="col-12 md:col-9">
                            <p className="p-2 bg-red-50 border-round-md border-1 border-red-200" style={{ whiteSpace: 'pre-wrap' }}>
                                {logbook.admin_feedback}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </Dialog>
    );
};

export default LogbookDetailDialog;

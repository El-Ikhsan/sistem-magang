"use client";

import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { useState, useEffect } from "react";
import { RadioButton } from "primereact/radiobutton";
import { InputTextarea } from "primereact/inputtextarea";

const ConfirmValidationDialog = ({
    visible,
    onHide,
    logbook,
    selectedLogbooks = [],
    fetchLogbooks,
    showToast,
    accessToken
}) => {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('validated');
    const [adminFeedback, setAdminFeedback] = useState('');

    // Reset state saat dialog ditutup atau item berubah
    useEffect(() => {
        if (visible) {
            setStatus('validated');
            setAdminFeedback('');
        }
    }, [visible]);

    const isBulkValidation = !logbook && selectedLogbooks.length > 0;

    const handleValidate = async () => {
        // Validasi di frontend sebelum mengirim request
        if (isBulkValidation) {
            // Cari apakah ada logbook yang sudah divalidasi atau ditolak
            const invalidLogbook = selectedLogbooks.find(l => l.status === 'validated' || l.status === 'rejected');
            if (invalidLogbook) {
                showToast("warn", "Aksi Dibatalkan", "Satu atau lebih logbook yang dipilih sudah diproses (validated/rejected).");
                return; // Hentikan eksekusi
            }
        } else if (logbook && logbook.status !== 'pending') {
            // Validasi untuk aksi tunggal
            showToast("warn", "Aksi Dibatalkan", "Logbook ini sudah diproses dan tidak dapat divalidasi lagi.");
            return; // Hentikan eksekusi
        }

        setLoading(true);
        try {
            let res;
            const body = {
                status,
                admin_feedback: adminFeedback || null // Kirim null jika feedback kosong
            };

            if (isBulkValidation) {
                // API call untuk validasi massal
                res = await fetch("/api/admin/logbook/validate-many", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        'Authorization': `Bearer ${accessToken}`
                    },
                    body: JSON.stringify({
                        ...body,
                        ids: selectedLogbooks.map((l) => l.id)
                    })
                });
            } else {
                // API call untuk validasi tunggal
                res = await fetch(`/api/admin/logbook/${logbook.id}/validate`, {
                    method: "PATCH", // Menggunakan POST agar konsisten
                    headers: {
                        "Content-Type": "application/json",
                        'Authorization': `Bearer ${accessToken}`
                    },
                    body: JSON.stringify(body)
                });
            }

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Gagal melakukan validasi");

            const successMessage = isBulkValidation
                ? `${selectedLogbooks.length} logbook berhasil diproses`
                : "Logbook berhasil diproses";

            showToast("success", "Berhasil", successMessage);
            fetchLogbooks();
            onHide();
        } catch (error) {
            showToast("error", "Gagal", error.message);
        } finally {
            setLoading(false);
        }
    };

    const footerContent = (
        <div className="flex justify-content-center gap-2">
            <Button
                label="Batal"
                icon="pi pi-times"
                severity="secondary"
                outlined
                onClick={onHide}
                disabled={loading}
            />
            <Button
                label="Ya, Konfirmasi"
                icon="pi pi-check"
                severity="success"
                onClick={handleValidate}
                loading={loading}
            />
        </div>
    );

    const formatDate = (dateString) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleDateString("id-ID", {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
    };

    return (
        <Dialog
            header="Konfirmasi Validasi"
            visible={visible}
            onHide={onHide}
            modal
            style={{ width: "30rem" }}
            footer={footerContent}
        >
            <div className="flex flex-column align-items-center text-center gap-4 py-4">
                <i className="pi pi-check-square text-blue-500 text-6xl" />
                <div>
                    <h3 className="font-bold mb-2">
                        {isBulkValidation
                            ? `Validasi ${selectedLogbooks.length} Logbook?`
                            : "Validasi Logbook Ini?"
                        }
                    </h3>
                    <p className="text-color-secondary">
                        {isBulkValidation ? (
                            `Anda akan memvalidasi ${selectedLogbooks.length} logbook yang dipilih.`
                        ) : (
                            <>
                                Anda akan memvalidasi logbook dari <strong>{logbook?.user_name ?? "mahasiswa terpilih"}</strong> pada tanggal <strong>{formatDate(logbook?.tanggal)}</strong>.
                            </>
                        )}
                    </p>
                </div>
                <div className="card flex flex-column gap-3 p-4 border-1 border-gray-200 border-round-md w-full">
                    <div className="flex align-items-center">
                        <RadioButton inputId="statusValidated" name="status" value="validated" onChange={(e) => setStatus(e.value)} checked={status === 'validated'} />
                        <label htmlFor="statusValidated" className="ml-2">Validated (Diterima)</label>
                    </div>
                    <div className="flex align-items-center">
                        <RadioButton inputId="statusRejected" name="status" value="rejected" onChange={(e) => setStatus(e.value)} checked={status === 'rejected'} />
                        <label htmlFor="statusRejected" className="ml-2">Rejected (Ditolak)</label>
                    </div>
                    {status === 'rejected' && (
                        <div className="mt-3 w-full">
                            <label htmlFor="feedback" className="font-semibold block mb-2 text-left">Feedback (Opsional)</label>
                            <InputTextarea
                                id="feedback"
                                value={adminFeedback}
                                onChange={(e) => setAdminFeedback(e.target.value)}
                                rows={3}
                                className="w-full"
                                placeholder="Berikan alasan penolakan..."
                            />
                        </div>
                    )}
                </div>
            </div>
        </Dialog>
    );
};

export default ConfirmValidationDialog;

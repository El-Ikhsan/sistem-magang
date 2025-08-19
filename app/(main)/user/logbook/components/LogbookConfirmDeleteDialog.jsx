"use client";

import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { useState } from "react";

const LogbookConfirmDeleteDialog = ({ visible, onHide, entry, selected = [], fetchLogbooks, showToast }) => {
    const [loading, setLoading] = useState(false);
    const isBulk = !entry && selected.length > 0;

    const handleDelete = async () => {
        setLoading(true);
        try {
            let res;
            if (isBulk) {
                res = await fetch('/api/users/logbook/delete-many', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ ids: selected.map(s => s.id) })
                });
            } else {
                res = await fetch(`/api/users/logbook/${entry.id}`, { method: 'DELETE', credentials: 'include' });
            }

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Gagal menghapus');

            showToast('success', 'Berhasil', data.message || 'Data dihapus');
            fetchLogbooks();
            onHide();
        } catch (err) {
            showToast('error', 'Gagal', err.message);
        } finally { setLoading(false); }
    };

    return (
        <Dialog header="Konfirmasi Hapus" visible={visible} onHide={onHide} modal style={{ width: '25rem' }} footer={(
            <div className="flex justify-content-center gap-2">
                <Button label="Batal" icon="pi pi-times" severity="secondary" outlined onClick={onHide} disabled={loading} />
                <Button label="Ya, Hapus" icon="pi pi-trash" severity="danger" onClick={handleDelete} loading={loading} />
            </div>
        )}>
            <div className="flex flex-column align-items-center text-center gap-4 py-4">
                <i className="pi pi-exclamation-triangle text-red-500 text-6xl" />
                <div>
                    <h3 className="font-bold mb-2">{isBulk ? `Hapus ${selected.length} entri logbook?` : 'Hapus entri logbook ini?'}</h3>
                    <p className="text-color-secondary">{isBulk ? `Anda akan menghapus ${selected.length} entri logbook.` : (`Anda akan menghapus entri tanggal ${entry?.tanggal ? new Date(entry.tanggal).toLocaleDateString('id-ID') : ''}.`) }<br/>Tindakan ini tidak dapat diurungkan.</p>
                </div>
            </div>
        </Dialog>
    );
};

export default LogbookConfirmDeleteDialog;

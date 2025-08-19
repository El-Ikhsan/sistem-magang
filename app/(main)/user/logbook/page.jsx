"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import LogbookTable from './components/LogbookTable';
import LogbookFormDialog from './components/LogbookFormDialog';
import LogbookConfirmDeleteDialog from './components/LogbookConfirmDeleteDialog';

const UserLogbook = () => {
    const toast = useRef(null);
    const [logbooks, setLogbooks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState(null);
    const [selectedItems, setSelectedItems] = useState([]);
    const [isFormOpen, setFormOpen] = useState(false);
    const [isDeleteOpen, setDeleteOpen] = useState(false);

    const showToast = useCallback((sev, sum, detail) => toast.current?.show({ severity: sev, summary: sum, detail, life: 3000 }), []);

    const fetchLogbooks = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/users/logbook', { credentials: 'include' });
            const body = await res.json();
            if (!res.ok) throw new Error(body.message || 'Gagal mengambil data');
            // backend returns data.list or data.logbooks; handle both
            setLogbooks(body.data?.logbooks || body.data || []);
        } catch (err) {
            showToast('error', 'Error', err.message);
        } finally { setLoading(false); }
    }, [showToast]);

    useEffect(() => { fetchLogbooks(); }, [fetchLogbooks]);

    const handleEdit = (row) => { setSelectedEntry(row); setFormOpen(true); };
    const handleDelete = (row) => { setSelectedEntry(row); setDeleteOpen(true); };
    const handleDeleteSelected = () => { if (selectedItems.length === 0) return showToast('warn', 'Warning', 'No selection'); setSelectedEntry(null); setDeleteOpen(true); };

    return (
        <div className="p-4">
            <Toast ref={toast} position="top-right" />
            <div className="card">
                <div className="flex justify-content-between items-start mb-4">
                    <div>
                        <h3 className="text-2xl font-semibold">Logbook Harian</h3>
                        <p className="text-sm text-gray-500">Catat aktivitas harian magang Anda</p>
                    </div>
                </div>

                <div className="flex flex-row flex-wrap items-center gap-2 mb-4">
                    <Button size="small" label="New" icon="pi pi-plus" outlined severity="success" onClick={() => { setSelectedEntry(null); setFormOpen(true); }} />
                    <Button size="small" label={`Delete${selectedItems.length > 0 ? ` (${selectedItems.length})` : ''}`} icon="pi pi-trash" severity="danger" outlined onClick={handleDeleteSelected} disabled={selectedItems.length === 0} />
                    <Button size="small" label="Refresh" icon="pi pi-refresh" outlined onClick={fetchLogbooks} disabled={loading} />
                </div>

                <LogbookTable logbooks={logbooks} loading={loading} selected={selectedItems} onSelectionChange={setSelectedItems} onEdit={handleEdit} onDelete={handleDelete} />

                <LogbookFormDialog visible={isFormOpen} onHide={() => { setFormOpen(false); setSelectedEntry(null); }} logbook={selectedEntry} fetchLogbooks={fetchLogbooks} showToast={showToast} />

                <LogbookConfirmDeleteDialog visible={isDeleteOpen} onHide={() => { setDeleteOpen(false); setSelectedEntry(null); }} entry={selectedEntry} selected={selectedItems} fetchLogbooks={fetchLogbooks} showToast={showToast} />
            </div>
        </div>
    );
};

export default UserLogbook;

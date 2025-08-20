"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Divider } from 'primereact/divider';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import dynamic from 'next/dynamic';
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
    const fileInputRef = useRef(null);

    // Print/export states
    const [adjustDialog, setAdjustDialog] = useState(false);
    const [jsPdfPreviewOpen, setJsPdfPreviewOpen] = useState(false);
    const [pdfUrl, setPdfUrl] = useState("");
    const [fileName, setFileName] = useState("Logbooks");
    const [printConfig, setPrintConfig] = useState({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        marginLeft: 10,
        marginRight: 10,
        marginTop: 10,
        marginBottom: 10
    });

    const [columnOptions] = useState([
        { field: 'tanggal', header: 'Tanggal', visible: true },
        { field: 'kehadiran', header: 'Kehadiran', visible: true },
        { field: 'kegiatan', header: 'Kegiatan', visible: true },
        { field: 'deskripsi', header: 'Deskripsi', visible: true },
        { field: 'jam_mulai', header: 'Jam Mulai', visible: true },
        { field: 'jam_selesai', header: 'Jam Selesai', visible: true },
        { field: 'status', header: 'Status', visible: true },
    ]);

    // Dynamic imports for print components
    const AdjustPrintMarginLaporan = dynamic(() => import("../../Export/adjustPrintMarginLaporan"), { ssr: false });
    const PDFViewer = dynamic(() => import("../../Export/PDFViewer"), { ssr: false });

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

    const formatDate = (dateString) => {
        if (!dateString) return '';
        try {
            return new Date(dateString).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
        } catch (e) { return dateString; }
    };

    const formatStatus = (status) => (status === 'active' || status === 'validated' ? 'Active' : 'Pending');

    // --- Export to Excel ---
    const exportExcel = async () => {
        if (!logbooks.length) return showToast('warn', 'Warning', 'Tidak ada data untuk diekspor');

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Logbooks');

        const headers = columnOptions.filter(c => c.visible).map(c => c.header);
        worksheet.addRow(headers);

        logbooks.forEach(lb => {
            const row = columnOptions.filter(c => c.visible).map(col => {
                if (col.field === 'tanggal') return formatDate(lb[col.field]);
                if (col.field === 'status') return formatStatus(lb[col.field]);
                return lb[col.field] ?? '';
            });
            worksheet.addRow(row);
        });

        worksheet.getRow(1).eachCell(cell => { cell.font = { bold: true }; });
        worksheet.columns.forEach(col => { col.width = 20; });

        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), `${fileName}_${new Date().toISOString().slice(0,10)}.xlsx`);
        showToast('success', 'Success', 'Data berhasil diekspor ke Excel');
    };

    // --- Export to PDF ---
    const exportPdf = (config = null) => {
        if (!logbooks.length) return showToast('warn', 'Warning', 'Tidak ada data untuk cetak');
        const currentConfig = config || printConfig;
        const doc = new jsPDF({ orientation: currentConfig.orientation, unit: currentConfig.unit, format: currentConfig.format });

        const visibleColumns = columnOptions.filter(c => c.visible);
        const headers = visibleColumns.map(c => c.header);
        const data = logbooks.map(lb => visibleColumns.map(col => col.field === 'tanggal' ? formatDate(lb[col.field]) : (lb[col.field] ?? '')));

        doc.text('Logbook Report', currentConfig.marginLeft, currentConfig.marginTop);
        autoTable(doc, { startY: currentConfig.marginTop + 10, head: [headers], body: data, margin: { left: currentConfig.marginLeft, right: currentConfig.marginRight } });

        const pdfBlob = doc.output('blob');
        const url = URL.createObjectURL(pdfBlob);
        setPdfUrl(url);
        setJsPdfPreviewOpen(true);
    };

    const handleAdjust = (newConfig) => { setPrintConfig(newConfig); exportPdf(newConfig); };

    const handleImport = async (e) => {
        const file = e.target.files?.[0]; if (!file) return;
        try {
            const workbook = new ExcelJS.Workbook();
            const buffer = await file.arrayBuffer();
            await workbook.xlsx.load(buffer);
            const ws = workbook.getWorksheet(1);
            const rows = [];
            ws.eachRow((row, rn) => {
                if (rn === 1) return; // skip header
                const vals = row.values; // values is 1-based
                // headers expected: tanggal, kehadiran, kegiatan, deskripsi, jam_mulai, jam_selesai, status
                const r = {
                    tanggal: vals[1] ? new Date(vals[1]).toISOString().split('T')[0] : null,
                    kehadiran: vals[2] ?? '',
                    kegiatan: vals[3] ?? '',
                    deskripsi: vals[4] ?? '',
                    jam_mulai: vals[5] ?? null,
                    jam_selesai: vals[6] ?? null,
                    status: vals[7] ?? 'pending'
                };
                if (r.tanggal && r.kehadiran) rows.push(r);
            });

            for (const item of rows) {
                const res = await fetch('/api/users/logbook', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(item) });
                const body = await res.json();
                if (!res.ok) throw new Error(body.message || 'Import failed');
            }
            showToast('success', 'Import Sukses', `${rows.length} data berhasil diimpor`);
            fetchLogbooks();
        } catch (err) { showToast('error', 'Import Gagal', err.message); }
        e.target.value = '';
    };

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

                <input type="file" ref={fileInputRef} accept=".xlsx,.xls" onChange={handleImport} style={{ display: 'none' }} />

                <div className="flex flex-row flex-wrap items-center gap-2 mb-4">
                    <Button size="small" label="Back" icon="pi pi-arrow-left" outlined disabled />
                    <Button size="small" label="New" icon="pi pi-plus" outlined severity="success" onClick={() => { setSelectedEntry(null); setFormOpen(true); }} />
                    <Divider layout="vertical" />
                    <Button size="small" label="Import" icon="pi pi-file-import" outlined onClick={() => fileInputRef.current?.click()} />
                    <Button size="small" label="Export" icon="pi pi-file-export" outlined onClick={exportExcel} />
                    <Button size="small" label="Print" icon="pi pi-print" outlined onClick={() => setAdjustDialog(true)} />
                    <Divider layout="vertical" />
                    <Button size="small" label={`Delete${selectedItems.length > 0 ? ` (${selectedItems.length})` : ''}`} icon="pi pi-trash" severity="danger" outlined onClick={handleDeleteSelected} disabled={selectedItems.length === 0} />
                    <Divider layout="vertical" />
                    <Button size="small" label="Refresh" icon="pi pi-refresh" outlined onClick={fetchLogbooks} disabled={loading} />
                </div>

                <LogbookTable logbooks={logbooks} loading={loading} selected={selectedItems} onSelectionChange={setSelectedItems} onEdit={handleEdit} onDelete={handleDelete} />

                <LogbookFormDialog visible={isFormOpen} onHide={() => { setFormOpen(false); setSelectedEntry(null); }} logbook={selectedEntry} fetchLogbooks={fetchLogbooks} showToast={showToast} />

                <LogbookConfirmDeleteDialog visible={isDeleteOpen} onHide={() => { setDeleteOpen(false); setSelectedEntry(null); }} entry={selectedEntry} selected={selectedItems} fetchLogbooks={fetchLogbooks} showToast={showToast} />

                <AdjustPrintMarginLaporan key={adjustDialog ? 'open' : 'closed'} adjustDialog={adjustDialog} setAdjustDialog={setAdjustDialog} handleAdjust={handleAdjust} excel={exportExcel} columnOptions={columnOptions} printConfig={printConfig} setPrintConfig={setPrintConfig} />

                <Dialog visible={jsPdfPreviewOpen} onHide={() => setJsPdfPreviewOpen(false)} modal style={{ width: '90vw', height: '90vh' }} header="PDF Preview">
                    <PDFViewer pdfUrl={pdfUrl} fileName={fileName} />
                </Dialog>
            </div>
        </div>
    );
};

export default UserLogbook;

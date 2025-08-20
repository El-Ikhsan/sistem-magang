"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Divider } from "primereact/divider";
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import dynamic from "next/dynamic";
import { useAuth } from "../../../../layout/context/AuthContext";

// Placeholder untuk komponen yang akan Anda berikan nanti
import LogbookTable from "./components/LogbookTable";
import LogbookDetailDialog from "./components/LogbookDetailDialog";
import ConfirmValidationDialog from "./components/ConfirmValidationDialog";

// Dynamic imports untuk komponen cetak
const AdjustPrintMarginLaporan = dynamic(() => import("../../Export/adjustPrintMarginLaporan"), { ssr: false });
const PDFViewer = dynamic(() => import("../../Export/PDFViewer"), { ssr: false });

const LogbookPage = () => {
    const toast = useRef(null);
    const { accessToken } = useAuth(); // Mengambil accessToken dari context

    const [logbooks, setLogbooks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedLogbook, setSelectedLogbook] = useState(null);
    const [selectedLogbooks, setSelectedLogbooks] = useState([]);
    const [isDetailOpen, setDetailOpen] = useState(false);
    const [isValidationOpen, setValidationOpen] = useState(false);

    // State untuk cetak dan ekspor
    const [adjustDialog, setAdjustDialog] = useState(false);
    const [jsPdfPreviewOpen, setJsPdfPreviewOpen] = useState(false);
    const [pdfUrl, setPdfUrl] = useState("");
    const [fileName, setFileName] = useState("Logbook");
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
        { field: 'user_name', header: 'Nama Mahasiswa', visible: true },
        { field: 'tanggal', header: 'Tanggal', visible: true },
        { field: 'kegiatan', header: 'Kegiatan', visible: true },
        { field: 'status', header: 'Status', visible: true },
        { field: 'created_at', header: 'Created Date', visible: true },
    ]);

    const showToast = useCallback((severity, summary, detail) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    }, []);

    const fetchLogbooks = useCallback(async () => {
        if (!accessToken) return;
        setLoading(true);
        setSelectedLogbooks([]);
        try {
            const res = await fetch("/api/admin/logbook", {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            const body = await res.json();
            if (res.ok) {
                // --- PERBAIKAN DI SINI ---
                // Menyesuaikan dengan struktur data baru: body.data.logbooks
                const data = Array.isArray(body.data?.logbooks) ? body.data.logbooks : [];
                setLogbooks(data);
            } else {
                throw new Error(body.message || "Gagal mengambil data logbook");
            }
        } catch (err) {
            showToast("error", "Error", err.message);
        } finally {
            setLoading(false);
        }
    }, [accessToken, showToast]);

    useEffect(() => {
        fetchLogbooks();
    }, [fetchLogbooks]);

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("id-ID", {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
    };

    const formatStatus = (status) => {
        return status ? status.charAt(0).toUpperCase() + status.slice(1) : "N/A";
    };

    // --- Fungsi Ekspor ke Excel ---
    const exportExcel = async () => {
        if (!logbooks.length) {
            showToast("warn", "Warning", "Tidak ada data untuk diekspor");
            return;
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Logbook');

        const headers = columnOptions.filter(col => col.visible).map(col => col.header);
        worksheet.addRow(headers);

        logbooks.forEach(log => {
            const rowData = columnOptions.filter(col => col.visible).map(col => {
                // Menggunakan user_name sesuai data baru
                if (col.field === 'user_name') return log.user_name || 'N/A';
                if (col.field === 'tanggal' || col.field === 'created_at') return formatDate(log[col.field]);
                if (col.field === 'status') return formatStatus(log[col.field]);
                return log[col.field] || '';
            });
            worksheet.addRow(rowData);
        });

        worksheet.getRow(1).eachCell((cell) => {
            cell.font = { bold: true };
        });
        worksheet.columns.forEach(column => { column.width = 25; });

        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), `${fileName}_${new Date().toISOString().slice(0,10)}.xlsx`);
        showToast("success", "Success", "Data berhasil diekspor ke Excel");
    };

    // --- Fungsi Ekspor ke PDF ---
    const exportPdf = (config = null) => {
        if (!logbooks.length) {
            showToast("warn", "Warning", "Tidak ada data untuk dicetak");
            return;
        }
        const currentConfig = config || printConfig;
        const doc = new jsPDF(currentConfig);
        const visibleColumns = columnOptions.filter(col => col.visible);
        const headers = visibleColumns.map(col => col.header);
        const data = logbooks.map(log => visibleColumns.map(col => {
            // Menggunakan user_name sesuai data baru
            if (col.field === 'user_name') return log.user_name || 'N/A';
            if (col.field === 'tanggal' || col.field === 'created_at') return formatDate(log[col.field]);
            if (col.field === 'status') return formatStatus(log[col.field]);
            return log[col.field] || '';
        }));

        doc.text('Laporan Logbook', currentConfig.marginLeft, currentConfig.marginTop);
        autoTable(doc, {
            startY: currentConfig.marginTop + 10,
            head: [headers],
            body: data,
            margin: { left: currentConfig.marginLeft, right: currentConfig.marginRight },
        });

        const pdfBlob = doc.output('blob');
        const url = URL.createObjectURL(pdfBlob);
        setPdfUrl(url);
        setJsPdfPreviewOpen(true);
    };

    const handleAdjust = (newConfig) => {
        setPrintConfig(newConfig);
        exportPdf(newConfig);
    };

    const handleValidation = (logbook) => {
        setSelectedLogbook(logbook);
        setValidationOpen(true);
    };

    const handleValidateSelected = () => {
        if (selectedLogbooks.length === 0) {
            showToast("warn", "Warning", "Tidak ada logbook yang dipilih");
            return;
        }
        setSelectedLogbook(null); // Mode validasi massal
        setValidationOpen(true);
    };

    return (
        <div className="p-4">
            <Toast ref={toast} position="top-right" />

            <div className="card">
                <div className="flex justify-content-between items-start mb-4">
                    <div>
                        <h3 className="text-2xl font-semibold">Logbook Management</h3>
                        <p className="text-sm text-gray-500">Validasi dan kelola logbook mahasiswa.</p>
                    </div>
                </div>

                <div className="flex flex-row flex-wrap items-center gap-2 mb-4">
                    <Button size="small" label="Export" icon="pi pi-file-export" outlined onClick={exportExcel} />
                    <Button size="small" label="Print" icon="pi pi-print" outlined onClick={() => setAdjustDialog(true)} />
                    <Divider layout="vertical" />
                    <Button
                        size="small"
                        label={`Validate${selectedLogbooks.length > 0 ? ` (${selectedLogbooks.length})` : ''}`}
                        icon="pi pi-check-square"
                        severity="success"
                        outlined
                        onClick={handleValidateSelected}
                        disabled={selectedLogbooks.length === 0}
                    />
                    <Divider layout="vertical" />
                    <Button size="small" label="Refresh" icon="pi pi-refresh" outlined onClick={fetchLogbooks} disabled={loading} />
                </div>

                <LogbookTable
                    logbooks={logbooks}
                    loading={loading}
                    selectedLogbooks={selectedLogbooks}
                    onSelectionChange={setSelectedLogbooks}
                    onDetail={(logbook) => {
                        setSelectedLogbook(logbook);
                        setDetailOpen(true);
                    }}
                    onValidate={handleValidation}
                />

                <LogbookDetailDialog
                    visible={isDetailOpen}
                    onHide={() => {
                        setDetailOpen(false);
                        setSelectedLogbook(null);
                    }}
                    logbook={selectedLogbook}
                />

                <ConfirmValidationDialog
                    visible={isValidationOpen}
                    logbook={selectedLogbook}
                    selectedLogbooks={selectedLogbooks}
                    onHide={() => {
                        setValidationOpen(false);
                        setSelectedLogbook(null);
                    }}
                    fetchLogbooks={fetchLogbooks}
                    showToast={showToast}
                    accessToken={accessToken}
                />

                <AdjustPrintMarginLaporan
                    key={adjustDialog ? 'open' : 'closed'}
                    adjustDialog={adjustDialog}
                    setAdjustDialog={setAdjustDialog}
                    handleAdjust={handleAdjust}
                    excel={exportExcel}
                    columnOptions={columnOptions}
                    printConfig={printConfig}
                    setPrintConfig={setPrintConfig}
                />

                <Dialog visible={jsPdfPreviewOpen} onHide={() => setJsPdfPreviewOpen(false)} modal style={{ width: '90vw', height: '90vh' }} header="PDF Preview">
                    <PDFViewer pdfUrl={pdfUrl} fileName={fileName} />
                </Dialog>
            </div>
        </div>
    );
};

export default LogbookPage;

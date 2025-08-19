"use client";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Tag } from "primereact/tag";
import { useState, useEffect } from "react";
import { FilterMatchMode } from "primereact/api";
import { ConfirmDialog } from "primereact/confirmdialog";

const LogbookTable = ({
    logbooks,
    loading,
    onEdit,
    onDelete,
    selected = [],
    onSelectionChange = () => {},
    onSearch = () => {},
    searchText = ""
}) => {
    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    });
    const [globalFilterValue, setGlobalFilterValue] = useState(searchText);

    useEffect(() => {
        setGlobalFilterValue(searchText);
        setFilters(prev => ({ ...prev, global: { ...prev.global, value: searchText } }));
    }, [searchText]);

    const onGlobalFilterChange = (value) => {
        const _filters = { ...filters };
        _filters['global'].value = value;
        setFilters(_filters);
        onSearch(value);
    };

    const handleSelectionChange = (e) => onSelectionChange(e.value);

    const kehadiranBody = (row) => {
        const map = { wfo: 'info', wfh: 'success', izin: 'warning', sakit: 'danger' };
        return <Tag value={row.kehadiran} severity={map[row.kehadiran] || 'secondary'} />;
    };

    const tanggalBody = row => new Date(row.tanggal).toLocaleDateString('id-ID');
    const jamBody = row => `${row.jam_mulai || '-'} - ${row.jam_selesai || '-'}`;

    const actionBody = (row) => (
        <div className="flex gap-2">
            <Button icon="pi pi-pencil" rounded outlined className="p-button-sm" onClick={() => onEdit(row)} tooltip="Edit" />
            <Button icon="pi pi-trash" rounded outlined severity="danger" className="p-button-sm" onClick={() => onDelete(row)} tooltip="Delete" />
        </div>
    );

    const header = (
        <div className="flex flex-wrap align-items-center justify-content-between gap-2">
            <span className="text-xl font-bold">My Logbook</span>
            <div className="flex gap-2">
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText value={globalFilterValue} onChange={(e) => { setGlobalFilterValue(e.target.value); onGlobalFilterChange(e.target.value); }} placeholder="Search logbooks..." />
                </span>
            </div>
        </div>
    );

    return (
        <div>
            <ConfirmDialog />
            <DataTable
                value={logbooks}
                selection={selected}
                onSelectionChange={handleSelectionChange}
                dataKey="id"
                paginator
                rows={10}
                loading={loading}
                emptyMessage="No logbook entries."
                filters={filters}
                globalFilterFields={["kegiatan", "deskripsi", "kehadiran"]}
                className="border-round-lg"
                rowClassName={() => "hover:bg-gray-50 transition-colors cursor-pointer"}
                header={header}
                selectionMode="multiple"
            >
                <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} />
                <Column field="tanggal" header="Date" body={tanggalBody} sortable />
                <Column field="kehadiran" header="Attendance" body={kehadiranBody} style={{ width: '120px' }} sortable />
                <Column field="kegiatan" header="Activity" style={{ minWidth: '300px' }} sortable />
                <Column field="deskripsi" header="Description" style={{ minWidth: '200px' }} />
                <Column header="Time" body={jamBody} style={{ width: '140px' }} />
                <Column header="Actions" body={actionBody} style={{ minWidth: '8rem' }} />
            </DataTable>
        </div>
    );
};

export default LogbookTable;

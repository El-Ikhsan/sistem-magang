"use client";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Tag } from "primereact/tag";
import { useState } from "react";
import { FilterMatchMode } from "primereact/api";

const LogbookTable = ({
    logbooks,
    loading,
    onDetail,
    onValidate,
    selectedLogbooks = [],
    onSelectionChange = () => {},
}) => {
    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    });
    const [globalFilterValue, setGlobalFilterValue] = useState('');

    const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        let _filters = { ...filters };
        _filters['global'].value = value;
        setFilters(_filters);
        setGlobalFilterValue(value);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("id-ID", {
            year: "numeric",
            month: "short",
            day: "numeric"
        });
    };

    const statusBodyTemplate = (rowData) => {
        const statusColors = {
            pending: "warning",
            validated: "success",
            rejected: "danger"
        };
        const statusText = rowData.status ? rowData.status.charAt(0).toUpperCase() + rowData.status.slice(1) : "Pending";
        return (
            <Tag
                value={statusText}
                severity={statusColors[rowData.status] || "info"}
                className="text-sm"
            />
        );
    };

    const kehadiranBodyTemplate = (rowData) => {
        const statusColors = {
            wfh: "info",
            wfo: "success",
            sakit: "danger",
            izin: "warning",
        };
        const statusText = rowData.kehadiran ? rowData.kehadiran.toUpperCase() : "N/A";
        return (
            <Tag
                value={statusText}
                severity={statusColors[rowData.kehadiran] || "warning"}
                className="text-sm"
            />
        );
    };

    const actionBodyTemplate = (rowData) => (
        <div className="flex gap-2">
            <Button
                icon="pi pi-eye"
                rounded
                outlined
                className="p-button-sm"
                onClick={() => onDetail(rowData)}
                tooltip="Lihat Detail"
            />
            <Button
                icon="pi pi-check"
                rounded
                outlined
                severity="success"
                className="p-button-sm"
                onClick={() => onValidate(rowData)}
                tooltip="Validasi"
                disabled={['validated', 'rejected'].includes(rowData.status)}
            />
        </div>
    );

    const header = (
        <div className="flex flex-wrap align-items-center justify-content-between gap-2">
            <span className="text-xl font-bold">Logbook Management</span>
            <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText
                    value={globalFilterValue}
                    onChange={onGlobalFilterChange}
                    placeholder="Cari logbook..."
                />
            </span>
        </div>
    );

    return (
        <DataTable
            value={logbooks}
            selection={selectedLogbooks}
            onSelectionChange={(e) => onSelectionChange(e.value)}
            dataKey="id"
            paginator
            rows={10}
            loading={loading}
            emptyMessage="Tidak ada logbook ditemukan."
            filters={filters}
            globalFilterFields={["user_name", "kegiatan", "status"]}
            className="border-round-lg"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Menampilkan {first} sampai {last} dari {totalRecords} logbook"
            rowsPerPageOptions={[5, 10, 25]}
            header={header}
            selectionMode="multiple"
        >
            <Column selectionMode="multiple" headerStyle={{ width: "3rem" }} />
            <Column field="user_name" header="Nama Mahasiswa" sortable />
            <Column field="tanggal" header="Tanggal" body={(rowData) => formatDate(rowData.tanggal)} style={{ width: "150px" }} sortable />
            <Column field="kehadiran" header="kehadiran" body={kehadiranBodyTemplate}/>
            <Column field="kegiatan" header="Kegiatan" />
            <Column field="status" header="Status" body={statusBodyTemplate} style={{ width: "120px" }} sortable />
            <Column header="Aksi" body={actionBodyTemplate} style={{ minWidth: "8rem" }} />
        </DataTable>
    );
};

export default LogbookTable;

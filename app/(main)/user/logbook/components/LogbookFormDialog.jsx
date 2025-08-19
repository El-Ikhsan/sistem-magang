"use client";

import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { InputTextarea } from "primereact/inputtextarea";
import { useState, useEffect } from "react";

const LogbookFormDialog = ({ visible, onHide, logbook, fetchLogbooks, showToast }) => {
    const [form, setForm] = useState({
        tanggal: null,
        kehadiran: 'wfo',
        kegiatan: '',
        deskripsi: '',
        jam_mulai: null,
        jam_selesai: null
    });
    const [loading, setLoading] = useState(false);

    const kehadiranOptions = [
        { label: 'WFO', value: 'wfo' },
        { label: 'WFH', value: 'wfh' },
        { label: 'Izin', value: 'izin' },
        { label: 'Sakit', value: 'sakit' }
    ];

    useEffect(() => {
        const parseTimeToDate = (timeStr, baseDate) => {
            if (!timeStr) return null;
            // timeStr expected like HH:mm or HH:mm:ss
            const parts = timeStr.split(':');
            const d = baseDate ? new Date(baseDate) : new Date();
            d.setHours(parseInt(parts[0], 10) || 0);
            d.setMinutes(parseInt(parts[1], 10) || 0);
            d.setSeconds(parseInt(parts[2], 10) || 0);
            d.setMilliseconds(0);
            return d;
        };

        if (logbook) {
            const baseDate = logbook.tanggal ? new Date(logbook.tanggal) : new Date();
            setForm({
                tanggal: logbook.tanggal ? new Date(logbook.tanggal) : null,
                kehadiran: logbook.kehadiran || 'wfo',
                kegiatan: logbook.kegiatan || '',
                deskripsi: logbook.deskripsi || '',
                jam_mulai: parseTimeToDate(logbook.jam_mulai, baseDate),
                jam_selesai: parseTimeToDate(logbook.jam_selesai, baseDate)
            });
        } else {
            setForm({ tanggal: null, kehadiran: 'wfo', kegiatan: '', deskripsi: '', jam_mulai: null, jam_selesai: null });
        }
    }, [logbook, visible]);

    const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

    const validate = () => {
        if (!form.tanggal) return 'Tanggal harus diisi';
        if (['wfo', 'wfh'].includes(form.kehadiran) && (!form.kegiatan || form.kegiatan.length < 5)) return 'Kegiatan minimal 5 karakter';
        return null;
    }

    const handleSubmit = async () => {
        const err = validate();
        if (err) return showToast('error', 'Validation', err);

        setLoading(true);
        try {
            // normalize time fields to HH:mm:ss
            const formatDateToTimeString = (d) => {
                if (!d) return null;
                const hh = String(d.getHours()).padStart(2, '0');
                const mm = String(d.getMinutes()).padStart(2, '0');
                const ss = String(d.getSeconds()).padStart(2, '0');
                return `${hh}:${mm}:${ss}`;
            };

            const payload = {
                tanggal: form.tanggal.toISOString().split('T')[0],
                kehadiran: form.kehadiran,
                kegiatan: form.kegiatan,
                deskripsi: form.deskripsi,
                jam_mulai: formatDateToTimeString(form.jam_mulai),
                jam_selesai: formatDateToTimeString(form.jam_selesai)
            };

            const url = logbook ? `/api/users/logbook/${logbook.id}` : '/api/users/logbook';
            const method = logbook ? 'PATCH' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Gagal menyimpan logbook');

            showToast('success', 'Sukses', data.message || 'Logbook berhasil disimpan');
            fetchLogbooks();
            onHide();
        } catch (err) {
            showToast('error', 'Error', err.message);
        } finally {
            setLoading(false);
        }
    }

    const footer = (
        <div className="flex justify-end gap-2">
            <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={onHide} disabled={loading} />
            <Button label={logbook ? 'Update' : 'Save'} icon="pi pi-check" onClick={handleSubmit} loading={loading} />
        </div>
    );

    return (
        <Dialog header={logbook ? 'Edit Logbook' : 'New Logbook'} visible={visible} onHide={onHide} modal style={{ width: '40rem' }} footer={footer}>
            <div className="grid p-fluid">
                <div className="field col-12 mb-3">
                    <label>Tanggal</label>
                    <Calendar value={form.tanggal} onChange={(e) => handleChange('tanggal', e.value)} dateFormat="yy-mm-dd" showIcon />
                </div>

                <div className="field col-12 mb-3">
                    <label>Kehadiran</label>
                    <Dropdown value={form.kehadiran} options={kehadiranOptions} onChange={(e) => handleChange('kehadiran', e.value)} />
                </div>

                <div className="field col-12 mb-3">
                    <label>Kegiatan</label>
                    <InputText value={form.kegiatan} onChange={(e) => handleChange('kegiatan', e.target.value)} />
                </div>

                <div className="field col-12 mb-3">
                    <label>Deskripsi</label>
                    <InputTextarea value={form.deskripsi} onChange={(e) => handleChange('deskripsi', e.target.value)} rows={3} />
                </div>

                <div className="field col-6 mb-3">
                    <label>Jam Mulai</label>
                    <Calendar value={form.jam_mulai} onChange={(e) => handleChange('jam_mulai', e.value)} timeOnly hourFormat="24" showIcon />
                </div>
                <div className="field col-6 mb-3">
                    <label>Jam Selesai</label>
                    <Calendar value={form.jam_selesai} onChange={(e) => handleChange('jam_selesai', e.value)} timeOnly hourFormat="24" showIcon />
                </div>
            </div>
        </Dialog>
    );
}

export default LogbookFormDialog;

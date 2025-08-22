// api/institutions/[id]/route.js
import { NextResponse } from "next/server";
import { Axios } from "../../../../utils/axios"; // Sesuaikan path jika perlu
import { API_ENDPOINTS } from "../../../api"; // Sesuaikan path jika perlu
import { isAxiosError } from "axios";

/**
 * Handler untuk mengambil data institusi berdasarkan ID.
 * @param {Request} request
 * @param {object} context - Berisi parameter dari URL
 */
export const GET = async (request, context) => {
    // --- PERBAIKAN DI SINI ---
    const { id } = await context.params;
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
        return NextResponse.json({ message: "Unauthorized: No token provided" }, { status: 401 });
    }

    try {
        const response = await Axios.get(API_ENDPOINTS.ADMIN.INSTITUTIONS.GET_BY_ID(id), {
            headers: { Authorization: `Bearer ${token}` }
        });
        return NextResponse.json(response.data);
    } catch (err) {
        if (isAxiosError(err) && err.response) {
            return NextResponse.json(err.response.data, { status: err.response.status });
        }
        console.error(`[API_INSTITUTIONS_GET_BY_ID]`, err);
        return NextResponse.json({ message: `Gagal mengambil data institusi dengan ID: ${id}.` }, { status: 500 });
    }
};

/**
 * Handler untuk memperbarui data institusi berdasarkan ID.
 * @param {Request} request
 * @param {object} context - Berisi parameter dari URL
 */
export const PATCH = async (request, context) => {
    // --- PERBAIKAN DI SINI ---
    const { id } = await context.params;
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
        return NextResponse.json({ message: "Unauthorized: No token provided" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const response = await Axios.patch(API_ENDPOINTS.ADMIN.INSTITUTIONS.UPDATE(id), body, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return NextResponse.json(response.data);
    } catch (err) {
        if (isAxiosError(err) && err.response) {
            return NextResponse.json(err.response.data, { status: err.response.status });
        }
        console.error(`[API_INSTITUTIONS_UPDATE]`, err);
        return NextResponse.json({ message: `Gagal memperbarui data institusi dengan ID: ${id}.` }, { status: 500 });
    }
};

/**
 * Handler untuk menghapus data institusi berdasarkan ID.
 * @param {Request} request
 * @param {object} context - Berisi parameter dari URL
 */
export const DELETE = async (request, context) => {
    // --- PERBAIKAN DI SINI ---
    const { id } = await context.params;
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
        return NextResponse.json({ message: "Unauthorized: No token provided" }, { status: 401 });
    }

    try {
        const response = await Axios.delete(API_ENDPOINTS.ADMIN.INSTITUTIONS.DELETE(id), {
            headers: { Authorization: `Bearer ${token}` }
        });
        return NextResponse.json(response.data);
    } catch (err) {
        if (isAxiosError(err) && err.response) {
            return NextResponse.json(err.response.data, { status: err.response.status });
        }
        console.error(`[API_INSTITUTIONS_DELETE]`, err);
        return NextResponse.json({ message: `Gagal menghapus data institusi dengan ID: ${id}.` }, { status: 500 });
    }
};

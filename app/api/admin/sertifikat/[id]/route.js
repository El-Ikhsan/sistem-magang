// api/admin/sertifikat/[id]/route.js
import { Axios } from "../../../../utils/axios"; // Sesuaikan path jika perlu
import { API_ENDPOINTS } from "../../../api"; // Sesuaikan path jika perlu
import { NextResponse } from "next/server";
import { isAxiosError } from "axios";

/**
 * Handler untuk menghapus satu sertifikat berdasarkan ID.
 * @param {Request} request
 * @param {{ params: { id: string } }} context
 */
export const DELETE = async (request, { params }) => {
    const { id } = params;

    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
        return NextResponse.json({ message: "Unauthorized: No token provided" }, { status: 401 });
    }

    try {
        const response = await Axios.delete(API_ENDPOINTS.ADMIN_SERTIFIKAT.DELETE(id), {
            headers: { Authorization: `Bearer ${token}` }
        });
        return NextResponse.json(response.data);
    } catch (err) {
        if (isAxiosError(err) && err.response) {
            return NextResponse.json(err.response.data, { status: err.response.status });
        }
        console.error(`[API_ADMIN_SERTIFIKAT_DELETE]`, err);
        return NextResponse.json({ message: `Gagal menghapus sertifikat dengan ID: ${id}.` }, { status: 500 });
    }
};

export const GET = async (request, { params }) => {
    const { id } = params;

    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
        return NextResponse.json({ message: "Unauthorized: No token provided" }, { status: 401 });
    }

    try {
        const response = await Axios.get(API_ENDPOINTS.ADMIN_SERTIFIKAT.GET_BY_USER_ID(id), {
            headers: { Authorization: `Bearer ${token}` }
        });
        return NextResponse.json(response.data);
    } catch (err) {
        if (isAxiosError(err) && err.response) {
            return NextResponse.json(err.response.data, { status: err.response.status });
        }
        console.error(`[API_ADMIN_SERTIFIKAT_GET_BY_USER_ID]`, err);
        return NextResponse.json({ message: `Gagal mengambil sertifikat untuk user ID: ${userId}.` }, { status: 500 });
    }
};

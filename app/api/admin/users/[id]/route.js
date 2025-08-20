import { Axios } from "../../../../utils/axios"; // Sesuaikan path jika perlu
import { API_ENDPOINTS } from "../../../api"; // Sesuaikan path jika perlu
import { NextResponse } from "next/server";
import { isAxiosError } from "axios";

export const GET = async (request, { params }) => {
    const { id } = params; // Ambil ID dari parameter URL

    // Mengambil token dari Authorization header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
        return NextResponse.json({ message: "Unauthorized: No token provided" }, { status: 401 });
    }

    try {
        const response = await Axios.get(API_ENDPOINTS.ADMIN_USERS.GET_BY_ID(id), {
            headers: { Authorization: `Bearer ${token}` }
        });
        return NextResponse.json(response.data);
    } catch (err) {
        if (isAxiosError(err) && err.response) {
            return NextResponse.json(err.response.data, { status: err.response.status });
        }
        console.error(`[API_ADMIN_USERS_GET_BY_ID]`, err);
        return NextResponse.json({ message: `Gagal mengambil data user dengan ID: ${id}.` }, { status: 500 });
    }
};

export const PUT = async (request, { params }) => {
    const { id } = params;

    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
        return NextResponse.json({ message: "Unauthorized: No token provided" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const response = await Axios.put(API_ENDPOINTS.ADMIN_USERS.UPDATE(id), body, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return NextResponse.json(response.data);
    } catch (err) {
        if (isAxiosError(err) && err.response) {
            return NextResponse.json(err.response.data, { status: err.response.status });
        }
        console.error(`[API_ADMIN_USERS_UPDATE]`, err);
        return NextResponse.json({ message: `Gagal memperbarui data user dengan ID: ${id}.` }, { status: 500 });
    }
};

export const DELETE = async (request, { params }) => {
    const { id } = params;

    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
        return NextResponse.json({ message: "Unauthorized: No token provided" }, { status: 401 });
    }

    try {
        const response = await Axios.delete(API_ENDPOINTS.ADMIN_USERS.DELETE(id), {
            headers: { Authorization: `Bearer ${token}` }
        });
        // Biasanya DELETE request mengembalikan status 204 No Content atau data konfirmasi
        return NextResponse.json(response.data);
    } catch (err) {
        if (isAxiosError(err) && err.response) {
            return NextResponse.json(err.response.data, { status: err.response.status });
        }
        console.error(`[API_ADMIN_USERS_DELETE]`, err);
        return NextResponse.json({ message: `Gagal menghapus user dengan ID: ${id}.` }, { status: 500 });
    }
};

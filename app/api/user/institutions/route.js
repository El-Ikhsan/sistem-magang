// api/institutions/route.js
import { NextResponse } from "next/server";
import { Axios } from "../../../utils/axios"; // Sesuaikan path jika perlu
import { API_ENDPOINTS } from "../../api"; // Sesuaikan path jika perlu
import { isAxiosError } from "axios";

/**
 * Handler untuk mengambil data institusi milik user.
 * @param {Request} request
 */
export const GET = async (request) => {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
        return NextResponse.json({ message: "Unauthorized: No token provided" }, { status: 401 });
    }

    try {
        const response = await Axios.get(API_ENDPOINTS.USER.INSTITUTIONS.GET, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return NextResponse.json(response.data);
    } catch (err) {
        if (isAxiosError(err) && err.response) {
            return NextResponse.json(err.response.data, { status: err.response.status });
        }
        console.error(`[API_INSTITUTIONS_GET]`, err);
        return NextResponse.json({ message: "Gagal mengambil data institusi." }, { status: 500 });
    }
};

/**
 * Handler untuk membuat data institusi baru untuk user.
 * @param {Request} request
 */
export const POST = async (request) => {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
        return NextResponse.json({ message: "Unauthorized: No token provided" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const response = await Axios.post(API_ENDPOINTS.USER.INSTITUTIONS.CREATE, body, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return NextResponse.json(response.data, { status: 201 });
    } catch (err) {
        if (isAxiosError(err) && err.response) {
            return NextResponse.json(err.response.data, { status: err.response.status });
        }
        console.error(`[API_INSTITUTIONS_CREATE]`, err);
        return NextResponse.json({ message: "Gagal membuat data institusi." }, { status: 500 });
    }
};

/**
 * Handler untuk memperbarui data institusi milik user.
 * @param {Request} request
 */
export const PATCH = async (request) => {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
        return NextResponse.json({ message: "Unauthorized: No token provided" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const response = await Axios.patch(API_ENDPOINTS.USER.INSTITUTIONS.UPDATE, body, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return NextResponse.json(response.data);
    } catch (err) {
        if (isAxiosError(err) && err.response) {
            return NextResponse.json(err.response.data, { status: err.response.status });
        }
        console.error(`[API_INSTITUTIONS_UPDATE]`, err);
        return NextResponse.json({ message: "Gagal memperbarui data institusi." }, { status: 500 });
    }
};

/**
 * Handler untuk menghapus data institusi milik user.
 * @param {Request} request
 */
export const DELETE = async (request) => {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
        return NextResponse.json({ message: "Unauthorized: No token provided" }, { status: 401 });
    }

    try {
        const response = await Axios.delete(API_ENDPOINTS.USER.INSTITUTIONS.DELETE, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return NextResponse.json(response.data);
    } catch (err) {
        if (isAxiosError(err) && err.response) {
            return NextResponse.json(err.response.data, { status: err.response.status });
        }
        console.error(`[API_INSTITUTIONS_DELETE]`, err);
        return NextResponse.json({ message: "Gagal menghapus data institusi." }, { status: 500 });
    }
};

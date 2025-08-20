import { Axios } from "../../../utils/axios"; // Sesuaikan path jika perlu
import { API_ENDPOINTS } from "../../api"; // Pastikan path ini benar
import { NextResponse } from "next/server";
import { isAxiosError } from "axios";

export const GET = async (request) => {
    // Mengambil token dari Authorization header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1]; // Ekstrak token dari "Bearer <token>"

    // Jika tidak ada token, kembalikan response Unauthorized
    if (!token) {
        return NextResponse.json({ message: "Unauthorized: No token provided in header" }, { status: 401 });
    }

    try {
        // Melakukan request GET ke API backend dengan token di header
        const response = await Axios.get(API_ENDPOINTS.ADMIN_USERS.GET_ALL, {
            headers: { Authorization: `Bearer ${token}` }
        });

        return NextResponse.json(response.data);
    } catch (err) {
        if (isAxiosError(err) && err.response) {
            return NextResponse.json(err.response.data, { status: err.response.status });
        }
        console.error("[API_ADMIN_USERS_GET_ALL]", err);
        return NextResponse.json({ message: "Gagal mengambil data user." }, { status: 500 });
    }
};

export const POST = async (request) => {
    // Mengambil token dari Authorization header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1]; // Ekstrak token dari "Bearer <token>"

    // Jika tidak ada token, kembalikan response Unauthorized
    if (!token) {
        return NextResponse.json({ message: "Unauthorized: No token provided in header" }, { status: 401 });
    }

    try {
        // Mengambil body dari request yang berisi data user baru
        const body = await request.json();

        // Melakukan request POST ke API backend dengan token di header
        const response = await Axios.post(API_ENDPOINTS.ADMIN_USERS.CREATE, body, {
            headers: { Authorization: `Bearer ${token}` }
        });

        // Mengembalikan data user yang baru dibuat
        return NextResponse.json(response.data, { status: 201 });
    } catch (err) {
        if (isAxiosError(err) && err.response) {
            return NextResponse.json(err.response.data, { status: err.response.status });
        }
        console.error("[API_ADMIN_USERS_CREATE]", err);
        return NextResponse.json({ message: "Gagal membuat user." }, { status: 500 });
    }
};

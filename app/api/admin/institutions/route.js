// api/institutions/route.js
import { NextResponse } from "next/server";
import { Axios } from "../../../utils/axios"; // Sesuaikan path jika perlu
import { API_ENDPOINTS } from "../../api"; // Sesuaikan path jika perlu
import { isAxiosError } from "axios";

export const GET = async (request) => {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
        return NextResponse.json({ message: "Unauthorized: No token provided" }, { status: 401 });
    }

    try {
        const response = await Axios.get(API_ENDPOINTS.INSTITUTIONS.GET_ALL, { // Diasumsikan endpoint GET_ALL
            headers: { Authorization: `Bearer ${token}` }
        });
        return NextResponse.json(response.data);
    } catch (err) {
        if (isAxiosError(err) && err.response) {
            return NextResponse.json(err.response.data, { status: err.response.status });
        }
        console.error(`[API_INSTITUTIONS_GET_ALL]`, err);
        return NextResponse.json({ message: "Gagal mengambil data institusi." }, { status: 500 });
    }
};

export const POST = async (request) => {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
        return NextResponse.json({ message: "Unauthorized: No token provided" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const response = await Axios.post(API_ENDPOINTS.INSTITUTIONS.CREATE, body, {
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

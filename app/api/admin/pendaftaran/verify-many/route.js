// api/admin/pendaftaran/verify-many/route.js
import { Axios } from "../../../../utils/axios"; // Sesuaikan path jika perlu
import { API_ENDPOINTS } from "../../../api"; // Sesuaikan path jika perlu
import { NextResponse } from "next/server";
import { isAxiosError } from "axios";

export const POST = async (request) => {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
        return NextResponse.json({ message: "Unauthorized: No token provided" }, { status: 401 });
    }

    try {
        const { ids } = await request.json();

        if (!Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ message: "Bad Request: 'ids' must be a non-empty array" }, { status: 400 });
        }

        const response = await Axios.post(API_ENDPOINTS.ADMIN_PENDAFTARAN.VERIFY_MANY,
            { ids },
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );

        return NextResponse.json(response.data);
    } catch (err) {
        if (isAxiosError(err) && err.response) {
            return NextResponse.json(err.response.data, { status: err.response.status });
        }
        console.error(`[API_ADMIN_PENDAFTARAN_VERIFY_MANY]`, err);
        return NextResponse.json({ message: "Gagal memverifikasi beberapa pendaftaran." }, { status: 500 });
    }
};

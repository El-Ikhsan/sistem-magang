// api/admin/pendaftaran/status-magang-many/route.js
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
        // Mengharapkan body berisi { ids: [...], status: "..." }
        const { ids, status } = await request.json();

        if (!Array.isArray(ids) || ids.length === 0 || !status) {
            return NextResponse.json({ message: "Bad Request: 'ids' and 'status' are required" }, { status: 400 });
        }

        const response = await Axios.post(API_ENDPOINTS.ADMIN_PENDAFTARAN.UPDATE_STATUS_MAGANG_MANY,
            { ids, status },
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );

        return NextResponse.json(response.data);
    } catch (err) {
        if (isAxiosError(err) && err.response) {
            return NextResponse.json(err.response.data, { status: err.response.status });
        }
        console.error(`[API_ADMIN_PENDAFTARAN_UPDATE_STATUS_MANY]`, err);
        return NextResponse.json({ message: "Gagal memperbarui status beberapa pendaftaran." }, { status: 500 });
    }
};

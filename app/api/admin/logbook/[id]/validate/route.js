// api/admin/logbook/[id]/validate/route.js
import { Axios } from "../../../../../utils/axios"; // Sesuaikan path jika perlu
import { API_ENDPOINTS } from "../../../../api"; // Sesuaikan path jika perlu
import { NextResponse } from "next/server";
import { isAxiosError } from "axios";

/**
 * Handler untuk memvalidasi satu logbook berdasarkan ID.
 * @param {Request} request
 * @param {{ params: { id: string } }} context
 */
export const PATCH = async (request, { params }) => {
    const { id } = await params;

    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
        return NextResponse.json({ message: "Unauthorized: No token provided" }, { status: 401 });
    }

    try {
        // Membaca body dari request yang dikirim oleh frontend
        const body = await request.json();

        // Meneruskan body (berisi status dan feedback) ke API backend
        const response = await Axios.patch(API_ENDPOINTS.ADMIN_LOGBOOK.VALIDATE(id),
            body,
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );
        return NextResponse.json(response.data);
    } catch (err) {
        if (isAxiosError(err) && err.response) {
            return NextResponse.json(err.response.data, { status: err.response.status });
        }
        console.error(`[API_ADMIN_LOGBOOK_VALIDATE]`, err);
        return NextResponse.json({ message: `Gagal memvalidasi logbook dengan ID: ${id}.` }, { status: 500 });
    }
};

// api/admin/logbook/validate-many/route.js
import { Axios } from "../../../../utils/axios"; // Sesuaikan path jika perlu
import { API_ENDPOINTS } from "../../../api"; // Sesuaikan path jika perlu
import { NextResponse } from "next/server";
import { isAxiosError } from "axios";

/**
 * Handler untuk memvalidasi beberapa logbook berdasarkan array ID.
 * @param {Request} request
 */
export const POST = async (request) => {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
        return NextResponse.json({ message: "Unauthorized: No token provided" }, { status: 401 });
    }

    try {
        // Mengharapkan body berisi { ids: [...], status: "...", admin_feedback: "..." }
        const body = await request.json();
        const { ids, status } = body;

        if (!Array.isArray(ids) || ids.length === 0 || !status) {
            return NextResponse.json({ message: "Bad Request: 'ids' and 'status' are required" }, { status: 400 });
        }

        // Meneruskan seluruh body (ids, status, feedback) ke API backend
        const response = await Axios.post(API_ENDPOINTS.ADMIN_LOGBOOK.VALIDATE_MANY,
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
        console.error(`[API_ADMIN_LOGBOOK_VALIDATE_MANY]`, err);
        return NextResponse.json({ message: "Gagal memvalidasi beberapa logbook." }, { status: 500 });
    }
};

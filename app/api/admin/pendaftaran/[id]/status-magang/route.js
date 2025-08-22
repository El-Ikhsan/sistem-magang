// api/admin/pendaftaran/[id]/status-magang/route.js
import { Axios } from "../../../../../utils/axios"; // Sesuaikan path jika perlu
import { API_ENDPOINTS } from "../../../../api"; // Sesuaikan path jika perlu
import { NextResponse } from "next/server";
import { isAxiosError } from "axios";

export const PATCH = async (request, context)  => {
    const { id } = await context.params;

    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
        return NextResponse.json({ message: "Unauthorized: No token provided" }, { status: 401 });
    }

    try {
        // Mengharapkan body berisi status baru, contoh: { status: "diterima" }
        const body = await request.json();

        const response = await Axios.patch(API_ENDPOINTS.ADMIN_PENDAFTARAN.UPDATE_STATUS_MAGANG(id),
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
        console.error(`[API_ADMIN_PENDAFTARAN_UPDATE_STATUS]`, err);
        return NextResponse.json({ message: `Gagal memperbarui status magang untuk ID: ${id}.` }, { status: 500 });
    }
};

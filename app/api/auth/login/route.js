
import { Axios } from "../../../utils/axios";
import { API_ENDPOINTS } from "../../api";
import { NextResponse } from "next/server";
import { isAxiosError } from "axios";

export const POST = async (request) => {
    try {
        const { email, password } = await request.json();
        const response = await Axios.post(API_ENDPOINTS.LOGINUSERS, { email, password });

        const data = response.data;
        const nextResponse = NextResponse.json(data);

        // Handle different response formats for token storage
        let tokenToStore = null;

        // Format 1: Local backend with nested structure
        if (data.success && data.data && data.data.accessToken) {
            tokenToStore = data.data.accessToken;
        }
        // Format 2: Remote backend with direct token field
        else if (data.status === '00' && data.token) {
            tokenToStore = data.token;
        }

        if (tokenToStore) {
            // Cookie settings yang lebih robust untuk production
            const cookieOptions = {
                name: "authToken",
                value: tokenToStore,
                httpOnly: false, // Perlu false agar bisa diakses client-side
                path: "/",
                maxAge: 60 * 60 * 24, // 24 jam
                secure: false, // Set false untuk HTTP, true untuk HTTPS
                sameSite: "lax"
            };

            // Untuk production dengan HTTPS, aktifkan secure
            if (process.env.NODE_ENV === "production" && request.url.startsWith('https')) {
                cookieOptions.secure = true;
            }

            nextResponse.cookies.set(cookieOptions);
        }

        return nextResponse;
    } catch (err) {
        if (isAxiosError(err) && err.response) {
            return NextResponse.json(err.response.data, { status: err.response.status });
        }

        return NextResponse.json({
            success: false,
            message: "Gagal terhubung ke server backend."
        }, { status: 500 });
    }
};

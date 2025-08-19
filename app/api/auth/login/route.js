import { Axios } from "../../../utils/axios";
import { API_ENDPOINTS } from "../../api";
import { NextResponse } from "next/server";
import { isAxiosError } from "axios";

export async function POST(request) {
    try {
        const { email, password } = await request.json();

        // Panggil backend utama untuk login
        const response = await Axios.post(API_ENDPOINTS.LOGIN, { email, password });
        const responseData = response.data;

        // Backend mengembalikan { success: true, data: { accessToken, refreshToken, user } }
        if (responseData.success && responseData.data) {
            const { accessToken, refreshToken, user } = responseData.data;

            // Buat respons JSON yang akan dikirim ke client
            const nextResponse = NextResponse.json({
                success: true,
                message: responseData.message || "Login successful",
                data: { user }
            });

            // Set authToken cookie untuk akses API
            nextResponse.cookies.set("authToken", accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 60 * 60 * 1000 // 1 hour
            });

            // Set refreshToken cookie untuk refresh
            nextResponse.cookies.set("refreshToken", refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });

            return nextResponse;
        }

        return NextResponse.json(responseData);
    } catch (err) {
        if (isAxiosError(err) && err.response) {
            return NextResponse.json(err.response.data, { status: err.response.status });
        }
        console.error("[API AUTH LOGIN]", err);
        return NextResponse.json({
            success: false,
            message: "Gagal terhubung ke server backend."
        }, { status: 500 });
    }
};

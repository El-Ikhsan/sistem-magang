// api/auth/refresh/route.js
import { Axios } from "../../../utils/axios";
import { API_ENDPOINTS } from "../../api";
import { NextResponse } from "next/server";
import { isAxiosError } from "axios";

export async function POST(request) {
    try {
        const refreshToken = request.cookies.get("refreshToken")?.value;

        if (!refreshToken) {
            return NextResponse.json(
                { success: false, message: "No refresh token found" },
                { status: 401 }
            );
        }

        // Call backend refresh token endpoint with proper headers
        const response = await Axios.post(API_ENDPOINTS.REFRESH_TOKEN, {}, {
            headers: {
                'Authorization': `Bearer ${refreshToken}`,
                'Content-Type': 'application/json'
            },
            withCredentials: true
        });

        const responseData = response.data;

        if (responseData.success && responseData.data) {
            const { accessToken, user } = responseData.data;

            // Create response with new access token
            const nextResponse = NextResponse.json({
                success: true,
                message: responseData.message || "Token refreshed successfully",
                data: { user }
            });

            // Update authToken cookie with new access token
            nextResponse.cookies.set("authToken", accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 60 * 60 * 1000 // 1 hour
            });

            return nextResponse;
        }

        return NextResponse.json(responseData, { status: 401 });
    } catch (err) {
        console.error("[API AUTH REFRESH ERROR]", err.message);
        
        if (isAxiosError(err) && err.response) {
            console.error("Backend response:", err.response.data);
            // If refresh fails, clear cookies
            const response = NextResponse.json(
                { 
                    success: false, 
                    message: err.response.data.message || "Token refresh failed" 
                }, 
                { status: err.response.status }
            );
            response.cookies.delete("authToken");
            response.cookies.delete("refreshToken");
            return response;
        }

        const response = NextResponse.json({
            success: false,
            message: "Gagal memperbarui token."
        }, { status: 500 });

        response.cookies.delete("authToken");
        response.cookies.delete("refreshToken");
        return response;
    }
};

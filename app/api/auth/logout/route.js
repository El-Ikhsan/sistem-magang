import { NextResponse } from 'next/server';
import { Axios } from "../../../utils/axios";
import { API_ENDPOINTS } from "../../api";
import { isAxiosError } from "axios";

export async function POST(request) {
    try {
        const authToken = request.cookies.get("authToken")?.value;

        if (!authToken) {
            const response = NextResponse.json({
                success: true,
                message: "Already logged out"
            });

            // Clear cookies anyway
            response.cookies.delete("authToken");
            response.cookies.delete("refreshToken");

            return response;
        }

        // Call backend logout endpoint
        try {
            await Axios.delete(API_ENDPOINTS.LOGOUT, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
        } catch (err) {
            // Even if backend logout fails, we still clear cookies
            console.error("[API AUTH LOGOUT] Backend logout failed:", err);
        }

        // Create response and clear cookies
        const response = NextResponse.json({
            success: true,
            message: "Logout successful"
        });

        // Clear authentication cookies
        response.cookies.delete("authToken");
        response.cookies.delete("refreshToken");

        return response;
    } catch (err) {
        console.error("[API AUTH LOGOUT]", err);

        // Even on error, clear cookies
        const response = NextResponse.json({
            success: true,
            message: "Logout completed"
        });

        response.cookies.delete("authToken");
        response.cookies.delete("refreshToken");

        return response;
    }
}

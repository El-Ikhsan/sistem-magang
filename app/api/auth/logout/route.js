import { Axios } from "../../../utils/axios";
import { API_ENDPOINTS } from "../../api";
import { NextResponse } from "next/server";
import { isAxiosError } from "axios";

export const POST = async (request) => {
    try {
        // Ambil token dari cookie
        const authToken = request.cookies.get("authToken")?.value;

        if (authToken) {
            // Kirim logout request ke backend dengan token
            try {
                await Axios.delete(API_ENDPOINTS.LOGOUT, {
                    headers: {
                        'Authorization': `Bearer ${authToken}`
                    }
                });
            } catch (backendError) {
                // Jika backend error, tetap lanjutkan untuk hapus cookie
                console.log("Backend logout error (continuing):", backendError);
            }
        }

        const response = NextResponse.json(
            {
                success: true,
                message: "Logout successful"
            },
            { status: 200 }
        );

        // Clear cookie dengan setting yang konsisten
        response.cookies.set("authToken", "", {
            httpOnly: false,
            expires: new Date(0),
            path: "/",
            secure: false,
            sameSite: "lax"
        });

        return response;
    } catch (error) {
        console.error("[API LOGOUT]", error);

        // Tetap clear cookie meski ada error
        const response = NextResponse.json(
            {
                success: false,
                message: "Logout failed but cookie cleared"
            },
            { status: 500 }
        );

        response.cookies.set("authToken", "", {
            httpOnly: false,
            expires: new Date(0),
            path: "/",
            secure: false,
            sameSite: "lax"
        });

        return response;
    }
};

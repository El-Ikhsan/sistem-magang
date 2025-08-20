import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { Axios } from "../../../utils/axios"; // Sesuaikan path
import { API_ENDPOINTS } from "../../../api/api"; // Sesuaikan path

export async function DELETE(request) {
    const cookieStore = await cookies();

    try {
        // Ambil accessToken dari body request yang dikirim frontend
        const { accessToken } = await request.json();
        console.log(accessToken);

        if (accessToken) {
            // Panggil backend utama menggunakan accessToken di header Authorization
            await Axios.delete(API_ENDPOINTS.LOGOUT, { // Body bisa kosong jika tidak dibutuhkan
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
        }
    } catch (error) {
        // Abaikan error dari backend utama, yang terpenting adalah menghapus cookie
        console.error("Backend logout failed, but clearing cookie anyway:", error.message);
    }

    // Langkah paling krusial: Hapus cookie refreshToken dari browser
    cookieStore.set('refreshToken', '', {
        httpOnly: true,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 0 // Atur maxAge ke 0 untuk menghapus cookie
    });

    return NextResponse.json({ success: true, message: "Logged out successfully" });
}

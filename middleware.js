import { NextResponse } from "next/server";

export function middleware(request) {
    // 1. Ambil cookie refreshToken yang aman
    const refreshToken = request.cookies.get("refreshToken")?.value;
    const { pathname } = request.nextUrl;

    // 2. Tentukan halaman publik yang bisa diakses tanpa login
    const isPublicPath = pathname === '/auth/login';

    // 3. Logika Redirect
    // Jika mencoba akses halaman terproteksi TANPA refreshToken, redirect ke login
    if (!isPublicPath && !refreshToken) {
        return NextResponse.redirect(new URL("/auth/login", request.url));
    }



    // Jika semua kondisi aman, lanjutkan ke halaman yang dituju
    return NextResponse.next();
}

// 4. Konfigurasi Matcher
// Middleware ini akan berjalan di semua path KECUALI yang spesifik di bawah ini
export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};

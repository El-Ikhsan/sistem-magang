import { NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";

export function middleware(request) {
    const authToken = request.cookies.get("authToken")?.value;
    const { pathname } = request.nextUrl;

    // Path yang bisa diakses tanpa autentikasi
    const publicPaths = ["/auth/login", "/api/auth/login"];
    const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

    if (isPublicPath) {
        return NextResponse.next();
    }

    // Jika tidak ada token, redirect ke login
    if (!authToken) {
        return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    let userRole = null;
    try {
        const decodedToken = jwtDecode(authToken);

        // Periksa apakah token sudah expired
        if (decodedToken.exp && decodedToken.exp < Date.now() / 1000) {
            const response = NextResponse.redirect(new URL("/auth/login", request.url));
            response.cookies.delete("authToken");
            return response;
        }

        userRole = decodedToken.role;
    } catch (error) {
        // Token tidak valid, redirect ke login
        const response = NextResponse.redirect(new URL("/auth/login", request.url));
        response.cookies.delete("authToken");
        return response;
    }

    // Aturan akses berdasarkan role dan path
    if (pathname.startsWith("/admin/")) {
        // Hanya admin yang bisa akses path admin
        if (userRole !== "admin") {
            return NextResponse.redirect(new URL("/auth/login", request.url));
        }
    } else if (pathname.startsWith("/user/")) {
        // Hanya user yang bisa akses path user
        if (userRole !== "user") {
            return NextResponse.redirect(new URL("/auth/login", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|auth|access-denied|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.webp$|.*\\.svg$|.*\\.css$|.*\\.js$|.*\\.woff$|.*\\.woff2$|.*\\.ttf$|.*\\.eot$).*)"]
};

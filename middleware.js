import { NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";

export function middleware(request) {
    const authToken = request.cookies.get("authToken")?.value;
    const { pathname } = request.nextUrl;

    const publicPaths = ["/auth/login", "/api/auth/login"];
    const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));
    if (isPublicPath) {
        return NextResponse.next();
    }
    if (!authToken) {
        return NextResponse.redirect(new URL("/auth/login", request.url));
    }
    let userRole = null;
    try {
        const decodedToken = jwtDecode(authToken);
        if (decodedToken.exp && decodedToken.exp < Date.now() / 1000) {
            const response = NextResponse.redirect(new URL("/auth/login", request.url));
            response.cookies.delete("authToken");
            return response;
        }
        userRole = decodedToken.role;
    } catch (error) {
        const response = NextResponse.redirect(new URL("/auth/login", request.url));
        response.cookies.delete("authToken");
        return response;
    }
    // Hanya izinkan admin ke /admin/dashboard
    if (userRole !== "admin" || !pathname.startsWith("/admin/dashboard")) {
        return NextResponse.redirect(new URL("/auth/login", request.url));
    }
    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|auth|access-denied|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.webp$|.*\\.svg$|.*\\.css$|.*\\.js$|.*\\.woff$|.*\\.woff2$|.*\\.ttf$|.*\\.eot$).*)"]
};

// import { Axios } from "../../../utils/axios"; // Sesuaikan path
// import { API_ENDPOINTS } from "../../../api/api"; // Sesuaikan path
// import { NextResponse } from "next/server";
// import { isAxiosError } from "axios";

// export async function POST(request) {
//     try {
//         const { email, password } = await request.json();
//         // Panggil backend utama untuk login
//         const response = await Axios.post(API_ENDPOINTS.LOGINUSERS, { email, password });

//         const responseData = response.data;

//         // Asumsi backend mengembalikan { success: true, data: { accessToken, refreshToken, user } }
//         if (responseData.success && responseData.data) {
//             const { accessToken, refreshToken, user } = responseData.data;

//             // Buat respons JSON yang akan dikirim ke client
//             // HANYA kirim accessToken dan data user
//             const nextResponse = NextResponse.json({
//                 success: true,
//                 message: "Login successful",
//                 data: { accessToken, user }
//             });

//             // Atur refreshToken di dalam cookie yang aman
//             nextResponse.cookies.set({
//                 name: "refreshToken",
//                 value: refreshToken,
//                 httpOnly: true, // PENTING: Mencegah akses dari JavaScript
//                 path: "/",
//                 maxAge: 60 * 60 * 24 * 7, // 7 hari
//                 secure: process.env.NODE_ENV === "production", // Wajib true untuk HTTPS
//                 sameSite: "strict" // Paling aman
//             });

//             return nextResponse;
//         }

//         return NextResponse.json(responseData);
//     } catch (err) {
//         if (isAxiosError(err) && err.response) {
//             return NextResponse.json(err.response.data, { status: err.response.status });
//         }
//         return NextResponse.json({
//             success: false,
//             message: "Gagal terhubung ke server backend."
//         }, { status: 500 });
//     }
// };

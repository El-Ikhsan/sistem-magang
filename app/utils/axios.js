import axios from "axios";

export const Axios = axios.create({
    // 1. Gunakan URL API dari environment variable
    baseURL: process.env.NEXT_PUBLIC_API_URL,

    headers: {
        "Content-Type": "application/json"
    },

    // 2. Wajib 'true' agar cookie (seperti refreshToken) bisa dikirim antar domain
    withCredentials: true,

    timeout: 10000 // 10 detik timeout
});

// Interceptor untuk menangani error secara terpusat
Axios.interceptors.response.use(
    // Jika respons sukses, langsung kembalikan
    (response) => {
        return response;
    },
    // 3. Jika ada error, cukup teruskan error tersebut
    (error) => {
        // Jangan tangani redirect di sini.
        // Biarkan komponen atau context yang memanggil API yang memutuskan
        // tindakan apa yang harus diambil (misalnya, logout dan redirect).
        return Promise.reject(error);
    }
);

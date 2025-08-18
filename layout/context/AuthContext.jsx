"use client";

import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// Buat Context
const AuthContext = createContext(null);

// Buat Provider Komponen
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [accessToken, setAccessToken] = useState(null);
    const [loading, setLoading] = useState(true); // Untuk loading awal saat cek sesi
    const router = useRouter();

    // Fungsi untuk login
    const login = async (email, password) => {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Login failed');
        }

        // Simpan accessToken dan user ke state
        setAccessToken(result.data.accessToken);
        setUser(result.data.user);

         const userRole = result.data.user.role;

        // Arahkan berdasarkan role
        if (userRole === 'admin') {
            router.push('/admin/dashboard');
        } else if (userRole === 'user') {
            router.push('/user/dashboard');
        } else {
            router.push('/auth/login'); // Fallback jika role tidak dikenali
        }

        return result;
    };

    // Fungsi untuk logout
  const logout = async () => {
    try {
        // Kirim accessToken dalam body saat logout
        console.log(accessToken)
        await fetch('/api/auth/logout', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ accessToken }) // Kirim token yang ada di state
        });
    } finally {
        // Hapus data dari state
        setAccessToken(null);
        setUser(null);
    }
};

    // Cek sesi saat aplikasi pertama kali dimuat
    const checkUserSession = useCallback(async () => {
        try {
            // Panggil endpoint refresh untuk mendapatkan accessToken baru jika ada refreshToken valid
            const response = await fetch('/api/auth/refresh-token', {
                method: 'POST',
            });
            const result = await response.json();

            if (!response.ok) {
                console.log('No valid session found, redirecting to login');
                return
            }

            setAccessToken(result.data.accessToken);
            setUser(result.data.user);
         const userRole = result.data.user.role;

        // Arahkan berdasarkan role
        if (userRole === 'admin') {
            router.push('/admin/dashboard');
        } else if (userRole === 'user') {
            router.push('/user/dashboard');
        } else {
            router.push('/auth/login'); // Fallback jika role tidak dikenali
        }
        } catch (error) {
            // Jika gagal (misal, refresh token tidak ada atau tidak valid), pastikan state kosong
            setAccessToken(null);
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        checkUserSession();
    }, [checkUserSession]);


    const authContextValue = {
        user,
        accessToken,
        loading,
        login,
        logout,
    };

        return (
        <AuthContext.Provider value={authContextValue}>
            {children}
        </AuthContext.Provider>
    );
};

// Buat custom hook untuk menggunakan context ini dengan mudah
export const useAuth = () => {
    return useContext(AuthContext);
};

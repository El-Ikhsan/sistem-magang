'use client';

import { useAuth } from '../layout/context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Layout from '../layout/context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Jika selesai loading dan tidak ada user, redirect ke login
    if (!loading && !user) {
      // Kecuali jika sudah di halaman login
      if (pathname !== '/auth/login') {
        router.push('/auth/login');
      }
    }
  }, [user, loading, router, pathname]);

  // Tampilkan loading screen saat sesi diperiksa
  if (loading) {
    return <div>Loading session...</div>;
  }

  // Jika user tidak ada dan berada di halaman publik (login), tampilkan halaman itu
  if (!user && pathname.startsWith('/auth/login')) {
    return children;
  }

  // Jika user ada, tampilkan layout lengkap dengan konten halaman
  if (user) {
    return <Layout>{children}</Layout>;
  }

  // Fallback jika user tidak ada dan mencoba akses halaman terproteksi
  return <div>Loading...</div>;
}

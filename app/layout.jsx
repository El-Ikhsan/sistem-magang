// 1. Impor semua CSS/SCSS global, TERMASUK theme.css
import 'primereact/resources/themes/lara-light-indigo/theme.css'; // <-- PINDAHKAN KE SINI
import 'primereact/resources/primereact.css';
import 'primeflex/primeflex.css';
import 'primeicons/primeicons.css';
import '../styles/layout/layout.scss';
import '../styles/demo/Demos.scss';

import { Providers } from './providers';

export const metadata = {
  title: 'Aplikasi Magang',
  description: 'Sistem Informasi Manajemen Magang',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                {/* 2. HAPUS tag <link> dari sini */}
            </head>
            <body>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}

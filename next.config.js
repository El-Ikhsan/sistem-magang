/** @type {import('next').NextConfig} */
const nextConfig = {
    // Opsi ini diperlukan jika ada paket server yang tidak bisa di-bundle
    serverExternalPackages: ['jsonwebtoken', 'bcryptjs'],

    // Untuk production build yang dioptimalkan
    output: 'standalone',

    // Blok 'env' dan 'rewrites' tidak lagi diperlukan
};

module.exports = nextConfig;

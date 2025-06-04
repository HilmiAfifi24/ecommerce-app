import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['unsplash.com', 'plus.unsplash.com', 'google.com'], // Menambahkan plus.unsplash.com sebagai domain yang diizinkan
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com', // Gambar dari domain ini
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com', // Menambahkan domain plus.unsplash.com untuk gambar premium
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'google.com', // Menambahkan domain plus.unsplash.com untuk gambar premium
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ecommerce-integrasi.s3.ap-southeast-1.amazonaws.com',
        pathname: '/**',
      },
            {
        protocol: 'https',
        hostname: 'commerce123.s3.us-east-1.amazonaws.com',
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;

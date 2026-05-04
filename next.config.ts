import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: 'standalone',
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'upload.wikimedia.org',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'static.wikia.nocookie.net',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'qavhjoqptirrbopzjwud.supabase.co', // ✅ your Supabase storage
                pathname: '/storage/v1/object/public/images/**',
            },
        ],
    },
};

export default nextConfig;

import type { NextConfig } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  reactStrictMode: true,
  env: {
    GOOGLE_CLIENT_ID: process.env.NEXT_GOOGLE_CLIENT_ID ?? '',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${BASE_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;

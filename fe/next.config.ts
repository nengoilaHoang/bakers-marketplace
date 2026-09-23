import type { NextConfig } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

const nextConfig: NextConfig = {
	/* config options here */
	reactCompiler: true,
	reactStrictMode: true,
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

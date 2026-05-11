import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.com',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },

  experimental: {
    typedRoutes: true,
    serverActions: {
      bodySizeLimit: '4mb',
    },
  },

  async headers() {
    return [
      {
        source: '/api/webhooks/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache' },
        ],
      },
    ]
  },

  async redirects() {
    return [
      {
        source: '/shop',
        destination: '/drops',
        permanent: false,
      },
    ]
  },
}

export default nextConfig

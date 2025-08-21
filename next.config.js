
/** @type {import('next').NextConfig} */

// Load environment variables from .env file
require('dotenv').config({ path: './.env' });

const nextConfig = {
  // The `env` property is a modern and standard way to expose variables to the browser.
  // It ensures that NEXT_PUBLIC_ variables from your .env file are available in the client-side code.
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_API_KEY_BACKEND: process.env.NEXT_PUBLIC_API_KEY_BACKEND,
    NEXT_PUBLIC_COINMARKETCAP_API_KEY: process.env.NEXT_PUBLIC_COINMARKETCAP_API_KEY,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        // We use an environment variable for the backend URL to make it configurable.
        destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`,
      },
    ]
  },
  allowedDevOrigins: [
      "https://6000-firebase-strawberry-scroll-1754699729740.cluster-ux5mmlia3zhhask7riihruxydo.cloudworkstations.dev",
  ],
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.qrserver.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 's2.coinmarketcap.com',
        port: '',
        pathname: '/static/img/coins/64x64/**',
      },
       {
        protocol: 'https',
        hostname: 'pro-api.coinmarketcap.com',
      }
    ],
    dangerouslyAllowSVG: true,
  },
};

module.exports = nextConfig;

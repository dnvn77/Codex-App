
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `https://us-central1-strawberry-scroll.cloudfunctions.net/api/:path*`,
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
    ],
    dangerouslyAllowSVG: true,
  },
};

export default nextConfig;

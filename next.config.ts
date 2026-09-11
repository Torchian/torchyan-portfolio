import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactCompiler: true,
  compiler: {
    styledComponents: true,
  },
  images: {
    // Serve AVIF when the browser supports it (smallest), falling back to
    // WebP, ahead of the original source format.
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
  },
};

export default nextConfig;

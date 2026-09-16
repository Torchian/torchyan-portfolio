import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  reactCompiler: true,
  compiler: {
    styledComponents: true,
  },
  images: {
    // Serve AVIF when the browser supports it (smallest), falling back to
    // WebP, ahead of the original source format.
    formats: ['image/avif', 'image/webp'],
  },
};

export default withNextIntl(nextConfig);

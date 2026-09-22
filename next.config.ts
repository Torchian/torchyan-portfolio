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
    // Fewer candidate widths: fewer variants to encode on first request and
    // more cache hits after. Nothing on the site is drawn wider than 1280 CSS
    // px, so 2560 covers it at 2x.
    deviceSizes: [640, 828, 1080, 1280, 1920, 2560],
    imageSizes: [64, 128, 256, 384],
    // Keep encoded variants for 31 days instead of the default 4 hours, so
    // they aren't re-encoded all day. When you replace an image, give the new
    // file a new name (see scripts/optimize-images.ts).
    minimumCacheTTL: 2678400,
  },
};

export default withNextIntl(nextConfig);

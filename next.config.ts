import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/**
 * Content Security Policy, sent **report-only** for now.
 *
 * Report-only because it cannot be proved safe from here: the two analytics
 * scripts only load when their env vars are set, which they are not in this
 * repo, so nothing exercises the script-src and connect-src entries below. Watch
 * the browser console on the deployed site with the analytics keys in place,
 * then switch the header name to `Content-Security-Policy` once a session
 * through every page reports nothing. Shipping it enforced first risks a blank
 * page in production for a policy nobody has seen fail.
 *
 * Why the loose bits are there:
 *  - `'unsafe-inline'` in script-src: Next.js inlines its own bootstrap and the
 *    flight data. A nonce needs every page to be dynamically rendered, which
 *    would cost this site its static export. `'strict-dynamic'` with a nonce is
 *    the upgrade path if that trade changes.
 *  - `'unsafe-inline'` in style-src: styled-components writes real inline
 *    styles. There is no nonce path for it in this setup.
 *  - no `'unsafe-eval'`: nothing needs it in a production build.
 *
 * Everything else the site uses is first-party: the fonts are local
 * (`next/font/local`), the images are all in `public/`, and so are the sounds.
 */
const csp = [
  "default-src 'self'",
  // Google Tag Manager (GA4) and Yandex Metrica; both only load when their
  // NEXT_PUBLIC_* env var is set (src/lib/analytics/provider.tsx).
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://mc.yandex.ru",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://mc.yandex.ru https://www.google-analytics.com",
  "font-src 'self'",
  "media-src 'self'",
  "connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com https://mc.yandex.ru",
  // Yandex Metrica's Webvisor talks to the page through a frame.
  'frame-src https://mc.yandex.ru',
  "object-src 'none'",
  "base-uri 'self'",
  // The contact form has no endpoint yet; widen this when it gets one.
  "form-action 'self'",
  "frame-ancestors 'none'",
  // `upgrade-insecure-requests` belongs here too, but a report-only policy
  // ignores it and Chrome warns about it on every page load. Add it in the same
  // change that switches the header name to `Content-Security-Policy`.
].join('; ');

/**
 * Headers every response carries. HSTS is a year without `preload`: preloading
 * is hard to undo (the list ships in browser binaries), so it is a decision for
 * after the domain has been live on HTTPS for a while.
 */
const securityHeaders = [
  { key: 'Content-Security-Policy-Report-Only', value: csp },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Nothing on the site asks for a device or the user's location.
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  },
  // frame-ancestors above covers this; kept for browsers that predate CSP 2.
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
];

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
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
  // The Work page (and its case pages) moved from /projects to /work; keep
  // old links and search results landing somewhere real.
  async redirects() {
    return [
      { source: '/projects/:slug*', destination: '/work/:slug*', permanent: true },
      { source: '/:locale(ru|hy)/projects/:slug*', destination: '/:locale/work/:slug*', permanent: true },
    ];
  },
};

export default withNextIntl(nextConfig);

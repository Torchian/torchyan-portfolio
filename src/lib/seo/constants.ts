import type { SiteMetadata } from '@/types/seo';

export const siteMetadata: SiteMetadata = {
  siteName: 'Torchyan',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://torchyan.design',
  // Pages read their titles and descriptions from messages/*.json (meta.*);
  // these two are the English fallbacks and must say the same thing.
  defaultTitle: 'Torchyan — Digital Product Studio',
  defaultDescription:
    'Founder-led studio for websites and digital products. Strategy, UX, design and engineering carried from first direction to production — then improved after launch.',
  // 1200x630, the size every social platform crops from. JPEG rather than PNG:
  // the artwork is photographic, so JPEG is 145 KB against PNG's 642 KB with no
  // visible difference, and LinkedIn still does not render WebP previews.
  defaultOgImage: '/og/default.jpg',
  twitterHandle: undefined,
  locale: 'en_US',
};

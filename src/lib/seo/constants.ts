import type { SiteMetadata } from '@/types/seo';

export const siteMetadata: SiteMetadata = {
  siteName: 'Stepan Torchyan',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://torchyan.design',
  defaultTitle: 'Stepan Torchyan — Design Engineer',
  defaultDescription:
    'Design engineering portfolio of Stepan Torchyan. Building performant, accessible, and beautifully crafted web experiences.',
  // 1200x630, the size every social platform crops from. JPEG rather than PNG:
  // the artwork is photographic, so JPEG is 145 KB against PNG's 642 KB with no
  // visible difference, and LinkedIn still does not render WebP previews.
  defaultOgImage: '/og/default.jpg',
  twitterHandle: undefined,
  locale: 'en_US',
};

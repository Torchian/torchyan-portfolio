import type { SiteMetadata } from '@/types/seo';

export const siteMetadata: SiteMetadata = {
  siteName: 'Stepan Torchyan',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://torchyan.com',
  defaultTitle: 'Stepan Torchyan — Design Engineer',
  defaultDescription:
    'Design engineering portfolio of Stepan Torchyan. Building performant, accessible, and beautifully crafted web experiences.',
  defaultOgImage: '/og/default.png',
  twitterHandle: undefined,
  locale: 'en_US',
};

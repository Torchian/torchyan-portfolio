import type { Metadata } from 'next';
import { siteMetadata } from './constants';
import type { SEOFields } from '@/types/seo';

interface GenerateMetadataOptions {
  path: string;
  seo?: SEOFields;
  title?: string;
  description?: string;
}

export function generatePageMetadata({
  path,
  seo,
  title,
  description,
}: GenerateMetadataOptions): Metadata {
  const pageTitle = seo?.title ?? title ?? siteMetadata.defaultTitle;
  const pageDescription = seo?.description ?? description ?? siteMetadata.defaultDescription;
  const ogImage = seo?.ogImage ?? `${siteMetadata.siteUrl}${siteMetadata.defaultOgImage}`;
  const canonicalUrl = `${siteMetadata.siteUrl}${path}`;

  return {
    title: pageTitle,
    description: pageDescription,
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: canonicalUrl,
      siteName: siteMetadata.siteName,
      images: [{ url: ogImage, width: 1200, height: 630 }],
      locale: siteMetadata.locale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDescription,
      images: [ogImage],
      ...(siteMetadata.twitterHandle && { creator: siteMetadata.twitterHandle }),
    },
    alternates: {
      canonical: canonicalUrl,
    },
    ...(seo?.noIndex && {
      robots: { index: false, follow: false },
    }),
  };
}

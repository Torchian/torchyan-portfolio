import type { Metadata } from 'next';
import { siteMetadata } from './constants';
import type { SEOFields } from '@/types/seo';
import { getPathname } from '@/i18n/navigation';
import { OG_LOCALES, routing, type Locale } from '@/i18n/routing';

interface GenerateMetadataOptions {
  locale: Locale;
  /** The page's path without a locale prefix, e.g. '/about'. */
  path: string;
  siteName: string;
  title: string;
  /** Use the title as is, without the layout's "%s | Stepan Torchyan" template (the home page). */
  absoluteTitle?: boolean;
  description: string;
  seo?: SEOFields;
}

/** The page's absolute URL in a given language: /about, /ru/about, /hy/about. */
export function localizedUrl(locale: Locale, path: string) {
  return `${siteMetadata.siteUrl}${getPathname({ locale, href: path })}`;
}

/** Every language's URL for a page, plus x-default (English) — for hreflang links and the sitemap. */
export function languageAlternates(path: string) {
  const languages: Record<string, string> = {};
  for (const locale of routing.locales) languages[locale] = localizedUrl(locale, path);
  languages['x-default'] = localizedUrl(routing.defaultLocale, path);
  return languages;
}

export function generatePageMetadata({
  locale,
  path,
  siteName,
  title,
  absoluteTitle = false,
  description,
  seo,
}: GenerateMetadataOptions): Metadata {
  const pageTitle = seo?.title ?? title;
  const pageDescription = seo?.description ?? description;
  const socialTitle = absoluteTitle ? pageTitle : `${pageTitle} | ${siteName}`;
  const ogImage = seo?.ogImage ?? `${siteMetadata.siteUrl}${siteMetadata.defaultOgImage}`;
  const canonicalUrl = localizedUrl(locale, path);

  return {
    title: absoluteTitle ? { absolute: pageTitle } : pageTitle,
    description: pageDescription,
    openGraph: {
      title: socialTitle,
      description: pageDescription,
      url: canonicalUrl,
      siteName,
      images: [{ url: ogImage, width: 1200, height: 630 }],
      locale: OG_LOCALES[locale],
      alternateLocale: routing.locales.filter((l) => l !== locale).map((l) => OG_LOCALES[l]),
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: socialTitle,
      description: pageDescription,
      images: [ogImage],
      ...(siteMetadata.twitterHandle && { creator: siteMetadata.twitterHandle }),
    },
    alternates: {
      canonical: canonicalUrl,
      languages: languageAlternates(path),
    },
    ...(seo?.noIndex && {
      robots: { index: false, follow: false },
    }),
  };
}

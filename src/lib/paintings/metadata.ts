import type { Metadata } from 'next';
import { OG_LOCALES, routing, type Locale } from '@/i18n/routing';
import { PAINTINGS_URL } from './site';

/** A paintings page's public URL: on its own host, English unprefixed, /ru and /hy otherwise. */
export function paintingsUrl(locale: Locale, path: string) {
  const prefix = locale === routing.defaultLocale ? '' : `/${locale}`;
  return `${PAINTINGS_URL}${prefix}${path === '/' ? '' : path}` || PAINTINGS_URL;
}

interface Options {
  locale: Locale;
  /** The page's path on the paintings host, without a language prefix: '/', '/commissions'. */
  path: string;
  title: string;
  /** Use the title as is, not inside the layout's template (the landing page). */
  absoluteTitle?: boolean;
  description: string;
  siteName: string;
  /** For link previews; a painting page passes its painting. */
  image?: { url: string; width: number; height: number };
}

export function paintingsMetadata({ locale, path, title, absoluteTitle, description, siteName, image }: Options): Metadata {
  const languages: Record<string, string> = {};
  for (const l of routing.locales) languages[l] = paintingsUrl(l, path);
  languages['x-default'] = paintingsUrl(routing.defaultLocale, path);
  const url = paintingsUrl(locale, path);
  const images = image ? [{ url: `${PAINTINGS_URL}${image.url}`, width: image.width, height: image.height }] : undefined;

  return {
    metadataBase: new URL(PAINTINGS_URL),
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: url, languages },
    openGraph: {
      title: absoluteTitle ? title : `${title} — ${siteName}`,
      description,
      url,
      siteName,
      locale: OG_LOCALES[locale],
      type: 'website',
      images,
    },
    twitter: { card: 'summary_large_image', title, description, images: images?.map((i) => i.url) },
  };
}

import { hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing, type Locale } from './routing';

export interface LocaleParams {
  params: Promise<{ locale: string }>;
}

/**
 * Validates the [locale] segment (unknown → 404) and marks the segment for
 * static rendering. Call it first in every localized layout, page and
 * generateMetadata.
 */
export async function resolveLocale(params: Promise<{ locale: string }>): Promise<Locale> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  return locale;
}

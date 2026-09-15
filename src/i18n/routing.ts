import { defineRouting } from 'next-intl/routing';

/**
 * English lives at the unprefixed URLs (/, /about); Russian and Armenian under
 * /ru and /hy. src/proxy.ts picks a first-time visitor's language (country,
 * then browser language) and owns the cookie, so next-intl's own detection and
 * cookie are off.
 */
export const routing = defineRouting({
  locales: ['en', 'ru', 'hy'],
  defaultLocale: 'en',
  localePrefix: 'as-needed',
  localeDetection: false,
  localeCookie: false,
});

export type Locale = (typeof routing.locales)[number];

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (routing.locales as readonly string[]).includes(value);
}

/** Remembers the visitor's language: set by the proxy on a first visit, and by the language switcher. */
export const LOCALE_COOKIE = 'NEXT_LOCALE';
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/** What the language switcher shows — each language in its own script, never translated. */
export const LANGUAGE_LABELS: Record<Locale, string> = {
  en: 'Eng',
  ru: 'Рус',
  hy: 'Հայ',
};

/** For Intl formatting (dates, numbers). */
export const INTL_LOCALES: Record<Locale, string> = {
  en: 'en-US',
  ru: 'ru-RU',
  hy: 'hy-AM',
};

/** For Open Graph's og:locale. */
export const OG_LOCALES: Record<Locale, string> = {
  en: 'en_US',
  ru: 'ru_RU',
  hy: 'hy_AM',
};

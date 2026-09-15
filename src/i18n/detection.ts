import { isLocale, routing, type Locale } from './routing';

/** Countries whose visitors get a language other than English on their first visit. Edit freely. */
export const COUNTRY_LOCALES: Record<string, Locale> = {
  AM: 'hy',
  RU: 'ru',
  BY: 'ru',
  KZ: 'ru',
  KG: 'ru',
  TJ: 'ru',
  UZ: 'ru',
  TM: 'ru',
};

/** Where hosts put the visitor's country (ISO 3166-1 alpha-2), in the order we trust them. */
const COUNTRY_HEADERS = [
  'x-vercel-ip-country', // Vercel
  'cf-ipcountry', // Cloudflare
  'cloudfront-viewer-country', // AWS CloudFront
  'x-country-code', // generic reverse proxies
];

export function countryFrom(headers: Headers): string | null {
  for (const name of COUNTRY_HEADERS) {
    const value = headers.get(name);
    if (value && /^[a-z]{2}$/i.test(value)) return value.toUpperCase();
  }
  // No geo header on localhost: DEV_COUNTRY=AM npm run dev simulates one.
  if (process.env.NODE_ENV === 'development' && process.env.DEV_COUNTRY) {
    return process.env.DEV_COUNTRY.toUpperCase();
  }
  return null;
}

/** The highest-ranked Accept-Language entry we have a translation for. */
export function localeFromAcceptLanguage(header: string | null): Locale | null {
  if (!header) return null;
  const ranked = header
    .split(',')
    .map((part) => {
      const [tag, ...params] = part.trim().split(';');
      const q = params.map((p) => p.trim()).find((p) => p.startsWith('q='));
      return { base: tag.trim().toLowerCase().split('-')[0], weight: q ? Number(q.slice(2)) : 1 };
    })
    .filter(({ base, weight }) => base && weight > 0)
    .sort((a, b) => b.weight - a.weight);

  for (const { base } of ranked) {
    if (isLocale(base)) return base;
  }
  return null;
}

/** Country first, then the browser's languages, then English. */
export function detectLocale(headers: Headers): Locale {
  const country = countryFrom(headers);
  return (
    (country && COUNTRY_LOCALES[country]) ||
    localeFromAcceptLanguage(headers.get('accept-language')) ||
    routing.defaultLocale
  );
}

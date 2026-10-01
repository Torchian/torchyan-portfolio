import { routing, type Locale } from './routing';

/**
 * Countries whose visitors get a language other than English on their first
 * visit. Edit freely — anything not listed here gets English.
 *
 * Armenia is deliberately absent: the site's audience there reads English, and
 * Armenian is a choice the switcher offers rather than one the site makes.
 */
export const COUNTRY_LOCALES: Record<string, Locale> = {
  // Suspended for the studio relaunch: the English copy is new and the Russian
  // adaptation has not been written yet, so sending these visitors to /ru would
  // show them text that lags the English site. Restore the map below once
  // messages/ru.json carries the adapted copy (and run `npm run check:messages`).
  //   RU, BY, KZ, KG, TJ, UZ, TM → 'ru'
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
  // No geo header on localhost: DEV_COUNTRY=RU npm run dev simulates one.
  if (process.env.NODE_ENV === 'development' && process.env.DEV_COUNTRY) {
    return process.env.DEV_COUNTRY.toUpperCase();
  }
  return null;
}

/**
 * The country decides, and nothing else: English everywhere but the countries
 * listed above.
 *
 * `Accept-Language` used to have a say after the country, and it was dropped on
 * purpose. It is the visitor's *interface* language, not a statement about what
 * they want to read here, and it quietly broke the rule it was meant to serve:
 * a Russian-speaking visitor in Germany or the United States was sent to the
 * Russian site although nothing about their visit said to. English is the one
 * language every visitor of this site is assumed to read; the other two are a
 * courtesy where the whole country shares them, and a click away everywhere
 * else. The choice is then remembered in `NEXT_LOCALE` for a year, so it is
 * made once.
 */
export function detectLocale(headers: Headers): Locale {
  const country = countryFrom(headers);
  return (country && COUNTRY_LOCALES[country]) || routing.defaultLocale;
}

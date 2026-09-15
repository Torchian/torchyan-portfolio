import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { detectLocale } from '@/i18n/detection';
import { isLocale, LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE, routing } from '@/i18n/routing';

/*
 * Language routing.
 *
 *  - /ru/… and /hy/… always render that language: an explicit link wins, and
 *    doesn't change the visitor's remembered choice.
 *  - An unprefixed page (English) sends a visitor to their language when it
 *    isn't English: the remembered choice if there is one, otherwise detected
 *    once from their country and browser language, then remembered.
 *  - Crawlers are never redirected; they find the other languages through
 *    hreflang links.
 */

const handleI18nRouting = createMiddleware(routing);

const BOT = /bot|crawl|spider|slurp|facebookexternalhit|embedly|preview|lighthouse/i;

const COOKIE_OPTIONS = {
  path: '/',
  maxAge: LOCALE_COOKIE_MAX_AGE,
  sameSite: 'lax',
} as const;

function hasLocalePrefix(pathname: string) {
  return isLocale(pathname.split('/')[1]);
}

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    request.method !== 'GET' ||
    hasLocalePrefix(pathname) ||
    BOT.test(request.headers.get('user-agent') ?? '')
  ) {
    return handleI18nRouting(request);
  }

  const stored = request.cookies.get(LOCALE_COOKIE)?.value;
  const locale = isLocale(stored) ? stored : detectLocale(request.headers);

  if (locale !== routing.defaultLocale) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`;
    const response = NextResponse.redirect(url, 307);
    // Depends on who's asking: never cache it.
    response.headers.set('Cache-Control', 'private, no-store');
    if (!isLocale(stored)) response.cookies.set(LOCALE_COOKIE, locale, COOKIE_OPTIONS);
    return response;
  }

  const response = handleI18nRouting(request);
  if (!isLocale(stored)) response.cookies.set(LOCALE_COOKIE, locale, COOKIE_OPTIONS);
  return response;
}

export const config = {
  // Pages only: not API routes, Next internals, the Sanity studio, or files with an extension.
  matcher: ['/((?!api|_next|_vercel|studio|.*\\..*).*)'],
};

import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { detectLocale } from '@/i18n/detection';
import { isLocale, LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE, routing } from '@/i18n/routing';
import { maintenanceGate } from '@/lib/maintenance';
import { PAINTINGS_HOST } from '@/lib/paintings/site';

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

/*
 * The paintings site: paintings.torchyan.design, served from this app's
 * /[locale]/paintings/… pages. Its URLs have no /paintings in them — /, /<work>,
 * /commissions, with /ru and /hy in front as on the main site — and are
 * rewritten here. Anywhere other than the two real hosts (a Vercel preview,
 * localhost) `?site=paintings` switches the whole host to the paintings site
 * for that browser and `?site=main` switches it back; paintings.localhost works
 * without either.
 */
const MAIN_HOSTS = new Set(['torchyan.design', 'www.torchyan.design']);
const SITE_COOKIE = 'site';

function hostOf(request: NextRequest) {
  return (request.headers.get('host') ?? '').split(':')[0].toLowerCase();
}

function isPaintingsRequest(request: NextRequest) {
  const host = hostOf(request);
  if (host.startsWith('paintings.')) return true;
  if (MAIN_HOSTS.has(host)) return false;
  return request.cookies.get(SITE_COOKIE)?.value === 'paintings';
}

/** The visitor's language when the URL doesn't name one: remembered, else detected. */
function preferredLocale(request: NextRequest) {
  const stored = request.cookies.get(LOCALE_COOKIE)?.value;
  return { stored, locale: isLocale(stored) ? stored : detectLocale(request.headers) };
}

function noStore(response: NextResponse) {
  // Depends on who's asking: never cache it.
  response.headers.set('Cache-Control', 'private, no-store');
  return response;
}

/** A request on the paintings host: the same language rules as the main site, then a rewrite. */
function routePaintings(request: NextRequest) {
  const url = request.nextUrl.clone();
  const [, first, ...rest] = url.pathname.split('/');
  const prefixed = isLocale(first);
  let path = `/${(prefixed ? rest : [first, ...rest]).join('/')}`.replace(/\/+$/, '') || '/';

  // A /paintings/… URL (the internal path, or an old link) is the same page without it.
  if (path === '/paintings' || path.startsWith('/paintings/')) {
    path = path.slice('/paintings'.length) || '/';
    url.pathname = `${prefixed && first !== routing.defaultLocale ? `/${first}` : ''}${path === '/' ? '' : path}` || '/';
    return NextResponse.redirect(url, 308);
  }

  // English has no prefix, as on the main site.
  if (prefixed && first === routing.defaultLocale) {
    url.pathname = path;
    return NextResponse.redirect(url, 308);
  }

  let locale = prefixed ? first : routing.defaultLocale;
  let remember: string | null = null;
  if (!prefixed && request.method === 'GET' && !BOT.test(request.headers.get('user-agent') ?? '')) {
    const preferred = preferredLocale(request);
    if (!isLocale(preferred.stored)) remember = preferred.locale;
    if (preferred.locale !== routing.defaultLocale) {
      url.pathname = `/${preferred.locale}${path === '/' ? '' : path}`;
      const response = noStore(NextResponse.redirect(url, 307));
      if (remember) response.cookies.set(LOCALE_COOKIE, remember, COOKIE_OPTIONS);
      return response;
    }
    locale = routing.defaultLocale;
  }

  url.pathname = `/${locale}/paintings${path === '/' ? '' : path}`;
  const response = NextResponse.rewrite(url);
  if (remember) response.cookies.set(LOCALE_COOKIE, remember, COOKIE_OPTIONS);
  return response;
}

export default async function proxy(request: NextRequest) {
  // Before anything else, including the language routing: while the site is
  // being worked on there is nothing to route to.
  const held = await maintenanceGate(request);
  if (held) return held;

  // Previews and localhost: switch this browser between the two sites.
  const site = request.nextUrl.searchParams.get('site');
  if ((site === 'paintings' || site === 'main') && !MAIN_HOSTS.has(hostOf(request)) && !hostOf(request).startsWith('paintings.')) {
    const url = request.nextUrl.clone();
    url.searchParams.delete('site');
    const response = noStore(NextResponse.redirect(url, 307));
    if (site === 'paintings') response.cookies.set(SITE_COOKIE, 'paintings', { path: '/', sameSite: 'lax' });
    else response.cookies.delete(SITE_COOKIE);
    return response;
  }

  if (isPaintingsRequest(request)) return routePaintings(request);

  const { pathname } = request.nextUrl;

  // The paintings pages belong to their own host; on the main one they move there.
  const [, maybeLocale, maybePaintings, ...restOfPath] = pathname.split('/');
  const paintingsPath =
    maybeLocale === 'paintings'
      ? { locale: '', rest: [maybePaintings, ...restOfPath] }
      : isLocale(maybeLocale) && maybePaintings === 'paintings'
        ? { locale: maybeLocale === routing.defaultLocale ? '' : `/${maybeLocale}`, rest: restOfPath }
        : null;
  if (paintingsPath) {
    const rest = paintingsPath.rest.filter((part) => part !== undefined).join('/');
    if (MAIN_HOSTS.has(hostOf(request))) {
      const target = new URL(`https://${PAINTINGS_HOST}${paintingsPath.locale}${rest ? `/${rest}` : ''}`);
      target.search = request.nextUrl.search;
      return NextResponse.redirect(target, 308);
    }
    // A preview or localhost has no paintings host: switch this browser to the paintings site.
    const url = request.nextUrl.clone();
    url.pathname = `${paintingsPath.locale}${rest ? `/${rest}` : ''}` || '/';
    url.searchParams.set('site', 'paintings');
    return noStore(NextResponse.redirect(url, 307));
  }

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
  // Pages only: not API routes, Next internals, or files with an extension.
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};

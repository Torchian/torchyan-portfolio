import { NextResponse, type NextRequest } from 'next/server';

/*
 * Maintenance mode: the site answers a holding page to everyone but whoever
 * knows the phrase.
 *
 * It is on whenever MAINTENANCE_PASSPHRASE is set to something non-empty, and
 * off when it is not — one variable rather than a switch and a secret that can
 * disagree with each other. Changing it on the host takes a redeploy, the same
 * as any other environment variable there.
 *
 * What this is for: keeping a site that is still being worked on away from
 * visitors and out of search results. It is not authentication, and nothing
 * behind it is private in any stronger sense — the pages are still served by
 * the same public host, and anyone with the phrase has the same access you do.
 * Do not put anything here you would mind a stranger reading if the phrase got
 * out.
 */

/** Set on the host; its presence is what turns the gate on. */
const PASSPHRASE = process.env.MAINTENANCE_PASSPHRASE?.trim();

/** The query that unlocks: /?unlock=<phrase>. */
const UNLOCK_PARAM = 'unlock';

const COOKIE = 'site-pass';
/** A month, so the phrase is typed once rather than every visit. */
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

export function maintenanceIsOn() {
  return Boolean(PASSPHRASE);
}

/**
 * What the cookie carries: the phrase hashed, not the phrase. A cookie that
 * leaks then shows what was granted, not what to type. It is only SHA-256 of a
 * phrase a person can remember, so it would not survive a dictionary — which is
 * the right strength for what it guards.
 */
async function token(phrase: string) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(phrase));
  return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Compares without leaking where two strings first differ. */
function sameString(a: string, b: string) {
  if (a.length !== b.length) return false;
  let difference = 0;
  for (let i = 0; i < a.length; i++) difference |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return difference === 0;
}

/**
 * The holding page, written here rather than rendered as a route: the point is
 * that none of the site loads, and a route would be part of the site.
 */
function holdingPage(locale: string, wrong: boolean) {
  const title = 'torchyan.design';
  const message = wrong ? 'That phrase does not open it.' : 'This site is being worked on.';
  return `<!doctype html>
<html lang="${locale}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${title}</title>
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" href="/icon.svg" type="image/svg+xml">
<style>
  :root { color-scheme: dark }
  * { box-sizing: border-box }
  body {
    margin: 0; min-height: 100dvh; display: flex; align-items: center; justify-content: center;
    padding: 24px; background: #0b0915; color: #f6f6f6;
    font: 400 16px/1.5 ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  }
  main { width: 100%; max-width: 380px; text-align: center }
  h1 { margin: 0 0 8px; font-size: 20px; font-weight: 600; letter-spacing: 0.01em }
  p { margin: 0 0 24px; color: #9a97a8; font-size: 15px }
  form { display: flex; gap: 8px }
  input {
    flex: 1; min-width: 0; padding: 12px 14px; border-radius: 999px;
    border: 1px solid rgba(246,246,246,0.18); background: rgba(246,246,246,0.04);
    color: #f6f6f6; font: inherit; font-size: 16px;
  }
  input::placeholder { color: #6f6c7d }
  input:focus-visible { outline: 2px solid #0caf0a; outline-offset: 2px }
  button {
    padding: 12px 20px; border: 0; border-radius: 999px; background: #0caf0a;
    color: #f6f6f6; font: inherit; font-weight: 600; cursor: pointer;
  }
  button:focus-visible { outline: 2px solid #f6f6f6; outline-offset: 2px }
  .wrong { color: #ff6b6b }
</style>
</head>
<body>
<main>
  <h1>${title}</h1>
  <p${wrong ? ' class="wrong"' : ''}>${message}</p>
  <form method="GET" action="/">
    <input type="password" name="${UNLOCK_PARAM}" placeholder="Passphrase"
           aria-label="Passphrase" autocomplete="current-password" autofocus>
    <button type="submit">Enter</button>
  </form>
</main>
</body>
</html>`;
}

/**
 * Runs before anything else. Returns a response when it has taken the request,
 * and null when the visitor is through and the rest of the routing should run.
 */
export async function maintenanceGate(request: NextRequest): Promise<NextResponse | null> {
  if (!PASSPHRASE) return null;

  const expected = await token(PASSPHRASE);
  const offered = request.nextUrl.searchParams.get(UNLOCK_PARAM);

  // Coming in with the phrase: remember it and send them to the clean URL, so
  // the phrase does not sit in the address bar afterwards.
  if (offered !== null) {
    if (sameString(offered, PASSPHRASE)) {
      const url = request.nextUrl.clone();
      url.searchParams.delete(UNLOCK_PARAM);
      const response = NextResponse.redirect(url, 307);
      response.cookies.set(COOKIE, expected, {
        path: '/',
        maxAge: COOKIE_MAX_AGE,
        httpOnly: true,
        sameSite: 'lax',
        secure: request.nextUrl.protocol === 'https:',
      });
      return response;
    }
    return holding(request, true);
  }

  const held = request.cookies.get(COOKIE)?.value;
  if (held && sameString(held, expected)) return null;

  return holding(request, false);
}

function holding(request: NextRequest, wrong: boolean) {
  const locale = request.nextUrl.pathname.split('/')[1] || 'en';
  return new NextResponse(holdingPage(locale.length === 2 ? locale : 'en', wrong), {
    // 503 rather than 200: it tells a crawler the site is away for a while and
    // to come back, instead of letting it record a holding page as the site.
    status: 503,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'private, no-store',
      'retry-after': '3600',
      'x-robots-tag': 'noindex, nofollow',
    },
  });
}

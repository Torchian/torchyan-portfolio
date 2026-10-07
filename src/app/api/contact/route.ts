import { NextResponse } from 'next/server';
import en from '../../../../messages/en.json';
import { maintenanceIsOn } from '@/lib/maintenance';

/**
 * The contact form's endpoint.
 *
 * Everything here runs on the server, because nothing sent from a browser can be
 * trusted: the checks the form does are for the person filling it in, and these
 * are the ones that actually hold.
 *
 * Mail goes through Resend's REST API over `fetch` rather than its SDK — one
 * POST is not worth a dependency, and it keeps the route free of anything that
 * would need bundling.
 *
 * Needs `RESEND_API_KEY`, `CONTACT_FROM` and `CONTACT_TO` (see `.env.example`).
 * Without them the route answers 503 and the form shows its error state, rather
 * than accepting a message that would go nowhere.
 */

export const runtime = 'nodejs';

const LIMITS = { name: 100, email: 254, company: 200, website: 300, message: 4000 } as const;

/**
 * Deliberately loose: one @, something either side, a dot in the domain. The
 * only way to know an address is real is to send to it, and anything stricter
 * rejects addresses that are perfectly valid (RFC 5322 allows far more than
 * people expect).
 */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Same spirit: a scheme, then something with a dot in it. Optional field. */
const URL_LIKE = /^https?:\/\/[^\s.]+\.[^\s]+$/i;

/**
 * At most this many submissions from one IP per window.
 *
 * In-memory, so it holds only for as long as this instance lives and only for
 * the requests that instance sees: on serverless there may be several, and they
 * come and go. It stops the crude case — one script hammering the endpoint — and
 * nothing more. Real rate limiting needs shared state (Upstash, Vercel KV);
 * that, and a Turnstile challenge, are in TODO.md §12.
 */
const RATE_LIMIT = { max: 5, windowMs: 60 * 60 * 1000 } as const;
const hits = new Map<string, number[]>();

function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT.windowMs);
  recent.push(now);
  hits.set(ip, recent);
  // The map would otherwise grow for the life of the instance.
  if (hits.size > 5000) for (const [key, times] of hits) if (times.every((t) => now - t >= RATE_LIMIT.windowMs)) hits.delete(key);
  return recent.length > RATE_LIMIT.max;
}

/**
 * Option groups submit an index, not their label: the labels are translated, so
 * the same answer arrives as three different strings depending on the language.
 * The index is resolved against English here, so every message reads the same
 * whatever language it was sent in. An index that is not in the list is dropped
 * rather than guessed at.
 */
function optionLabel(group: 'intentOptions' | 'timelineOptions', index: unknown) {
  if (typeof index !== 'number' || !Number.isInteger(index)) return null;
  const options = en.contact[group] as string[];
  return options[index] ?? null;
}

const clean = (value: unknown, max: number) =>
  typeof value === 'string' ? value.trim().slice(0, max) : '';

export async function POST(request: Request) {
  // The proxy's gate covers pages, not this route, and a closed site should not
  // still have one door that sends mail.
  if (maintenanceIsOn()) {
    return NextResponse.json({ ok: false, error: 'unavailable' }, { status: 503 });
  }

  const { RESEND_API_KEY, CONTACT_FROM, CONTACT_TO } = process.env;
  if (!RESEND_API_KEY || !CONTACT_FROM || !CONTACT_TO) {
    // A 503 and no detail: which variable is missing is not the sender's business.
    console.error('[contact] mail is not configured: RESEND_API_KEY, CONTACT_FROM or CONTACT_TO is unset');
    return NextResponse.json({ ok: false, error: 'unavailable' }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid' }, { status: 400 });
  }

  // A field the form hides and a person never sees ("nickname"). Anything in it
  // is a bot, and it is answered with a success it will not check, so it has
  // nothing to retry. (It used to be called "company", which is now a real field.)
  if (clean(body.nickname, 200)) {
    return NextResponse.json({ ok: true });
  }

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';
  if (rateLimited(ip)) {
    return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 });
  }

  const name = clean(body.name, LIMITS.name);
  const email = clean(body.email, LIMITS.email);
  const company = clean(body.company, LIMITS.company);
  // People type "acme.com" as often as "https://acme.com"; accept both.
  const typedWebsite = clean(body.website, LIMITS.website);
  const website = typedWebsite && !/^https?:\/\//i.test(typedWebsite) ? `https://${typedWebsite}` : typedWebsite;
  const message = clean(body.message, LIMITS.message);

  const fields: Record<string, string> = {};
  if (!name) fields.name = 'required';
  if (!email) fields.email = 'required';
  else if (!EMAIL.test(email)) fields.email = 'invalid';
  if (website && !URL_LIKE.test(website)) fields.website = 'invalid';
  if (!message) fields.message = 'required';
  if (Object.keys(fields).length) {
    return NextResponse.json({ ok: false, error: 'invalid', fields }, { status: 400 });
  }

  const intent = optionLabel('intentOptions', body.intent);
  // The /contact page's short form: a message, not a project brief.
  const general = body.topic === 'message';
  const timeline = optionLabel('timelineOptions', body.timeline);
  const locale = ['en', 'ru', 'hy'].includes(String(body.locale)) ? String(body.locale) : 'unknown';

  const lines = [
    `Name:     ${name}`,
    `Email:    ${email}`,
    company && `Company:  ${company}`,
    website && `Website:  ${website}`,
    intent && `Needs:    ${intent}`,
    timeline && `Timeline: ${timeline}`,
    `Language: ${locale}`,
    '',
    message,
  ].filter(Boolean);

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${RESEND_API_KEY}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        from: CONTACT_FROM,
        to: [CONTACT_TO],
        // So a reply in the mail client goes to them, not to the site's own
        // address — `from` has to stay on the verified domain.
        reply_to: email,
        subject: `Torchyan — ${general ? 'Message' : (intent ?? 'New enquiry')} — ${company || name}`,
        text: lines.join('\n'),
      }),
    });

    if (!response.ok) {
      // Resend's message is logged, never returned: it can name the account.
      console.error('[contact] resend refused', response.status, await response.text());
      return NextResponse.json({ ok: false, error: 'send_failed' }, { status: 502 });
    }
  } catch (error) {
    console.error('[contact] resend unreachable', error);
    return NextResponse.json({ ok: false, error: 'send_failed' }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}

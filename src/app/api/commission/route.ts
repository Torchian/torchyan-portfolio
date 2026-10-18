import { NextResponse } from 'next/server';
import en from '../../../../messages/en.json';
import { maintenanceIsOn } from '@/lib/maintenance';
import { getPainting } from '@/lib/paintings/catalogue';

/**
 * The paintings site's commission form. Same delivery as the studio's contact
 * form (src/app/api/contact/route.ts): Resend over fetch, to CONTACT_TO, with
 * the sender as reply-to. The subject starts with "Paintings" so these are easy
 * to tell apart in the inbox.
 */

export const runtime = 'nodejs';

const LIMITS = { name: 100, email: 254, phone: 60, size: 120, deadline: 120, message: 4000 } as const;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Crude per-instance limit, as on the contact form: it stops one script hammering the endpoint, nothing more. */
const RATE_LIMIT = { max: 5, windowMs: 60 * 60 * 1000 } as const;
const hits = new Map<string, number[]>();

function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT.windowMs);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) for (const [key, times] of hits) if (times.every((t) => now - t >= RATE_LIMIT.windowMs)) hits.delete(key);
  return recent.length > RATE_LIMIT.max;
}

const clean = (value: unknown, max: number) => (typeof value === 'string' ? value.trim().slice(0, max) : '');

/** The kind is sent as an index into the (translated) options and read back in English. */
function kindLabel(index: unknown) {
  if (typeof index !== 'number' || !Number.isInteger(index)) return null;
  return (en.paintings.commissions.form.kindOptions as string[])[index] ?? null;
}

export async function POST(request: Request) {
  if (maintenanceIsOn()) return NextResponse.json({ ok: false, error: 'unavailable' }, { status: 503 });

  const { RESEND_API_KEY, CONTACT_FROM, CONTACT_TO } = process.env;
  if (!RESEND_API_KEY || !CONTACT_FROM || !CONTACT_TO) {
    console.error('[commission] mail is not configured: RESEND_API_KEY, CONTACT_FROM or CONTACT_TO is unset');
    return NextResponse.json({ ok: false, error: 'unavailable' }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid' }, { status: 400 });
  }

  // The hidden field: a bot. Answer as if it worked.
  if (clean(body.nickname, 200)) return NextResponse.json({ ok: true });

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
  if (rateLimited(ip)) return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 });

  const name = clean(body.name, LIMITS.name);
  const email = clean(body.email, LIMITS.email);
  const message = clean(body.message, LIMITS.message);
  const fields: Record<string, string> = {};
  if (!name) fields.name = 'required';
  if (!email) fields.email = 'required';
  else if (!EMAIL.test(email)) fields.email = 'invalid';
  if (!message) fields.message = 'required';
  if (Object.keys(fields).length) return NextResponse.json({ ok: false, error: 'invalid', fields }, { status: 400 });

  const phone = clean(body.phone, LIMITS.phone);
  const size = clean(body.size, LIMITS.size);
  const deadline = clean(body.deadline, LIMITS.deadline);
  const kind = kindLabel(body.kind);
  const painting = typeof body.painting === 'string' ? getPainting(body.painting) : undefined;
  const locale = ['en', 'ru', 'hy'].includes(String(body.locale)) ? String(body.locale) : 'unknown';

  const lines = [
    `Name:     ${name}`,
    `Email:    ${email}`,
    phone && `Phone:    ${phone}`,
    kind && `Subject:  ${kind}`,
    painting && `About:    ${painting.title.en} (https://paintings.torchyan.design/${painting.slug})`,
    size && `Size:     ${size}`,
    deadline && `Date:     ${deadline}`,
    `Language: ${locale}`,
    '',
    message,
  ].filter(Boolean);

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${RESEND_API_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        from: CONTACT_FROM,
        to: [CONTACT_TO],
        reply_to: email,
        subject: `Paintings — ${painting ? `About "${painting.title.en}"` : `Commission${kind ? `: ${kind}` : ''}`} — ${name}`,
        text: lines.join('\n'),
      }),
    });
    if (!response.ok) {
      console.error('[commission] resend refused', response.status, await response.text());
      return NextResponse.json({ ok: false, error: 'send_failed' }, { status: 502 });
    }
  } catch (error) {
    console.error('[commission] resend unreachable', error);
    return NextResponse.json({ ok: false, error: 'send_failed' }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}

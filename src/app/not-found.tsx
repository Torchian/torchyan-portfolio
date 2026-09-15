'use client';

import NextError from 'next/error';

/** Requests that never reach a locale (e.g. an unknown locale segment) — no site chrome available. */
export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body>
        <NextError statusCode={404} />
      </body>
    </html>
  );
}

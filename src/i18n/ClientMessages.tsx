import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

/**
 * Which translations reach the browser.
 *
 * A provider without `messages` hands its client components the whole message
 * file, and every page then carries every page's copy in its HTML and its RSC
 * payload: the case studies alone are 26 KB of English, more in Russian and
 * Armenian, on a page that shows none of them. So the browser gets only the
 * namespaces client components actually read. Server components are not
 * affected: they read the request config, which always has everything.
 *
 * SITE_NAMESPACES is what the shell uses on every page (header, footer, loader,
 * language and sound controls, the 404). Each page adds its own with
 * <PageMessages>. A provider replaces its parent's messages rather than
 * merging with them, so a page's set includes the shell's.
 *
 * Adding a client component that reads a new namespace: add the namespace here
 * (shell) or to the page's <PageMessages>, or its strings render as their keys.
 */
export const SITE_NAMESPACES = [
  'common',
  'nav',
  'footer',
  'language',
  'sound',
  'notFound',
  'partners',
  'platforms',
] as const;

type Messages = Awaited<ReturnType<typeof getMessages>>;

/**
 * A subset of the messages, typed as the whole: the provider's type asks for
 * every namespace, and the point here is that the browser gets fewer.
 */
function pick(messages: Messages, namespaces: readonly string[]): Messages {
  const all = messages as Record<string, unknown>;
  const picked: Record<string, unknown> = {};
  for (const namespace of namespaces) {
    if (namespace in all) picked[namespace] = all[namespace];
  }
  return picked as Messages;
}

/** The root provider: the shell's namespaces only. */
export async function SiteMessages({ children }: { children: React.ReactNode }) {
  const messages = await getMessages();
  return <NextIntlClientProvider messages={pick(messages, SITE_NAMESPACES)}>{children}</NextIntlClientProvider>;
}

/** A page's provider: the shell's namespaces plus the ones its own client components read. */
export async function PageMessages({ namespaces, children }: { namespaces: readonly string[]; children: React.ReactNode }) {
  const messages = await getMessages();
  return (
    <NextIntlClientProvider messages={pick(messages, [...SITE_NAMESPACES, ...namespaces])}>
      {children}
    </NextIntlClientProvider>
  );
}

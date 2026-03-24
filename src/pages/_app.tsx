import type { AppProps } from 'next/app';

/**
 * Minimal Pages Router shell so Next can emit pages-manifest during build/dev.
 * All real routes live under `src/app` (App Router).
 */
export default function PagesShell({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

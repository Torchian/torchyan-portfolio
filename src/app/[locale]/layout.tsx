import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { Suspense } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { StyledComponentsRegistry } from '@/lib/styled-registry';
import { AnalyticsProvider } from '@/lib/analytics/provider';
import { SoundProvider } from '@/lib/sound/provider';
import { routing } from '@/i18n/routing';
import { PageLoader } from '@/components/layouts/PageLoader';
import { resolveLocale, type LocaleParams } from '@/i18n/server';

const gilroy = localFont({
  src: [
    { path: '../../../public/fonts/gilroy-thin.woff2', weight: '100' },
    { path: '../../../public/fonts/gilroy-ultralight.woff2', weight: '200' },
    { path: '../../../public/fonts/gilroy-regular.woff2', weight: '400' },
    { path: '../../../public/fonts/gilroy-medium.woff2', weight: '500' },
    { path: '../../../public/fonts/gilroy-semibold.woff2', weight: '600' },
    { path: '../../../public/fonts/gilroy-bold.woff2', weight: '700' },
    { path: '../../../public/fonts/gilroy-heavy.woff2', weight: '800' },
    { path: '../../../public/fonts/gilroy-black.woff2', weight: '900' },
  ],
  variable: '--font-gilroy',
  display: 'swap',
});

/*
 * Armenian: Bainsley (400 and 700 only). Gilroy has no Armenian glyphs, so the
 * font stacks fall through to these families for Armenian characters alone.
 * The glyphs are split by unicode-range, and neither family is preloaded, so a
 * browser downloads only what the page actually shows:
 *  - label: Հ ա յ — the language switcher's "Հայ", on every page (~4 KB);
 *  - full: the rest of the Armenian block — only pages with Armenian text (~19 KB).
 */
const armenianLabel = localFont({
  src: [
    { path: '../../../public/fonts/bainsley-armenian-label-regular.woff2', weight: '400' },
    { path: '../../../public/fonts/bainsley-armenian-label-bold.woff2', weight: '700' },
  ],
  variable: '--font-armenian-label',
  display: 'swap',
  preload: false,
  adjustFontFallback: false,
  fallback: [],
  declarations: [{ prop: 'unicode-range', value: 'U+0540, U+0561, U+0575' }],
});

const armenian = localFont({
  src: [
    { path: '../../../public/fonts/bainsley-armenian-regular.woff2', weight: '400' },
    { path: '../../../public/fonts/bainsley-armenian-bold.woff2', weight: '700' },
  ],
  variable: '--font-armenian',
  display: 'swap',
  preload: false,
  adjustFontFallback: false,
  fallback: [],
  declarations: [
    { prop: 'unicode-range', value: 'U+0530-053F, U+0541-0560, U+0562-0574, U+0576-058F, U+FB13-FB17' },
  ],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: 'meta' });
  return {
    title: {
      template: t('titleTemplate'),
      default: t('defaultTitle'),
    },
    description: t('description'),
  };
}

export default async function LocaleLayout({ children, params }: LocaleParams & { children: React.ReactNode }) {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: 'common' });

  return (
    // The site only has a dark design. data-theme is rendered here, not set by a <head> script:
    // switching language re-renders <html>, and React drops attributes it didn't render —
    // every theme colour (text, accents) then fell back to black.
    <html lang={locale} data-theme="dark" suppressHydrationWarning>
      <body className={`${gilroy.variable} ${armenianLabel.variable} ${armenian.variable}`}>
        <a id="skip-to-content" href="#main-content">
          {t('skipToContent')}
        </a>
        <NextIntlClientProvider>
          <StyledComponentsRegistry>
            <PageLoader />
            {children}
          </StyledComponentsRegistry>
          <SoundProvider />
        </NextIntlClientProvider>
        <Suspense fallback={null}>
          <AnalyticsProvider />
        </Suspense>
      </body>
    </html>
  );
}

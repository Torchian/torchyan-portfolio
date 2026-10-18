import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { PageMessages } from '@/i18n/ClientMessages';
import { resolveLocale, type LocaleParams } from '@/i18n/server';
import { PaintingsShell } from '@/components/paintings/PaintingsShell';
import { cormorant, serifArmenian } from '@/styles/fonts/paintings';
import { HAS_SAMPLES } from '@/lib/paintings/catalogue';

/*
 * paintings.torchyan.design. src/proxy.ts rewrites that host onto these pages,
 * so their own URLs have no /paintings in them. They share the root layout with
 * the studio site (fonts, translations, styles, analytics) and nothing else.
 */

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: 'paintings.meta' });
  return {
    title: { template: t('titleTemplate'), default: t('home.title') },
    description: t('home.description'),
  };
}

export default async function PaintingsLayout({ children, params }: LocaleParams & { children: React.ReactNode }) {
  await resolveLocale(params);
  return (
    <PageMessages namespaces={['paintings']}>
      <div className={`${cormorant.variable} ${serifArmenian.variable}`}>
        <PaintingsShell samples={HAS_SAMPLES}>{children}</PaintingsShell>
      </div>
    </PageMessages>
  );
}

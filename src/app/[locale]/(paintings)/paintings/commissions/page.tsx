import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { resolveLocale, type LocaleParams } from '@/i18n/server';
import { localized, PAINTINGS } from '@/lib/paintings/catalogue';
import { paintingsMetadata } from '@/lib/paintings/metadata';
import { CommissionsPage } from '@/components/paintings/Commissions';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: 'paintings.meta' });
  return paintingsMetadata({
    locale,
    path: '/commissions',
    title: t('commissions.title'),
    description: t('commissions.description'),
    siteName: t('siteName'),
  });
}

export default async function Commissions({ params }: LocaleParams) {
  const locale = await resolveLocale(params);
  // For "Ask about this painting": the form names the painting it came from.
  const titles = Object.fromEntries(PAINTINGS.map((p) => [p.slug, localized(p.title, locale)]));
  return <CommissionsPage titles={titles} />;
}

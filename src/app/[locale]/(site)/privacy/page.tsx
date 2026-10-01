import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { PrivacySection } from '@/components/sections/privacy/PrivacySection';
import { resolveLocale, type LocaleParams } from '@/i18n/server';
import { generatePageMetadata } from '@/lib/seo/metadata';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: 'meta' });
  return generatePageMetadata({
    locale,
    path: '/privacy',
    siteName: t('siteName'),
    title: t('privacy.title'),
    description: t('privacy.description'),
  });
}

export default async function PrivacyPage({ params }: LocaleParams) {
  await resolveLocale(params);

  return (
    <main id="main-content">
      <PrivacySection />
    </main>
  );
}

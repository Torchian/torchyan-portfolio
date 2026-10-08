import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ContactHeroSection } from '@/components/sections/contact/ContactTalkSections';
import { resolveLocale, type LocaleParams } from '@/i18n/server';
import { generatePageMetadata } from '@/lib/seo/metadata';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: 'meta' });
  return generatePageMetadata({
    locale,
    path: '/contact',
    siteName: t('siteName'),
    title: t('contact.title'),
    description: t('contact.description'),
  });
}

/*
 * For everything that isn't a project brief: a short message, then the ways
 * to reach me directly. A project goes to /start-a-project.
 */
export default async function ContactPage({ params }: LocaleParams) {
  await resolveLocale(params);

  return (
    <main id="main-content">
      <ContactHeroSection />
    </main>
  );
}

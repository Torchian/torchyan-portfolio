import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { PageHeroSection } from '@/components/sections/projects-page/ProjectsHeroSection';
import { ContactCTASection } from '@/components/sections/contact-cta/ContactCTASection';
import { NextStepsSection } from '@/components/sections/contact-page/ContactPageSections';
import { YearsMapSection } from '@/components/sections/years-map/YearsMapSection';
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
 * The one destination for every "Start a project": the form first, then what
 * happens after it, the direct alternatives, and the reach map — trust that
 * supports the form rather than competing with it.
 */
export default async function ContactPage({ params }: LocaleParams) {
  await resolveLocale(params);

  return (
    <main id="main-content">
      <PageHeroSection namespace="contactPage.hero" id="contact-page" />
      <ContactCTASection />
      <NextStepsSection />
      <YearsMapSection id="reach" />
    </main>
  );
}

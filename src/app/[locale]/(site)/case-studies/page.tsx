import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { VisuallyHidden } from '@/components/primitives';
import { CapabilitiesSection } from '@/components/sections/capabilities/CapabilitiesSection';
import { ContactCTASection } from '@/components/sections/contact-cta/ContactCTASection';
import { resolveLocale, type LocaleParams } from '@/i18n/server';
import { generatePageMetadata } from '@/lib/seo/metadata';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: 'meta' });
  return generatePageMetadata({
    locale,
    path: '/case-studies',
    siteName: t('siteName'),
    title: t('caseStudies.title'),
    description: t('caseStudies.description'),
  });
}

export default async function CaseStudiesPage({ params }: LocaleParams) {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: 'meta' });

  return (
    <main id="main-content">
      {/* The page's own title for screen readers and search; the design has no visible one. */}
      <VisuallyHidden as="h1">{t('caseStudies.title')}</VisuallyHidden>
      <CapabilitiesSection />
      <ContactCTASection />
    </main>
  );
}

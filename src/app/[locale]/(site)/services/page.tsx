import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { PageHeroSection } from '@/components/sections/projects-page/ProjectsHeroSection';
import { AreasSection, ModelSection, StartSection } from '@/components/sections/services/ServicesSections';
import { ServicesTeam } from '@/components/sections/services/ServicesTeam';
import { ServicesSpecialists } from '@/components/sections/services/ServicesSpecialists';
import { CollaborationSection } from '@/components/sections/projects-page/CollaborationSection';
import { resolveLocale, type LocaleParams } from '@/i18n/server';
import { generatePageMetadata } from '@/lib/seo/metadata';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: 'meta' });
  return generatePageMetadata({
    locale,
    path: '/services',
    siteName: t('siteName'),
    title: t('services.title'),
    description: t('services.description'),
  });
}

/*
 * What Torchyan takes on (the four areas from the homepage, in depth), how an
 * engagement can begin, who does the work, and what Torchyan doesn't do.
 * Assembled from existing sections; see docs/adr/0008-studio-pages.md.
 */
export default async function ServicesPage({ params }: LocaleParams) {
  await resolveLocale(params);

  return (
    <main id="main-content">
      <PageHeroSection namespace="servicesPage.hero" id="services" points={false}>
        <ServicesTeam />
      </PageHeroSection>
      <AreasSection headless />
      <ServicesSpecialists />
      <StartSection />
      <ModelSection />
      <CollaborationSection
        namespace="servicesPage.cta"
        initiateHref="/start-a-project"
        analyzeHref="/contact"
        ctaId="services"
        compact
      />
    </main>
  );
}

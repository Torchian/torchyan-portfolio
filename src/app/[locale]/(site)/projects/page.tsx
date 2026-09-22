import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { PartnersCarousel } from '@/components/composites';
import { ProjectsHeroSection } from '@/components/sections/projects-page/ProjectsHeroSection';
import { ProjectsListSection } from '@/components/sections/projects-page/ProjectsListSection';
import { PerspectiveSection } from '@/components/sections/projects-page/PerspectiveSection';
import { CollaborationSection } from '@/components/sections/projects-page/CollaborationSection';
import { resolveLocale, type LocaleParams } from '@/i18n/server';
import { generatePageMetadata } from '@/lib/seo/metadata';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: 'meta' });
  return generatePageMetadata({
    locale,
    path: '/projects',
    siteName: t('siteName'),
    title: t('projects.title'),
    description: t('projects.description'),
  });
}

/*
 * Figma: Projects Page (section 3155:8425) — Desktop 1920 (3155:9789), Desktop
 * 1440 (3753:11170), Tablet 1024 (3753:14691), Mobile 480 (3753:17708).
 */
export default async function ProjectsPage({ params }: LocaleParams) {
  await resolveLocale(params);

  return (
    <main id="main-content">
      <ProjectsHeroSection />
      <ProjectsListSection />
      <PartnersCarousel />
      <PerspectiveSection />
      <CollaborationSection />
    </main>
  );
}

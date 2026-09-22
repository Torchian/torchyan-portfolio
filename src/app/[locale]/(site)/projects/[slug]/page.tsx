import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getMessages, getTranslations } from 'next-intl/server';
import { getProjectBySlug, PROJECTS } from '@/components/sections/selected-work/projectsConfig';
import { CaseStudyHeroSection } from '@/components/sections/case-study/CaseStudyHeroSection';
import { CaseStudyBodySection } from '@/components/sections/case-study/CaseStudyBodySection';
import { ContactCTASection } from '@/components/sections/contact-cta/ContactCTASection';
import { CaseStudyHero } from '@/components/sections/case-study/CaseStudyHero';
import { CaseStudyTimeline } from '@/components/sections/case-study/CaseStudyTimeline';
import { CaseStudyBlueprint } from '@/components/sections/case-study/CaseStudyBlueprint';
import { CaseStudyArchitecture } from '@/components/sections/case-study/CaseStudyArchitecture';
import { CollaborationSection } from '@/components/sections/projects-page/CollaborationSection';
import { CASE_STUDIES, type CaseStudyCopy } from '@/components/sections/case-study/caseStudyConfig';
import { resolveLocale } from '@/i18n/server';
import { generatePageMetadata } from '@/lib/seo/metadata';

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const { slug } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  const project = getProjectBySlug(slug);
  if (!project) {
    return { title: t('projectNotFound') };
  }
  const content = (await getMessages({ locale })).projects[project.slug];
  return generatePageMetadata({
    locale,
    path: `/projects/${slug}`,
    siteName: t('siteName'),
    title: `${project.company} — ${content.title}`,
    description: content.description,
  });
}

export default async function ProjectPage({ params }: PageProps) {
  const locale = await resolveLocale(params);
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  // Figma: Case Study page (3155:9107). A project gets it once it has imagery
  // (caseStudyConfig.ts) and copy (caseStudy.<slug>); until then, the older layout.
  const imagery = CASE_STUDIES[project.slug];
  const caseCopies = (await getMessages({ locale })).caseStudy as Record<string, CaseStudyCopy> | undefined;
  const copy = caseCopies?.[project.slug];
  if (imagery && copy) {
    return (
      <main id="main-content">
        <CaseStudyHero copy={copy.hero} carousel={imagery.carousel} />
        <CaseStudyTimeline copy={copy.timeline} gallery={imagery.timeline} />
        <CaseStudyBlueprint copy={copy.blueprint} />
        <CaseStudyArchitecture copy={copy.architecture} images={imagery.useCases} />
        <CollaborationSection />
      </main>
    );
  }

  return (
    <main id="main-content">
      <CaseStudyHeroSection project={project} />
      <CaseStudyBodySection project={project} />
      <ContactCTASection />
    </main>
  );
}

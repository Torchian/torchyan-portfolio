import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getMessages, getTranslations } from 'next-intl/server';
import { getProjectBySlug, PROJECTS } from '@/components/sections/selected-work/projectsConfig';
import { CaseStudyHeroSection } from '@/components/sections/case-study/CaseStudyHeroSection';
import { CaseStudyBodySection } from '@/components/sections/case-study/CaseStudyBodySection';
import { ContactCTASection } from '@/components/sections/contact-cta/ContactCTASection';
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
  await resolveLocale(params);
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  return (
    <main id="main-content">
      <CaseStudyHeroSection project={project} />
      <CaseStudyBodySection project={project} />
      <ContactCTASection />
    </main>
  );
}

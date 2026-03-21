import { notFound } from 'next/navigation';
import { getProjectBySlug, PROJECTS } from '@/components/sections/selected-work/projectsConfig';
import { CaseStudyHeroSection } from '@/components/sections/case-study/CaseStudyHeroSection';
import { CaseStudyProjectInfoSection } from '@/components/sections/case-study/CaseStudyProjectInfoSection';
import { CaseStudyBlueprintSection } from '@/components/sections/case-study/CaseStudyBlueprintSection';
import { CaseStudyVisualArchitectureSection } from '@/components/sections/case-study/CaseStudyVisualArchitectureSection';
import { CaseStudyClosingSection } from '@/components/sections/case-study/CaseStudyClosingSection';
import { getCaseStudyContent } from '@/components/sections/case-study/caseStudyContent';
import { ContactCTASection } from '@/components/sections/contact-cta/ContactCTASection';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) {
    return { title: 'Project Not Found' };
  }
  return {
    title: `${project.company} — ${project.title}`,
    description: project.description,
    openGraph: {
      title: `${project.company} — ${project.title}`,
      description: project.description,
    },
  };
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const study = getCaseStudyContent(project);

  return (
    <main id="main-content">
      <CaseStudyHeroSection project={project} />
      <CaseStudyProjectInfoSection project={project} />
      {study.blueprint ? <CaseStudyBlueprintSection content={study.blueprint} /> : null}
      {study.visualArchitecture ? (
        <CaseStudyVisualArchitectureSection project={project} content={study.visualArchitecture} />
      ) : null}
      <CaseStudyClosingSection project={project} />
      <ContactCTASection />
    </main>
  );
}

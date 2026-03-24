import dynamic from 'next/dynamic';
import { notFound } from 'next/navigation';
import { getProjectBySlug, PROJECTS } from '@/components/sections/selected-work/projectsConfig';
import { CaseStudyHeroSection } from '@/components/sections/case-study/CaseStudyHeroSection';
import { getCaseStudyContent } from '@/components/sections/case-study/caseStudyContent';
import type { Metadata } from 'next';

const CaseStudyProjectInfoSection = dynamic(() =>
  import('@/components/sections/case-study/CaseStudyProjectInfoSection').then((m) => ({
    default: m.CaseStudyProjectInfoSection,
  })),
);
const CaseStudyBlueprintSection = dynamic(() =>
  import('@/components/sections/case-study/CaseStudyBlueprintSection').then((m) => ({
    default: m.CaseStudyBlueprintSection,
  })),
);
const CaseStudyVisualArchitectureSection = dynamic(() =>
  import('@/components/sections/case-study/CaseStudyVisualArchitectureSection').then((m) => ({
    default: m.CaseStudyVisualArchitectureSection,
  })),
);
const CaseStudyClosingSection = dynamic(() =>
  import('@/components/sections/case-study/CaseStudyClosingSection').then((m) => ({
    default: m.CaseStudyClosingSection,
  })),
);
const ContactCTASection = dynamic(() =>
  import('@/components/sections/contact-cta/ContactCTASection').then((m) => ({
    default: m.ContactCTASection,
  })),
);

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

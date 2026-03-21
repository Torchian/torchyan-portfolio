import { notFound } from 'next/navigation';
import { getProjectBySlug, PROJECTS } from '@/components/sections/selected-work/projectsConfig';
import { CaseStudyHeroSection } from '@/components/sections/case-study/CaseStudyHeroSection';
import { CaseStudyBodySection } from '@/components/sections/case-study/CaseStudyBodySection';
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

  return (
    <main id="main-content">
      <CaseStudyHeroSection project={project} />
      <CaseStudyBodySection project={project} />
      <ContactCTASection />
    </main>
  );
}

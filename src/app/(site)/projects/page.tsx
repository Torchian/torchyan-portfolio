import { PartnersCarousel } from '@/components/composites';
import { ProjectsHeroSection } from '@/components/sections/projects-page/ProjectsHeroSection';
import { ProjectsListSection } from '@/components/sections/projects-page/ProjectsListSection';
import { PerspectiveSection } from '@/components/sections/projects-page/PerspectiveSection';
import { CollaborationSection } from '@/components/sections/projects-page/CollaborationSection';

export const metadata = {
  title: 'Projects',
  description: 'Selected work and projects by Stepan Torchyan.',
  openGraph: {
    title: 'Projects | Stepan Torchyan',
    description: 'Selected work and projects by Stepan Torchyan.',
  },
};

/* Figma: Projects Page (3155:9789). Desktop only for now. */
export default function ProjectsPage() {
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

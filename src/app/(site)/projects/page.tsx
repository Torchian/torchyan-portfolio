import dynamic from 'next/dynamic';
import styled from 'styled-components';
import { neutrals } from '@/styles/tokens/colors';
import { spacing } from '@/styles/tokens/spacing';
import { ProjectsHeroSection } from '@/components/sections/projects';

const ProjectsGridSection = dynamic(() =>
  import('@/components/sections/projects/ProjectsGridSection').then((m) => ({
    default: m.ProjectsGridSection,
  })),
);
const ProjectsLogosStrip = dynamic(() =>
  import('@/components/sections/projects/ProjectsLogosStrip').then((m) => ({
    default: m.ProjectsLogosStrip,
  })),
);
const ProjectsSwitchSection = dynamic(() =>
  import('@/components/sections/projects/ProjectsSwitchSection').then((m) => ({
    default: m.ProjectsSwitchSection,
  })),
);
const ProjectsBuildSection = dynamic(() =>
  import('@/components/sections/projects/ProjectsBuildSection').then((m) => ({
    default: m.ProjectsBuildSection,
  })),
);

export const metadata = {
  title: 'Projects',
  description: 'Selected work and projects by Stepan Torchyan.',
  openGraph: {
    title: 'Projects | Stepan Torchyan',
    description: 'Selected work and projects by Stepan Torchyan.',
  },
};

const Page = styled.main`
  display: flex;
  flex-direction: column;
  gap: ${spacing[2000]}px;
  background: ${neutrals[900]};
`;

export default function ProjectsPage() {
  return (
    <Page id="main-content">
      <ProjectsHeroSection />
      <ProjectsGridSection />
      <ProjectsLogosStrip />
      <ProjectsSwitchSection />
      <ProjectsBuildSection />
    </Page>
  );
}

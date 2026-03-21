import styled from 'styled-components';
import { neutrals } from '@/styles/tokens/colors';
import { spacing } from '@/styles/tokens/spacing';
import {
  ProjectsHeroSection,
  ProjectsGridSection,
  ProjectsLogosStrip,
  ProjectsSwitchSection,
  ProjectsBuildSection,
} from '@/components/sections/projects';

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

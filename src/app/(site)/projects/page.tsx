import { Container } from '@/components/primitives';
import { SectionHeading } from '@/components/composites';
import { spacing } from '@/styles/tokens/spacing';
import styled from 'styled-components';
import { ContactCTASection } from '@/components/sections/contact-cta/ContactCTASection';
import { ProjectStickyCard } from '@/components/sections/selected-work/ProjectStickyCard';
import { PROJECTS } from '@/components/sections/selected-work/projectsConfig';

const Section = styled.section``;

const ProjectsStack = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: ${spacing[800]}px;
`;

export const metadata = {
  title: 'Projects',
  description: 'Selected work and projects by Stepan Torchyan.',
};

export default function ProjectsPage() {
  return (
    <main id="main-content">
      <Section id="work">
        <Container>
          <SectionHeading
            title="Projects"
            subtitle="Work that shaped my craft"
          />
        </Container>
        <ProjectsStack>
          {PROJECTS.map((project, i) => (
            <ProjectStickyCard key={i} project={project} />
          ))}
        </ProjectsStack>
      </Section>
      <ContactCTASection />
    </main>
  );
}

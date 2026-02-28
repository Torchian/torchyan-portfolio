'use client';

import styled from 'styled-components';
import { Container } from '@/components/primitives';
import { SectionHeading } from '@/components/composites';
import { ProjectStickyCard } from './ProjectStickyCard';
import { PROJECTS } from './projectsConfig';
import { spacing } from '@/styles/tokens/spacing';

const Section = styled.section`
  padding: ${spacing[1000]}px 0;
`;

const ProjectsStack = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: ${spacing[800]}px;
`;

export function SelectedWorkSection() {
  return (
    <Section id="work">
      <Container>
        <SectionHeading title="Selected Work" subtitle="Projects that shaped my craft" />
      </Container>
      <ProjectsStack>
        {PROJECTS.map((project, i) => (
          <ProjectStickyCard key={i} project={project} />
        ))}
      </ProjectsStack>
    </Section>
  );
}

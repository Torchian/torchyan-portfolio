'use client';

import styled from 'styled-components';
import { spacing } from '@/styles/tokens/spacing';
import { ProjectShowcase } from './ProjectShowcase';
import { SHOWCASE_PROJECTS } from './projectShowcaseConfig';
import { useTranslations } from 'next-intl';

/** Figma: Projects (3155:9805). The collage starts on the right and alternates row by row. */
const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${spacing[500]}px;
  /* The Figma frame ends 160px below the last row, on top of the page's section gap. */
  padding-bottom: ${spacing[2000]}px;
`;

export function ProjectsListSection() {
  const t = useTranslations('projectsPage');

  return (
    <Section aria-label={t('listLabel')}>
      {SHOWCASE_PROJECTS.map((project, i) => (
        <ProjectShowcase key={project.id} project={project} mediaSide={i % 2 === 0 ? 'right' : 'left'} />
      ))}
    </Section>
  );
}

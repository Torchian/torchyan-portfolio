'use client';

import styled from 'styled-components';
import { Container } from '@/components/primitives';
import { ProjectMeta } from '@/components/composites';
import { spacing } from '@/styles/tokens/spacing';
import { fontSize, lineHeight, fontWeight, fontFamily } from '@/styles/tokens/typography';
import { neutrals } from '@/styles/tokens/colors';
import { media } from '@/styles/media';
import type { ProjectConfig } from '@/components/sections/selected-work/projectsConfig';

const Section = styled.section<{ $gradient: string }>`
  position: relative;
  padding: ${spacing[2000]}px 0 ${spacing[1000]}px;
  background: ${(p) => p.$gradient};
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;

  ${media.down('m')} {
    padding: ${spacing[1000]}px 0 ${spacing[800]}px;
    min-height: 50vh;
  }
`;

const Content = styled(Container)`
  display: flex;
  flex-direction: column;
  gap: ${spacing[600]}px;
`;

const Title = styled.h1`
  font-family: ${fontFamily.display};
  font-weight: ${fontWeight.heading};
  font-size: ${fontSize.display.m}px;
  line-height: ${lineHeight.display.m}px;
  color: ${neutrals[100]};
  margin: 0;
  max-width: 800px;

  ${media.down('l')} {
    font-size: ${fontSize.display.s}px;
    line-height: ${lineHeight.display.s}px;
  }

  ${media.down('m')} {
    font-size: ${fontSize.heading.l}px;
    line-height: ${lineHeight.heading.l}px;
  }
`;

const MetaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${spacing[300]}px;
  font-family: ${fontFamily.display};
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.body.xl}px;
  line-height: ${lineHeight.body.xl}px;
  color: ${neutrals[100]};
`;

export interface CaseStudyHeroSectionProps {
  project: ProjectConfig;
}

export function CaseStudyHeroSection({ project }: CaseStudyHeroSectionProps) {
  return (
    <Section $gradient={project.gradient}>
      <Content>
        <ProjectMeta
          company={project.company}
          description={project.title}
          tags={project.roles}
        />
        <Title>{project.description}</Title>
        <MetaRow>
          <span>{project.field}</span>
          <span>·</span>
          <span>{project.year}</span>
        </MetaRow>
      </Content>
    </Section>
  );
}

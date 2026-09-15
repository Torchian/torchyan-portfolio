'use client';

import styled from 'styled-components';
import { spacing } from '@/styles/tokens/spacing';
import { fontFamily, fontWeight, fontSize, lineHeight, letterSpacing } from '@/styles/tokens/typography';
import { accents, neutrals } from '@/styles/tokens/colors';
import { grid } from '@/styles/tokens/grid';
import { useTranslations } from 'next-intl';

/* Figma: hero_section (3155:9791). Desktop only for now. */

const Section = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: ${spacing[1000]}px;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacing[800]}px;
  width: 100%;
  max-width: ${grid.maxWidth}px;
  padding: ${spacing[1000]}px ${spacing[400]}px ${spacing[400]}px;
`;

const Title = styled.h1`
  width: 100%;
  margin: 0;
  font-family: ${fontFamily.display};
  font-weight: ${fontWeight.black};
  font-size: ${fontSize.display.xl}px;
  line-height: ${lineHeight.display.xl}px;
  letter-spacing: ${letterSpacing.xxs}px;
  text-align: center;
  text-transform: uppercase;
  color: ${accents.secondary};
`;

const Description = styled.div`
  width: 820px;
  max-width: 100%;
  font-family: ${fontFamily.heading};
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.heading.s}px;
  line-height: ${lineHeight.heading.s}px;
  letter-spacing: ${letterSpacing.xs}px;
  text-align: center;
  color: ${neutrals[500]};

  p {
    margin: 0;
  }
`;

const Points = styled.ul`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: ${spacing[300]}px;
  width: 100%;
  margin: 0;
  padding: 0;
  list-style: none;
  font-family: ${fontFamily.heading};
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.body.l}px;
  line-height: ${lineHeight.body.l}px;
  letter-spacing: ${letterSpacing.m}px;
  color: ${neutrals[500]};
  white-space: nowrap;

  li {
    display: flex;
    align-items: center;
    gap: ${spacing[300]}px;
  }

  li:not(:last-child)::after {
    content: '×' / '';
  }
`;

export function ProjectsHeroSection() {
  const t = useTranslations('projectsPage.hero');
  const points = t.raw('points') as string[];

  return (
    <Section id="projects-hero" aria-labelledby="projects-title">
      <Container>
        <Title id="projects-title">{t('title')}</Title>
        <Description>
          <p>{t('lead')}</p>
          <p>{t('body')}</p>
        </Description>
        <Points>
          {points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </Points>
      </Container>
    </Section>
  );
}

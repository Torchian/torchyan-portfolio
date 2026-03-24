'use client';

import Image from 'next/image';
import styled from 'styled-components';
import { Button, Text, Reveal } from '@/components/primitives';
import { PROJECTS } from '@/components/sections/selected-work/projectsConfig';
import { spacing } from '@/styles/tokens/spacing';
import { fontFamily, fontWeight, fontSize, lineHeight } from '@/styles/tokens/typography';
import { fluidFontSize, fluidLineHeight } from '@/styles/fluid';
import { accents, neutrals, elevation } from '@/styles/tokens/colors';
import { radius } from '@/styles/tokens/radius';
import { border } from '@/styles/tokens/border';
import { duration, easing } from '@/styles/tokens/motion';
import { media } from '@/styles/media';

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${spacing[500]}px;
`;
const Card = styled.article<{ $reverse?: boolean }>`
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 640px;
  border-radius: ${radius.xxl}px;
  overflow: hidden;
  transition: transform ${duration.normal} ${easing.out},
    box-shadow ${duration.normal} ${easing.out};

  ${(p) => p.$reverse && 'direction: rtl;'}

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      transform: translateY(-4px);
      box-shadow: ${elevation.medium};
    }
  }

  ${media.down('l')} {
    grid-template-columns: 1fr;
    min-height: auto;
    direction: ltr;
  }
`;

const Info = styled.div`
  padding: ${spacing[500]}px ${spacing[800]}px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: ${spacing[500]}px;
  background: ${neutrals[900]};
`;

const Title = styled.h2`
  margin: 0;
  font-family: ${fontFamily.display};
  font-weight: ${fontWeight.heading};
  font-size: ${fluidFontSize.display.s};
  line-height: ${fluidLineHeight.display.s};
  color: ${neutrals[100]};
`;
const Roles = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: ${spacing[150]}px;
`;
const Role = styled.span`
  font-family: ${fontFamily.heading};
  font-weight: ${fontWeight.semibold};
  font-size: ${fluidFontSize.heading.s};
  line-height: ${fluidLineHeight.heading.s};
  color: ${accents.primary};
`;

const Desc = styled(Text)`
  margin: 0;
  max-width: 820px;
  color: ${neutrals[500]};
  font-family: ${fontFamily.body};
  font-size: ${fontSize.body.l}px;
  line-height: ${lineHeight.body.l}px;
`;
const BadgeRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing[300]}px;
`;
const Badge = styled.span`
  border-radius: ${radius.round}px;
  border: ${border.medium}px solid ${neutrals[100]};
  background: transparent;
  color: ${neutrals[100]};
  padding: ${spacing[50]}px ${spacing[150]}px;
  font-family: ${fontFamily.body};
  font-size: ${fontSize.body.l}px;
  line-height: ${lineHeight.body.l}px;
  font-weight: ${fontWeight.semibold};
`;

const CardMedia = styled.div`
  position: relative;
  aspect-ratio: 16 / 10;
  border-radius: ${radius.xxl}px;
  overflow: hidden;
`;

const STACK_BADGES = ['React', 'JSS', 'Styled Components', 'Localization', 'WCAG Compliance'] as const;

const PROJECT_ORDER = ['picsart', 'soulone', 'smartbet', 'picsart', 'smartbet', 'soulone'] as const;

export function ProjectsGridSection() {
  const ordered = PROJECT_ORDER.map((slug) => PROJECTS.find((p) => p.slug === slug)).filter(Boolean);

  return (
    <Section>
      {ordered.map((project, index) =>
        project ? (
          <Reveal key={`${project.slug}-${index}`} delay={index * 0.05}>
          <Card $reverse={index % 2 === 1}>
            <Info>
              <Title>{project.company === 'Picsart' ? 'Picsart Marketplace' : project.company}</Title>
              <Roles>
                {project.roles.slice(0, 2).map((r, i) => (
                  <span key={r}>
                    <Role>{r}</Role>
                    {i === 0 && <Role aria-hidden> × </Role>}
                  </span>
                ))}
              </Roles>
              <Desc as="p">{project.description}</Desc>
              <BadgeRow>
                {STACK_BADGES.map((badge) => (
                  <Badge key={badge}>{badge}</Badge>
                ))}
              </BadgeRow>
              <Button as="a" href={`/projects/${project.slug}`} $variant="secondaryPink">
                View Case Story
              </Button>
            </Info>
            <CardMedia>
              <Image
                src={project.images[0]?.src ?? '/selected-work/picsart/Screenshot 2026-01-26 at 19.53.17.png'}
                alt={project.images[0]?.alt ?? project.company}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                style={{ objectFit: 'cover' }}
              />
            </CardMedia>
          </Card>
          </Reveal>
        ) : null
      )}
    </Section>
  );
}

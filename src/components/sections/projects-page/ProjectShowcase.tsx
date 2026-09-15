'use client';

import { Link } from '@/i18n/navigation';
import styled, { css } from 'styled-components';
import { Badge, Button } from '@/components/primitives';
import { spacing } from '@/styles/tokens/spacing';
import { fontFamily, fontWeight, fontSize, lineHeight, letterSpacing } from '@/styles/tokens/typography';
import { accents, neutrals } from '@/styles/tokens/colors';
import { radius } from '@/styles/tokens/radius';
import { grid } from '@/styles/tokens/grid';
import { ProjectCollage } from './ProjectCollage';
import { useMessages, useTranslations } from 'next-intl';
import type { ShowcaseProject } from './projectShowcaseConfig';

/*
 * Figma: Single Project (3155:9806…9813). The project's text on one half and its
 * screenshot collage on the other, running out to the page edge with the inner
 * corners rounded. Rows alternate which side the collage is on. Desktop only.
 */

export type MediaSide = 'left' | 'right';

/* Two equal halves, as Figma's "fill" splits them (a flex basis of 0 would count the text's padding first). */
const Row = styled.article`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  align-items: center;
  gap: ${spacing[200]}px;
`;

const Info = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: ${spacing[400]}px;
  min-width: 0;
  max-width: ${grid.maxWidth}px;
  height: 100%;
  padding: ${spacing[500]}px ${spacing[400]}px;
`;

const Heading = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing[200]}px;
  width: 100%;
`;

const Title = styled.h2`
  margin: 0;
  font-family: ${fontFamily.display};
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.display.s}px;
  line-height: ${lineHeight.display.s}px;
  letter-spacing: ${letterSpacing.xs}px;
  color: ${neutrals[100]};
`;

const Roles = styled.ul`
  display: flex;
  align-items: center;
  gap: ${spacing[150]}px;
  margin: 0;
  padding: 0;
  list-style: none;
  font-family: ${fontFamily.heading};
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.heading.s}px;
  line-height: ${lineHeight.heading.s}px;
  letter-spacing: ${letterSpacing.xs}px;
  color: ${accents.primary};
  /* Roles move to a second line as a whole when they don't fit (longer Russian and Armenian titles). */
  flex-wrap: wrap;

  li {
    display: flex;
    align-items: center;
    gap: ${spacing[150]}px;
    white-space: nowrap;
  }

  li:not(:last-child)::after {
    content: '×' / '';
  }
`;

const Description = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing[200]}px;
  width: 100%;
  font-family: ${fontFamily.body};
  font-weight: ${fontWeight.regular};
  font-size: ${fontSize.body.l}px;
  line-height: ${lineHeight.body.l}px;
  letter-spacing: ${letterSpacing.xs}px;
  color: ${neutrals[100]};

  p {
    margin: 0;
  }
`;

const TechStack = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing[300]}px;
  width: 100%;
  margin: 0;
  padding: 0;
  list-style: none;

  li {
    display: flex;
  }
`;

const Media = styled.div<{ $side: MediaSide }>`
  position: relative;
  min-width: 0;
  height: 560px;
  overflow: hidden;
  /* clip, not just hidden: nothing (focus, scrollIntoView) can scroll the collage inside its box. */
  overflow: clip;

  ${(p) =>
    p.$side === 'right'
      ? css`
          border-radius: ${radius.xxl}px 0 0 ${radius.xxl}px;
        `
      : css`
          order: -1;
          border-radius: 0 ${radius.xxl}px ${radius.xxl}px 0;
        `}
`;

export interface ProjectShowcaseProps {
  project: ShowcaseProject;
  mediaSide: MediaSide;
}

export function ProjectShowcase({ project, mediaSide }: ProjectShowcaseProps) {
  const t = useTranslations('projectsPage.showcase');
  const content = useMessages().projectsPage.showcase.items[project.content];
  const description = t.raw('description') as string[];
  const stack = t.raw('stack') as string[];

  return (
    <Row>
      <Info>
        <Heading>
          <Title>{content.title}</Title>
          <Roles aria-label={t('rolesLabel')}>
            {content.roles.map((role) => (
              <li key={role}>{role}</li>
            ))}
          </Roles>
        </Heading>
        <Description>
          {description.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </Description>
        <TechStack aria-label={t('stackLabel')}>
          {stack.map((item) => (
            <li key={item}>
              <Badge $size="medium">{item}</Badge>
            </li>
          ))}
        </TechStack>
        <Button as={Link} href={project.href} $variant="secondaryPink">
          {t('cta')}
        </Button>
      </Info>

      <Media $side={mediaSide} aria-hidden>
        <ProjectCollage collage={project.collage} />
      </Media>
    </Row>
  );
}

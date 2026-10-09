'use client';

import Image from 'next/image';
import styled from 'styled-components';
import { useMessages, useTranslations } from 'next-intl';
import { SectionHeading } from '@/components/composites';
import { Link } from '@/i18n/navigation';
import { MORE_PROJECTS } from '@/components/sections/selected-work/projectsConfig';
import { spacing } from '@/styles/tokens/spacing';
import { fontFamily, fontSize, fontWeight, letterSpacing, lineHeight } from '@/styles/tokens/typography';
import { accents, neutrals } from '@/styles/tokens/colors';
import { radius } from '@/styles/tokens/radius';
import { grid } from '@/styles/tokens/grid';
import { media } from '@/styles/media';

/*
 * The Work page's second tier: smaller projects with a short write-up each
 * (/work/<slug>, the short case). A card per project: its first screen, the
 * company, what it was, and its field.
 */

const Section = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing[800]}px;
  width: 100%;
  max-width: ${grid.maxWidth}px;
  padding: 0 ${spacing[400]}px;

  ${media.down('xl')} {
    padding: 0 ${spacing[300]}px;
  }

  ${media.down('m')} {
    gap: ${spacing[600]}px;
    padding: 0 ${spacing[200]}px;
  }
`;

const Cards = styled.ul`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 320px), 1fr));
  gap: ${spacing[400]}px;
  margin: 0;
  padding: 0;
  list-style: none;

  ${media.down('m')} {
    gap: ${spacing[300]}px;
  }
`;

const Card = styled(Link)`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  border-radius: ${radius.xl}px;
  background: ${neutrals[800]};
  color: inherit;
  text-decoration: none;
  transition: transform 0.25s ease;

  &:hover {
    transform: translateY(-4px);
  }

  &:focus-visible {
    outline: 2px solid ${accents.primary};
    outline-offset: 3px;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;

    &:hover {
      transform: none;
    }
  }
`;

const Cover = styled.div`
  position: relative;
  aspect-ratio: 16 / 10;
  overflow: hidden;

  /* A screen reads from its top-left corner, where its logo and headline sit. */
  img {
    object-fit: cover;
    object-position: left top;
  }
`;

const Text = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${spacing[100]}px;
  padding: ${spacing[300]}px ${spacing[300]}px ${spacing[400]}px;
`;

const Company = styled.h3`
  margin: 0;
  font-family: ${fontFamily.heading};
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.heading.s}px;
  line-height: ${lineHeight.heading.s}px;
  letter-spacing: ${letterSpacing.xs}px;
  color: ${neutrals[100]};
`;

const Title = styled.p`
  margin: 0;
  font-family: ${fontFamily.body};
  font-size: ${fontSize.body.l}px;
  line-height: ${lineHeight.body.l}px;
  color: ${neutrals[100]};
`;

const Field = styled.p`
  margin: auto 0 0;
  padding-top: ${spacing[200]}px;
  font-family: ${fontFamily.body};
  font-size: ${fontSize.body.m}px;
  line-height: ${lineHeight.body.m}px;
  color: ${neutrals[500]};
`;

interface ShortContent {
  title: string;
  field: string;
}

export function MoreProjectsSection() {
  const t = useTranslations('projectsPage.more');
  const projects = useMessages().projects as unknown as Record<string, ShortContent>;

  return (
    <Section aria-labelledby="more-projects-title">
      <Container>
        <SectionHeading id="more-projects-title" title={t('title')} subtitle={t('subtitle')} size="large" />
        <Cards>
          {MORE_PROJECTS.map((project) => {
            const content = projects[project.slug];
            const cover = project.images[0];
            return (
              <li key={project.slug}>
                <Card href={`/work/${project.slug}`} data-cta={`more-${project.slug}`}>
                  <Cover>{cover && <Image src={cover.src} alt="" fill sizes="(max-width: 480px) 100vw, 33vw" />}</Cover>
                  <Text>
                    <Company>{project.company}</Company>
                    <Title>{content.title}</Title>
                    <Field>{project.year ? `${content.field} · ${project.year}` : content.field}</Field>
                  </Text>
                </Card>
              </li>
            );
          })}
        </Cards>
      </Container>
    </Section>
  );
}

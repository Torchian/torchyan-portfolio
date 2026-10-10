'use client';

import Image from 'next/image';
import styled from 'styled-components';
import { useMessages, useTranslations } from 'next-intl';
import { SectionHeading } from '@/components/composites';
import { Badge } from '@/components/primitives';
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
 * (/work/<slug>, the short case). Figma: Card Project (4215:13023) — the
 * brand's mark and the year over its first screen; pointing at it, the screen
 * draws back and the company, what it was and its field come up underneath
 * (State3). Without hover (a touch screen) that is how it always reads.
 * Two to a row on a desktop and a tablet, one on a phone.
 */

/** Pointing devices get the reveal; everything else shows the card opened. */
const HOVER = '@media (hover: hover) and (pointer: fine)';
const EASE = 'cubic-bezier(0.65, 0, 0.35, 1)';
const DURATION = 500;

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
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${spacing[200]}px;
  margin: 0;
  padding: 0;
  list-style: none;

  ${media.down('m')} {
    grid-template-columns: minmax(0, 1fr);
  }
`;

const Card = styled(Link)`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: ${spacing[300]}px;
  border-radius: ${radius.xxl}px;
  background: ${neutrals[900]};
  color: inherit;
  text-decoration: none;
  overflow: hidden;

  /* A fixed shape, Figma's 654 × 592, so the screen gives up its room to the text on hover. */
  ${HOVER} {
    aspect-ratio: 654 / 592;
  }

  &:focus-visible {
    outline: 2px solid ${accents.primary};
    outline-offset: 3px;
  }

  ${media.down('m')} {
    padding: ${spacing[200]}px;
    border-radius: ${radius.xl}px;
  }
`;

const Top = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${spacing[200]}px;
  margin-bottom: ${spacing[200]}px;

  img {
    display: block;
    width: auto;
    max-width: 70%;
    height: 32px;
    object-fit: contain;
    object-position: left center;
  }
`;

/** The first screen, read from its top-left corner; held a little close until the card is pointed at. */
const Shot = styled.div`
  position: relative;
  flex: none;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  border-radius: ${radius.l}px;

  img {
    object-fit: cover;
    object-position: left top;
    transform-origin: left top;
    transition: transform ${DURATION}ms ${EASE};
  }

  ${HOVER} {
    flex: 1 1 0;
    min-height: 0;
    aspect-ratio: auto;

    img {
      transform: scale(1.12);
    }

    a:hover > &,
    a:focus-visible > & {
      img {
        transform: none;
      }
    }
  }

  @media (prefers-reduced-motion: reduce) {
    img {
      transition: none;
    }
  }
`;

/** The text under the screen: always there without hover; with it, it opens (0fr → 1fr) and takes the screen's room. */
const Reveal = styled.div`
  display: grid;
  grid-template-rows: 1fr;

  ${HOVER} {
    grid-template-rows: 0fr;
    transition: grid-template-rows ${DURATION}ms ${EASE};

    a:hover > &,
    a:focus-visible > & {
      grid-template-rows: 1fr;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

/** What collapses: nothing of its own, so closed it takes no room at all. */
const Fold = styled.div`
  min-height: 0;
  overflow: hidden;
`;

const Info = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: ${spacing[200]}px;
  padding-top: ${spacing[200]}px;
`;

const Heading = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing[100]}px;
  min-width: 0;
  font-family: ${fontFamily.heading};
  font-weight: ${fontWeight.semibold};
`;

const Company = styled.h3`
  margin: 0;
  font: inherit;
  font-size: ${fontSize.heading.m}px;
  line-height: ${lineHeight.heading.m}px;
  letter-spacing: ${letterSpacing.xs}px;
  color: ${accents.primary};

  ${media.down('m')} {
    font-size: ${fontSize.heading.s}px;
    line-height: ${lineHeight.heading.s}px;
  }
`;

const Title = styled.p`
  margin: 0;
  font-size: ${fontSize.body.l}px;
  line-height: ${lineHeight.body.l}px;
  letter-spacing: ${letterSpacing.m}px;
  color: ${neutrals[500]};

  ${media.down('m')} {
    font-size: ${fontSize.body.m}px;
    line-height: ${lineHeight.body.m}px;
    letter-spacing: ${letterSpacing.s}px;
  }
`;

const Fields = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing[150]}px;
  margin: 0;
  padding: 0;
  list-style: none;
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
                  <Top>
                    {project.logo ? (
                      // A brand's own mark, SVG or a small PNG: next/image adds nothing.
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={project.logo} alt="" />
                    ) : (
                      <span />
                    )}
                    {project.year && <Badge $size="medium">{project.year}</Badge>}
                  </Top>
                  <Shot>
                    {cover && (
                      <Image
                        src={cover.src}
                        alt=""
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    )}
                  </Shot>
                  <Reveal>
                    <Fold>
                      <Info>
                        <Heading>
                          <Company>{project.company}</Company>
                          <Title>{content.title}</Title>
                        </Heading>
                        <Fields aria-label={content.field}>
                          {content.field.split(' · ').map((field) => (
                            <li key={field}>
                              <Badge>{field}</Badge>
                            </li>
                          ))}
                        </Fields>
                      </Info>
                    </Fold>
                  </Reveal>
                </Card>
              </li>
            );
          })}
        </Cards>
      </Container>
    </Section>
  );
}

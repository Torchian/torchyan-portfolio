'use client';

import styled from 'styled-components';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { InfoCard, InfoCardBody, InfoCardTitle, SectionHeading } from '@/components/composites';
import { spacing } from '@/styles/tokens/spacing';
import { fontFamily, fontWeight, fontSize, lineHeight, letterSpacing } from '@/styles/tokens/typography';
import { accents, neutrals } from '@/styles/tokens/colors';
import { grid } from '@/styles/tokens/grid';
import { media } from '@/styles/media';
import { getProjectBySlug } from '@/components/sections/selected-work/projectsConfig';
import { AREAS } from './servicesConfig';

/*
 * The Services page body, built only from the site's existing pieces: the
 * section heading, the glass info card and the type and spacing tokens. No new
 * visual language — the page reads like the Projects page's Perspective
 * section, at more length.
 *
 *  - AreasSection: what Torchyan takes on — four areas, each with when it fits,
 *    what Torchyan owns, what you get, and the related case pages.
 *  - StartSection: how an engagement can begin — three ways of working, not
 *    packages; scope is agreed once the project is understood.
 *  - ModelSection: who does the work (founder-led, specialists when needed),
 *    how the technology is chosen, and what Torchyan doesn't do.
 */

const Section = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${spacing[1000]}px 0;

  ${media.down('m')} {
    padding: ${spacing[600]}px 0;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacing[1000]}px;
  width: 100%;
  max-width: ${grid.maxWidth}px;
  padding: 0 ${spacing[400]}px;

  ${media.down('xl')} {
    gap: ${spacing[800]}px;
    padding: 0 ${spacing[300]}px;
  }

  ${media.down('m')} {
    gap: ${spacing[600]}px;
    padding: 0 ${spacing[200]}px;
  }
`;

/** Cards in a row on desktop, stacked on a phone. */
const CardRow = styled.ul`
  display: flex;
  align-items: stretch;
  gap: ${spacing[600]}px;
  width: 100%;
  margin: 0;
  padding: 0;
  list-style: none;

  ${media.down('xl')} {
    gap: ${spacing[300]}px;
  }

  ${media.down('l')} {
    flex-direction: column;

    /* Stacked, each card takes its content's height: InfoCard's flex-basis of 0
       with its phone min-height would otherwise cap it and let the text spill. */
    > li {
      flex: none;
    }
  }
`;

/* ─── Areas ──────────────────────────────────────────────────────────────── */

const AreaGrid = styled.ul`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${spacing[600]}px;
  width: 100%;
  margin: 0;
  padding: 0;
  list-style: none;

  ${media.down('xl')} {
    gap: ${spacing[300]}px;
  }

  ${media.down('l')} {
    grid-template-columns: minmax(0, 1fr);
  }
`;

/** A long-form info card: reads from the left at every size. */
const AreaCard = styled(InfoCard)`
  align-items: flex-start;
  text-align: left;
  /* The header is fixed, so an anchor jump must land below it. */
  scroll-margin-top: ${spacing[1000] + spacing[300]}px;
`;

const AreaPart = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing[100]}px;
  width: 100%;
`;

const PartLabel = styled.h4`
  margin: 0;
  font-family: ${fontFamily.heading};
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.body.m}px;
  line-height: ${lineHeight.body.m}px;
  letter-spacing: ${letterSpacing.xxl}px;
  text-transform: uppercase;
  color: ${neutrals[100]};
`;

const PartText = styled.p`
  margin: 0;
  font-family: ${fontFamily.body};
  font-weight: ${fontWeight.regular};
  font-size: ${fontSize.body.xl}px;
  line-height: ${lineHeight.body.xl}px;
  color: ${neutrals[500]};

  ${media.down('m')} {
    font-size: ${fontSize.body.l}px;
    line-height: ${lineHeight.body.l}px;
  }
`;

const PartList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: ${spacing[50]}px;
  margin: 0;
  padding-left: 1.2em;
  font-family: ${fontFamily.body};
  font-weight: ${fontWeight.regular};
  font-size: ${fontSize.body.xl}px;
  line-height: ${lineHeight.body.xl}px;
  color: ${neutrals[500]};
  list-style: disc;

  ${media.down('m')} {
    font-size: ${fontSize.body.l}px;
    line-height: ${lineHeight.body.l}px;
  }
`;

const ProofLinks = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing[100]}px ${spacing[300]}px;
  margin: 0;
  padding: 0;
  list-style: none;
  font-family: ${fontFamily.body};
  font-size: ${fontSize.body.l}px;
  line-height: ${lineHeight.body.l}px;

  a {
    color: ${accents.primary};
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  a:focus-visible {
    outline: 2px solid ${accents.primary};
    outline-offset: 2px;
    border-radius: 2px;
  }
`;

interface AreaCopy {
  title: string;
  situation: string;
  owns: string[];
  outcomes: string[];
}

export function AreasSection() {
  const t = useTranslations('servicesPage.areas');
  const items = t.raw('items') as AreaCopy[];

  return (
    <Section>
      <Container>
        <SectionHeading title={t('title')} subtitle={t('subtitle')} />
        <AreaGrid>
          {AREAS.map((area, i) => {
            const copy = items[i];
            if (!copy) return null;
            const headingId = `area-${area.id}`;
            return (
              <AreaCard key={area.id} id={area.id} aria-labelledby={headingId}>
                <InfoCardTitle id={headingId}>{copy.title}</InfoCardTitle>
                <AreaPart>
                  <PartLabel>{t('situationLabel')}</PartLabel>
                  <PartText>{copy.situation}</PartText>
                </AreaPart>
                <AreaPart>
                  <PartLabel>{t('ownsLabel')}</PartLabel>
                  <PartList>
                    {copy.owns.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </PartList>
                </AreaPart>
                <AreaPart>
                  <PartLabel>{t('outcomesLabel')}</PartLabel>
                  <PartList>
                    {copy.outcomes.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </PartList>
                </AreaPart>
                <AreaPart>
                  <PartLabel>{t('proofLabel')}</PartLabel>
                  <ProofLinks>
                    {area.proof.map((slug) => {
                      const project = getProjectBySlug(slug);
                      if (!project) return null;
                      return (
                        <li key={slug}>
                          <Link href={`/projects/${slug}`} data-area={area.id}>
                            {project.company}
                          </Link>
                        </li>
                      );
                    })}
                  </ProofLinks>
                </AreaPart>
              </AreaCard>
            );
          })}
        </AreaGrid>
      </Container>
    </Section>
  );
}

/* ─── How to start ───────────────────────────────────────────────────────── */

const StartCard = styled(InfoCard)`
  align-items: flex-start;
  text-align: left;
`;

export function StartSection() {
  const t = useTranslations('servicesPage.start');
  const items = t.raw('items') as { title: string; body: string }[];

  return (
    <Section>
      <Container>
        <SectionHeading title={t('title')} subtitle={t('subtitle')} />
        <CardRow>
          {items.map((item) => (
            <StartCard key={item.title}>
              <InfoCardTitle>{item.title}</InfoCardTitle>
              <InfoCardBody>{item.body}</InfoCardBody>
            </StartCard>
          ))}
        </CardRow>
      </Container>
    </Section>
  );
}

/* ─── Operating model, technology, boundaries ────────────────────────────── */

const Boundaries = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacing[300]}px;
  width: 100%;
`;

const BoundariesTitle = styled.h3`
  margin: 0;
  font-family: ${fontFamily.heading};
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.heading.s}px;
  line-height: ${lineHeight.heading.s}px;
  color: ${neutrals[100]};
  text-align: center;

  ${media.down('m')} {
    font-size: ${fontSize.body.xl}px;
    line-height: ${lineHeight.body.xl}px;
  }
`;

const BoundaryList = styled.ul`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: ${spacing[200]}px ${spacing[600]}px;
  max-width: 960px;
  margin: 0;
  padding: 0;
  list-style: none;
  font-family: ${fontFamily.body};
  font-size: ${fontSize.body.l}px;
  line-height: ${lineHeight.body.l}px;
  color: ${neutrals[500]};
  text-align: center;
`;

const ModelCard = styled(InfoCard)`
  align-items: flex-start;
  text-align: left;
`;

export function ModelSection() {
  const t = useTranslations('servicesPage');
  const boundaries = t.raw('boundaries.items') as string[];
  const cards = (['founder', 'specialists', 'technology'] as const).map((key) => ({
    key,
    title: t(`${key}.title`),
    body: t(`${key}.body`),
  }));

  return (
    <Section>
      <Container>
        <SectionHeading title={t('model.title')} subtitle={t('model.subtitle')} />
        <CardRow>
          {cards.map((card) => (
            <ModelCard key={card.key}>
              <InfoCardTitle>{card.title}</InfoCardTitle>
              <InfoCardBody>{card.body}</InfoCardBody>
            </ModelCard>
          ))}
        </CardRow>
        <Boundaries>
          <BoundariesTitle>{t('boundaries.title')}</BoundariesTitle>
          <BoundaryList>
            {boundaries.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </BoundaryList>
        </Boundaries>
      </Container>
    </Section>
  );
}

'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { SectionHeading } from '@/components/composites';
import { spacing } from '@/styles/tokens/spacing';
import {
  fontFamily,
  fontWeight,
  fontSize,
  lineHeight,
  letterSpacing,
} from '@/styles/tokens/typography';
import { accents, neutrals } from '@/styles/tokens/colors';
import { grid } from '@/styles/tokens/grid';
import { media } from '@/styles/media';
import { useMessages, useTranslations } from 'next-intl';
import { TIMELINE_ENTRIES, type TimelineEntry, type TimelineEntryContent } from './aboutConfig';
import { AboutYearRail, RAIL_SPACE, RAIL_WIDE } from './AboutYearRail';

/*
 * Figma: Timeline — 1920 (2973:16245), 1024 (3960:15405), 480 (3983:11086);
 * the card is 2810:6345 and the gallery 2821:5636.
 *
 * A column of workplaces with a gallery that swaps its screenshots for
 * whichever card is crossing the middle of the screen, laid out as each frame
 * has it:
 *  - 1920: cards 756 wide, the gallery two columns beside them (900 wide).
 *  - tablet: cards 536 of the 952 container, the gallery one column (408) on
 *    the right, both sticky beside the cards.
 *  - phone: the cards run full width and the gallery is a 244-tall strip that
 *    sticks to the top of the timeline while they scroll under it.
 * The year rail down the left edge is AboutYearRail.
 */

/** Where the gallery stops sitting beside the cards and becomes a strip above them. */
const STACKED = media.down('m');
/** Figma's gallery widths: 900 beside the 1920 frame's cards, 408 on a tablet. */
const GALLERY = { desktop: 900, tablet: 408, strip: 244 } as const;

const Section = styled.section`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacing[1000]}px;
  width: 100%;
  max-width: ${grid.maxWidth}px;
  /* Room on the left for the year rail, except where the page's own margin has it. */
  padding: 0 ${spacing[400]}px 0 ${RAIL_SPACE.base}px;

  @media (min-width: ${RAIL_WIDE}px) {
    padding: 0 ${spacing[400]}px;
  }

  /* Figma: 48 on the tablet frame, 32 on the phone — plus the rail's gutter. */
  ${media.down('xl')} {
    padding: 0 ${spacing[600]}px 0 ${RAIL_SPACE.tablet}px;
  }

  ${media.down('m')} {
    gap: ${spacing[600]}px;
    padding: 0 ${spacing[400]}px 0 ${RAIL_SPACE.mobile}px;
  }
`;

/** The cards and the gallery side by side; the gallery runs to the screen's right edge. */
const Body = styled.div`
  position: relative;
  display: flex;
  width: 100%;
`;

const Cards = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  gap: ${spacing[1000]}px;
  /* Figma: the cards take the left 756 of the 1376 container. */
  max-width: 756px;

  /* Beside the tablet gallery (408 and a 24 gap), in what the rail leaves. */
  ${media.down('xl')} {
    max-width: calc(100% - ${GALLERY.tablet + 24}px);
    gap: ${spacing[800]}px;
  }

  ${STACKED} {
    max-width: none;
    gap: ${spacing[600]}px;
  }
`;

const Card = styled.article`
  display: flex;
  flex-direction: column;
  gap: ${spacing[500]}px;

  ${media.down('m')} {
    gap: ${spacing[300]}px;
  }
`;

const Heading = styled.header`
  display: flex;
  flex-direction: column;
  gap: ${spacing[150]}px;
`;

const Company = styled.h3`
  margin: 0;
  font-family: ${fontFamily.display};
  font-weight: ${fontWeight.heading};
  font-size: ${fontSize.display.s}px;
  line-height: ${lineHeight.display.s}px;
  letter-spacing: ${letterSpacing.xs}px;
  color: ${accents.primary};

  ${media.down('m')} {
    font-size: ${fontSize.heading.l}px;
    line-height: ${lineHeight.heading.l}px;
  }
`;

const Role = styled.p`
  margin: 0;
  font-family: ${fontFamily.heading};
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.heading.s}px;
  line-height: ${lineHeight.heading.s}px;
  letter-spacing: ${letterSpacing.xs}px;
  color: ${neutrals[700]};

  ${media.down('m')} {
    font-size: ${fontSize.body.l}px;
    line-height: ${lineHeight.body.l}px;
  }
`;

const Block = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing[200]}px;
`;

const BlockLabel = styled.h4`
  margin: 0;
  font-family: ${fontFamily.heading};
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.body.l}px;
  line-height: ${lineHeight.body.l}px;
  letter-spacing: ${letterSpacing.m}px;
  color: ${neutrals[100]};
`;

const BlockBody = styled.ul`
  display: flex;
  flex-direction: column;
  gap: ${spacing[50]}px;
  margin: 0;
  padding-left: 1.2em;
  list-style: disc;
  font-family: ${fontFamily.heading};
  font-weight: ${fontWeight.regular};
  font-size: ${fontSize.body.l}px;
  line-height: ${lineHeight.body.l}px;
  letter-spacing: ${letterSpacing.m}px;
  color: ${neutrals[500]};

  ${media.down('m')} {
    font-size: ${fontSize.body.m}px;
    line-height: ${lineHeight.body.m}px;
  }
`;

/** The growth words, spaced out on one line as in the card. */
const Growth = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing[400]}px;
  margin: 0;
  padding: 0;
  list-style: none;
  font-family: ${fontFamily.heading};
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.body.l}px;
  line-height: ${lineHeight.body.l}px;
  letter-spacing: ${letterSpacing.m}px;
  color: ${neutrals[700]};

  ${media.down('m')} {
    gap: ${spacing[200]}px;
    font-size: ${fontSize.body.m}px;
  }
`;

/* ---------- Gallery ---------- */

/**
 * Beside the cards, running to the right edge of the screen, with a sticky box
 * inside it: Figma's gallery is 900 wide and 1146 tall at 1920.
 */
const GalleryColumn = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 780px;
  right: calc((100vw - min(100vw, ${grid.maxWidth}px)) / -2 - ${spacing[400]}px);
  pointer-events: none;

  ${media.down('xl')} {
    left: auto;
    right: 0;
    width: ${GALLERY.tablet}px;
  }

  ${STACKED} {
    display: none;
  }
`;

const Sticky = styled.div`
  position: sticky;
  /* Under the header, with the same room left below. */
  top: ${spacing[1000]}px;
  height: min(1146px, 100svh - ${spacing[1000] * 2}px);
  overflow: hidden;
`;

const Set = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  gap: ${spacing[200]}px;
  opacity: 0;
  transition: opacity 400ms ease-out;

  &[data-active='true'] {
    opacity: 1;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const Column = styled.div`
  display: flex;
  flex: 1 1 0;
  flex-direction: column;
  gap: ${spacing[200]}px;

  /* The second column is shifted, as the design staggers the two. */
  &:nth-child(2) {
    margin-top: -${spacing[1000]}px;
  }

  /* The tablet frame's gallery is a single column. */
  ${media.down('xl')} {
    &:nth-child(2) {
      display: none;
    }
  }
`;

const Shot = styled.div`
  position: relative;
  width: 100%;
  flex: none;
  overflow: hidden;

  img {
    object-fit: cover;
    object-position: top center;
  }
`;

/**
 * The phone frame's gallery: a strip at the top of the timeline that the cards
 * scroll under, showing the set of whichever card is in the middle.
 */
const Strip = styled.div`
  display: none;

  ${STACKED} {
    position: sticky;
    top: ${spacing[1000]}px;
    z-index: 2;
    display: block;
    width: 100%;
    height: ${GALLERY.strip}px;
    margin-bottom: ${spacing[400]}px;
    /* The cards pass under it, so it can't be see-through. */
    background: var(--color-bg-primary, #0b0915);
    overflow: hidden;
  }
`;

/** Inside the strip the two columns lie side by side, as the mobile gallery has them. */
const StripSet = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  gap: ${spacing[150]}px;
  opacity: 0;
  transition: opacity 400ms ease-out;

  &[data-active='true'] {
    opacity: 1;
  }

  > * {
    flex: 1 1 0;
    height: 100%;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

function GallerySet({ entry, active }: { entry: TimelineEntry; active: boolean }) {
  return (
    <Set data-active={active} aria-hidden>
      {entry.gallery.map((column, c) => (
        <Column key={c}>
          {column.map((image) => (
            <Shot key={image.src} style={{ aspectRatio: String(image.aspect) }}>
              <Image src={image.src} alt="" fill sizes="(max-width: 1024px) 40vw, 50vw" />
            </Shot>
          ))}
        </Column>
      ))}
    </Set>
  );
}

export function AboutTimelineSection() {
  const t = useTranslations('about.timeline');
  const messages = useMessages() as {
    about: { timeline: { entries: Record<string, TimelineEntryContent> } };
  };
  const copy = messages.about.timeline.entries;
  const entries: TimelineEntry[] = TIMELINE_ENTRIES.map((entry) => ({
    ...entry,
    ...copy[entry.id],
  }));

  const [active, setActive] = useState(0);
  const cardsRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  // Whichever card is crossing the middle of the screen owns the gallery and the rail.
  useEffect(() => {
    const cards = cardsRef.current;
    if (!cards) return;
    const observer = new IntersectionObserver(
      (records) => {
        const seen = records
          .filter((record) => record.isIntersecting)
          .map((record) => Number((record.target as HTMLElement).dataset.index));
        if (seen.length) setActive(Math.min(...seen));
      },
      { rootMargin: '-50% 0px -50% 0px' },
    );
    cards.querySelectorAll('[data-index]').forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, []);

  return (
    <Section ref={sectionRef}>
      <AboutYearRail entries={entries} active={active} sectionRef={sectionRef} />
      <Container>
        <SectionHeading title={t('title')} subtitle={t('subtitle')} />
        <Strip aria-hidden>
          {entries.map((entry, index) => (
            <StripSet key={entry.id} data-active={index === active}>
              {entry.gallery.flat().map((image) => (
                <Shot key={image.src}>
                  <Image src={image.src} alt="" fill sizes="33vw" />
                </Shot>
              ))}
            </StripSet>
          ))}
        </Strip>
        <Body>
          <Cards ref={cardsRef}>
            {entries.map((entry, index) => (
              <Card key={entry.id} data-index={index}>
                <Heading>
                  <Company>{entry.company}</Company>
                  <Role>{entry.role}</Role>
                </Heading>
                <Block>
                  <BlockLabel>{t('focus')}</BlockLabel>
                  <BlockBody>
                    {entry.focus
                      .split('. ')
                      .filter(Boolean)
                      .map((line) => (
                        <li key={line}>{line.replace(/\.$/, '')}</li>
                      ))}
                  </BlockBody>
                </Block>
                <Block>
                  <BlockLabel>{t('impact')}</BlockLabel>
                  <BlockBody>
                    {entry.impact
                      .split('. ')
                      .filter(Boolean)
                      .map((line) => (
                        <li key={line}>{line.replace(/\.$/, '')}</li>
                      ))}
                  </BlockBody>
                </Block>
                <Growth>
                  {entry.coreGrowth.map((word) => (
                    <li key={word}>{word}</li>
                  ))}
                </Growth>
              </Card>
            ))}
          </Cards>
          <GalleryColumn aria-hidden>
            <Sticky>
              {entries.map((entry, index) => (
                <GallerySet key={entry.id} entry={entry} active={index === active} />
              ))}
            </Sticky>
          </GalleryColumn>
        </Body>
      </Container>
    </Section>
  );
}

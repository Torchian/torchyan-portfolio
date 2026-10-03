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
import { AboutYearRail, RAIL_CLEAR, RAIL_SPACE } from './AboutYearRail';

/*
 * Figma: Timeline — 1920 (2973:16245), 1024 (3960:15405), 480 (3983:11086);
 * the card is 2810:6345 and the gallery 2821:5636.
 *
 * A column of workplaces with a gallery that swaps its screenshots for
 * whichever card is under the year marker, laid out as each frame has it:
 *  - 1920: cards 748 wide with their text indented 80, the gallery two
 *    columns beside them (900 wide).
 *  - tablet: the cards beside a single 408 column, sticky on the right.
 *  - phone: the cards run the width of the track and the gallery is a 244-tall
 *    strip that sticks to the top while they scroll under it.
 *
 * The section is the page's ordinary centred container, so its heading lines up
 * with every other one. Only the rows the year marker rides beside — the strip
 * and the cards — step right, by as much as the marker still needs (see Track).
 * The year rail down the left edge is AboutYearRail.
 */

/** Where the gallery stops sitting beside the cards and becomes a strip above them. */
const STACKED = media.down('m');
/** Figma's gallery widths: 900 beside the 1920 frame's cards, 408 on a tablet. */
const GALLERY = { desktop: 900, tablet: 408, strip: 244 } as const;
/** Where the gallery starts inside the 1376 container, which is where the cards stop. */
const CARDS = { desktop: 640, tablet: 480 } as const;

const Section = styled.section`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`;

/**
 * The same box every other section on the page uses, so the timeline's heading
 * is centred with the rest of them. Figma's own page margins: 32 at 1920, 48 on
 * a tablet, 32 on a phone.
 */
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacing[2000]}px;
  width: 100%;
  max-width: ${grid.maxWidth}px;
  padding: ${spacing[2000]}px ${spacing[400]}px 0 ${spacing[600]}px;

  ${media.down('xxl')} {
    gap: ${spacing[1250]}px;
    padding: 0 ${spacing[300]}px 0 ${spacing[600]}px;
  }

  ${media.down('m')} {
    gap: ${spacing[600]}px;
    padding: 0 ${spacing[400]}px;
  }
`;

/**
 * The rows the year marker rides beside — the gallery strip and the cards.
 * Figma's 1920 frame parks the marker in the page's own 240px margin; narrower
 * than that there is no margin to park it in, so these rows step right by
 * whatever the marker still needs, while the section and its heading stay
 * centred. The step closes itself as the page's margin grows, so nothing jumps
 * at the width where the margin takes over.
 */
const Track = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding-left: max(
    0px,
    calc(
      ${RAIL_SPACE.base + RAIL_CLEAR - spacing[400]}px - (100vw - min(100vw, ${grid.maxWidth}px)) /
        2
    )
  );

  ${media.down('xxl')} {
    padding-left: ${RAIL_SPACE.mobile + RAIL_CLEAR}px;
  }

  ${STACKED} {
    gap: ${spacing[1000]}px;
    padding-left: ${RAIL_SPACE.mobile + RAIL_CLEAR - spacing[400]}px;
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
  /* Figma stacks the cards 40 apart; their own padding does the rest. */
  gap: ${spacing[500]}px;
  /* Figma: the card box reaches the gallery's left edge, 748 into the container. */
  max-width: ${CARDS.desktop}px;
  padding-right: ${spacing[400]}px;

  /* Beside the tablet gallery (408 and a 32 gap), in what the rail leaves. */
  ${media.down('xxl')} {
    max-width: none;
    padding-right: 0;
  }

  /* The phone frame runs the cards edge to edge with no gap between them. */
  ${STACKED} {
    gap: 0;
  }
`;

/**
 * Figma's timeline_card (2810:6345), one state per device: Desktop (2810:6108),
 * Tablet (3984:12537) and Mobile (3984:12572). The card carries its own padding
 * — 40 top and bottom with an 80 indent at 1920, 24 all round below it — so the
 * three states differ in their rhythm as well as their type.
 */
const Card = styled.article`
  display: flex;
  flex-direction: column;
  gap: ${spacing[400]}px;
  padding: 0 0 ${spacing[800]}px 0;
`;

const Heading = styled.header`
  display: flex;
  flex-direction: column;
  gap: ${spacing[150]}px;

  ${media.down('m')} {
    gap: ${spacing[100]}px;
  }
`;

const Company = styled.h3`
  margin: 0;
  font-family: ${fontFamily.heading};
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.heading.l}px;
  line-height: ${lineHeight.heading.l}px;
  letter-spacing: ${letterSpacing.xs}px;
  color: ${accents.primary};

  /* The tablet state sets it lighter as well as smaller. */
  ${media.down('xxl')} {
    font-weight: ${fontWeight.medium};
    font-size: ${fontSize.heading.m}px;
    line-height: ${lineHeight.heading.m}px;
  }

  ${media.down('m')} {
    font-weight: ${fontWeight.semibold};
    font-size: ${fontSize.heading.s}px;
    line-height: ${lineHeight.heading.s}px;
  }
`;

const Role = styled.p`
  margin: 0;
  font-family: ${fontFamily.heading};
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.heading.s}px;
  line-height: ${lineHeight.heading.s}px;
  letter-spacing: ${letterSpacing.xs}px;
  color: ${neutrals[100]};

  ${media.down('xxl')} {
    font-size: ${fontSize.body.xl}px;
    line-height: ${lineHeight.body.xl}px;
    letter-spacing: ${letterSpacing.s}px;
  }

  ${media.down('m')} {
    font-size: ${fontSize.body.l}px;
    line-height: ${lineHeight.body.l}px;
    letter-spacing: ${letterSpacing.m}px;
  }
`;

/** Figma's Frame 68: everything under the heading, at one size per state. */
const Details = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing[200]}px;

  ${media.down('m')} {
    gap: ${spacing[150]}px;
  }
`;

const Block = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing[100]}px;
`;

/** "Focus" and "Impact": muted, with the lines under them at full strength. */
const BlockLabel = styled.h4`
  margin: 0;
  font-family: ${fontFamily.heading};
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.body.xl}px;
  line-height: ${lineHeight.body.xl}px;
  letter-spacing: ${letterSpacing.s}px;
  color: ${neutrals[700]};

  ${media.down('xxl')} {
    font-size: ${fontSize.body.l}px;
    line-height: ${lineHeight.body.l}px;
    letter-spacing: ${letterSpacing.m}px;
  }

  ${media.down('m')} {
    font-size: ${fontSize.body.m}px;
    line-height: ${lineHeight.body.m}px;
    letter-spacing: ${letterSpacing.s}px;
  }
`;

const BlockBody = styled.ul`
  display: flex;
  flex-direction: column;
  margin: 0;
  /* Figma hangs the bullets 27 out at 1920, 24 on a tablet, 21 on a phone. */
  padding-left: 27px;
  list-style: disc;
  font-family: ${fontFamily.body};
  font-weight: ${fontWeight.regular};
  font-size: ${fontSize.body.xl}px;
  line-height: ${lineHeight.body.xl}px;
  letter-spacing: ${letterSpacing.xs}px;
  color: ${neutrals[100]};

  ${media.down('xxl')} {
    padding-left: 24px;
    font-size: ${fontSize.body.l}px;
    line-height: ${lineHeight.body.l}px;
  }

  ${media.down('m')} {
    padding-left: 21px;
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
  font-size: ${fontSize.body.xl}px;
  line-height: ${lineHeight.body.xl}px;
  letter-spacing: ${letterSpacing.s}px;
  color: ${neutrals[100]};

  ${media.down('xxl')} {
    gap: ${spacing[300]}px;
    font-size: ${fontSize.body.l}px;
    line-height: ${lineHeight.body.l}px;
    letter-spacing: ${letterSpacing.m}px;
  }

  ${media.down('m')} {
    font-size: ${fontSize.body.m}px;
    line-height: ${lineHeight.body.m}px;
    letter-spacing: ${letterSpacing.s}px;
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
  left: ${CARDS.desktop}px;
  right: calc((100vw - min(100vw, ${grid.maxWidth}px)) / -2 - ${spacing[500]}px);
  pointer-events: none;

  ${media.down('xxl')} {
    display: none;
  }
`;

const Sticky = styled.div`
  position: sticky;
  /* Under the header, with the same room left below. */
  top: ${spacing[1000]}px;
  height: min(1146px, 100svh - ${spacing[1000]}px);
  overflow: hidden;

  ${media.down('xxl')} {
    top: calc(${spacing[1000]}px + ${spacing[2000]}px + ${spacing[300]}px);
  }
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
  ${media.down('xxl')} {
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

  // The card under the year marker owns the gallery and the rail: the topmost one
  // still crossing the band that starts where the marker holds, so the year and
  // the company name beside it always name the same workplace.
  useEffect(() => {
    const cards = cardsRef.current;
    if (!cards) return;
    // A record only arrives for a card whose state changed, so the band's whole
    // contents are kept here rather than read off one batch.
    const crossing = new Map<number, boolean>();
    const observer = new IntersectionObserver(
      (records) => {
        for (const record of records) {
          const index = Number((record.target as HTMLElement).dataset.index);
          crossing.set(index, record.isIntersecting);
        }
        const seen = [...crossing].filter(([, on]) => on).map(([index]) => index);
        if (seen.length) setActive(Math.min(...seen));
      },
      { rootMargin: `-${spacing[1000]}px 0px -60% 0px` },
    );
    cards.querySelectorAll('[data-index]').forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, []);

  return (
    <Section ref={sectionRef}>
      <AboutYearRail
        entries={entries}
        active={active}
        sectionRef={sectionRef}
        cardsRef={cardsRef}
      />
      <Container>
        <SectionHeading title={t('title')} subtitle={t('subtitle')} />
        <Track>
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
                  <Details>
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
                  </Details>
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
        </Track>
      </Container>
    </Section>
  );
}

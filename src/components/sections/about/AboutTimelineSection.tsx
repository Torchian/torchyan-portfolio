'use client';

import Image from 'next/image';
import { useEffect, useRef, useState, type RefObject } from 'react';
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
import { TIMELINE_ENTRIES, type GalleryImage, type TimelineEntry, type TimelineEntryContent } from './aboutConfig';
import { AboutYearRail, RAIL_CLEAR, RAIL_SPACE } from './AboutYearRail';

/*
 * Figma: Timeline — 1920 (2973:16245), 1024 (3960:15405), 480 (3983:11086);
 * the card is 2810:6345 and the gallery 2821:5636.
 *
 * A column of workplaces with a gallery that swaps its screenshots for
 * whichever card is under the year marker, laid out as each frame has it:
 *  - 1920: cards 748 wide with their text indented 80, the gallery two
 *    columns beside them (900 wide).
 *  - 1024–1280: the same, narrower — cards 480 wide in tablet type, the
 *    gallery beside them.
 *  - the 1024 frame and down (tablet and phone alike): cards run single-column, full
 *    width, and the gallery moves into the rail's own gutter — the column
 *    the year marker sits in — as a single file of screenshots running top
 *    to bottom, docked 24px under where the marker itself sticks, with the
 *    cards scrolling under it.
 *
 * The section is the page's ordinary centred container, so its heading lines up
 * with every other one. Only the rows the year marker rides beside — the
 * gallery and the cards — step right, by as much as the marker still needs
 * (see Track). The year rail down the left edge is AboutYearRail.
 */

/** Phone-only spacing (Track's own gap and rail clearance). */
const STACKED = media.down('m');
/**
 * Where the layout turns to the tablet frame's single column. Above it the
 * desktop layout holds (cards beside a two-column gallery); between 1024 and
 * 1280 it keeps the tablet type sizes and spacing, only the layout is desktop.
 */
const TABLET = media.down('xl');
/** Where the gallery starts inside the 1376 container, which is where the cards stop. */
const CARDS = { desktop: 640, tablet: 480 } as const;
/**
 * The rail's own gutter below 1280 — same width Track reserves for it in its
 * padding-left, so the gallery that moves in there lines up exactly with the
 * year marker above it. Tablet and phone share one width (Track's own `xxl`
 * rule does too); the phone-only STACKED rule narrows it by Track's step.
 */
const GUTTER = {
  xxl: RAIL_SPACE.mobile + RAIL_CLEAR,
  stacked: RAIL_SPACE.mobile + RAIL_CLEAR - spacing[400],
} as const;

const Section = styled.section`
  position: relative;
  /* The gallery runs to the screen's edge and a little past it: cut it there.
     (clip, not hidden, so the sticky gallery and marker still stick.) */
  overflow-x: clip;
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
 * The rows the year marker rides beside — the gallery and the cards.
 * Figma's 1920 frame parks the marker in the page's own 240px margin; narrower
 * than that there is no margin to park it in, so these rows step right by
 * whatever the marker still needs, while the section and its heading stay
 * centred. The step closes itself as the page's margin grows, so nothing jumps
 * at the width where the margin takes over. Below 1280 this padding is the
 * same gutter the gallery pulls itself back into (GUTTER).
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

  /* The rail's label is tablet-sized from here (AboutYearRail), so it needs less room. */
  ${media.down('xxl')} {
    padding-left: ${RAIL_SPACE.tablet + RAIL_CLEAR - spacing[400]}px;
  }

  ${TABLET} {
    padding-left: ${GUTTER.xxl}px;
  }

  ${STACKED} {
    padding-left: ${GUTTER.stacked}px;
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

  /* 1024–1280: still beside the gallery, narrower. */
  ${media.down('xxl')} {
    max-width: ${CARDS.tablet}px;
  }

  /* The tablet frame: single-column cards, the gallery in the rail's gutter. */
  ${TABLET} {
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
 * Beside the cards at 1920 and up, running to the right edge of the screen,
 * with a sticky box inside it: Figma's gallery is 900 wide and 1146 tall.
 *
 * Below that the two-column grid has nowhere to go, so the box moves into
 * the rail's own gutter instead — pulled left out of Body by the gutter's
 * own width, the same column the year marker sits in above it.
 */
const GalleryColumn = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: ${CARDS.desktop}px;
  right: calc((100vw - min(100vw, ${grid.maxWidth}px)) / -2 - ${spacing[500]}px);
  pointer-events: none;

  ${media.down('xxl')} {
    left: ${CARDS.tablet}px;
  }

  /*
   * The year marker starts level with the first card, in this same gutter, so
   * the box starts under it — 24px below the marker's own bottom edge, as it
   * docks once both are pinned — rather than over the year.
   */
  ${TABLET} {
    top: calc(var(--marker-height, 120px) + 24px);
    left: -${GUTTER.xxl}px;
    right: auto;
    width: ${GUTTER.xxl - RAIL_CLEAR}px;
  }

  ${STACKED} {
    left: -${GUTTER.stacked}px;
    width: ${GUTTER.stacked - RAIL_CLEAR}px;
  }
`;

/** The tablet box's ceiling: under the marker, clear of the screen's bottom. */
const ROOM = `min(640px, 100svh - ${spacing[1500]}px - var(--marker-height, 120px) - 24px - ${spacing[600]}px)`;

const Sticky = styled.div`
  position: sticky;
  /* Under the header, with the same room left below. */
  top: ${spacing[1000]}px;
  height: min(1146px, 100svh - ${spacing[1000]}px);
  overflow: hidden;

  /*
   * In the tablet frame the box docks 24px under the year marker's own bottom edge —
   * not its top, which would run the box through the year and its phrase.
   * --marker-height is AboutYearRail's own measurement of the marker it
   * renders (it wraps differently per entry and per locale), published on
   * the section the two share.
   */
  ${TABLET} {
    top: calc(${spacing[1500]}px + var(--marker-height, 120px) + 24px);
    z-index: 2;
    /* Down to the last screen that fits whole (--fit, useFitGallery). */
    height: min(var(--fit, 100vh), ${ROOM});
    background: var(--color-bg-primary, #0b0915);
    transition: height 400ms ease-out;

    /* A screen runs past the room: it fades out rather than ending on a cut. */
    &[data-cropped='true'] {
      mask-image: linear-gradient(to bottom, #000 80%, transparent);
    }

    @media (prefers-reduced-motion: reduce) {
      transition: none;
    }
  }
`;

/** The most the tablet box may take: the room a probe of this height measures. */
const Room = styled.div`
  display: none;

  ${TABLET} {
    display: block;
    position: absolute;
    top: 0;
    width: 0;
    height: ${ROOM};
    visibility: hidden;
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

  ${TABLET} {
    display: none;
  }
`;

/**
 * The tablet frame's gallery: one column with each of the entry's screens
 * once, in order. The box is cut to the last one that fits whole (useFitGallery),
 * so it never shows a bare stretch under the screens or half of one.
 */
const Single = styled.div`
  display: none;

  ${TABLET} {
    display: flex;
    flex: 1 1 0;
    flex-direction: column;
    gap: ${spacing[200]}px;
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
 * How tall each column has to run, in column widths, to fill the box: the box
 * is about 2.6 column-widths tall, the second column starts 80px higher, and a
 * little over covers the gaps.
 */
const FILL = 3.2;

/**
 * Lays an entry's screens out to fill both columns. Every screen goes to the
 * column that is shorter so far, so tall ones balance short ones; then each
 * column carries on with the entry's own screens again until it's full, so
 * there's no empty space under them.
 */
function fillColumns(gallery: TimelineEntry['gallery']) {
  const images = gallery.flat();
  const columns: { image: GalleryImage; key: string }[][] = [[], []];
  const height = [0, 0];
  if (!images.length) return columns;
  // Tallest first, so the long screens anchor the columns and the short ones even them out.
  const order = [...images].sort((a, b) => a.aspect - b.aspect);
  order.forEach((image) => {
    const c = height[0] <= height[1] ? 0 : 1;
    columns[c].push({ image, key: image.src });
    height[c] += 1 / image.aspect;
  });
  for (let c = 0; c < 2; c++) {
    // Repeat starting from the other column's screens, so a column doesn't show its own again first.
    const pool = [...columns[1 - c], ...columns[c]].map((entry) => entry.image);
    for (let i = 0; height[c] < FILL && i < 40; i++) {
      const image = pool[i % pool.length];
      columns[c].push({ image, key: `${image.src}#${i}` });
      height[c] += 1 / image.aspect;
    }
  }
  return columns;
}

function GallerySet({ entry, active }: { entry: TimelineEntry; active: boolean }) {
  const columns = fillColumns(entry.gallery);
  return (
    <Set data-active={active} aria-hidden>
      {columns.map((column, c) => (
        <Column key={c}>
          {column.map(({ image, key }) => (
            <Shot key={key} style={{ aspectRatio: String(image.aspect) }}>
              <Image src={image.src} alt="" fill sizes="(max-width: 1024px) 200px, (max-width: 1920px) 40vw, 50vw" />
            </Shot>
          ))}
        </Column>
      ))}
      <Single data-single>
        {entry.gallery.flat().map((image) => (
          <Shot key={image.src} style={{ aspectRatio: String(image.aspect) }}>
            <Image src={image.src} alt="" fill sizes="200px" />
          </Shot>
        ))}
      </Single>
    </Set>
  );
}

/**
 * Cuts the tablet box to the active entry's screens: down to the bottom of the
 * last one that fits in the room (Room), or the whole room, faded, when the
 * screens that fit whole would fill less than half of it. Off the tablet frame it leaves the box alone.
 */
function useFitGallery(
  boxRef: RefObject<HTMLDivElement | null>,
  roomRef: RefObject<HTMLDivElement | null>,
  shown: number,
) {
  useEffect(() => {
    const box = boxRef.current;
    const room = roomRef.current;
    if (!box || !room) return;
    const fit = () => {
      const single = box.querySelector<HTMLElement>('[data-active="true"] [data-single]');
      const max = room.getBoundingClientRect().height;
      if (!single || !max || getComputedStyle(single).display === 'none') {
        box.style.removeProperty('--fit');
        box.removeAttribute('data-cropped');
        return;
      }
      let bottom = 0;
      for (const shot of single.children) {
        const end = (shot as HTMLElement).offsetTop + (shot as HTMLElement).offsetHeight;
        if (end > max + 0.5) break;
        bottom = end;
      }
      // A short screen followed by a long one would leave a sliver of a box:
      // there, the long one runs on into the room and fades instead.
      if (bottom < max / 2) bottom = 0;
      box.style.setProperty('--fit', `${bottom || max}px`);
      if (bottom) box.removeAttribute('data-cropped');
      else box.setAttribute('data-cropped', 'true');
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(room);
    for (const single of box.querySelectorAll('[data-single]')) observer.observe(single);
    return () => observer.disconnect();
  }, [boxRef, roomRef, shown]);
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

  // An entry is the page's once its company name has reached the year's line
  // (the middle of the year beside it on the rail): the year changes as each
  // title arrives level with it.
  useEffect(() => {
    const cards = cardsRef.current;
    const section = sectionRef.current;
    if (!cards || !section) return;
    const titles = [...cards.querySelectorAll<HTMLElement>('[data-index] h3')];
    let frame = 0;
    const update = () => {
      frame = 0;
      const year = section.querySelector<HTMLElement>('[data-rail-year]');
      if (!year) return;
      const rect = year.getBoundingClientRect();
      const line = rect.top + rect.height / 2;
      let next = 0;
      titles.forEach((title, index) => {
        const box = title.getBoundingClientRect();
        if (box.top + box.height / 2 <= line + 1) next = index;
      });
      setActive(next);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, []);

  // The gallery stays on the latest workplace that has screens.
  let shown = active;
  while (shown > 0 && entries[shown].gallery.every((column) => column.length === 0)) shown -= 1;
  const stickyRef = useRef<HTMLDivElement>(null);
  const roomRef = useRef<HTMLDivElement>(null);
  useFitGallery(stickyRef, roomRef, shown);

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
              <Room ref={roomRef} />
              <Sticky ref={stickyRef}>
                {entries.map((entry, index) => (
                  <GallerySet key={entry.id} entry={entry} active={index === shown} />
                ))}
              </Sticky>
            </GalleryColumn>
          </Body>
        </Track>
      </Container>
    </Section>
  );
}

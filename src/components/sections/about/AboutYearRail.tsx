'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';
import styled, { css } from 'styled-components';
import { spacing } from '@/styles/tokens/spacing';
import {
  fontFamily,
  fontWeight,
  fontSize,
  lineHeight,
  letterSpacing,
} from '@/styles/tokens/typography';
import { accents, neutrals } from '@/styles/tokens/colors';
import { media } from '@/styles/media';
import { zIndex } from '@/styles/tokens/z-index';
import { HEADER_INLINE } from '@/components/layouts/NavBar';
import { subscribeScroll } from '@/lib/scroll-driver';
import type { TimelineEntry } from './aboutConfig';

/*
 * Figma: Progress Bar (3984:15175) — Desktop / Tablet / Mobile, with its
 * Timeline Year (2810:6629).
 *
 * A line drawn from under the header's logo down the left edge of the page: a
 * green length at the top (751px, fading out) over a faint white one that runs
 * the whole way (25% → 4%). On it rides a single marker — a dot, the year, and
 * what that year stood for — which stays with you as you read and shows one
 * year at a time: the workplace whose card is on screen.
 *
 * The line's top stays where it starts — under the logo, on screen — however
 * far you scroll: it is fixed there, and what changes is its length. It runs
 * down to the end of the timeline, so once that end rises into view the line
 * shortens after it and is gone when the timeline is (`--rail-run`).
 *
 * The marker travels instead: `position: sticky` inside a rail that spans the
 * timeline, it starts beside the first card, rides up with the page, and then
 * holds under the header until the timeline ends. The timeline measures how
 * far the rail reaches back up the page (`--rail-top`) and where its cards
 * begin (`--rail-head`).
 *
 * Figma's 1920 frame has a 240px page margin to hold the label. Below
 * RAIL_WIDE there is no such margin, so the marker covers the left edge of the
 * page instead (RAIL_SPACE) and the timeline steps its own rows right by that
 * much — its heading stays centred with the rest of the page. The label steps
 * down with the width too: the year and its phrase on a narrow desktop, the
 * year alone on a tablet or phone.
 */

/** From this width the page's own margin holds the label, at Figma's full size. */
export const RAIL_WIDE = 1800;
/**
 * How much of the page's left edge the marker itself covers below that width:
 * the dot, and beside it the year with its phrase on a desktop narrower than
 * the wide frame, or the year alone on a tablet or phone.
 */
export const RAIL_SPACE = { base: 264, tablet: 208, mobile: 156 } as const;
/** What the timeline keeps clear after the marker before its own rows start. */
export const RAIL_CLEAR = 16;
/**
 * How much of that width the dot and the gap after it take, so the year gets
 * the rest and never reaches the cards — which stand beside it, since both hold
 * at the top of the screen.
 */
const LABEL_INSET = { base: 86, tablet: 78, mobile: 64 } as const;

/** Figma: the line starts 51px down, just under the header logo. */
const LINE_TOP = 51;

/** Where the rail sits on the page — the line and the marker share the column. */
const railColumn = css`
  left: ${HEADER_INLINE.base}px;
  z-index: ${zIndex.base};
  width: 8px;
  pointer-events: none;

  @media (min-width: ${RAIL_WIDE}px) {
    left: calc((100vw - 1376px) / 2 - 240px + ${HEADER_INLINE.base}px);
  }

  ${media.down('m')} {
    left: ${HEADER_INLINE.mobile}px;
  }
`;

/**
 * The line: pinned under the logo and never moving from there. Only its length
 * changes, and it changes on scroll — it reaches the end of the timeline, or
 * the bottom of the screen while that end is still below.
 */
const Track = styled.div`
  position: fixed;
  top: ${LINE_TOP}px;
  height: var(--rail-run, calc(100vh - ${LINE_TOP}px));
  ${railColumn}
`;

const Line = styled.div`
  position: absolute;
  inset: 17px 0 0;
  background: linear-gradient(to bottom, ${accents.primary} 0%, rgba(12, 175, 10, 0) 100%);
`;

/** Spans the timeline, so the marker inside it can stick through it. */
const Rail = styled.div`
  position: absolute;
  top: calc(var(--rail-top, 0px) + ${LINE_TOP}px);
  bottom: 0;
  ${railColumn}
`;

/**
 * Rides the line: it starts beside the first card, travels up with the page,
 * and then sticks under the header — level with the gallery — for as long as
 * the timeline lasts. The rail itself begins at the logo, far above the cards,
 * so the marker is pushed down to where they start (`--rail-head`).
 */
const Marker = styled.div`
  position: sticky;
  top: ${spacing[2000]}px;
  margin-top: var(--rail-head, 0px);
  display: flex;
  align-items: flex-start;
  gap: ${spacing[300]}px;
  /* Figma hangs the marker 22px to the left of the bar, centring the dot on the line. */
  margin-left: -22px;
  opacity: 0;
  transition: opacity 300ms ease-out;

  &[data-visible='true'] {
    opacity: 1;
  }

  /* Figma's Timeline Year sets the gap per state; the dot never changes size. */
  ${media.down('xl')} {
    gap: ${spacing[200]}px;
  }

  ${media.down('m')} {
    gap: 10px;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

/**
 * Figma's Map Dot 3: three green circles, 48 / 30 / 12 of a 48 box at 20%, 30%
 * and full, drawn at 52 in every state of Timeline Year. It hangs a little
 * below the year's cap line — 12 at 1920, 10 on a tablet.
 */
const Dot = styled.span`
  position: relative;
  flex: none;
  width: 52px;
  height: 52px;
  margin-top: ${spacing[150]}px;

  span {
    position: absolute;
    top: 50%;
    left: 50%;
    border-radius: 50%;
    background: ${accents.primary};
    transform: translate(-50%, -50%);
  }

  span:nth-child(1) {
    width: 52px;
    height: 52px;
    opacity: 0.2;
  }

  span:nth-child(2) {
    width: 32.5px;
    height: 32.5px;
    opacity: 0.3;
  }

  span:nth-child(3) {
    width: 13px;
    height: 13px;
  }

  ${media.down('xl')} {
    margin-top: 10px;
  }

  ${media.down('m')} {
    margin-top: 0;
  }
`;

/** The year over its phrase, as Timeline Year has them. */
/** Figma's timeline_year_content: the year over its phrase, 16 / 8 / 0 apart. */
const Label = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: ${spacing[200]}px;
  width: ${RAIL_SPACE.base - LABEL_INSET.base}px;

  ${media.down('xl')} {
    gap: ${spacing[100]}px;
    width: ${RAIL_SPACE.tablet - LABEL_INSET.tablet}px;
  }

  ${media.down('m')} {
    gap: 0;
    width: ${RAIL_SPACE.mobile - LABEL_INSET.mobile}px;
  }
`;

/** Figma: 72 Bold at 1920, 58 SemiBold on a tablet, 36 SemiBold on a phone. */
const Year = styled.span`
  font-family: ${fontFamily.display};
  font-weight: ${fontWeight.heading};
  font-size: ${fontSize.display.m}px;
  line-height: ${lineHeight.display.m}px;
  letter-spacing: ${letterSpacing.xs}px;
  white-space: nowrap;
  color: ${accents.primary};

  ${media.down('xl')} {
    font-weight: ${fontWeight.semibold};
    font-size: ${fontSize.display.s}px;
    line-height: ${lineHeight.display.s}px;
  }

  ${media.down('m')} {
    font-size: ${fontSize.heading.l}px;
    line-height: ${lineHeight.heading.l}px;
  }
`;

/** Figma: 18 at 1920, 16 on a tablet, 14 on a phone — always the muted grey. */
const Phrase = styled.span`
  font-family: ${fontFamily.heading};
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.body.xl}px;
  line-height: ${lineHeight.body.xl}px;
  letter-spacing: ${letterSpacing.s}px;
  color: ${neutrals[500]};

  ${media.down('xl')} {
    font-size: ${fontSize.body.l}px;
    line-height: ${lineHeight.body.l}px;
    letter-spacing: ${letterSpacing.m}px;
  }

  /*
   * Figma sets this on one line at every size, which on a phone is 220px of a
   * 480 screen — it lies over the cards there. The gutter holds the year, so
   * the phrase steps out on a phone rather than the cards stepping further in.
   */
  ${media.down('m')} {
    display: none;
  }
`;

export interface AboutYearRailProps {
  entries: TimelineEntry[];
  /** Index of the entry the page is on. */
  active: number;
  /** The timeline: how far the rail reaches back up the page, and when the marker shows. */
  sectionRef: RefObject<HTMLElement | null>;
  /** The cards: where the marker starts, so it arrives beside the first one. */
  cardsRef: RefObject<HTMLElement | null>;
}

export function AboutYearRail({ entries, active, sectionRef, cardsRef }: AboutYearRailProps) {
  const railRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const entry = entries[Math.min(active, entries.length - 1)];

  useEffect(() => {
    const section = sectionRef.current;
    const rail = railRef.current;
    const track = trackRef.current;
    if (!section || !rail || !track) return;

    // The rail starts at the top of the page, which is this far above the
    // timeline; the marker starts further down still, where the cards do.
    const measure = () => {
      const top = section.getBoundingClientRect().top + window.scrollY;
      rail.style.setProperty('--rail-top', `${-Math.max(0, top)}px`);
      const cards = cardsRef.current;
      if (!cards) return;
      const head = cards.getBoundingClientRect().top + window.scrollY - LINE_TOP;
      rail.style.setProperty('--rail-head', `${Math.max(0, head)}px`);
    };
    measure();
    const resize = new ResizeObserver(measure);
    resize.observe(document.documentElement);

    // It shows for as long as the timeline is on screen, so it arrives with the
    // section's top edge rather than waiting for the section to fill the screen.
    const shown = new IntersectionObserver(([record]) => setVisible(record.isIntersecting));
    shown.observe(section);

    // The line's top is fixed, so its length is what has to follow the page: it
    // ends where the timeline ends, or at the bottom of the screen until then.
    const unsubscribe = subscribeScroll<number>({
      read: (frame) => Math.min(frame.vh, frame.rect(section).bottom) - LINE_TOP,
      write: (_frame, run) => {
        track.style.setProperty('--rail-run', `${Math.max(0, run)}px`);
      },
    });

    return () => {
      resize.disconnect();
      shown.disconnect();
      unsubscribe();
    };
  }, [sectionRef, cardsRef]);

  return (
    <>
      <Track ref={trackRef} aria-hidden>
        <Line />
      </Track>
      <Rail ref={railRef} aria-hidden>
        <Marker data-visible={visible}>
          <Dot>
            <span />
            <span />
            <span />
          </Dot>
          <Label>
            <Year>{entry.railYear}</Year>
            <Phrase>{entry.stickyContent.replace(/\n/g, ' ')}</Phrase>
          </Label>
        </Marker>
      </Rail>
    </>
  );
}

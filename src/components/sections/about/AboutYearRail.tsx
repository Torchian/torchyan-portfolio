'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';
import styled from 'styled-components';
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
 * The marker is `position: sticky` inside the rail, so the line travels past it
 * as the design draws it, and it stops at the rail's two ends by itself. The
 * rail runs from the top of the page to the end of the timeline; the timeline
 * measures how far back up that is (`--rail-top`).
 *
 * Figma's 1920 frame has a 240px page margin to hold the label. Below
 * RAIL_WIDE there is no such margin, so the timeline leaves a gutter
 * (RAIL_SPACE) and the label steps down with it: the year and its phrase in the
 * gutter, and on a phone the year alone.
 */

/** From this width the page's own margin holds the label, at Figma's full size. */
export const RAIL_WIDE = 1800;
/**
 * What the timeline leaves clear on its left below that width: enough for the
 * year and its phrase on a desktop that's narrower than the wide frame, and
 * for the year alone on a tablet or phone, where the cards and the gallery
 * need the rest.
 */
export const RAIL_SPACE = { base: 192, tablet: 112, mobile: 96 } as const;

/** Figma: the line starts 51px down, just under the header logo. */
const LINE_TOP = 51;
/** The green length at the top of the line. */
const GREEN_RUN = 751;

const Rail = styled.div`
  position: absolute;
  top: calc(var(--rail-top, 0px) + ${LINE_TOP}px);
  bottom: 0;
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

/** The faint line the whole way down, with the green run over its top. */
const Line = styled.div`
  position: absolute;
  inset: 0;
  border-radius: 4px;
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.25) 0%,
    rgba(255, 255, 255, 0.04) 100%
  );

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: ${GREEN_RUN}px;
    border-radius: 4px;
    background: linear-gradient(to bottom, ${accents.primary} 0%, rgba(12, 175, 10, 0) 100%);
  }
`;

/**
 * Rides the line: sticky, so it keeps its place on screen while the rail runs
 * past it. It fades in with the timeline.
 */
const Marker = styled.div`
  position: sticky;
  top: 45vh;
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

  ${media.down('xl')} {
    gap: ${spacing[150]}px;
    margin-left: -12px;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const Dot = styled.span`
  position: relative;
  flex: none;
  width: 52px;
  height: 52px;

  span {
    position: absolute;
    top: 50%;
    left: 50%;
    border-radius: 50%;
    background: ${accents.primary};
    transform: translate(-50%, -50%);
  }

  span:nth-child(1) {
    width: 48px;
    height: 48px;
    opacity: 0.16;
  }

  span:nth-child(2) {
    width: 30px;
    height: 30px;
    opacity: 0.3;
  }

  span:nth-child(3) {
    width: 12px;
    height: 12px;
  }

  ${media.down('xl')} {
    width: 32px;
    height: 32px;

    span:nth-child(1) {
      width: 28px;
      height: 28px;
    }

    span:nth-child(2) {
      width: 18px;
      height: 18px;
    }

    span:nth-child(3) {
      width: 8px;
      height: 8px;
    }
  }
`;

/** The year over its phrase, as Timeline Year has them. */
const Label = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing[200]}px;
  width: 154px;

  @media (max-width: ${RAIL_WIDE - 1}px) {
    gap: ${spacing[100]}px;
    width: ${RAIL_SPACE.base - 106}px;
  }

  ${media.down('xl')} {
    width: ${RAIL_SPACE.tablet - 60}px;
  }

  ${media.down('m')} {
    width: ${RAIL_SPACE.mobile - 44}px;
  }
`;

const Year = styled.span`
  font-family: ${fontFamily.display};
  font-weight: ${fontWeight.black};
  /* Figma: 72 on desktop, 58 on a tablet, 36 on a phone. */
  font-size: ${fontSize.display.m}px;
  line-height: ${lineHeight.display.m}px;
  letter-spacing: ${letterSpacing.xs}px;
  color: ${accents.primary};

  /* Below the wide frame the year lives in the gutter, so it steps down to fit it. */
  @media (max-width: ${RAIL_WIDE - 1}px) {
    font-size: ${fontSize.heading.l}px;
    line-height: ${lineHeight.heading.l}px;
  }

  /* On a tablet and a phone the year shares the gutter with the cards. */
  ${media.down('xl')} {
    font-size: ${fontSize.heading.s}px;
    line-height: ${lineHeight.heading.s}px;
  }
`;

const Phrase = styled.span`
  font-family: ${fontFamily.heading};
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.body.l}px;
  line-height: ${lineHeight.body.l}px;
  letter-spacing: ${letterSpacing.m}px;
  color: ${neutrals[500]};

  @media (max-width: ${RAIL_WIDE - 1}px) {
    font-size: ${fontSize.body.s}px;
    line-height: ${lineHeight.body.s}px;
  }

  /* No room for it beside a tablet's or phone's cards. */
  ${media.down('xl')} {
    display: none;
  }
`;

export interface AboutYearRailProps {
  entries: TimelineEntry[];
  /** Index of the entry the page is on. */
  active: number;
  /** The timeline: how far the rail reaches back up the page, and when the marker shows. */
  sectionRef: RefObject<HTMLElement | null>;
}

export function AboutYearRail({ entries, active, sectionRef }: AboutYearRailProps) {
  const railRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const entry = entries[Math.min(active, entries.length - 1)];

  useEffect(() => {
    const section = sectionRef.current;
    const rail = railRef.current;
    if (!section || !rail) return;

    // The rail starts at the top of the page, which is this far above the timeline.
    const measure = () => {
      const top = section.getBoundingClientRect().top + window.scrollY;
      rail.style.setProperty('--rail-top', `${-Math.max(0, top)}px`);
    };
    measure();
    const resize = new ResizeObserver(measure);
    resize.observe(document.documentElement);

    const shown = new IntersectionObserver(([record]) => setVisible(record.isIntersecting), {
      rootMargin: '-20% 0px -20% 0px',
    });
    shown.observe(section);

    return () => {
      resize.disconnect();
      shown.disconnect();
    };
  }, [sectionRef]);

  return (
    <Rail ref={railRef} aria-hidden>
      <Line />
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
  );
}

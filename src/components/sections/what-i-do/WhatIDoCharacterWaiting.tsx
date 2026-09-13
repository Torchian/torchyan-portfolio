'use client';

import styled from 'styled-components';
import { useEffect, useRef, type RefObject } from 'react';
import { createInViewGate, subscribeScroll } from '@/lib/scroll-driver';

/** Fraction of whatido_bg_3.svg's (1074×1210) height at which the visible
 *  bottom bracket line of the "Design with intent" square sits - measured by
 *  pixel-scanning the rendered SVG (bottom line at ~y=860 of 1210). */
const BG3_SQUARE_BOTTOM_FRACTION = 0.2;

/** Character parts - no head (excluded from second container) */
const ALL_PARTS = [
  { src: '/character/character_right_ear.svg', zIndex: 0, left: 3.7, top: 44.5, width: 11 },
  { src: '/character/character_left_ear.svg', zIndex: 0, left: 85, top: 44.3, width: 11 },
  { src: '/character/character_right_eyebrow.svg', zIndex: 2, left: 15, top: 32.92, width: 27 },
  { src: '/character/character_left_eyebrow.svg', zIndex: 2, left: 56.3, top: 32.3, width: 28.8 },
  { src: '/character/character_right_eye.svg', zIndex: 1, left: 19.7, top: 41.4, width: 18.4 },
  { src: '/character/character_left_eye.svg', zIndex: 1, left: 60.7, top: 41.3, width: 19.8 },
  { src: '/character/character_beard.svg', zIndex: 4, left: 11, top: 62.5, width: 77.6 },
] as const;

/** Initial "waiting" parts: left_eyebrow, left_ear, right_eye (indices 3, 1, 4). */
const INITIAL_PART_INDICES = [3, 1, 4];

/** Beard - fades in (0 to 1 opacity) over BEARD_FADE_DISTANCE_PX of scroll
 *  once the square's bottom line reaches it, instead of following the other
 *  parts' step-based reveal. */
const BEARD_INDEX = 6;

/** Scroll distance (px), past the moment the line reaches the beard's top,
 *  over which its opacity ramps from 0 to 1. */
const BEARD_FADE_DISTANCE_PX = 200;

/**
 * Same dimensions as WhatIDoCharacter for alignment.
 * Grayscale comes from the --grayscale CSS variable, written by
 * useWhatIDoScroll onto the visuals column and inherited here.
 */
const Wrapper = styled.div`
  position: relative;
  width: 100%;
  max-width: 420px;
  aspect-ratio: 421 / 573;
  filter: sepia(0) grayscale(var(--grayscale, 1));
  transition: filter 0.4s ease-out;
`;

/**
 * How a part's opacity is driven:
 *  - `static`: always visible.
 *  - `reveal`: the inherited --reveal variable (written by useWhatIDoScroll),
 *    eased by a CSS transition.
 *  - `scrollFade` (the beard): its own --opacity, written imperatively
 *    frame-by-frame by the effect below. No CSS transition - the ramp is
 *    already smooth (computed from scroll distance), so a transition on top
 *    would only add lag. Defaults hidden so nothing flashes before it runs.
 */
type PartMode = 'static' | 'reveal' | 'scrollFade';

/** left/top/width/zIndex are static per part; only opacity changes on scroll,
 *  and it does so through CSS variables rather than styled-component props. */
const Part = styled.img<{
  $left: number;
  $top: number;
  $width: number;
  $zIndex: number;
  $mode: PartMode;
}>`
  position: absolute;
  left: ${(p) => p.$left}%;
  top: ${(p) => p.$top}%;
  width: ${(p) => p.$width}%;
  height: auto;
  object-fit: contain;
  object-position: left top;
  z-index: ${(p) => p.$zIndex};
  opacity: ${(p) =>
    p.$mode === 'static' ? '1' : p.$mode === 'reveal' ? 'var(--reveal, 0)' : 'var(--opacity, 0)'};
  transition: ${(p) => (p.$mode === 'reveal' ? 'opacity 0.5s ease-out' : 'none')};
  pointer-events: none;
`;

export interface WhatIDoCharacterWaitingProps {
  /** Ref to Bg3 (the "Design with intent" square) - its bottom bracket line
   *  gates the beard's fade. */
  squareRef?: RefObject<HTMLDivElement | null>;
}

/**
 * Second character - starts with 3 parts (no head), reveals the rest when scrolling to
 * "Design with intent". The reveal starts 200px of scroll into the transition.
 */
export function WhatIDoCharacterWaiting({ squareRef }: WhatIDoCharacterWaitingProps) {
  const beardRef = useRef<HTMLImageElement>(null);

  // Beard: fades in over BEARD_FADE_DISTANCE_PX of scroll once the square's
  // bottom bracket line rises to/past the beard's own (fixed, sticky) position.
  useEffect(() => {
    const beard = beardRef.current;
    if (!beard) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      beard.style.setProperty('--opacity', '1');
      return;
    }

    const gate = createInViewGate(beard);
    let lastOpacity = NaN;

    const unsubscribe = subscribeScroll<number | null>({
      active: () => gate.current,
      read: (frame) => {
        // Read .current every frame: Bg3 is a sibling, so its ref isn't
        // guaranteed to be attached the first time this runs. Until it is,
        // stay hidden and try again on the next driven frame.
        const square = squareRef?.current;
        if (!square) return null;
        const b = frame.rect(beard);
        const s = frame.rect(square);
        const lineY = s.top + s.height * BG3_SQUARE_BOTTOM_FRACTION;
        // 0 while the line hasn't reached the beard's top yet; ramps to 1 over
        // the next BEARD_FADE_DISTANCE_PX of scroll past that point.
        return Math.min(1, Math.max(0, (b.top - lineY) / BEARD_FADE_DISTANCE_PX));
      },
      write: (_frame, opacity) => {
        if (opacity === null || opacity === lastOpacity) return;
        beard.style.setProperty('--opacity', String(opacity));
        lastOpacity = opacity;
      },
    });

    return () => {
      unsubscribe();
      gate.disconnect();
    };
  }, [squareRef]);

  return (
    <Wrapper aria-hidden>
      {ALL_PARTS.map((part, i) => {
        const isBeard = i === BEARD_INDEX;
        const mode: PartMode = isBeard
          ? 'scrollFade'
          : INITIAL_PART_INDICES.includes(i)
            ? 'static'
            : 'reveal';
        return (
          <Part
            key={i}
            ref={isBeard ? beardRef : undefined}
            src={part.src}
            alt=""
            $left={part.left}
            $top={part.top}
            $width={part.width}
            $zIndex={part.zIndex}
            $mode={mode}
          />
        );
      })}
    </Wrapper>
  );
}

'use client';

import Image from 'next/image';
import styled from 'styled-components';
import { useEffect, useRef, type RefObject } from 'react';
import {
  FACE_ASPECT,
  glassesImage,
  headImage,
  partBox,
  type HeadPart,
  type PartImage,
} from '@/components/composites/character/characterLayout';
import { media } from '@/styles/media';
import { createInViewGate, subscribeScroll } from '@/lib/scroll-driver';

/** Where the beard's reveal line crosses Bg3 (whatido_bg_3, 1074×1210 in Figma), as
 *  a fraction of its height: 20% down the box, tuned by eye. It is not the
 *  square's bottom bracket line — that sits lower, at ~860 of 1210 (≈0.71). */
const BEARD_REVEAL_LINE_FRACTION = 0.2;

/** Character parts - no face (that's the first container), bottom to top as in
 *  the Figma head (glasses between the brows and the beard), placed in the face
 *  frame from the shared Character layout. */
const PARTS = [
  'eye-left',
  'eye-right',
  'ear-right',
  'ear-left',
  'brow-left',
  'brow-right',
  'glasses',
  'beard',
] as const satisfies readonly (HeadPart | 'glasses')[];

const imageOf = (name: (typeof PARTS)[number]): PartImage =>
  name === 'glasses' ? glassesImage('default') : headImage(name);

/** Shown from the start, "waiting" for the rest. */
const INITIAL_PARTS: readonly string[] = ['brow-left', 'ear-left', 'eye-right'];

/** Wrapper's max width (below), for each part's download size. */
const MAX_WIDTH = 420;

/** Scroll distance (px), past the moment the line reaches the beard's top,
 *  over which the beard's opacity ramps from 0 to 1 — it fades in on its own
 *  instead of following the other parts' step-based reveal. */
const BEARD_FADE_DISTANCE_PX = 200;

/**
 * Same dimensions as WhatIDoCharacter for alignment.
 * Grayscale comes from the --grayscale CSS variable, written by
 * useWhatIDoScroll onto the visuals column and inherited here.
 */
const Wrapper = styled.div`
  position: relative;
  width: 100%;
  max-width: ${MAX_WIDTH}px;
  aspect-ratio: ${FACE_ASPECT};
  filter: sepia(0) grayscale(var(--grayscale, 1));
  transition: filter 0.4s ease-out;
`;

/**
 * How a part's opacity is driven:
 *  - `static`: always visible.
 *  - `reveal`: the inherited --reveal variable (written by useWhatIDoScroll),
 *    eased by a CSS transition.
 *  - `final` (the glasses): the inherited --final switch (written by
 *    useWhatIDoScroll on "Refine and evolve"); they drop into place over the
 *    eyes as they fade in, and lift off again on the way back up.
 *  - `scrollFade` (the beard): its own --opacity, written imperatively
 *    frame-by-frame by the effect below. No CSS transition - the ramp is
 *    already smooth (computed from scroll distance), so a transition on top
 *    would only add lag. Defaults hidden so nothing flashes before it runs.
 */
type PartMode = 'static' | 'reveal' | 'final' | 'scrollFade';

/** The box is static per part (inline style); only opacity changes on scroll,
 *  and it does so through CSS variables rather than styled-component props.
 *  Paint order is DOM order. */
const OPACITY: Record<PartMode, string> = {
  static: '1',
  reveal: 'var(--reveal, 0)',
  final: 'var(--final, 0)',
  scrollFade: 'var(--opacity, 0)',
};

const Part = styled.div<{ $mode: PartMode }>`
  position: absolute;
  opacity: ${(p) => OPACITY[p.$mode]};
  transition: ${(p) => (p.$mode === 'reveal' ? 'opacity 0.5s ease-out' : 'none')};
  pointer-events: none;

  &[data-mode='final'] {
    /* Lowered from a little above the brow onto the nose as it fades in. */
    transform: translateY(calc((1 - var(--final, 0)) * -24%));
    transition:
      opacity 0.4s ease-out,
      transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
  }

  ${media.reducedMotion} {
    &[data-mode='final'] {
      transform: none;
      transition: opacity 0.2s linear;
    }
  }
`;

export interface WhatIDoCharacterWaitingProps {
  /** Ref to Bg3 (the "Design with intent" square) - a line across it
   *  gates the beard's fade. */
  squareRef?: RefObject<HTMLDivElement | null>;
}

/**
 * Second character - starts with 3 parts (no head), reveals the rest when scrolling to
 * "Design with intent". The reveal starts 200px of scroll into the transition.
 */
export function WhatIDoCharacterWaiting({ squareRef }: WhatIDoCharacterWaitingProps) {
  const beardRef = useRef<HTMLDivElement>(null);

  // Beard: fades in over BEARD_FADE_DISTANCE_PX of scroll once the reveal line
  // across Bg3 rises to/past the beard's own (fixed, sticky) position.
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
        const lineY = s.top + s.height * BEARD_REVEAL_LINE_FRACTION;
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
      {PARTS.map((name) => {
        const image = imageOf(name);
        const box = partBox(image, 'face');
        const isBeard = name === 'beard';
        const mode: PartMode = isBeard
          ? 'scrollFade'
          : name === 'glasses'
            ? 'final'
            : INITIAL_PARTS.includes(name)
              ? 'static'
              : 'reveal';
        return (
          <Part
            key={name}
            ref={isBeard ? beardRef : undefined}
            $mode={mode}
            data-mode={mode}
            style={{
              left: `${box.left}%`,
              top: `${box.top}%`,
              width: `${box.width}%`,
              height: `${box.height}%`,
            }}
          >
            <Image
              src={image.src}
              alt=""
              fill
              sizes={`${Math.ceil((MAX_WIDTH * box.width) / 100)}px`}
              draggable={false}
            />
          </Part>
        );
      })}
    </Wrapper>
  );
}

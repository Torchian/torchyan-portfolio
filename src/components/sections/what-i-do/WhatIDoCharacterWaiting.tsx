'use client';

import styled from 'styled-components';
import { getGrayscale } from './WhatIDoCharacter';

/** Design with intent = step index 2 */
const REVEAL_AT_STEP_INDEX = 2;

/** Scroll offset (px) before reveal animation starts */
const REVEAL_OFFSET_PX = 200;

/** Step height for progress calculation */
const STEP_HEIGHT = 960;

/** Character parts - no head (excluded from second container) */
const ALL_PARTS = [
  { src: '/character/character_right_ear.svg', zIndex: 0, left: 3.7, top: 44.5, width: 11 },
  { src: '/character/character_left_ear.svg', zIndex: 0, left: 85, top: 44.3, width: 11 },
  { src: '/character/character_right_eyebrow.svg', zIndex: 2, left: 15, top: 32.9, width: 27 },
  { src: '/character/character_left_eyebrow.svg', zIndex: 2, left: 56.3, top: 32.3, width: 28.8 },
  { src: '/character/character_right_eye.svg', zIndex: 1, left: 19.7, top: 41.4, width: 18.4 },
  { src: '/character/character_left_eye.svg', zIndex: 1, left: 60.7, top: 41.3, width: 19.8 },
  { src: '/character/character_beard.svg', zIndex: 4, left: 11, top: 62.5, width: 77.6 },
] as const;

/** Initial "waiting" parts: beard, left_eyebrow, left_ear, right_eye (indices 6, 3, 1, 4) */
const INITIAL_PART_INDICES = [6, 3, 1, 4];

/** Progress threshold: reveal starts after REVEAL_OFFSET_PX of scroll */
const REVEAL_PROGRESS_THRESHOLD = REVEAL_OFFSET_PX / STEP_HEIGHT;

/** Same dimensions as WhatIDoCharacter for alignment */
const Wrapper = styled.div<{ $grayscale: number }>`
  position: relative;
  width: 100%;
  max-width: 420px;
  aspect-ratio: 421 / 573;
  filter: grayscale(${(p) => p.$grayscale});
  transition: filter 0.4s ease-out;
`;

const Part = styled.img<{
  $left: number;
  $top: number;
  $width: number;
  $zIndex: number;
  $opacity: number;
}>`
  position: absolute;
  left: ${(p) => p.$left}%;
  top: ${(p) => p.$top}%;
  width: ${(p) => p.$width}%;
  height: auto;
  object-fit: contain;
  object-position: left top;
  z-index: ${(p) => p.$zIndex};
  opacity: ${(p) => p.$opacity};
  transition: opacity 0.5s ease-out;
  pointer-events: none;
`;

export interface WhatIDoCharacterWaitingProps {
  activeStepIndex: number;
  scrollProgress: number;
}

/**
 * Second character - starts with 4 parts (no head), reveals remaining parts when scrolling to
 * "Design with intent". Reveal animation starts after 200px of scroll into the transition.
 */
export function WhatIDoCharacterWaiting({
  activeStepIndex,
  scrollProgress,
}: WhatIDoCharacterWaitingProps) {
  const rawProgress =
    activeStepIndex >= REVEAL_AT_STEP_INDEX
      ? 1
      : activeStepIndex === REVEAL_AT_STEP_INDEX - 1
        ? scrollProgress
        : 0;
  const revealProgress =
    rawProgress <= REVEAL_PROGRESS_THRESHOLD
      ? 0
      : (rawProgress - REVEAL_PROGRESS_THRESHOLD) / (1 - REVEAL_PROGRESS_THRESHOLD);

  const grayscale = getGrayscale(activeStepIndex, scrollProgress);

  return (
    <Wrapper aria-hidden $grayscale={grayscale}>
      {ALL_PARTS.map((part, i) => {
        const isInitial = INITIAL_PART_INDICES.includes(i);
        const opacity = isInitial ? 1 : revealProgress;
        return (
          <Part
            key={i}
            src={part.src}
            alt=""
            $left={part.left}
            $top={part.top}
            $width={part.width}
            $zIndex={part.zIndex}
            $opacity={opacity}
          />
        );
      })}
    </Wrapper>
  );
}

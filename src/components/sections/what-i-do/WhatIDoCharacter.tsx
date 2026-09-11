'use client';

/* eslint-disable @next/next/no-img-element */
import styled from 'styled-components';
import type { CSSProperties } from 'react';

/** Engineer the experience = step index 3 */
export const EXIT_STEP_INDEX = 3;

export function getGrayscale(activeStepIndex: number, scrollProgress: number): number {
  if (activeStepIndex < EXIT_STEP_INDEX) return 1;
  if (activeStepIndex > EXIT_STEP_INDEX) return 0;
  return 1 - scrollProgress;
}

// Static class — grayscale is driven by the --grayscale CSS variable set via
// inline style below, not by a styled-components prop interpolation. That
// keeps every scroll-driven update to a plain style-attribute write instead
// of styled-components recomputing/injecting a new class each frame.
const Wrapper = styled.div`
  position: relative;
  width: 100%;
  max-width: 420px;
  aspect-ratio: 421 / 573;
  filter: grayscale(var(--grayscale, 1));
  transition: filter 0.4s ease-out;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    object-position: center;
    pointer-events: none;
  }
`;

export interface WhatIDoCharacterProps {
  activeStepIndex?: number;
  scrollProgress?: number;
}

export function WhatIDoCharacter({
  activeStepIndex = 0,
  scrollProgress = 0,
}: WhatIDoCharacterProps) {
  const grayscale = getGrayscale(activeStepIndex, scrollProgress);
  return (
    <Wrapper aria-hidden style={{ '--grayscale': grayscale } as CSSProperties}>
      <img src="/character/character_head.svg" alt="" />
    </Wrapper>
  );
}

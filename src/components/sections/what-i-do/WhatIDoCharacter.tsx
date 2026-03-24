'use client';

/* eslint-disable @next/next/no-img-element */
import styled from 'styled-components';

/** Engineer the experience = step index 3 */
export const EXIT_STEP_INDEX = 3;

export function getGrayscale(activeStepIndex: number, scrollProgress: number): number {
  if (activeStepIndex < EXIT_STEP_INDEX) return 1;
  if (activeStepIndex > EXIT_STEP_INDEX) return 0;
  return 1 - scrollProgress;
}

const Wrapper = styled.div<{ $grayscale: number }>`
  position: relative;
  width: 100%;
  max-width: 420px;
  aspect-ratio: 421 / 573;
  filter: grayscale(${(p) => p.$grayscale});
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
    <Wrapper aria-hidden $grayscale={grayscale}>
      <img src="/character/character_head.svg" alt="" loading="lazy" width={421} height={573} />
    </Wrapper>
  );
}

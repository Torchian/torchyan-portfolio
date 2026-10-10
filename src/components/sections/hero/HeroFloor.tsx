'use client';

import styled, { keyframes } from 'styled-components';
import { media } from '@/styles/media';
import { zIndex } from '@/styles/tokens/z-index';

/*
 * The homepage hero's ground: a wireframe floor, like the wireframe pair
 * standing at the screen's edges, running away to a horizon behind the name
 * and drifting slowly towards the viewer.
 *
 * The floor is one CSS grid laid flat in 3D (rotateX under a perspective), so
 * the browser draws the convergence; the drift is its background sliding by
 * one cell, over and over. Under reduced motion it stands still.
 */

const CELL = 80;
/** Where the horizon sits, down the section: between the description and the buttons. */
const HORIZON = '12%';

const drift = keyframes`
  to {
    background-position: 0 ${CELL}px, 0 0;
  }
`;

const Ground = styled.div`
  position: absolute;
  inset: 0;
  /* Under the side characters, in SideCharacters' own layer. */
  z-index: ${zIndex.behind};
  pointer-events: none;
`;

const Floor = styled.div`
  position: absolute;
  top: ${HORIZON};
  left: -50%;
  width: 200%;
  height: 46%;
  transform-origin: 50% 0;
  transform: perspective(520px) rotateX(72deg);
  background-image:
    linear-gradient(to bottom, rgba(12, 175, 10, 0.14) 1px, transparent 1px),
    linear-gradient(to right, rgba(12, 175, 10, 0.14) 1px, transparent 1px);
  background-size: ${CELL}px ${CELL}px;
  background-position:
    0 0,
    0 0;
  /* Gone at the horizon, strongest close up. */
  mask-image: linear-gradient(to bottom, transparent, #000 35%, #000 70%, transparent);
  animation: ${drift} 6s linear infinite;

  ${media.reducedMotion} {
    animation: none;
  }
`;

export function HeroFloor() {
  return (
    <Ground aria-hidden>
      <Floor />
    </Ground>
  );
}

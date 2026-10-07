'use client';

import styled, { keyframes } from 'styled-components';
import { media } from '@/styles/media';
import { zIndex } from '@/styles/tokens/z-index';

/*
 * The homepage hero's ground: a wireframe floor, like the wireframe pair
 * standing at the screen's edges, running away to a horizon behind the name
 * and drifting slowly towards the viewer. A hairline horizon, ticked like a
 * ruler, with a node where the centre line meets it.
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

const Horizon = styled.svg`
  position: absolute;
  top: 31%;
  left: 0;
  width: 100%;
  height: 24px;
  overflow: visible;
  transform: translateY(-50%);
  /* Strongest in the middle, gone at the page's sides. */
  mask-image: linear-gradient(to right, transparent, #000 30%, #000 70%, transparent);

  line {
    stroke: rgba(246, 246, 246, 0.22);
  }

  .tick {
    stroke: rgba(246, 246, 246, 0.16);
  }

  circle {
    fill: #0b0915;
    stroke: rgba(246, 246, 246, 0.4);
  }
`;

/** Ticks every 2% of the width, a longer one every 10%. */
const TICKS = Array.from({ length: 51 }, (_, i) => i * 2);

export function HeroFloor() {
  return (
    <Ground aria-hidden>
      <Floor />
      <Horizon>
        <line x1="0" x2="100%" y1="12" y2="12" />
        {TICKS.map((x) => (
          <line
            key={x}
            className="tick"
            x1={`${x}%`}
            x2={`${x}%`}
            y1={x % 10 === 0 ? 4 : 8}
            y2={x % 10 === 0 ? 20 : 16}
          />
        ))}
        <circle cx="50%" cy="12" r="5" />
      </Horizon>
    </Ground>
  );
}

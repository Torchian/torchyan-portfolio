'use client';

import styled, { keyframes } from 'styled-components';
import { accents } from '@/styles/tokens/colors';
import { media } from '@/styles/media';

/*
 * The Work hero's backdrop: a contact sheet. Rows of empty thumbnail frames,
 * the shape of the screens in the logo grid, spread out from behind it and
 * fading away; now and then one lights up green, as if picked. Print crop
 * marks stand at the logo's corners, as on a proof.
 *
 * Drawn in units of the logo box (the box this sits in is the logo), three
 * times its size so the sheet runs out well past it.
 */

const CELL = { width: 96, height: 60, gap: 16 } as const;
/** The logo box in the sheet's own units. */
const LOGO = 480;
const SPAN = LOGO * 3;

const pick = keyframes`
  0%, 70%, 100% {
    opacity: 0;
  }
  80%, 90% {
    opacity: 1;
  }
`;

const Sheet = styled.svg`
  position: absolute;
  z-index: -1;
  top: -100%;
  left: -100%;
  width: 300%;
  /* The global reset caps an svg at its container's width. */
  max-width: none;
  height: 300%;
  overflow: visible;
  pointer-events: none;
  /* Whole around the logo, gone well before the sheet's edge. */
  mask-image: radial-gradient(closest-side, #000 30%, transparent 95%);

  .frame {
    fill: none;
    stroke: rgba(246, 246, 246, 0.14);
  }

  .picked {
    fill: rgba(12, 175, 10, 0.08);
    stroke: ${accents.primary};
    opacity: 0;
    animation: ${pick} 9s ease-in-out infinite;
  }

  .crop {
    fill: none;
    stroke: rgba(246, 246, 246, 0.4);
  }

  ${media.reducedMotion} {
    .picked {
      animation: none;
    }
  }
`;

/** A steady pseudo-random pick, so the sheet is the same on every render. */
function picked(col: number, row: number) {
  return (col * 7 + row * 13) % 17 === 0;
}

const cells: { x: number; y: number; lit: boolean; delay: number }[] = [];
for (let row = 0; row * (CELL.height + CELL.gap) < SPAN; row++) {
  // Every other row shifts by half a frame, as a sheet laid by hand.
  const shift = row % 2 ? (CELL.width + CELL.gap) / 2 : 0;
  for (let col = -1; col * (CELL.width + CELL.gap) < SPAN; col++) {
    const x = col * (CELL.width + CELL.gap) + shift;
    const y = row * (CELL.height + CELL.gap);
    // Not behind the logo itself: the sheet surrounds it.
    const inLogo = x > LOGO - 40 && x < LOGO * 2 - 56 && y > LOGO - 40 && y < LOGO * 2 - 20;
    if (!inLogo) cells.push({ x, y, lit: picked(col + 2, row), delay: ((col * 5 + row * 3) % 9) * 1 });
  }
}

/** An L at each corner of the logo box, standing just off it, pointing out. */
const CROP = 28;
const OFF = 14;
const corners = [
  [LOGO, LOGO, -1, -1],
  [LOGO * 2, LOGO, 1, -1],
  [LOGO, LOGO * 2, -1, 1],
  [LOGO * 2, LOGO * 2, 1, 1],
] as const;

export function ContactSheet() {
  return (
    <Sheet viewBox={`0 0 ${SPAN} ${SPAN}`} aria-hidden>
      {cells.map((c) => (
        <g key={`${c.x}-${c.y}`}>
          <rect
            className="frame"
            x={c.x}
            y={c.y}
            width={CELL.width}
            height={CELL.height}
            rx={6}
            vectorEffect="non-scaling-stroke"
          />
          {c.lit && (
            <rect
              className="picked"
              x={c.x}
              y={c.y}
              width={CELL.width}
              height={CELL.height}
              rx={6}
              vectorEffect="non-scaling-stroke"
              style={{ animationDelay: `${c.delay}s` }}
            />
          )}
        </g>
      ))}
      {corners.map(([x, y, ox, oy]) => (
        <path
          key={`${x}-${y}`}
          className="crop"
          d={`M ${x + ox * OFF} ${y} H ${x + ox * (OFF + CROP)} M ${x} ${y + oy * OFF} V ${y + oy * (OFF + CROP)}`}
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </Sheet>
  );
}

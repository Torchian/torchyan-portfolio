'use client';

import styled, { keyframes } from 'styled-components';
import { accents } from '@/styles/tokens/colors';
import { fontFamily, fontWeight } from '@/styles/tokens/typography';
import { media } from '@/styles/media';

/*
 * The About hero's backdrop, for "from first sketch to production": the
 * construction drawing the character could have been drawn over. A head
 * circle with its centre line and eye line, the jaw's guide, two diagonals,
 * a compass arc for the shoulders, and a dimension line down the side with
 * its figure, all in hairline; they draw themselves in once, as a hand would.
 *
 * Drawn in the character's own square (it sits in CharacterStage, behind the
 * character), so it stays on the head at every size.
 */

const draw = keyframes`
  from {
    stroke-dashoffset: 1;
  }
  to {
    stroke-dashoffset: 0;
  }
`;

const Drawing = styled.svg`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  /* Kept to the character's square, so its long guides never widen the page. */
  overflow: hidden;

  .line {
    fill: none;
    stroke: rgba(246, 246, 246, 0.26);
    stroke-dasharray: 1;
    stroke-dashoffset: 1;
    animation: ${draw} 1.6s cubic-bezier(0.65, 0, 0.35, 1) forwards;
  }

  .guide {
    stroke: rgba(246, 246, 246, 0.14);
  }

  .accent {
    stroke: ${accents.primary};
    stroke-opacity: 0.6;
  }

  .label {
    font-family: ${fontFamily.heading};
    font-weight: ${fontWeight.semibold};
    font-size: 14px;
    letter-spacing: 1px;
    fill: rgba(246, 246, 246, 0.35);
  }

  ${media.reducedMotion} {
    .line {
      animation: none;
      stroke-dashoffset: 0;
    }
  }
`;

/** The head, in the character's 1000 square. */
const HEAD = { x: 500, y: 300, r: 190 } as const;

/** Each stroke, with when it starts drawing. */
const STROKES: { d: string; className?: string; delay: number }[] = [
  // The head circle.
  {
    d: `M ${HEAD.x} ${HEAD.y - HEAD.r} a ${HEAD.r} ${HEAD.r} 0 1 1 0 ${2 * HEAD.r} a ${HEAD.r} ${HEAD.r} 0 1 1 0 ${-2 * HEAD.r}`,
    delay: 0,
  },
  // Centre line, well past the head both ways.
  { d: `M ${HEAD.x} ${HEAD.y - HEAD.r - 120} V ${HEAD.y + HEAD.r + 260}`, className: 'guide', delay: 0.3 },
  // Eye line.
  { d: `M ${HEAD.x - HEAD.r - 220} ${HEAD.y + 30} H ${HEAD.x + HEAD.r + 220}`, className: 'guide', delay: 0.45 },
  // The jaw's guide, under the circle.
  {
    d: `M ${HEAD.x - HEAD.r * 0.78} ${HEAD.y + HEAD.r * 0.6} L ${HEAD.x} ${HEAD.y + HEAD.r * 1.45} L ${HEAD.x + HEAD.r * 0.78} ${HEAD.y + HEAD.r * 0.6}`,
    delay: 0.6,
  },
  // Diagonals through the head's centre.
  { d: `M ${HEAD.x - 330} ${HEAD.y - 330} L ${HEAD.x + 330} ${HEAD.y + 330}`, className: 'guide', delay: 0.75 },
  { d: `M ${HEAD.x + 330} ${HEAD.y - 330} L ${HEAD.x - 330} ${HEAD.y + 330}`, className: 'guide', delay: 0.85 },
  // The shoulders' compass arc.
  { d: `M ${HEAD.x - 420} ${HEAD.y + 520} A 520 520 0 0 1 ${HEAD.x + 420} ${HEAD.y + 520}`, delay: 1 },
  // Dimension line down the right, with its end bars, over the head's height.
  {
    d: `M ${HEAD.x + HEAD.r + 90} ${HEAD.y - HEAD.r} V ${HEAD.y + HEAD.r} M ${HEAD.x + HEAD.r + 78} ${HEAD.y - HEAD.r} H ${HEAD.x + HEAD.r + 102} M ${HEAD.x + HEAD.r + 78} ${HEAD.y + HEAD.r} H ${HEAD.x + HEAD.r + 102}`,
    className: 'accent',
    delay: 1.2,
  },
];

export function AboutSketch() {
  return (
    <Drawing viewBox="0 0 1000 1000" aria-hidden>
      {STROKES.map((s, i) => (
        <path
          key={i}
          className={`line ${s.className ?? ''}`}
          d={s.d}
          pathLength={1}
          vectorEffect="non-scaling-stroke"
          style={{ animationDelay: `${s.delay}s` }}
        />
      ))}
      <text className="label" x={HEAD.x + HEAD.r + 112} y={HEAD.y} dominantBaseline="central">
        1:1
      </text>
    </Drawing>
  );
}

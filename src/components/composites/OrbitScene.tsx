'use client';

import { useId } from 'react';
import styled, { keyframes } from 'styled-components';
import { fontFamily, fontWeight } from '@/styles/tokens/typography';
import { accents, neutrals } from '@/styles/tokens/colors';
import { media } from '@/styles/media';

/*
 * The scene the site sets its centrepieces in: a soft glow, three orbits (dots
 * travelling round two of them), and hairline axes running out towards the
 * page's edges, ticked like a ruler, each with a node where it meets the first
 * orbit. First drawn for the Services specialists circle, then set behind the
 * heroes.
 *
 * Drawn in units of a 1024 circle, centred on whatever box it sits in (that
 * box is the circle), three times its size so it can run out well past it.
 * Strokes stay 1px at any size. By default it fades out all round; a section
 * can give it its own mask instead.
 */

const SIZE = 1024;
const R = SIZE / 2;
const DURATION = 600;
const EASE = 'cubic-bezier(0.65, 0, 0.35, 1)';

const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

const Scene = styled.div`
  position: absolute;
  top: -100%;
  left: -100%;
  width: 300%;
  aspect-ratio: 1;
  pointer-events: none;
  /* Whole across the circle and its orbits, gone before the box's edge. */
  mask-image: radial-gradient(closest-side, #000 55%, transparent 100%);

  /* The glow: the circle plus 45% of it all round. A green one comes up with a lit axis. */
  &::before,
  &::after {
    content: '';
    position: absolute;
    inset: ${((1 - 0.45) / 3) * 100}%;
    border-radius: 50%;
    transition: opacity ${DURATION}ms ${EASE};
  }

  &::before {
    background: radial-gradient(closest-side, rgba(43, 36, 92, 0.55), rgba(31, 26, 56, 0.25) 55%, transparent);
  }

  &::after {
    background: radial-gradient(closest-side, rgba(12, 175, 10, 0.16), rgba(12, 175, 10, 0.05) 50%, transparent 75%);
    opacity: 0;
  }

  &[data-glow='false']::before {
    display: none;
  }

  &[data-on='true']::after {
    opacity: 1;
  }

  svg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    overflow: visible;
  }

  .orbit {
    fill: none;
    stroke: rgba(246, 246, 246, 0.09);
  }

  .orbit-dashed {
    stroke-dasharray: 2 10;
    stroke: rgba(246, 246, 246, 0.14);
  }

  .orbit-far {
    stroke: rgba(246, 246, 246, 0.05);
  }

  .traveller {
    transform-origin: 0 0;
    animation: ${spin} 60s linear infinite;
  }

  .traveller circle {
    fill: ${accents.primary};
  }

  .axis {
    transition: opacity ${DURATION}ms ${EASE};
  }

  .axis-lit {
    opacity: 0;
  }

  .ticks {
    stroke: rgba(246, 246, 246, 0.12);
  }

  .node {
    fill: ${neutrals[900]};
    stroke: rgba(246, 246, 246, 0.35);
    transition:
      fill ${DURATION}ms ${EASE},
      stroke ${DURATION}ms ${EASE};
  }

  .index {
    font-family: ${fontFamily.heading};
    font-weight: ${fontWeight.semibold};
    font-size: 16px;
    letter-spacing: 1px;
    fill: rgba(246, 246, 246, 0.35);
    transition: fill ${DURATION}ms ${EASE};
  }

  [data-on='true'] {
    .axis-lit {
      opacity: 1;
    }

    .node {
      fill: ${accents.primary};
      stroke: ${accents.primary};
    }

    .index {
      fill: ${accents.primary};
    }
  }

  ${media.reducedMotion} {
    .traveller {
      animation: none;
    }

    &::after,
    .axis,
    .node,
    .index {
      transition: none;
    }
  }
`;

/**
 * The box the scene is centred on and scaled to: place it over the
 * centrepiece. It sits behind the section's content (the section isolates it),
 * and takes no pointer.
 */
export const OrbitAnchor = styled.div`
  position: absolute;
  z-index: -1;
  aspect-ratio: 1;
  transform: translate(-50%, -50%);
  pointer-events: none;
`;

/** Ruler ticks along one axis, from just outside the orbits outwards. */
function ticks(from: number, to: number) {
  const marks: string[] = [];
  for (let d = from; d <= to; d += 48) {
    const long = (d - from) % 192 === 0;
    marks.push(`M ${d} ${long ? -8 : -4} V ${long ? 8 : 4}`);
  }
  return marks.join(' ');
}

export interface OrbitSceneProps {
  /** Where the axes run, in degrees clockwise from the top. */
  axes?: readonly number[];
  /** Shown beside each axis's node, in the axes' order. */
  labels?: readonly string[];
  /** The axis to light up green, by index; the green glow comes up with it. */
  active?: number | null;
  /** The ambient purple glow. Off where the section has a glow of its own. */
  glow?: boolean;
  className?: string;
}

export function OrbitScene({
  axes = [0, 90, 180, 270],
  labels,
  active = null,
  glow = true,
  className,
}: OrbitSceneProps) {
  // Each scene's gradients get their own ids: several scenes share a page.
  const id = useId().replace(/:/g, '');
  const fade = `orbit-fade-${id}`;
  const lit = `orbit-lit-${id}`;

  return (
    <Scene className={className} data-on={active !== null} data-glow={glow} aria-hidden>
      <svg viewBox={`${-3 * R} ${-3 * R} ${3 * SIZE} ${3 * SIZE}`}>
        <defs>
          <linearGradient id={fade} gradientUnits="userSpaceOnUse" x1={R + 144} x2={R * 3} y1="0" y2="0">
            <stop offset="0" stopColor="#f6f6f6" stopOpacity="0.22" />
            <stop offset="1" stopColor="#f6f6f6" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={lit} gradientUnits="userSpaceOnUse" x1={R + 144} x2={R * 2.2} y1="0" y2="0">
            <stop offset="0" stopColor={accents.primary} stopOpacity="0.9" />
            <stop offset="1" stopColor={accents.primary} stopOpacity="0" />
          </linearGradient>
        </defs>

        <circle className="orbit" r={R + 72} vectorEffect="non-scaling-stroke" />
        <circle className="orbit orbit-dashed" r={R + 176} vectorEffect="non-scaling-stroke" />
        <circle className="orbit orbit-far" r={R + 320} vectorEffect="non-scaling-stroke" />
        <g className="traveller">
          <circle cx={R + 176} cy={0} r={4} />
        </g>
        <g className="traveller" style={{ animationDuration: '90s', animationDirection: 'reverse' }}>
          <circle cx={0} cy={R + 320} r={3} opacity={0.6} />
        </g>

        {axes.map((angle, i) => (
          // Each axis is drawn pointing right, then turned into place.
          <g key={angle} transform={`rotate(${angle - 90})`} data-on={active === i}>
            <path
              className="axis"
              d={`M ${R + 144} 0 H ${R * 3}`}
              stroke={`url(#${fade})`}
              vectorEffect="non-scaling-stroke"
            />
            <path
              className="axis axis-lit"
              d={`M ${R + 144} 0 H ${R * 2.2}`}
              stroke={`url(#${lit})`}
              vectorEffect="non-scaling-stroke"
            />
            <path className="ticks" d={ticks(R + 176 + 48, R * 3)} vectorEffect="non-scaling-stroke" />
            <circle className="node" cx={R + 72} cy={0} r={6} vectorEffect="non-scaling-stroke" />
            {labels?.[i] && (
              // Beside its node, upright wherever the axis points.
              <text
                className="index"
                x={R + 118}
                y={0}
                transform={`rotate(${90 - angle} ${R + 118} 0)`}
                textAnchor="middle"
                dominantBaseline="central"
              >
                {labels[i]}
              </text>
            )}
          </g>
        ))}
      </svg>
    </Scene>
  );
}

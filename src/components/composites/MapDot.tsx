'use client';

import styled, { keyframes } from 'styled-components';
import { accents } from '@/styles/tokens/colors';

const heartbeat = keyframes`
  0%, 100% { transform: translate(-50%, -50%) scale(1); }
  14% { transform: translate(-50%, -50%) scale(1.25); }
  28% { transform: translate(-50%, -50%) scale(0.8); }
  42% { transform: translate(-50%, -50%) scale(1.15); }
  56% { transform: translate(-50%, -50%) scale(1); }
`;

export interface MapDotProps {
  x: number;
  y: number;
  title?: string;
  /** Animation delay in seconds */
  delay?: number;
  /** Animation duration in seconds */
  duration?: number;
  /** The dot's colour; the home point is the secondary pink. */
  color?: string;
}

/**
 * Every length here is a design pixel of the 1200px map the dots were drawn on,
 * scaled by how wide the map actually is (--map-scale, written by WorldMapSVG).
 *
 * They were fixed pixels, and the spacing between two places is a fraction of
 * the map, so the two drifted apart as the map shrank. Berlin and Switzerland
 * sit 1.75% of the map from each other: 22px apart on a 1200px map, against a
 * 14px core — clear. On a 390px phone the map is 342px, so the same pair is 6px
 * apart while the core stayed 14px, and the two ran into each other every time
 * they beat. Scaled, the core is 1.17% of the map wherever it is drawn, so the
 * gap stays wider than the dot at every size.
 */
const unit = (px: number) => `calc(${px}px * var(--map-scale, 1))`;

const DotInner = styled.span<{ $color: string }>`
  position: absolute;
  inset: 0;
  pointer-events: none;

  &::before {
    content: '';
    position: absolute;
    left: 50%;
    top: 50%;
    width: ${unit(32)};
    height: ${unit(32)};
    border-radius: 50%;
    background: ${(p) => p.$color};
    opacity: 0.1;
    transform: translate(-50%, -50%);
  }
`;

const Dot = styled.div<{ $x: number; $y: number; $delay: number; $duration: number; $color: string }>`
  position: absolute;
  left: ${(p) => p.$x}%;
  top: ${(p) => p.$y}%;
  width: ${unit(8)};
  height: ${unit(8)};
  transform: translate(-50%, -50%);
  animation: ${heartbeat} ${(p) => p.$duration}s ease-in-out infinite;
  animation-delay: ${(p) => p.$delay}s;

  &::before {
    content: '';
    position: absolute;
    left: 50%;
    top: 50%;
    width: ${unit(24)};
    height: ${unit(24)};
    border-radius: 50%;
    background: ${(p) => p.$color};
    opacity: 0.3;
    transform: translate(-50%, -50%);
  }

  &::after {
    content: '';
    position: absolute;
    left: 50%;
    top: 50%;
    width: ${unit(14)};
    height: ${unit(14)};
    border-radius: 50%;
    background: ${(p) => p.$color};
    box-shadow:
      0 0 ${unit(12)} ${(p) => p.$color},
      0 0 ${unit(24)} color-mix(in srgb, ${(p) => p.$color} 40%, transparent);
    transform: translate(-50%, -50%);
  }
`;

export function MapDot({ x, y, title, delay = 0, duration = 1.5, color = accents.primary }: MapDotProps) {
  return (
    <Dot $x={x} $y={y} $delay={delay} $duration={duration} $color={color} title={title} aria-hidden>
      <DotInner $color={color} />
    </Dot>
  );
}

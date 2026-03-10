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
}

const DotInner = styled.span`
  position: absolute;
  inset: 0;
  pointer-events: none;

  &::before {
    content: '';
    position: absolute;
    left: 50%;
    top: 50%;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: ${accents.primary};
    opacity: 0.1;
    transform: translate(-50%, -50%);
  }
`;

const Dot = styled.div<{ $x: number; $y: number; $delay: number; $duration: number }>`
  position: absolute;
  left: ${(p) => p.$x}%;
  top: ${(p) => p.$y}%;
  width: 8px;
  height: 8px;
  transform: translate(-50%, -50%);
  animation: ${heartbeat} ${(p) => p.$duration}s ease-in-out infinite;
  animation-delay: ${(p) => p.$delay}s;

  &::before {
    content: '';
    position: absolute;
    left: 50%;
    top: 50%;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: ${accents.primary};
    opacity: 0.3;
    transform: translate(-50%, -50%);
  }

  &::after {
    content: '';
    position: absolute;
    left: 50%;
    top: 50%;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: ${accents.primary};
    box-shadow: 0 0 12px ${accents.primary}, 0 0 24px rgba(12, 175, 10, 0.4);
    transform: translate(-50%, -50%);
  }
`;

export function MapDot({ x, y, title, delay = 0, duration = 1.5 }: MapDotProps) {
  return (
    <Dot $x={x} $y={y} $delay={delay} $duration={duration} title={title} aria-hidden>
      <DotInner />
    </Dot>
  );
}

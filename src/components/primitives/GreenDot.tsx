'use client';

import styled, { css, keyframes } from 'styled-components';
import { accents } from '@/styles/tokens/colors';

const pulse = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.4); }
`;

type DotSize = 'sm' | 'md' | 'lg';

const sizes: Record<DotSize, number> = {
  sm: 6,
  md: 8,
  lg: 12,
};

export interface GreenDotProps {
  $size?: DotSize;
  $pulse?: boolean;
}

export const GreenDot = styled.span<GreenDotProps>`
  display: inline-block;
  width: ${(p) => sizes[p.$size ?? 'md']}px;
  height: ${(p) => sizes[p.$size ?? 'md']}px;
  border-radius: 50%;
  background: ${accents.primary};
  flex-shrink: 0;

  ${(p) =>
    p.$pulse &&
    css`
      animation: ${pulse} 2s ease-in-out infinite;
    `}
`;

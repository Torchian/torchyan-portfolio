'use client';

import styled from 'styled-components';
import { spacing } from '@/styles/tokens/spacing';
import { accents, neutrals } from '@/styles/tokens/colors';

const Wrapper = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${spacing[75]}px;
`;

interface DotProps {
  $filled: boolean;
}

const Dot = styled.span<DotProps>`
  width: ${spacing[100]}px;
  height: ${spacing[100]}px;
  border-radius: 50%;
  background: ${(p) => (p.$filled ? accents.primary : neutrals[800])};
`;

export interface RatingDotsProps {
  total?: number;
  filled: number;
}

export function RatingDots({ total = 7, filled }: RatingDotsProps) {
  return (
    <Wrapper>
      {Array.from({ length: total }, (_, i) => (
        <Dot key={i} $filled={i < filled} />
      ))}
    </Wrapper>
  );
}

'use client';

import styled from 'styled-components';
import { Text, GreenDot } from '@/components/primitives';
import { spacing } from '@/styles/tokens/spacing';

const Wrapper = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${spacing[100]}px;
`;

export interface YearMarkerProps {
  year: number | string;
}

export function YearMarker({ year }: YearMarkerProps) {
  return (
    <Wrapper>
      <GreenDot $size="sm" />
      <Text $scale="body" $size="m" $weight="semibold" $color="var(--color-accent-primary)">
        {year}
      </Text>
    </Wrapper>
  );
}

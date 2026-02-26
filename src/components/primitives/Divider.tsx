'use client';

import styled from 'styled-components';
import { border } from '@/styles/tokens/border';
import { spacing, type SpacingKey } from '@/styles/tokens/spacing';

export interface DividerProps {
  $color?: string;
  $spacing?: SpacingKey;
}

export const Divider = styled.hr<DividerProps>`
  border: none;
  height: ${border.thin}px;
  background: ${(p) => p.$color ?? 'var(--color-border-primary)'};
  width: 100%;
  margin: ${(p) => (p.$spacing != null ? `${spacing[p.$spacing]}px 0` : '0')};
`;

'use client';

import styled, { css } from 'styled-components';
import { spacing, type SpacingKey } from '@/styles/tokens/spacing';

export interface StackProps {
  $direction?: 'row' | 'column';
  $gap?: SpacingKey;
  $align?: 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline';
  $justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
  $wrap?: boolean;
}

export const Stack = styled.div<StackProps>`
  display: flex;
  flex-direction: ${(p) => p.$direction ?? 'column'};
  gap: ${(p) => spacing[p.$gap ?? 200]}px;
  align-items: ${(p) => p.$align ?? 'stretch'};
  justify-content: ${(p) => p.$justify ?? 'flex-start'};
  ${(p) => p.$wrap && css`flex-wrap: wrap;`}
`;

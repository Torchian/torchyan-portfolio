'use client';

import styled from 'styled-components';
import { grid } from '@/styles/tokens/grid';
import { spacing } from '@/styles/tokens/spacing';
import { media } from '@/styles/media';

export interface ContainerProps {
  $fluid?: boolean;
  $padding?: boolean;
}

export const Container = styled.div<ContainerProps>`
  width: 100%;
  max-width: ${(p) => (p.$fluid ? '100%' : `${grid.maxWidth}px`)};
  margin-left: auto;
  margin-right: auto;
  padding-left: ${(p) => (p.$padding !== false ? `${spacing[400]}px` : '0')};
  padding-right: ${(p) => (p.$padding !== false ? `${spacing[400]}px` : '0')};

  ${media.down('m')} {
    padding-left: ${(p) => (p.$padding !== false ? `${spacing[300]}px` : '0')};
    padding-right: ${(p) => (p.$padding !== false ? `${spacing[300]}px` : '0')};
  }
`;

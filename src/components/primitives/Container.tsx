'use client';

import styled from 'styled-components';
import { grid } from '@/styles/tokens/grid';

export interface ContainerProps {
  $fluid?: boolean;
  $padding?: boolean;
}

export const Container = styled.div<ContainerProps>`
  width: 100%;
  max-width: ${(p) => (p.$fluid ? '100%' : `${grid.maxWidth}px`)};
  margin-left: auto;
  margin-right: auto;
  padding-left: ${(p) => (p.$padding !== false ? `${grid.margin}px` : '0')};
  padding-right: ${(p) => (p.$padding !== false ? `${grid.margin}px` : '0')};
`;

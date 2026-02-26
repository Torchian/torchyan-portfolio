'use client';

import styled, { css } from 'styled-components';
import { spacing } from '@/styles/tokens/spacing';
import { border } from '@/styles/tokens/border';
import { duration, easing } from '@/styles/tokens/motion';

export interface NavIconProps {
  $active?: boolean;
}

export const NavIcon = styled.button<NavIconProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${spacing[500]}px;
  height: ${spacing[500]}px;
  border-radius: 50%;
  border: ${border.medium}px solid var(--color-border-primary);
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all ${duration.fast} ${easing.out};
  flex-shrink: 0;

  svg {
    width: ${spacing[250] - 2}px;
    height: ${spacing[250] - 2}px;
  }

  ${(p) =>
    p.$active &&
    css`
      border-color: var(--color-accent-primary);
      color: var(--color-accent-primary);
    `}

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      border-color: var(--color-accent-primary);
      color: var(--color-accent-primary);
    }
  }

  &:focus-visible {
    outline: ${border.thick}px solid var(--color-border-focus);
    outline-offset: ${spacing[25]}px;
  }
`;

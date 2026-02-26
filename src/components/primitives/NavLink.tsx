'use client';

import styled, { css } from 'styled-components';
import { fontSize, lineHeight, fontWeight } from '@/styles/tokens/typography';
import { duration, easing } from '@/styles/tokens/motion';

export interface NavLinkProps {
  $active?: boolean;
}

export const NavLink = styled.a<NavLinkProps>`
  font-size: ${fontSize.body.m}px;
  line-height: ${lineHeight.body.m}px;
  font-weight: ${fontWeight.medium};
  color: var(--color-text-secondary);
  text-decoration: none;
  cursor: pointer;
  transition: color ${duration.fast} ${easing.out};
  white-space: nowrap;

  ${(p) =>
    p.$active &&
    css`
      color: var(--color-accent-primary);
    `}

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      color: var(--color-text-primary);
    }
  }
`;

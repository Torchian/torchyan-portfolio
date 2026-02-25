'use client';

import styled, { css } from 'styled-components';
import { fontWeight } from '@/styles/tokens/typography';
import { spacing } from '@/styles/tokens/spacing';
import { radius } from '@/styles/tokens/radius';
import { duration, easing } from '@/styles/tokens/motion';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  $variant?: ButtonVariant;
  $size?: ButtonSize;
  $fullWidth?: boolean;
}

const sizeStyles = {
  sm: css`
    height: 32px;
    padding: 0 ${spacing[150]}px;
    font-size: 14px;
  `,
  md: css`
    height: 40px;
    padding: 0 ${spacing[200]}px;
    font-size: 16px;
  `,
  lg: css`
    height: 48px;
    padding: 0 ${spacing[300]}px;
    font-size: 18px;
  `,
};

const variantStyles = {
  primary: css`
    background: var(--color-accent-primary);
    color: var(--color-text-inverse);

    ${`@media (hover: hover) and (pointer: fine)`} {
      &:hover:not(:disabled) {
        background: var(--color-accent-primaryHover);
      }
    }
  `,
  secondary: css`
    background: transparent;
    color: var(--color-text-primary);
    border: 1px solid var(--color-border-primary);

    ${`@media (hover: hover) and (pointer: fine)`} {
      &:hover:not(:disabled) {
        background: var(--color-bg-tertiary);
        border-color: var(--color-border-secondary);
      }
    }
  `,
  ghost: css`
    background: transparent;
    color: var(--color-text-primary);

    ${`@media (hover: hover) and (pointer: fine)`} {
      &:hover:not(:disabled) {
        background: var(--color-bg-tertiary);
      }
    }
  `,
};

export const Button = styled.button<ButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${spacing[100]}px;
  border: none;
  border-radius: ${radius.m}px;
  font-weight: ${fontWeight.medium};
  cursor: pointer;
  transition: all ${duration.fast} ${easing.out};
  white-space: nowrap;
  user-select: none;

  ${(p) => sizeStyles[p.$size ?? 'md']}
  ${(p) => variantStyles[p.$variant ?? 'primary']}
  ${(p) => p.$fullWidth && css`width: 100%;`}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid var(--color-border-focus);
    outline-offset: 2px;
  }
`;

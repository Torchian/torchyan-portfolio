'use client';

import styled, { css } from 'styled-components';
import { fontFamily, fontWeight, fontSize, lineHeight, letterSpacing } from '@/styles/tokens/typography';
import { spacing } from '@/styles/tokens/spacing';
import { radius } from '@/styles/tokens/radius';
import { neutrals, accents } from '@/styles/tokens/colors';

// Figma: Badge atom (3011:8816) — 3 sizes × 3 color variants.
export type BadgeSize = 'small' | 'medium' | 'large';
export type BadgeVariant = 'light' | 'primary' | 'secondary';

const sizeStyles: Record<BadgeSize, ReturnType<typeof css>> = {
  small: css`
    height: 22px;
    padding: ${spacing[50]}px ${spacing[150]}px;
    font-size: ${fontSize.body.m}px;
    line-height: ${lineHeight.body.m}px;
    letter-spacing: ${letterSpacing.s}px;
  `,
  medium: css`
    height: 24px;
    padding: ${spacing[50]}px ${spacing[200]}px;
    font-size: ${fontSize.body.l}px;
    line-height: ${lineHeight.body.l}px;
    letter-spacing: ${letterSpacing.m}px;
  `,
  large: css`
    height: 28px;
    padding: ${spacing[50]}px ${spacing[250]}px;
    font-size: ${fontSize.body.xl}px;
    line-height: ${lineHeight.body.xl}px;
    letter-spacing: ${letterSpacing.s}px;
  `,
};

// Note: the "primary" (green) variant uses dark text, not white — that's
// the actual Figma spec, not an oversight.
const variantStyles: Record<BadgeVariant, ReturnType<typeof css>> = {
  light: css`
    background: ${neutrals[100]};
    color: ${neutrals[900]};
  `,
  primary: css`
    background: ${accents.primary};
    color: ${neutrals[900]};
  `,
  secondary: css`
    background: ${accents.secondary};
    color: ${neutrals[100]};
  `,
};

const StyledBadge = styled.span<{ $size: BadgeSize; $variant: BadgeVariant }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: ${radius.xl}px;
  font-family: ${fontFamily.heading};
  font-weight: ${fontWeight.semibold};
  white-space: nowrap;
  ${(p) => sizeStyles[p.$size]}
  ${(p) => variantStyles[p.$variant]}
`;

export interface BadgeProps {
  children: React.ReactNode;
  $size?: BadgeSize;
  $variant?: BadgeVariant;
  className?: string;
}

export function Badge({ children, $size = 'small', $variant = 'light', className }: BadgeProps) {
  return (
    <StyledBadge $size={$size} $variant={$variant} className={className}>
      {children}
    </StyledBadge>
  );
}

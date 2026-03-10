'use client';

import styled from 'styled-components';
import { Display, Text } from '@/components/primitives';
import { spacing } from '@/styles/tokens/spacing';
import { fontSize, lineHeight, fontWeight, letterSpacing } from '@/styles/tokens/typography';
import { media } from '@/styles/media';

export interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  $align?: 'center' | 'left';
  className?: string;
}

const Wrapper = styled.div<{ $align?: 'center' | 'left' }>`
  display: flex;
  flex-direction: column;
  align-items: ${(p) => (p.$align === 'left' ? 'flex-start' : 'center')};
  gap: ${spacing[200]}px;
  text-align: ${(p) => p.$align ?? 'center'};
`;

const Title = styled(Display)`
  /* Mobile: 58px, 600, title case */
  font-size: ${fontSize.display.s}px;
  line-height: ${lineHeight.display.s}px;
  font-weight: ${fontWeight.semibold};
  text-transform: capitalize;

  /* Tablet: 72px, 700, title case */
  ${media.up('m')} {
    font-size: ${fontSize.display.m}px;
    line-height: ${lineHeight.display.m}px;
    font-weight: ${fontWeight.heading};
  }

  /* Desktop: 96px, 900, uppercase */
  ${media.up('l')} {
    font-size: ${fontSize.display.xl}px;
    line-height: ${lineHeight.display.xl}px;
    font-weight: ${fontWeight.black};
    text-transform: uppercase;
    letter-spacing: ${letterSpacing.xxs}px;
  }
`;

const Subtitle = styled(Text).attrs({
  as: 'p',
  $scale: 'heading' as const,
  $size: 's',
  $weight: 'semibold' as const,
  $color: 'var(--color-text-secondary)',
})``;

export function SectionHeading({ title, subtitle, $align, className }: SectionHeadingProps) {
  return (
    <Wrapper $align={$align} className={className}>
      <Title $size="xl">{title}</Title>
      {subtitle && <Subtitle>{subtitle}</Subtitle>}
    </Wrapper>
  );
}

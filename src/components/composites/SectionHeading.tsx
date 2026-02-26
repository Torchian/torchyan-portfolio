'use client';

import styled from 'styled-components';
import { Display, Text } from '@/components/primitives';
import { spacing } from '@/styles/tokens/spacing';
import { letterSpacing } from '@/styles/tokens/typography';

export interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  $align?: 'center' | 'left';
}

const Wrapper = styled.div<{ $align?: 'center' | 'left' }>`
  display: flex;
  flex-direction: column;
  align-items: ${(p) => (p.$align === 'left' ? 'flex-start' : 'center')};
  gap: ${spacing[200]}px;
  text-align: ${(p) => p.$align ?? 'center'};
`;

const Title = styled(Display)`
  text-transform: uppercase;
  letter-spacing: ${letterSpacing.xxs}px;
`;

const Subtitle = styled(Text).attrs({
  as: 'p',
  $scale: 'heading' as const,
  $size: 's',
  $weight: 'semibold' as const,
  $color: 'var(--color-text-secondary)',
})``;

export function SectionHeading({ title, subtitle, $align }: SectionHeadingProps) {
  return (
    <Wrapper $align={$align}>
      <Title $size="xl">{title}</Title>
      {subtitle && <Subtitle>{subtitle}</Subtitle>}
    </Wrapper>
  );
}

'use client';

import styled from 'styled-components';
import { Display, Text } from '@/components/primitives';
import { spacing } from '@/styles/tokens/spacing';
import { letterSpacing } from '@/styles/tokens/typography';

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacing[200]}px;
  text-align: center;
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

export function SectionHeading({ title, subtitle }: SectionHeadingProps) {
  return (
    <Wrapper>
      <Title $size="xl">{title}</Title>
      {subtitle && <Subtitle>{subtitle}</Subtitle>}
    </Wrapper>
  );
}

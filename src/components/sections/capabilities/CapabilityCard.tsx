'use client';

import styled, { css } from 'styled-components';
import { Heading, Text } from '@/components/primitives';
import { spacing } from '@/styles/tokens/spacing';
import { radius } from '@/styles/tokens/radius';
import { border } from '@/styles/tokens/border';
import { accents, neutrals, elevation } from '@/styles/tokens/colors';
import { duration, easing } from '@/styles/tokens/motion';

type CardVariant = 'dark' | 'accent';

export interface CapabilityCardProps {
  title: string;
  description: string;
  $variant?: CardVariant;
}

const Card = styled.article<{ $variant: CardVariant }>`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: ${spacing[200]}px;
  padding: ${spacing[400]}px;
  border-radius: ${radius.xl}px;
  overflow: hidden;
  min-height: 320px;
  transition: transform ${duration.normal} ${easing.out},
    box-shadow ${duration.normal} ${easing.out};

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      transform: translateY(-4px);
      box-shadow: ${elevation.medium};
    }
  }

  ${(p) =>
    p.$variant === 'accent'
      ? css`
          background: ${accents.primary};
          color: ${neutrals[900]};
        `
      : css`
          background: var(--color-bg-secondary);
          border: ${border.medium}px solid var(--color-border-primary);
          color: var(--color-text-primary);
        `}
`;

const CircleAccent = styled.div<{ $variant: CardVariant }>`
  position: absolute;
  top: -40px;
  right: -40px;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  opacity: 0.15;

  ${(p) =>
    p.$variant === 'accent'
      ? css`
          background: ${neutrals[900]};
        `
      : css`
          background: ${accents.primary};
        `}
`;

const Title = styled(Heading)<{ $variant: CardVariant }>`
  position: relative;
  z-index: 1;
  color: ${(p) => (p.$variant === 'accent' ? neutrals[900] : 'var(--color-accent-primary)')};
`;

const Description = styled(Text)<{ $variant: CardVariant }>`
  position: relative;
  z-index: 1;
  color: ${(p) => (p.$variant === 'accent' ? neutrals[900] : 'var(--color-text-secondary)')};
`;

export function CapabilityCard({
  title,
  description,
  $variant = 'dark',
}: CapabilityCardProps) {
  return (
    <Card $variant={$variant}>
      <CircleAccent $variant={$variant} />
      <Title $variant={$variant} $size="m">
        {title}
      </Title>
      <Description $variant={$variant} $scale="body" $size="l">
        {description}
      </Description>
    </Card>
  );
}

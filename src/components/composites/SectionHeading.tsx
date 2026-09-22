'use client';

import styled, { css } from 'styled-components';
import { Display, Text } from '@/components/primitives';
import { spacing } from '@/styles/tokens/spacing';
import { fontFamily, fontSize, lineHeight, fontWeight, letterSpacing } from '@/styles/tokens/typography';
import { media } from '@/styles/media';

/**
 * Figma Section Heading (2647:3287 desktop, 2647:3292 tablet, 2647:3295 mobile):
 *  - Desktop (from 1025px): large is Black 96 uppercase, medium is Bold 72 as typed; subtitle 24.
 *  - Tablet (481–1024px): Bold 72 as typed; subtitle 24.
 *  - Mobile (up to 480px): SemiBold 36; subtitle 18.
 */
export type SectionHeadingSize = 'large' | 'medium';

export interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  size?: SectionHeadingSize;
  $align?: 'center' | 'left';
  /** Id for the title, so a section can be labelled by it. */
  id?: string;
  className?: string;
}

const Wrapper = styled.div<{ $align?: 'center' | 'left' }>`
  display: flex;
  flex-direction: column;
  align-items: ${(p) => (p.$align === 'left' ? 'flex-start' : 'center')};
  gap: ${spacing[200]}px;
  width: 100%;
  text-align: ${(p) => p.$align ?? 'center'};
`;

const Title = styled(Display)<{ $heading: SectionHeadingSize }>`
  /* A title that wraps onto two lines keeps the heading's alignment. */
  text-align: inherit;
  font-family: ${fontFamily.heading};
  font-size: ${fontSize.heading.l}px;
  line-height: ${lineHeight.heading.l}px;
  font-weight: ${fontWeight.semibold};
  letter-spacing: ${letterSpacing.xs}px;

  ${media.up('m')} {
    font-family: ${fontFamily.display};
    font-size: ${fontSize.display.m}px;
    line-height: ${lineHeight.display.m}px;
    font-weight: ${fontWeight.heading};
  }

  ${media.up('xl')} {
    ${(p) =>
      p.$heading === 'large' &&
      css`
        font-size: ${fontSize.display.xl}px;
        line-height: ${lineHeight.display.xl}px;
        font-weight: ${fontWeight.black};
        text-transform: uppercase;
        letter-spacing: ${letterSpacing.xxs}px;
      `}
  }
`;

const Subtitle = styled(Text).attrs({
  as: 'p',
  $scale: 'heading' as const,
  $size: 's',
  $weight: 'semibold' as const,
  $color: 'var(--color-text-secondary)',
})`
  text-align: inherit;

  ${media.down('m')} {
    font-size: ${fontSize.body.xl}px;
    line-height: ${lineHeight.body.xl}px;
    letter-spacing: ${letterSpacing.s}px;
  }
`;

export function SectionHeading({ title, subtitle, size = 'large', $align, id, className }: SectionHeadingProps) {
  return (
    <Wrapper $align={$align} className={className}>
      <Title as="h2" id={id} $size="xl" $heading={size}>
        {title}
      </Title>
      {subtitle && <Subtitle>{subtitle}</Subtitle>}
    </Wrapper>
  );
}

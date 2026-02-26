'use client';

import styled from 'styled-components';
import { Text } from '@/components/primitives';
import { Ticker } from '@/components/primitives/Ticker';
import { spacing } from '@/styles/tokens/spacing';
import { fontSize, lineHeight, fontWeight } from '@/styles/tokens/typography';
import { media } from '@/styles/media';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing[300]}px;
`;

const TickerText = styled.span`
  font-size: ${fontSize.body.l}px;
  line-height: ${lineHeight.body.l}px;
  font-weight: ${fontWeight.medium};
  color: var(--color-text-secondary);
  white-space: nowrap;

  ${media.down('m')} {
    font-size: ${fontSize.body.m}px;
  }
`;

export interface HeroTaglineProps {
  tagline: string;
  tickerTexts: string[];
}

export function HeroTagline({ tagline, tickerTexts }: HeroTaglineProps) {
  return (
    <Wrapper>
      <Ticker $speed={25}>
        {tickerTexts.map((text, i) => (
          <TickerText key={i}>{text}</TickerText>
        ))}
      </Ticker>
      <Text $scale="heading" $size="s" $color="var(--color-text-secondary)">
        {tagline}
      </Text>
    </Wrapper>
  );
}

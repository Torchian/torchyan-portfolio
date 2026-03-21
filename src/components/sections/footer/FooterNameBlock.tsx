'use client';

import styled from 'styled-components';
import { spacing } from '@/styles/tokens/spacing';
import { neutrals, accents } from '@/styles/tokens/colors';
import { fontWeight, letterSpacing, fontFamily } from '@/styles/tokens/typography';
import { fluidFontSize, fluidLineHeight } from '@/styles/fluid';
import { media } from '@/styles/media';

const VerticalNameBlock = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: ${spacing[600]}px;
  transform: rotate(180deg);
  transform-origin: center;

  ${media.down('m')} {
    flex-direction: column;
    align-items: center;
    gap: ${spacing[400]}px;
  }
`;

const VerticalText = styled.div`
  display: flex;
  flex-direction: column-reverse;
  align-items: flex-start;
  gap: ${spacing[150]}px;
  writing-mode: vertical-lr;
  white-space: nowrap;

  ${media.down('m')} {
    writing-mode: horizontal-tb;
    transform: none;
    align-items: center;
  }
`;

const Name = styled.span`
  font-family: ${fontFamily.display};
  font-weight: ${fontWeight.black};
  font-size: ${fluidFontSize.display.xl};
  line-height: ${fluidLineHeight.display.xl};
  letter-spacing: ${letterSpacing.s}px;
  text-transform: uppercase;
  color: ${accents.primary};
  display: block;

  ${media.down('m')} {
    font-size: ${fluidFontSize.display.m};
    line-height: ${fluidLineHeight.display.m};
  }
`;

const FirstName = styled(Name)`
  font-size: calc(${fluidFontSize.display.xl} * 1.705);
  line-height: 0.75;
`;

const LastName = styled(Name)`
  font-size: calc(${fluidFontSize.display.xl} * 1.15);
  line-height: 0.8;
`;

const Title = styled.span`
  font-family: ${fontFamily.display};
  font-weight: ${fontWeight.semibold};
  font-size: ${fluidFontSize.display.s};
  line-height: ${fluidLineHeight.display.s};
  color: ${neutrals[500]};
  display: block;

  ${media.down('m')} {
    font-size: ${fluidFontSize.heading.l};
    line-height: ${fluidLineHeight.heading.l};
  }
`;

export function FooterNameBlock() {
  return (
    <VerticalNameBlock>
      <VerticalText>
        <Title>Designer × Engineer</Title>
      </VerticalText>
      <VerticalText>
        <FirstName>Stepan</FirstName>
        <LastName>Torchyan</LastName>
      </VerticalText>
    </VerticalNameBlock>
  );
}

'use client';

import { forwardRef } from 'react';
import styled from 'styled-components';
import { fontWeight, fontFamily } from '@/styles/tokens/typography';
import { fluidFontSize, fluidLineHeight } from '@/styles/fluid';
import { spacing } from '@/styles/tokens/spacing';
import { media } from '@/styles/media';

interface WhatidoStepProps {
  index: number;
  title: string;
  description: string;
}

export const STEP_HEIGHT = 960;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing[600]}px;
  align-items: flex-start;
  justify-content: center;
  height: ${STEP_HEIGHT}px;

  ${media.down('l')} {
    height: auto;
    min-height: 480px;
    padding-top: ${spacing[1000]}px;
  }

  ${media.down('m')} {
    padding-top: ${spacing[800]}px;
    min-height: auto;
  }
`;

const Title = styled.h3`
  font-family: ${fontFamily.display};
  font-size: ${fluidFontSize.display.m};
  line-height: ${fluidLineHeight.display.m};
  font-weight: ${fontWeight.heading};
  color: var(--color-accent-primary);

  ${media.down('l')} {
    font-size: ${fluidFontSize.display.s};
    line-height: ${fluidLineHeight.display.s};
  }

  ${media.down('m')} {
    font-size: ${fluidFontSize.heading.l};
    line-height: ${fluidLineHeight.heading.l};
  }
`;

const Description = styled.p`
  font-family: ${fontFamily.heading};
  font-size: ${fluidFontSize.heading.m};
  line-height: ${fluidLineHeight.heading.m};
  font-weight: ${fontWeight.medium};
  color: var(--color-text-secondary);

  ${media.down('l')} {
    font-size: ${fluidFontSize.heading.s};
    line-height: ${fluidLineHeight.heading.s};
  }
`;

export const WhatidoStep = forwardRef<HTMLDivElement, WhatidoStepProps>(
  function WhatidoStep({ title, description }, ref) {
    return (
      <Wrapper ref={ref}>
        <Title>{title}</Title>
        <Description>{description}</Description>
      </Wrapper>
    );
  },
);

'use client';

import { forwardRef } from 'react';
import styled from 'styled-components';
import { fontSize, lineHeight, fontWeight, fontFamily } from '@/styles/tokens/typography';
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
  font-size: ${fontSize.display.m}px;
  line-height: ${lineHeight.display.m}px;
  font-weight: ${fontWeight.heading};
  color: var(--color-accent-primary);

  ${media.down('l')} {
    font-size: ${fontSize.display.s}px;
    line-height: ${lineHeight.display.s}px;
  }

  ${media.down('m')} {
    font-size: ${fontSize.heading.l}px;
    line-height: ${lineHeight.heading.l}px;
  }
`;

const Description = styled.p`
  font-family: ${fontFamily.heading};
  font-size: ${fontSize.heading.m}px;
  line-height: ${lineHeight.heading.m}px;
  font-weight: ${fontWeight.medium};
  color: var(--color-text-secondary);

  ${media.down('l')} {
    font-size: ${fontSize.heading.s}px;
    line-height: ${lineHeight.heading.s}px;
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

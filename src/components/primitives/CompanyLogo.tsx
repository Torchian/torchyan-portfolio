'use client';

import styled from 'styled-components';
import Image from 'next/image';
import { duration, easing } from '@/styles/tokens/motion';

const Wrapper = styled.span<{ $hoverScale?: number }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  opacity: 0.6;
  transition: opacity ${duration.fast} ${easing.out},
    transform ${duration.fast} ${easing.out};
  flex-shrink: 0;

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      opacity: 1;
      ${(p) => (p.$hoverScale ? `transform: scale(${p.$hoverScale});` : '')}
    }
  }
`;

export interface CompanyLogoProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  $hoverScale?: number;
}

export function CompanyLogo({ src, alt, width = 120, height = 32, $hoverScale }: CompanyLogoProps) {
  return (
    <Wrapper $hoverScale={$hoverScale}>
      <Image src={src} alt={alt} width={width} height={height} style={{ objectFit: 'contain' }} />
    </Wrapper>
  );
}

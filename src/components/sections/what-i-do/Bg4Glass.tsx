'use client';

import styled from 'styled-components';
import { radius } from '@/styles/tokens/radius';
import { zIndex } from '@/styles/tokens/z-index';
import { media } from '@/styles/media';

const Wrapper = styled.div`
  position: absolute;
  top: 3100px;
  width: 70%;
  aspect-ratio: 1 / 1;
  left: 50%;
  transform: translateX(-50%);
  flex: none;
  flex-grow: 0;
  z-index: ${zIndex.whatidoBg4};
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: ${radius.xl}px;
  overflow: hidden;
  pointer-events: none;

  ${media.down('l')} {
    display: none;
  }
`;

const GlassPane = styled.div`
  position: absolute;
  inset: 0;
  backdrop-filter: blur(10px) saturate(5000%);
  -webkit-backdrop-filter: blur(10px) saturate(5000%);
`;

export function Bg4Glass() {
  return (
    <Wrapper>
      <GlassPane />
    </Wrapper>
  );
}

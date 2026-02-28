'use client';

import styled from 'styled-components';
import { zIndex } from '@/styles/tokens/z-index';

const HEIGHT = '90vmin'; // Responsive to screen (smaller of vw/vh)

const Wrapper = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: ${zIndex.base};
`;

const VectorBg = styled.img`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  opacity: 0.1;
  z-index: ${zIndex.behind};
`;

const SideCharacter = styled.div<{ $side: 'left' | 'right' }>`
  position: absolute;
  ${(p) => (p.$side === 'left' ? 'left: 0' : 'right: 0')};
  bottom: 0;
  height: ${HEIGHT};
  display: flex;
  align-items: center;
  justify-content: ${(p) => (p.$side === 'left' ? 'flex-start' : 'flex-end')};
  z-index: 1;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 200px;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    mask-image: linear-gradient(to bottom, transparent 0%, black 100%);
    -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 100%);
    pointer-events: none;
  }
`;

const Img = styled.img<{ $objectPosition: string; $margin: string }>`
  height: 100%;
  width: auto;
  object-fit: contain;
  object-position: ${(p) => p.$objectPosition};
  margin: ${(p) => p.$margin};
`;

export function SideCharacters() {
  return (
    <Wrapper aria-hidden>
      <VectorBg src="/hero/Vector.svg" alt="" />
      <SideCharacter $side="left">
        <Img
          src="/hero/character_color.png"
          alt=""
          $objectPosition="right center"
          $margin="0 0 0 -50%"
        />
      </SideCharacter>
      <SideCharacter $side="right">
        <Img
          src="/hero/character_negative.png"
          alt=""
          $objectPosition="left center"
          $margin="0 -50% 0 0"
        />
      </SideCharacter>
    </Wrapper>
  );
}

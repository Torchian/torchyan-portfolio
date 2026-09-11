'use client';

import styled from 'styled-components';
import { zIndex } from '@/styles/tokens/z-index';

const HEIGHT = '90vmin'; // Responsive to screen (smaller of vw/vh)

const Wrapper = styled.div`
  position: absolute;
  inset: 0;
  overflow: hidden;
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
`;

/**
 * Fades the character's own pixels to transparent near the bottom, instead
 * of blurring a fixed-height band on top of it (which left the image's own
 * edge fully opaque and hard-cut once the blur band ran out). This also
 * drops two more backdrop-filter layers from the page.
 */
const Img = styled.img<{ $objectPosition: string; $margin: string }>`
  height: 100%;
  width: auto;
  object-fit: contain;
  object-position: ${(p) => p.$objectPosition};
  margin: ${(p) => p.$margin};
  mask-image: linear-gradient(to bottom, black 0%, black 55%, transparent 96%);
  -webkit-mask-image: linear-gradient(to bottom, black 0%, black 55%, transparent 96%);
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

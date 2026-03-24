'use client';

import styled from 'styled-components';
import { media } from '@/styles/media';
import { zIndex } from '@/styles/tokens/z-index';
import { easing } from '@/styles/tokens/motion';
import { useContentReveal } from '@/contexts/ContentRevealContext';

const HEIGHT = '90vmin';

const Wrapper = styled.div<{ $visible: boolean }>`
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: ${zIndex.base};
  overflow: hidden;
  opacity: ${(p) => (p.$visible ? 1 : 0)};
  transition: opacity 400ms ${easing.out};
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

const CharacterSlot = styled.div<{ $side?: 'left' | 'right'; $center?: boolean }>`
  position: absolute;
  ${(p) => (p.$center ? 'left: 50%; transform: translateX(-50%);' : p.$side === 'left' ? 'left: 0;' : 'right: 0;')}
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: ${(p) => (p.$center ? 'center' : p.$side === 'left' ? 'flex-start' : 'flex-end')};
  z-index: 1;

  ${media.down('s')} {
    width: 100%;
  }
`;

const FrostedEdge = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 200px;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  mask-image: linear-gradient(to bottom, transparent 0%, black 100%);
  -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 100%);
  pointer-events: none;
`;

const DesktopPair = styled.div`
  position: absolute;
  inset: 0;

  ${media.down('l')} {
    display: none;
  }
`;

const TabletPair = styled.div`
  position: absolute;
  inset: 0;
  display: none;

  ${media.between('s', 'l')} {
    display: block;
  }
`;

const TabletCharacterSlot = styled(CharacterSlot)<{ $side: 'left' | 'right' }>`
  top: 50%;
  bottom: auto;
  transform: translateY(-50%);
`;

const MobileSingle = styled.div`
  position: absolute;
  inset: 0;
  display: none;

  ${media.down('s')} {
    display: block;
  }
`;

const Img = styled.img<{ $objectPosition: string; $margin: string; $height: string; $grayTone?: boolean }>`
  height: ${(p) => p.$height};
  width: auto;
  object-fit: contain;
  object-position: ${(p) => p.$objectPosition};
  margin: ${(p) => p.$margin};
  filter: ${(p) => (p.$grayTone ? 'grayscale(1) contrast(1.05) brightness(0.95)' : 'none')};
  content-visibility: auto;
`;

export function SideCharacters() {
  const { contentRevealed } = useContentReveal();

  return (
    <Wrapper aria-hidden $visible={contentRevealed}>
      <VectorBg src="/hero/Vector.svg" alt="" loading="lazy" decoding="async" fetchPriority="low" />

      <DesktopPair>
        <CharacterSlot $side="left">
          <Img
            src="/hero/character_color.webp"
            alt=""
            decoding="async"
            fetchPriority="low"
            $height={HEIGHT}
            $objectPosition="right center"
            $margin="0 0 0 -50%"
          />
        </CharacterSlot>
        <CharacterSlot $side="right">
          <Img
            src="/hero/character_negative.webp"
            alt=""
            decoding="async"
            fetchPriority="low"
            $height={HEIGHT}
            $objectPosition="left center"
            $margin="0 -50% 0 0"
          />
        </CharacterSlot>
        <FrostedEdge />
      </DesktopPair>

      <TabletPair>
        <TabletCharacterSlot $side="left">
          <Img
            src="/hero/character_head.webp"
            alt=""
            decoding="async"
            fetchPriority="low"
            $height="78vmin"
            $objectPosition="right center"
            $margin="0 0 0 -50%"
          />
        </TabletCharacterSlot>
        <TabletCharacterSlot $side="right">
          <Img
            src="/hero/character_head.webp"
            alt=""
            decoding="async"
            fetchPriority="low"
            $height="78vmin"
            $objectPosition="left center"
            $margin="0 -50% 0 0"
            $grayTone
          />
        </TabletCharacterSlot>
        <FrostedEdge />
      </TabletPair>

      <MobileSingle>
        <CharacterSlot $center>
          <Img
            src="/hero/character_color.webp"
            alt=""
            decoding="async"
            fetchPriority="low"
            $height="auto"
            $objectPosition="center bottom"
            $margin="0"
          />
        </CharacterSlot>
        <FrostedEdge />
      </MobileSingle>
    </Wrapper>
  );
}

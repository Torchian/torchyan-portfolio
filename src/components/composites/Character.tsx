'use client';

import styled from 'styled-components';

/**
 * Character assembled from SVG parts to match the reference portrait.
 * Base canvas: 421×573 (head dimensions).
 * Parts are positioned in the same coordinate system.
 */
const PARTS = [
  { src: '/character/character_head.svg', zIndex: 3 },
  { src: '/character/character_right_ear.svg', zIndex: 0 },
  { src: '/character/character_left_ear.svg', zIndex: 0 },
  { src: '/character/character_right_eyebrow.svg', zIndex: 2 },
  { src: '/character/character_left_eyebrow.svg', zIndex: 2 },
  { src: '/character/character_right_eye.svg', zIndex: 1 },
  { src: '/character/character_left_eye.svg', zIndex: 1 },
  { src: '/character/character_beard.svg', zIndex: 4 },
] as const;

const Wrapper = styled.div`
  position: relative;
  width: 100%;
  max-width: 420px;
  aspect-ratio: 421 / 573;
`;

const Part = styled.img<{ $left: number; $top: number; $width: number; $zIndex: number }>`
  position: absolute;
  left: ${(p) => p.$left}%;
  top: ${(p) => p.$top}%;
  width: ${(p) => p.$width}%;
  height: auto;
  object-fit: contain;
  object-position: left top;
  z-index: ${(p) => p.$zIndex};
  pointer-events: none;
`;

export function Character() {
  return (
    <Wrapper aria-hidden>
      <Part
        src={PARTS[0].src}
        alt=""
        $left={0}
        $top={0}
        $width={100}
        $zIndex={PARTS[0].zIndex}
      />
      <Part
        src={PARTS[1].src}
        alt=""
        $left={3.7}
        $top={44.5}
        $width={11}
        $zIndex={PARTS[1].zIndex}
      />
      <Part
        src={PARTS[2].src}
        alt=""
        $left={85}
        $top={44.3}
        $width={11}
        $zIndex={PARTS[2].zIndex}
      />
      <Part
        src={PARTS[3].src}
        alt=""
        $left={15}
        $top={32.9}
        $width={27}
        $zIndex={PARTS[3].zIndex}
      />
      <Part
        src={PARTS[4].src}
        alt=""
        $left={56.3}
        $top={32.3}
        $width={28.8}
        $zIndex={PARTS[4].zIndex}
      />
      <Part
        src={PARTS[5].src}
        alt=""
        $left={19.7}
        $top={41.4}
        $width={18.4}
        $zIndex={PARTS[5].zIndex}
      />
      <Part
        src={PARTS[6].src}
        alt=""
        $left={60.7}
        $top={41.3}
        $width={19.8}
        $zIndex={PARTS[6].zIndex}
      />
      <Part
        src={PARTS[7].src}
        alt=""
        $left={11}
        $top={62.5}
        $width={77.6}
        $zIndex={PARTS[7].zIndex}
      />
    </Wrapper>
  );
}

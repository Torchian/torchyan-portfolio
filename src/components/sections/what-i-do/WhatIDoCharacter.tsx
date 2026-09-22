'use client';

import Image from 'next/image';
import styled from 'styled-components';
import { useRef, type RefObject } from 'react';
import { FACE_ASPECT, headImage, partBox } from '@/components/composites/character/characterLayout';
import { useBoardClip } from './useBoardClip';

/** The colour face, from the shared Character parts, placed in the face frame. */
const FACE = headImage('face');
const FACE_BOX = partBox(FACE, 'face');
/** Wrapper's max width (below), for the face's download size. */
const MAX_WIDTH = 420;

// Static class — grayscale comes from the --grayscale CSS variable, which
// useWhatIDoScroll writes onto the visuals column and this wrapper inherits.
// No React props or styled-components interpolation are involved, so a scroll
// update never re-renders this component or injects a new class.
const Wrapper = styled.div`
  position: relative;
  width: 100%;
  max-width: ${MAX_WIDTH}px;
  aspect-ratio: ${FACE_ASPECT};
  filter: sepia(0.2) grayscale(var(--grayscale, 1));
  transition: filter 0.4s ease-out;

  img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
    object-position: center;
    pointer-events: none;
  }
`;

/**
 * Pencil layer, stacked above the colored one. It's clipped to only show the
 * portion ABOVE the board's bottom line — the clip inset is driven per-frame by
 * the scroll handler. No transition: the edge is a hard cut that moves with the
 * board line, so the drawing "can't pass through the board" — anything below the
 * line is the colored image underneath.
 */
const PencilLayer = styled.img`
  clip-path: inset(0 0 var(--clip-below, 100%) 0);
`;

/**
 * Colored layer gets the INVERSE clip — hidden above the line, visible only
 * below it. This isn't just relying on the pencil layer opaquely covering it:
 * the pencil source has real transparent gaps (cut-out eyes/eyebrows), so
 * without its own clip the colored image would show through those gaps while
 * still inside the board. Explicitly clipping both layers to the same line
 * keeps them mutually exclusive regardless of either asset's transparency.
 * The face sits at the top of the face frame, so the wrapper's --clip-above
 * (measured from the wrapper's top) lines up on it unchanged.
 */
const ColorLayer = styled.div`
  position: absolute;
  clip-path: inset(var(--clip-above, 0px) 0 0 0);
`;

export interface WhatIDoCharacterProps {
  /** Ref to the board element (Bg1) whose bottom line drives the pencil clip. */
  boardRef?: RefObject<HTMLDivElement | null>;
}

export function WhatIDoCharacter({ boardRef }: WhatIDoCharacterProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  useBoardClip(wrapperRef, boardRef);

  return (
    <Wrapper ref={wrapperRef} aria-hidden>
      <ColorLayer
        style={{
          left: `${FACE_BOX.left}%`,
          top: `${FACE_BOX.top}%`,
          width: `${FACE_BOX.width}%`,
          height: `${FACE_BOX.height}%`,
        }}
      >
        <Image src={FACE.src} alt="" fill sizes={`${Math.ceil((MAX_WIDTH * FACE_BOX.width) / 100)}px`} />
      </ColorLayer>
      <PencilLayer src="/character/character_head_sketch.webp" alt="" />
    </Wrapper>
  );
}

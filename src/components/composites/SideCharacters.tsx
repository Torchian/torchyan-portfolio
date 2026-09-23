'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { zIndex } from '@/styles/tokens/z-index';
import { media, mediaQueries } from '@/styles/media';
import { Character, characterFade } from './character/Character';
import { useLookAtPointer } from './character/useLookAtPointer';

const HEIGHT = '90vmin'; // Responsive to screen (smaller of vw/vh)

/**
 * Baked stills of the Character (scripts/bake-character.py, see ADR 0005). Each
 * is only the half that shows: the character stands centred on the screen edge
 * with its other half off screen, so that half is never shipped.
 *  - left: Big Lebowski, colour, no cap or glasses (`--half right`)
 *  - right: Matrix with the default glasses, black and white (`--half left --grayscale`)
 */
const HALF = { width: 768, height: 1536 } as const;
// Lazy (next/image's default), not priority: the pair is hidden on phones, and a
// preload would fetch them there anyway. On screens that show them they're in
// view from the first layout, so lazy loading starts them straight away.
const LEFT_SRC = '/hero/character-left.webp';
const RIGHT_SRC = '/hero/character-right.webp';

/**
 * Where the characters come alive: the stills are swapped for the live,
 * layered Characters (the same combinations as the stills) that look at the
 * pointer. Screens that show the side characters, with a real mouse, without
 * reduced motion.
 */
const LIVE_QUERY = `${mediaQueries.up('l')} and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)`;
/** The still-to-live crossfade. */
const SWAP_MS = 300;

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

/**
 * The visible half of a character: 45vmin wide, 90vmin tall, on the screen
 * edge. It fades the character's own pixels to transparent near the bottom,
 * instead of blurring a fixed-height band on top of it (which left the image's
 * own edge fully opaque and hard-cut once the blur band ran out) — one mask for
 * the still and the live character alike.
 */
const SideCharacter = styled.div<{ $side: 'left' | 'right' }>`
  position: absolute;
  ${(p) => (p.$side === 'left' ? 'left: 0' : 'right: 0')};
  bottom: 0;
  width: calc(${HEIGHT} / 2);
  height: ${HEIGHT};
  z-index: 1;
  ${characterFade}

  /* In the 768 frame and below, the hero shows a single centred portrait instead. */
  ${media.down('l')} {
    display: none;
  }
`;

const Still = styled(Image)`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  transition: opacity ${SWAP_MS}ms ease-out;

  [data-live='true'] > & {
    opacity: 0;
  }
`;

/** The whole live character, twice the visible half, hung so its middle is on the screen edge. */
const Live = styled.div<{ $side: 'left' | 'right' }>`
  position: absolute;
  top: 0;
  ${(p) => (p.$side === 'left' ? 'right: 0' : 'left: 0')};
  width: 200%;
  opacity: 0;
  transition: opacity ${SWAP_MS}ms ease-out;

  [data-live='true'] > & {
    opacity: 1;
  }
`;

export function SideCharacters() {
  /** CSS px of a whole live character (90vmin), for its layers' download sizes; 0 until wanted. */
  const [liveWidth, setLiveWidth] = useState(0);
  const [readyCount, setReadyCount] = useState(0);
  const [stillsGone, setStillsGone] = useState(false);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const targets = useMemo(() => [leftRef, rightRef], []);
  const live = readyCount === 2;

  // The live characters load on the first real mouse move, not before: the
  // stills stay the first paint, and touch screens never fetch the layers.
  useEffect(() => {
    if (!window.matchMedia(LIVE_QUERY).matches) return;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      window.removeEventListener('pointermove', onMove);
      setLiveWidth(Math.round(Math.min(window.innerWidth, window.innerHeight) * 0.9));
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  // Once they're in, the stills go.
  useEffect(() => {
    if (!live) return;
    const timer = window.setTimeout(() => setStillsGone(true), SWAP_MS + 100);
    return () => window.clearTimeout(timer);
  }, [live]);

  useLookAtPointer(targets, live);

  const onReady = () => setReadyCount((n) => n + 1);

  return (
    <Wrapper aria-hidden>
      <VectorBg src="/hero/grid-lines.webp" alt="" />
      <SideCharacter $side="left" data-live={live}>
        {!stillsGone && <Still src={LEFT_SRC} alt="" {...HALF} sizes="45vmin" />}
        {liveWidth > 0 && (
          <Live $side="left" ref={leftRef}>
            <Character
              clothes="big-lebowski"
              glasses={false}
              cap={false}
              width={liveWidth}
              eager
              motion
              onReady={onReady}
            />
          </Live>
        )}
      </SideCharacter>
      <SideCharacter $side="right" data-live={live}>
        {!stillsGone && <Still src={RIGHT_SRC} alt="" {...HALF} sizes="45vmin" />}
        {liveWidth > 0 && (
          <Live $side="right" ref={rightRef}>
            <Character
              clothes="matrix"
              glasses="default"
              cap={false}
              width={liveWidth}
              eager
              motion
              grayscale
              onReady={onReady}
            />
          </Live>
        )}
      </SideCharacter>
    </Wrapper>
  );
}

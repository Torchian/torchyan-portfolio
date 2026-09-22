'use client';

import styled, { keyframes } from 'styled-components';
import { media } from '@/styles/media';
import { neutrals } from '@/styles/tokens/colors';
import { VisuallyHidden } from '@/components/primitives';
import { usePauseOffscreen } from '@/hooks';
import {
  CROSSHAIR_RING_VIEWBOX,
  CrosshairMark,
  CrosshairRing,
} from '@/components/primitives/Crosshair';

/*
 * Figma: 3956:15293. The hero name with its "O" drawn as the cursor's
 * crosshair, flat in the light text colour (no glass): the ring takes the
 * letter's exact place and size, turns forever, and the cross in the middle
 * breathes in and out.
 *
 * Sizes are in em of the heading, measured from Gilroy's own "O" (canvas
 * measureText): in capitals (Black, from the 1280 frame up) its ink is a
 * 0.73em circle in a 0.79em advance; in sentence case (Bold and SemiBold) the
 * lowercase "o" is 0.528em in 0.596em. Both sit 0.014em below the baseline.
 * The real letter stays in the heading for screen readers and copying.
 *
 * The ring and the cross are separate SVGs, each turned or scaled by a
 * wrapping span, so the compositor moves them without repainting. The spans
 * matter: Chrome ticks a transform animation set on an <svg> itself on the
 * main thread every frame (60 style recalcs a second, measured), while the
 * same animation on an HTML element runs on the compositor alone. They rest once the hero is
 * scrolled away (usePauseOffscreen), and reduced motion holds them still.
 */

/** The first o / O, Latin or Cyrillic. Names without one (Armenian) render as text. */
const LETTER_O = /[oOоО]/;

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const breathe = keyframes`
  0%, 100% { transform: scale(0.6); }
  50% { transform: scale(0.8); }
`;

const Glyph = styled.span`
  --d: 0.528em;
  position: relative;
  display: inline-block;
  width: 0.596em;
  height: var(--d);
  margin-bottom: -0.014em;
  vertical-align: baseline;

  /* From the 1280 frame up the name is in capitals (HeroSection's Name). */
  ${media.up('xl')} {
    --d: 0.73em;
    width: 0.79em;
  }

  & > * {
    position: absolute;
    top: 0;
    left: 50%;
    width: var(--d);
    height: var(--d);
    margin-left: calc(var(--d) / -2);
  }
`;

/* An atomic inline is a line-break opportunity: keep the word in one piece. */
const Word = styled.span`
  white-space: nowrap;
`;

const Layer = styled.span`
  display: block;
  color: ${neutrals[100]};
  transform-origin: 50% 50%;

  svg {
    display: block;
    width: 100%;
    height: 100%;
    overflow: visible;
  }

  &[data-part='ring'] {
    animation: ${spin} 8s linear infinite;
  }

  &[data-part='mark'] {
    animation: ${breathe} 0.4s linear infinite;
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none !important;
  }
`;

function CrosshairO({ letter }: { letter: string }) {
  const ref = usePauseOffscreen<HTMLSpanElement>();
  return (
    <>
      <VisuallyHidden>{letter}</VisuallyHidden>
      <Glyph ref={ref} aria-hidden>
        <Layer data-part="ring">
          <svg viewBox={CROSSHAIR_RING_VIEWBOX} fill="currentColor">
            <CrosshairRing />
          </svg>
        </Layer>
        <Layer data-part="mark">
          <svg viewBox={CROSSHAIR_RING_VIEWBOX} fill="currentColor">
            <CrosshairMark />
          </svg>
        </Layer>
      </Glyph>
    </>
  );
}

/** `name` with its first "o" swapped for the crosshair. */
export function CrosshairName({ name }: { name: string }) {
  const i = name.search(LETTER_O);
  if (i < 0) return <>{name}</>;
  const start = name.lastIndexOf(' ', i) + 1;
  const end = name.indexOf(' ', i) < 0 ? name.length : name.indexOf(' ', i);
  return (
    <>
      {name.slice(0, start)}
      <Word>
        {name.slice(start, i)}
        <CrosshairO letter={name[i]} />
        {name.slice(i + 1, end)}
      </Word>
      {name.slice(end)}
    </>
  );
}

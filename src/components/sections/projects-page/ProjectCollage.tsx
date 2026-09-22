'use client';

/* eslint-disable @next/next/no-img-element -- pre-sized decorative WebP, placed by hand */
import styled, { css } from 'styled-components';
import { neutrals } from '@/styles/tokens/colors';
import { media } from '@/styles/media';
import { STAGE_QUERY, type Collage, type CollageTilt } from './projectShowcaseConfig';

/*
 * Figma's isometric screenshot stacks: each stack is rotated, squashed
 * vertically and skewed, in that order, around its own centre.
 *
 * Every coordinate below is a pixel of the design's own media box (the collage's
 * `frame`, or 948 × 576 from the 1920 frame, COLLAGE_FRAME). The box sets `--u`
 * to what one of those pixels is worth at the current size, so one set of
 * numbers covers every breakpoint — the same trick the Selected Work cards use
 * (see ProjectStickyCard).
 *
 * On the Projects stage the columns travel along their own length, the way the
 * homepage grids slide on hover. A right-hand collage's columns come down from
 * the top right into place and go back up there; a left-hand one is drawn
 * mirrored (tilted the other way), so its columns come from and return to the
 * top left. It's the same whichever way the page is scrolled. Each of the three
 * columns has its own distance, pace and easing (COLUMN_MOTION).
 */

/** The media box the collage coordinates were measured in, unless a collage gives its own. */
export const COLLAGE_FRAME = { width: 948, height: 576 } as const;

/**
 * How each column moves, by index (repeating for collages with more): how far
 * along its own length it starts or ends up off stage, in design px, and the
 * transitions that bring it in and send it off. The first glides in, the second
 * overshoots a touch and settles, the third comes from furthest and eases in
 * slowest; they leave quicker, one after another.
 */
const COLUMN_MOTION = [
  {
    distance: 900,
    enter: 'transform 900ms cubic-bezier(0.22, 1, 0.36, 1) 150ms',
    leave: 'transform 450ms cubic-bezier(0.55, 0, 1, 0.45)',
  },
  {
    distance: 1150,
    enter: 'transform 1150ms cubic-bezier(0.34, 1.4, 0.64, 1) 320ms',
    leave: 'transform 500ms cubic-bezier(0.55, 0, 1, 0.45) 40ms',
  },
  {
    distance: 1400,
    enter: 'transform 1400ms cubic-bezier(0.16, 1, 0.3, 1) 480ms',
    leave: 'transform 550ms cubic-bezier(0.55, 0, 1, 0.45) 80ms',
  },
] as const;

const TILT: Record<Exclude<CollageTilt, 'none'>, string> = {
  clockwise: 'rotate(30deg) scale(1, 0.87) skewX(-30deg)',
  counterClockwise: 'rotate(-30deg) scale(1, 0.87) skewX(30deg)',
};

/**
 * `--slide` moves the column along its own length: it's applied after the tilt,
 * in the column's unprojected space, so the projection turns it into the
 * diagonal. Up the column is the top right for a clockwise tilt and the top left
 * for the mirrored one, so off stage every column simply waits up its length.
 */
const Stack = styled.div<{ $tilt: CollageTilt; $motion: number }>`
  --slide: 0px;
  position: absolute;
  display: flex;
  flex-direction: column;
  left: calc(var(--x) * var(--u));
  top: calc(var(--y) * var(--u));
  width: calc(var(--w) * var(--u));
  height: var(--h, auto);
  gap: calc(var(--stack-gap) * var(--u));
  pointer-events: none;

  transform: ${(p) => (p.$tilt === 'none' ? '' : `translate(-50%, -50%) ${TILT[p.$tilt]}`)}
    translateY(var(--slide));
  transition: ${(p) => COLUMN_MOTION[p.$motion].enter};

  @media ${STAGE_QUERY} {
    [data-active='false'] & {
      --slide: calc(${(p) => -COLUMN_MOTION[p.$motion].distance} * var(--u));
      transition: ${(p) => COLUMN_MOTION[p.$motion].leave};
    }
  }

  ${media.reducedMotion} {
    --slide: 0px !important;
    transition: none;
  }
`;

const Shot = styled.div<{ $outlined?: boolean }>`
  position: relative;
  flex: none;
  width: 100%;
  overflow: hidden;

  ${(p) =>
    p.$outlined &&
    css`
      border: 1px solid ${neutrals[100]};
    `}

  img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    max-width: none;
    object-fit: cover;
  }
`;

export interface ProjectCollageProps {
  collage: Collage;
  /** Drawn as its mirror image (tilted the other way), for the left-hand collages. */
  mirrored?: boolean;
}

const MIRROR: Record<CollageTilt, CollageTilt> = {
  clockwise: 'counterClockwise',
  counterClockwise: 'clockwise',
  none: 'none',
};

export function ProjectCollage({ collage, mirrored = false }: ProjectCollageProps) {
  const frameWidth = (collage.frame ?? COLLAGE_FRAME).width;
  const tilt = mirrored ? MIRROR[collage.tilt] : collage.tilt;
  return (
    <>
      {collage.stacks.map((stack, i) => (
        <Stack
          key={i}
          $tilt={tilt}
          $motion={i % COLUMN_MOTION.length}
          style={
            {
              // Tilted stacks are placed by their centre, flat ones by their left edge.
              '--x': !mirrored
                ? stack.x
                : tilt === 'none'
                  ? frameWidth - stack.x - stack.width
                  : frameWidth - stack.x,
              '--y': stack.y,
              '--w': stack.width,
              '--h': stack.height ? `calc(${stack.height} * var(--u))` : undefined,
              '--stack-gap': stack.gap ?? 0,
            } as React.CSSProperties
          }
        >
          {stack.images.map((image) => (
            <Shot
              key={image.src}
              $outlined={image.outlined}
              style={{ aspectRatio: `${image.width} / ${image.height}` }}
            >
              <img src={image.src} alt="" loading="lazy" decoding="async" />
            </Shot>
          ))}
        </Stack>
      ))}
    </>
  );
}

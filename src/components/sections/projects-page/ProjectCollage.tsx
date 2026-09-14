'use client';

/* eslint-disable @next/next/no-img-element -- pre-sized decorative WebP, placed by hand */
import styled, { css } from 'styled-components';
import { neutrals } from '@/styles/tokens/colors';
import type { Collage, CollageTilt } from './projectShowcaseConfig';

/*
 * Figma's isometric screenshot stacks: each stack is rotated, squashed
 * vertically and skewed, in that order, around its own centre.
 */
const TILT: Record<Exclude<CollageTilt, 'none'>, string> = {
  clockwise: 'rotate(30deg) scale(1, 0.87) skewX(-30deg)',
  counterClockwise: 'rotate(-30deg) scale(1, 0.87) skewX(30deg)',
};

const Stack = styled.div<{ $tilt: CollageTilt }>`
  position: absolute;
  display: flex;
  flex-direction: column;
  pointer-events: none;

  ${(p) =>
    p.$tilt !== 'none' &&
    css`
      transform: translate(-50%, -50%) ${TILT[p.$tilt]};
    `}
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
}

export function ProjectCollage({ collage }: ProjectCollageProps) {
  return (
    <>
      {collage.stacks.map((stack, i) => (
        <Stack
          key={i}
          $tilt={collage.tilt}
          style={{ left: stack.x, top: stack.y, width: stack.width, gap: stack.gap ?? 0 }}
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

'use client';

import type { CSSProperties } from 'react';
import styled from 'styled-components';
import { glassSurface } from '@/styles/mixins';
import { accents, neutrals } from '@/styles/tokens/colors';
import { duration, easing } from '@/styles/tokens/motion';
import { radius } from '@/styles/tokens/radius';
import { spacing } from '@/styles/tokens/spacing';

/*
 * Figma: Dot indicator (3907:1260) and Carousel Dots, Direction=Vertical (3906:9704).
 *  - Dot: 6px mute grey; hover 12px light; active 16px magenta (accents.secondary).
 *  - Container: a 48px-wide glass pill (dark/glass/action), fully rounded, 32px
 *    clear at each end with ~24px between dots, and a soft white glint along
 *    each long edge (the CTA's light wedges, turned on their side).
 * The sizes and colours ease between states rather than jumping.
 */

const DOT = { rest: 6, hover: 12, active: 16 } as const;
/** Space between two dots' edges. */
const DOT_GAP = 24;
/** Space between the pill's ends and the first and last dot. */
const END_INSET = spacing[400];
const WIDTH = spacing[600];
const EASE = `${duration.normal} ${easing.out}`;

/**
 * The pill is sized for its busiest moment (the active dot plus a hovered one),
 * so it never grows or shrinks under the pointer; the dots centre in it.
 */
const pillLength = (count: number) =>
  2 * END_INSET + DOT.active + DOT.hover + Math.max(0, count - 2) * DOT.rest + (count - 1) * DOT_GAP;

const Pill = styled.div`
  ${glassSurface}
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
  width: ${WIDTH}px;
  height: var(--length);
  padding-block: ${END_INSET - DOT_GAP / 2}px;
  border-radius: ${radius.round}px;
  overflow: hidden;

  /* The glints: a thin wedge of light along each long edge, widest at the
     middle, blurred into a sheen. */
  &::before,
  &::after {
    content: '';
    position: absolute;
    top: 0;
    width: 0;
    height: 0;
    border-top: calc(var(--length) / 2) solid transparent;
    border-bottom: calc(var(--length) / 2) solid transparent;
    filter: blur(4px);
    pointer-events: none;
  }

  &::before {
    left: -3px;
    border-left: ${spacing[75]}px solid rgba(255, 255, 255, 0.25);
  }

  &::after {
    right: -3px;
    border-right: ${spacing[75]}px solid rgba(255, 255, 255, 0.25);
  }
`;

/** A dot's whole row of the pill is its hit area, so even the 6px dot is easy to press. */
const DotButton = styled.button`
  position: relative;
  z-index: 1;
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: calc(var(--dot) + ${DOT_GAP}px);
  padding: 0;
  border: 0;
  background: none;
  cursor: pointer;
  --dot: ${DOT.rest}px;
  --dot-color: ${neutrals[700]};
  transition: height ${EASE};

  &::before {
    content: '';
    width: var(--dot);
    height: var(--dot);
    border-radius: 50%;
    background: var(--dot-color);
    transition:
      width ${EASE},
      height ${EASE},
      background-color ${EASE},
      box-shadow ${EASE};
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      --dot: ${DOT.hover}px;
      --dot-color: ${neutrals[100]};
    }
  }

  &:focus-visible {
    --dot: ${DOT.hover}px;
    --dot-color: ${neutrals[100]};
    outline: none;

    &::before {
      box-shadow: 0 0 0 2px ${accents.primary};
    }
  }

  &[aria-current='true'] {
    --dot: ${DOT.active}px;
    --dot-color: ${accents.secondary};
    cursor: default;
  }

  @media (prefers-reduced-motion: reduce) {
    &,
    &::before {
      transition: none;
    }
  }
`;

export interface CarouselDotsProps {
  /** One accessible name per dot, e.g. the slide's title. */
  labels: string[];
  /** The current slide, or -1 for none. */
  active: number;
  onSelect: (index: number) => void;
  /** Names the group for screen readers, e.g. "Projects". */
  label: string;
  className?: string;
}

export function CarouselDots({ labels, active, onSelect, label, className }: CarouselDotsProps) {
  return (
    <Pill
      role="group"
      aria-label={label}
      className={className}
      style={{ '--length': `${pillLength(labels.length)}px` } as CSSProperties}
    >
      {labels.map((name, i) => (
        <DotButton
          key={name + i}
          type="button"
          aria-label={name}
          aria-current={i === active ? 'true' : undefined}
          onClick={() => onSelect(i)}
        />
      ))}
    </Pill>
  );
}

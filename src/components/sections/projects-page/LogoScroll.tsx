'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import styled from 'styled-components';
import { createInViewGate, subscribeScroll } from '@/lib/scroll-driver';
import { media } from '@/styles/media';

/*
 * Figma: Logo scroll (4043:10874) on the Projects hero — Desktop 1920
 * (3155:9791, 480px), Tablet 1024 (3753:14693, 420px), Mobile 480
 * (3753:17720, 320px). Two states, "Start" and "End": a grid of site
 * thumbnails sits behind the wordmark's "P" shape, masked to it, and pans
 * upward inside it as the page scrolls — Start shows the grid's top, End
 * shows its last row (see TRAVEL_PERCENT below for why that's not Figma's
 * own authored 523px).
 *
 * The grid is one flattened raster (exported from the "Vector" layer, the
 * same image at both states — only its position differs) rather than the 20+
 * individual thumbnails Figma composites it from: one request instead of
 * twenty, and nothing to lay out at runtime.
 */

const GRID = { src: '/projects/logo-scroll/grid.webp', width: 960, height: 2066 } as const;
const MASK_SRC = "url('/projects/logo-scroll/mask.svg')";

/**
 * The grid's travel inside the mark, as a percentage of the grid's own
 * rendered height (so one number holds at every breakpoint — a percentage
 * transform is relative to the element's own box, which already scales with
 * the mark's width). Figma authors this offset as a flat 523px of a
 * (notionally) 904px-tall image, which undershoots: the grid is only ever
 * exactly that tall, so 523px of travel leaves its last ~39px of that 904
 * never scrolled into view — the mark's bottom reads as cut off rather than
 * full of thumbnails. Travelling the image's own height short of the mark's
 * instead (GRID.height − GRID.width, since the mark is square and the image
 * fills its width) always lands exactly on the grid's last row.
 */
const TRAVEL_PERCENT = ((GRID.height - GRID.width) / GRID.height) * 100;

/**
 * How much of the mark's own remaining time on screen the pan uses — measured
 * live (see useLogoScrollProgress) rather than a flat pixel distance, since a
 * fixed distance either finishes with the mark still sitting there a while
 * (reads as the pan stopping short, the original bug report here) or, picked
 * too large, finishes after the mark has already scrolled out of view
 * entirely. 0.85 leaves it fully revealed for the last stretch rather than
 * snapping to End right as it exits.
 */
const VISIBLE_RANGE_FRACTION = 0.85;

const Wrapper = styled.div`
  position: relative;
  flex: none;
  overflow: hidden;
  width: 480px;
  height: 480px;
  mask-image: ${MASK_SRC};
  -webkit-mask-image: ${MASK_SRC};
  mask-size: 100% 100%;
  -webkit-mask-size: 100% 100%;
  mask-repeat: no-repeat;
  -webkit-mask-repeat: no-repeat;

  ${media.down('xl')} {
    width: 420px;
    height: 420px;
  }

  ${media.down('m')} {
    width: 320px;
    height: 320px;
  }
`;

const Grid = styled(Image)`
  position: absolute;
  top: 0;
  left: 0;
  display: block;
  width: 100%;
  height: auto;
  max-width: none;
  transform: translateY(calc(var(--logo-scroll-progress, 0) * -${TRAVEL_PERCENT}%));

  ${media.reducedMotion} {
    transform: translateY(-${TRAVEL_PERCENT}%);
  }
`;

/**
 * Scroll-linked pan: 0 where the mark sits when it first comes into measure,
 * 1 after VISIBLE_RANGE_FRACTION of the scrolling left before its bottom
 * would reach the viewport's top — i.e. before it scrolls out of view,
 * wherever that happens to land for this viewport and this hero's height.
 * Measured on the first driven frame rather than at mount, since layout
 * (fonts, images above it) can still be settling then.
 */
function useLogoScrollProgress(wrapperRef: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const gate = createInViewGate(wrapper);
    let last = '';
    let startY: number | null = null;
    let triggerDistance = 0;

    const unsubscribe = subscribeScroll<string>({
      active: () => gate.current,
      read: (frame) => {
        if (startY === null) {
          startY = frame.y;
          const documentBottom = frame.rect(wrapper).bottom + frame.y;
          triggerDistance = Math.max(1, (documentBottom - frame.y) * VISIBLE_RANGE_FRACTION);
        }
        return Math.min(1, Math.max(0, (frame.y - startY) / triggerDistance)).toFixed(3);
      },
      write: (_frame, progress) => {
        if (progress === last) return;
        wrapper.style.setProperty('--logo-scroll-progress', progress);
        last = progress;
      },
    });

    return () => {
      unsubscribe();
      gate.disconnect();
    };
  }, [wrapperRef]);
}

export function LogoScroll() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  useLogoScrollProgress(wrapperRef);

  return (
    <Wrapper ref={wrapperRef} aria-hidden>
      <Grid src={GRID.src} width={GRID.width} height={GRID.height} alt="" sizes="480px" priority />
    </Wrapper>
  );
}

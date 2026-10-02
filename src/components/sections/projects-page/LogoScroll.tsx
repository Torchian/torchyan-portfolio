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
 * (523px of travel, authored in Figma) shows further down it.
 *
 * The grid is one flattened raster (exported from the "Vector" layer, the
 * same image at both states — only its position differs) rather than the 20+
 * individual thumbnails Figma composites it from: one request instead of
 * twenty, and nothing to lay out at runtime.
 */

const GRID = { src: '/projects/logo-scroll/grid.webp', width: 960, height: 2066 } as const;
const MASK_SRC = "url('/projects/logo-scroll/mask.svg')";

/**
 * The grid's travel inside the mark, authored in Figma as 523px of a 904px-tall
 * image at the mark's 420px design size — expressed as a percentage of the
 * grid's own rendered height so one number holds at every breakpoint; a
 * percentage transform is relative to the element's own box, which already
 * scales with the mark's width.
 */
const TRAVEL_PERCENT = (523 / 904) * 100;

/** How far (px) the page scrolls before the grid is fully panned to its End position. */
const SCROLL_TRIGGER_DISTANCE = 600;

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

/** Scroll-linked pan: 0 at the top of the page, 1 once scrolled SCROLL_TRIGGER_DISTANCE px. */
function useLogoScrollProgress(wrapperRef: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const gate = createInViewGate(wrapper);
    let last = '';

    const unsubscribe = subscribeScroll<string>({
      active: () => gate.current,
      read: (frame) => Math.min(1, Math.max(0, frame.y / SCROLL_TRIGGER_DISTANCE)).toFixed(3),
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

'use client';

import { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { media } from '@/styles/media';

/*
 * Figma: Logo scroll (4043:10874) on the Projects hero — Desktop 1920
 * (3155:9791, 480px), Tablet 1024 (3753:14693, 420px), Mobile 480
 * (3753:17720, 320px). A grid of site thumbnails sits behind the wordmark's
 * "P" shape, masked to it, and appears to pan inside it as the page scrolls.
 *
 * No scroll listener drives this: the grid is a `background-attachment:
 * fixed` image, pinned to the viewport rather than the page. The mark itself
 * is an ordinary element that scrolls with the page as always: since the
 * grid behind it stays still on screen while the mark's mask moves past it,
 * a different slice of the grid shows through as the page scrolls — the
 * same reveal, done by the browser's own compositor on every frame rather
 * than a per-frame style write.
 *
 * Touch browsers don't honour `fixed` (iOS Safari draws it as `scroll`,
 * Android Chrome is inconsistent), so there the component pins the grid
 * itself: on scroll it offsets the background by the element's distance from
 * the viewport top — exactly what `fixed` would have done.
 *
 * The grid is one flattened raster (exported from Figma's "Vector" layer,
 * the same image the two Start/End states differ only by panning) rather
 * than the 20+ individual thumbnails Figma composites it from: one request
 * instead of twenty, and nothing to lay out at runtime.
 */

const GRID_SRC = "url('/projects/logo-scroll/grid.webp')";
const MASK_SRC = "url('/projects/logo-scroll/mask.svg')";

const Wrapper = styled.div`
  flex: none;
  width: 480px;
  height: 480px;
  mask-image: ${MASK_SRC};
  -webkit-mask-image: ${MASK_SRC};
  mask-size: 100% 100%;
  -webkit-mask-size: 100% 100%;
  mask-repeat: no-repeat;
  -webkit-mask-repeat: no-repeat;
  background-image: ${GRID_SRC};
  background-attachment: fixed;
  background-repeat: no-repeat;
  background-position: top;
  background-size: 480px auto;

  /* Parallax reads as motion the page itself never asked for; a viewer who
     prefers less of it gets the same crop, just not pinned to the viewport. */
  ${media.reducedMotion} {
    background-attachment: scroll;
  }

  &[data-pinned='js'] {
    background-attachment: scroll;
    background-position: center calc(var(--pan-y, 0) * 1px);
  }

  ${media.down('xl')} {
    width: 420px;
    height: 420px;
    background-size: 420px auto;
  }

  ${media.down('m')} {
    width: 320px;
    height: 320px;
    background-size: 320px auto;
  }
`;

/** Where `background-attachment: fixed` can't be trusted. */
const TOUCH_QUERY = '(hover: none), (pointer: coarse)';

export function LogoScroll() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia(TOUCH_QUERY).matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    el.dataset.pinned = 'js';
    let frame = 0;
    const update = () => {
      frame = 0;
      el.style.setProperty('--pan-y', String(-el.getBoundingClientRect().top));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      delete el.dataset.pinned;
    };
  }, []);

  return <Wrapper ref={ref} aria-hidden />;
}

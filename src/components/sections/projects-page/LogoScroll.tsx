'use client';

import { preload } from 'react-dom';
import styled, { keyframes } from 'styled-components';
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
 * Android Chrome is inconsistent). There the grid is a layer inside the mark,
 * moved by a scroll-driven animation (`animation-timeline: view()`): it runs
 * on the compositor in step with the scroll, so it can't lag the way a scroll
 * listener does. Across the mark's whole pass through the viewport the layer
 * travels from one screen above to the mark's own height below, which keeps
 * its top on the viewport's top, as `fixed` would. A touch browser without
 * scroll-driven animations gets the grid's top crop, standing still.
 *
 * The grid is one flattened raster (exported from Figma's "Vector" layer,
 * the same image the two Start/End states differ only by panning) rather
 * than the 20+ individual thumbnails Figma composites it from: one request
 * instead of twenty, and nothing to lay out at runtime.
 */

const GRID = '/projects/logo-scroll/grid.webp';
const GRID_SRC = `url('${GRID}')`;
const MASK_SRC = "url('/projects/logo-scroll/mask.svg')";

const TOUCH = '@media (hover: none), (pointer: coarse)';
const SCROLL_DRIVEN = '@supports (animation-timeline: view())';

/** The grid layer's top follows the viewport's top from entry to exit. */
const pan = keyframes`
  from {
    transform: translateY(-100vh);
  }
  to {
    transform: translateY(var(--size));
  }
`;

const Wrapper = styled.div`
  --size: 480px;
  position: relative;
  overflow: clip;
  view-timeline: --logo-scroll;
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

  ${TOUCH} {
    background-attachment: scroll;
  }

  ${SCROLL_DRIVEN} {
    ${TOUCH} {
      background-image: none;
    }
  }

  ${media.down('xl')} {
    --size: 420px;
    width: 420px;
    height: 420px;
    background-size: 420px auto;
  }

  ${media.down('m')} {
    --size: 320px;
    width: 320px;
    height: 320px;
    background-size: 320px auto;
  }
`;

/** The touch-screen grid: absent elsewhere. */
const Pan = styled.div`
  display: none;

  ${SCROLL_DRIVEN} {
    ${TOUCH} {
      position: absolute;
      top: 0;
      left: 0;
      display: block;
      width: 100%;
      aspect-ratio: 960 / 2066;
      background-image: ${GRID_SRC};
      background-size: 100% auto;
      will-change: transform;
      animation: ${pan} linear both;
      animation-timeline: --logo-scroll;

      ${media.reducedMotion} {
        animation: none;
      }
    }
  }
`;

export function LogoScroll() {
  // The grid is the Work page's largest paint, but as a CSS background the
  // browser only finds it once styles apply. Asking for it in the <head> starts
  // it with the HTML.
  preload(GRID, { as: 'image', fetchPriority: 'high' });

  return (
    <Wrapper aria-hidden>
      <Pan />
    </Wrapper>
  );
}

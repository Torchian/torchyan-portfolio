'use client';

import styled from 'styled-components';
import { zIndex } from '@/styles/tokens/z-index';

const Wrapper = styled.div`
  position: fixed;
  inset: 0;
  z-index: ${zIndex.behind};
  pointer-events: none;
  overflow: hidden;
  /* Full-viewport fixed layer: keep it on its own compositor layer so the
     background is rasterised once, not repainted as the page scrolls past it. */
  will-change: transform;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    /* A raster of /vectors/background.svg (the Figma export), 600 × 3983, WebP.
       The SVG draws its glows with ten Gaussian blurs of up to 1000px, which a
       browser re-rasterises on the CPU for every size and scroll tile: about two
       seconds of raster per page load in profiling, blocking the main thread's
       frames. The glows are blurred so far that a small raster of them scales up
       without any visible difference. Re-export from the SVG if it changes. */
    background-image: url('/backgrounds/page-background.webp');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
  }
`;

export function PageBackground() {
  return <Wrapper aria-hidden />;
}

'use client';

import { useLayoutEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import styled from 'styled-components';
import { zIndex } from '@/styles/tokens/z-index';

/** How far an artwork reaches past its span: fractions of the span's height (top, bottom) and width (sides). */
export interface GlowBleed {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface GlowArtwork {
  /** The span starts at the top of this element and runs to the bottom of the page. */
  startSelector: string;
  src: string;
  bleed: GlowBleed;
}

/**
 * Figma page backgrounds: large blurred ellipses behind the content.
 *  - Homepage "Background" (2670:10784): from the Capabilities section to the bottom of the footer.
 *  - Projects page "Background" (3155:9814): the whole page.
 *
 * Both rasters are Figma's own render of that frame (the MCP server's
 * screenshot, not a local re-export): the raw vector — nine overlapping
 * Gaussian-blurred ellipses at 4-15% opacity apiece — renders correctly on
 * Figma's own server but comes out as a ring of solid, saturated colour per
 * ellipse (each one's blur never actually softening it) in a local Chromium
 * at the extreme downscale a 1/8-scale raster needs, independent of which
 * scale the render itself ran at — a renderer difference the next bake
 * cannot assume away; measure the raster it produces before trusting it.
 * Figma's frame screenshot is already clipped to the span, so neither
 * artwork bleeds past it the way the hand-cropped vector export once would
 * have — bleed is 0 on every edge until an un-clipped source exists.
 */
export const GLOW_ARTWORKS: GlowArtwork[] = [
  {
    startSelector: '#capabilities',
    src: '/backgrounds/lower-page-glow.webp',
    bleed: { top: 0, right: 0, bottom: 0, left: 0 },
  },
  {
    startSelector: '#projects-hero',
    src: '/backgrounds/projects-page-glow.webp',
    bleed: { top: 0, right: 0, bottom: 0, left: 0 },
  },
];

/**
 * Grain, laid over the glow to break its banding.
 *
 * The artwork itself is fine — 152 distinct levels down its middle, in bands of
 * 16 to 56px. What breaks it is the scale: a 452px-wide picture stretched over
 * a page thousands of pixels tall, so one of those bands lands on screen a
 * hundred pixels deep. Measured on a 390px phone, the glow crossed 18 levels
 * over a whole screen and held each one for 85px — a step every hundred pixels
 * through a near-black field, which reads as the background being cut into
 * slabs. No re-encoding can help: the levels are there, they are simply spread
 * too thin.
 *
 * The fix is the one every image editor uses for the same problem. A pixel of
 * grain nudges each point a little either way, so the step between two levels
 * falls apart into a mixture of both and the eye stops finding the edge. The
 * texture sits on the backdrop's own colour, so mixing it in adds variation
 * without lightening or darkening the picture — measured at 0.6 of a level
 * against 85 pixels of banding removed.
 */
const DITHER_OPACITY = 0.05;

const Layer = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: ${zIndex.behind};
  overflow: hidden;
  pointer-events: none;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: url('/backgrounds/dither.png') repeat;
    opacity: ${DITHER_OPACITY};
  }
`;

/** The artwork, sized and offset against its span through CSS variables written by the effect. */
const Artwork = styled.div`
  position: absolute;
  top: 0;
  left: calc(var(--glow-bleed-left, 0) * -100%);
  width: calc((1 + var(--glow-bleed-left, 0) + var(--glow-bleed-right, 0)) * 100%);
  height: calc(var(--glow-span, 100%) * (1 + var(--glow-bleed-top, 0) + var(--glow-bleed-bottom, 0)));
  background: var(--glow-image, none) 0 0 / 100% 100% no-repeat;
`;

export interface LowerPageBackgroundProps {
  /** The first artwork whose start element is on the page is shown; none, and the layer stays hidden. */
  artworks?: GlowArtwork[];
}

/**
 * Render as a direct child of a `position: relative` wrapper that contains
 * both the page content and the footer. Re-measured whenever the wrapper
 * changes size (content above the start growing or shrinking changes the
 * wrapper's height too) and on client-side navigation.
 */
export function LowerPageBackground({ artworks = GLOW_ARTWORKS }: LowerPageBackgroundProps) {
  const layerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useLayoutEffect(() => {
    const layer = layerRef.current;
    const scope = layer?.parentElement;
    if (!layer || !scope) return;

    const update = () => {
      let artwork: GlowArtwork | undefined;
      let start: HTMLElement | null = null;
      for (const candidate of artworks) {
        start = scope.querySelector<HTMLElement>(candidate.startSelector);
        if (start) {
          artwork = candidate;
          break;
        }
      }
      layer.hidden = !artwork;
      if (!artwork || !start) return;

      const scopeRect = scope.getBoundingClientRect();
      const spanTop = start.getBoundingClientRect().top - scopeRect.top;
      const span = scopeRect.height - spanTop;
      const { bleed } = artwork;
      // The layer starts where the artwork does; the artwork keeps its designed position against the span.
      layer.style.top = `${Math.round(spanTop - span * bleed.top)}px`;
      layer.style.setProperty('--glow-span', `${Math.round(span)}px`);
      layer.style.setProperty('--glow-image', `url('${artwork.src}')`);
      layer.style.setProperty('--glow-bleed-top', String(bleed.top));
      layer.style.setProperty('--glow-bleed-right', String(bleed.right));
      layer.style.setProperty('--glow-bleed-bottom', String(bleed.bottom));
      layer.style.setProperty('--glow-bleed-left', String(bleed.left));
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(scope);
    return () => observer.disconnect();
  }, [pathname, artworks]);

  // Hidden until measured, so it never flashes in at the top of the page.
  return (
    <Layer ref={layerRef} aria-hidden hidden>
      <Artwork />
    </Layer>
  );
}

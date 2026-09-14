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
 * Neither artwork is clipped to its span in Figma. Each bleeds past it, so it
 * does here too, and is only clipped at the page sides and bottom (where
 * nothing is visible to cut). The blurs are hundreds of units wide, so a
 * 1/8-scale raster looks identical to the vector and costs nothing to paint on
 * scroll, unlike live SVG blur filters.
 */
export const GLOW_ARTWORKS: GlowArtwork[] = [
  {
    startSelector: '#capabilities',
    src: '/backgrounds/lower-page-glow.webp',
    bleed: { top: 0.0871, right: 0.4583, bottom: 0.1278, left: 0.4238 },
  },
  {
    startSelector: '#projects-hero',
    src: '/backgrounds/projects-page-glow.webp',
    bleed: { top: 0.0592, right: 0.4583, bottom: 0.0869, left: 0.4583 },
  },
];

const Layer = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: ${zIndex.behind};
  overflow: hidden;
  pointer-events: none;
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

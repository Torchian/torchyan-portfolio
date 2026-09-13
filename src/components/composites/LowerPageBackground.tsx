'use client';

import { useLayoutEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import styled from 'styled-components';
import { zIndex } from '@/styles/tokens/z-index';

/**
 * One soft coloured glow. Position and size are percentages of the layer, so
 * the composition stretches with the page from the Capabilities section down
 * to the bottom of the footer (Figma: page background, node 2670:10784).
 */
interface Glow {
  /** Centre. */
  x: string;
  y: string;
  /** Horizontal / vertical radius. */
  rx: string;
  ry: string;
  /** Colour as `r, g, b`, and its opacity at the centre. */
  rgb: string;
  alpha: number;
}

/** Top to bottom, as in the Figma frame. */
const GLOWS: Glow[] = [
  // Neutral haze behind the Capabilities heading area.
  { x: '30%', y: '6%', rx: '32%', ry: '8%', rgb: '200, 200, 180', alpha: 0.12 },
  // Indigo top of the large purple glow.
  { x: '55%', y: '26%', rx: '42%', ry: '11%', rgb: '96, 48, 176', alpha: 0.16 },
  // Magenta body of the large purple glow, around Trusted By.
  { x: '48%', y: '40%', rx: '46%', ry: '17%', rgb: '190, 20, 140', alpha: 0.2 },
  // Amber glow under the map.
  { x: '57%', y: '67%', rx: '32%', ry: '9%', rgb: '247, 150, 40', alpha: 0.1 },
  // Olive glow behind the contact form.
  { x: '38%', y: '79%', rx: '32%', ry: '9%', rgb: '190, 200, 40', alpha: 0.1 },
  // Magenta ember at the bottom right, by the footer.
  { x: '78%', y: '94%', rx: '26%', ry: '7%', rgb: '190, 20, 140', alpha: 0.14 },
];

/** A soft falloff (roughly Gaussian) instead of a linear cone. */
const glowGradient = ({ x, y, rx, ry, rgb, alpha }: Glow) =>
  `radial-gradient(${rx} ${ry} at ${x} ${y}, ` +
  `rgba(${rgb}, ${alpha}) 0%, ` +
  `rgba(${rgb}, ${(alpha * 0.55).toFixed(3)}) 40%, ` +
  `rgba(${rgb}, 0) 100%)`;

const Layer = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: ${zIndex.behind};
  pointer-events: none;
  /* Plain gradients rather than blurred shapes: painted once, nothing to
     re-filter while the page scrolls. No base colour, so there's no seam where
     the layer starts. */
  background-image: ${GLOWS.map(glowGradient).join(', ')};
`;

export interface LowerPageBackgroundProps {
  /** The layer starts at the top of this element; it's hidden on pages without one. */
  startSelector?: string;
}

/**
 * Glow background for the lower part of the page. Render it as a direct child
 * of a `position: relative` wrapper that contains both the page content and
 * the footer — it runs from the top of `startSelector` to the bottom of that
 * wrapper. The start offset is re-measured whenever the wrapper changes size
 * (content above the start growing or shrinking changes the wrapper's height
 * too) and on client-side navigation.
 */
export function LowerPageBackground({ startSelector = '#capabilities' }: LowerPageBackgroundProps) {
  const layerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useLayoutEffect(() => {
    const layer = layerRef.current;
    const scope = layer?.parentElement;
    if (!layer || !scope) return;

    const update = () => {
      const start = scope.querySelector<HTMLElement>(startSelector);
      layer.hidden = !start;
      if (!start) return;
      const top = start.getBoundingClientRect().top - scope.getBoundingClientRect().top;
      layer.style.top = `${Math.round(top)}px`;
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(scope);
    return () => observer.disconnect();
  }, [pathname, startSelector]);

  // Hidden until measured, so it never flashes in at the top of the page.
  return <Layer ref={layerRef} aria-hidden hidden />;
}

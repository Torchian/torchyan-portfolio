import { breakpoints, type BreakpointKey } from './tokens/breakpoints';

/**
 * Breakpoint tokens are the Figma frame widths, and each frame is the design up
 * to and including its width: Desktop 1280 covers 1025–1280px, Tablet 1024
 * covers 769–1024px, Mobile 480 covers 321–480px, and so on. A frame's design
 * starts just above the next smaller frame:
 *
 *  - up('xl')          — the 1280 frame and wider  → min-width: 1024.02px
 *  - down('l')         — the frames below 1024     → max-width: 768px
 *  - between('m', 'l') — the 768 frame only        → 480.02px–768px
 *
 * The .02px (rather than a whole pixel) leaves no gap at fractional viewport
 * widths, e.g. when the browser is zoomed.
 */
const ORDER: readonly BreakpointKey[] = ['xs', 's', 'm', 'l', 'xl', 'xxl', 'xxxl'];

/** Width of the next smaller frame — the top of the range below `bp`'s design. */
function below(bp: BreakpointKey) {
  const index = ORDER.indexOf(bp);
  return index <= 0 ? 0 : breakpoints[ORDER[index - 1]];
}

/** Bare queries with the same ranges as `media`, for `window.matchMedia`. */
export const mediaQueries = {
  up: (bp: BreakpointKey) => `(min-width: ${below(bp) + 0.02}px)`,
  down: (bp: BreakpointKey) => `(max-width: ${below(bp)}px)`,
  between: (min: BreakpointKey, max: BreakpointKey) =>
    `(min-width: ${below(min) + 0.02}px) and (max-width: ${below(max)}px)`,
} as const;

export const media = {
  up: (bp: BreakpointKey) => `@media ${mediaQueries.up(bp)}`,
  down: (bp: BreakpointKey) => `@media ${mediaQueries.down(bp)}`,
  between: (min: BreakpointKey, max: BreakpointKey) => `@media ${mediaQueries.between(min, max)}`,
  hover: '@media (hover: hover) and (pointer: fine)',
  reducedMotion: '@media (prefers-reduced-motion: reduce)',
} as const;

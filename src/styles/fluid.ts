import { breakpoints } from './tokens/breakpoints';

const MIN_VP = breakpoints.xs;
const MAX_VP = breakpoints.xl;

/**
 * Generate a CSS clamp() for fluid scaling between mobile and desktop viewports.
 * Returns a string like: clamp(32px, calc(32px + 64 * ((100vw - 320px) / 960)), 96px)
 */
export function fluid(minPx: number, maxPx: number): string {
  if (minPx === maxPx) return `${maxPx}px`;
  const slope = (maxPx - minPx) / (MAX_VP - MIN_VP);
  const intercept = minPx - slope * MIN_VP;
  const preferred = `${intercept.toFixed(4)}px + ${(slope * 100).toFixed(4)}vw`;
  return `clamp(${minPx}px, calc(${preferred}), ${maxPx}px)`;
}

/**
 * Fluid font-size scale. Each value is a clamp() string.
 * Min values (xs viewport) are optically scaled from the max (xl viewport).
 */
export const fluidFontSize = {
  display: {
    xl: fluid(48, 96),
    l: fluid(42, 80),
    m: fluid(38, 72),
    s: fluid(32, 58),
  },
  heading: {
    l: fluid(26, 36),
    m: fluid(22, 28),
    s: fluid(20, 24),
  },
  body: {
    xl: fluid(16, 18),
    l: fluid(15, 16),
    m: fluid(13, 14),
    s: fluid(12, 12),
    xs: fluid(11, 11),
  },
} as const;

/**
 * Fluid line-height scale. Tracks font-size ratios.
 */
export const fluidLineHeight = {
  display: {
    xl: fluid(56, 112),
    l: fluid(50, 96),
    m: fluid(46, 80),
    s: fluid(40, 72),
  },
  heading: {
    l: fluid(34, 48),
    m: fluid(30, 36),
    s: fluid(28, 32),
  },
  body: {
    xl: fluid(22, 24),
    l: fluid(20, 20),
    m: fluid(17, 18),
    s: fluid(16, 16),
    xs: fluid(14, 14),
  },
} as const;

import { breakpoints, type BreakpointKey } from './tokens/breakpoints';

export const media = {
  up: (bp: BreakpointKey) => `@media (min-width: ${breakpoints[bp]}px)`,
  down: (bp: BreakpointKey) => `@media (max-width: ${breakpoints[bp] - 1}px)`,
  between: (min: BreakpointKey, max: BreakpointKey) =>
    `@media (min-width: ${breakpoints[min]}px) and (max-width: ${breakpoints[max] - 1}px)`,
  hover: '@media (hover: hover) and (pointer: fine)',
  reducedMotion: '@media (prefers-reduced-motion: reduce)',
} as const;

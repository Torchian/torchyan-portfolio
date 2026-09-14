/**
 * Per-step visual config for the What I Do sticky column.
 * Upload assets to public/what-i-do/ and update paths.
 *
 * - whatido_grid: Background for steps 0-1 (Frame the problem + Architect the system)
 * - whatido_bg_1: Step 0 - Frame the problem (sticky character starts here)
 * - whatido_bg_2: Step 1 - Architect the system (matches face parts)
 * - whatido_bg_3: Step 2 - Design with intent (character moves behind it, then color change)
 *
 * The line art was Figma's brush strokes exported as SVG (0.75–6.2 MB each, tens
 * of thousands of tiny subpaths). They're WebP now, rendered by Chrome at 2× their
 * on-page size, which looks the same and is 21–241 KB each.
 */
export const WHATIDO_GRID = '/what-i-do/whatido_grid.webp' as const;

export const STEP_BACKGROUNDS = [
  '/what-i-do/whatido_bg_1.webp', // Frame the problem
  '/what-i-do/whatido_bg_2.webp', // Architect the system
  '/what-i-do/whatido_bg_3.webp', // Design with intent
] as const;

/** Height of one step on desktop (px); the scroll reveals measure progress against it too. */
export const STEP_HEIGHT = 960;

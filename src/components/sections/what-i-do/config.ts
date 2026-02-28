/**
 * Per-step visual config for the What I Do sticky column.
 * Upload assets to public/what-i-do/ and update paths.
 *
 * - whatido_grid.svg: Background for steps 0-1 (Frame the problem + Architect the system)
 * - whatido_bg_1.svg: Step 0 - Frame the problem (sticky character starts here)
 * - whatido_bg_2.svg: Step 1 - Architect the system (matches face parts)
 * - whatido_bg_3.svg: Step 2 - Design with intent (character moves behind it, then color change)
 * - whatido_bg_4.svg: Step 3 - Engineer the experience
 */
export const WHATIDO_GRID = '/what-i-do/whatido_grid.svg' as const;

export const STEP_BACKGROUNDS = [
  '/what-i-do/whatido_bg_1.svg', // Frame the problem
  '/what-i-do/whatido_bg_2.svg', // Architect the system
  '/what-i-do/whatido_bg_3.svg', // Design with intent
  '/what-i-do/whatido_bg_4.svg', // Build with precision
] as const;

/** Step 2 (Design with intent) - character goes behind this bg */
export const CHARACTER_BEHIND_STEP_INDEX = 2;

'use client';

import { useEffect, type RefObject } from 'react';
import { createInViewGate, subscribeScroll } from '@/lib/scroll-driver';
import { STEP_HEIGHT } from '@/components/sections/what-i-do/config';

/** "Design with intent" = step index 2 — the remaining character parts reveal on the way into it. */
const REVEAL_AT_STEP_INDEX = 2;

/** Scroll offset (px) into the preceding step before the reveal starts. */
const REVEAL_OFFSET_PX = 200;

/** REVEAL_OFFSET_PX as a fraction of a step's progress. */
const REVEAL_PROGRESS_THRESHOLD = REVEAL_OFFSET_PX / STEP_HEIGHT;

/** "Engineer the experience" = step index 3 — the character colours in across it. */
const EXIT_STEP_INDEX = 3;

/** "Refine and evolve" = step index 4 — the finishing touch: the glasses go on. */
const FINAL_STEP_INDEX = 4;

/** How far (px) past the viewport centre that step's top scrolls before the glasses go on. */
const FINAL_OFFSET_PX = 200;

/**
 * Drives the What I Do visuals from scroll position, as CSS custom properties
 * written onto `hostRef` (a common ancestor of both characters, so they inherit):
 *
 *  - `--grayscale` (1 → 0): the characters' grayscale, fading to colour across
 *    "Engineer the experience".
 *  - `--reveal` (0 → 1): opacity of the character parts that appear on the way
 *    into "Design with intent".
 *  - `--final` (0 | 1): the glasses, put on FINAL_OFFSET_PX of scroll after
 *    "Refine and evolve" becomes the active step. A switch rather than a ramp (the last step has no next step
 *    to measure progress to); the CSS transition does the easing.
 *
 * These used to be returned as React state. `scrollProgress` was a float that
 * changed every frame, so the whole section (both characters, all five steps,
 * every background) re-rendered on every scroll frame — just to compute two
 * values that were only ever used as CSS variables anyway.
 *
 * The active step is the last one whose top has passed the viewport centre;
 * progress is 0–1 across it, measured to the next step's top.
 */
export function useWhatIDoScroll(
  hostRef: RefObject<HTMLElement | null>,
  stepRefs: RefObject<HTMLElement | null>[],
) {
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const gate = createInViewGate(host);
    let lastGrayscale = '';
    let lastReveal = '';
    let lastFinal = '';

    const unsubscribe = subscribeScroll<{ grayscale: string; reveal: string; final: string }>({
      active: () => gate.current,
      read: (frame) => {
        const centre = frame.vh / 2;
        let index = 0;
        let progress = 0;

        for (let i = 0; i < stepRefs.length; i++) {
          const el = stepRefs[i]?.current;
          if (!el) continue;
          const top = frame.rect(el).top;
          // Steps are in document order, so none after this one has passed centre either.
          if (top > centre) break;

          index = i;
          if (i === stepRefs.length - 1) {
            progress = 1;
          } else {
            const next = stepRefs[i + 1]?.current;
            if (next) {
              const segment = frame.rect(next).top - top;
              progress = segment > 0 ? Math.min(1, Math.max(0, (centre - top) / segment)) : 0;
            }
          }
        }

        const finalStep = stepRefs[FINAL_STEP_INDEX]?.current;
        const finalReached = !!finalStep && frame.rect(finalStep).top <= centre - FINAL_OFFSET_PX;

        const grayscale =
          index < EXIT_STEP_INDEX ? 1 : index > EXIT_STEP_INDEX ? 0 : 1 - progress;

        const rawReveal =
          index >= REVEAL_AT_STEP_INDEX ? 1 : index === REVEAL_AT_STEP_INDEX - 1 ? progress : 0;
        const reveal =
          rawReveal <= REVEAL_PROGRESS_THRESHOLD
            ? 0
            : (rawReveal - REVEAL_PROGRESS_THRESHOLD) / (1 - REVEAL_PROGRESS_THRESHOLD);

        // Two decimals is well below what the eye can resolve here (both values
        // also ease through a CSS transition), and it lets the change guard in
        // write() skip most frames outright.
        return {
          grayscale: grayscale.toFixed(2),
          reveal: reveal.toFixed(2),
          final: finalReached ? '1' : '0',
        };
      },
      write: (_frame, { grayscale, reveal, final }) => {
        if (grayscale !== lastGrayscale) {
          host.style.setProperty('--grayscale', grayscale);
          lastGrayscale = grayscale;
        }
        if (reveal !== lastReveal) {
          host.style.setProperty('--reveal', reveal);
          lastReveal = reveal;
        }
        if (final !== lastFinal) {
          host.style.setProperty('--final', final);
          lastFinal = final;
        }
      },
    });

    return () => {
      unsubscribe();
      gate.disconnect();
    };
  }, [hostRef, stepRefs]);
}

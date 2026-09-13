'use client';

import { useEffect, type RefObject } from 'react';
import { createInViewGate, subscribeScroll } from '@/lib/scroll-driver';

/**
 * Fraction of the board SVG's (whatido_bg_1.svg, 1213×1158) height at which the
 * visible BOTTOM double-line sits — measured by pixel-scanning the rendered SVG
 * (bottom line pair at ~0.883/0.891). This is the "cut line": inside the board
 * (above it) the head is pencil; below it the normal colored render shows.
 */
export const BOTTOM_LINE_FRACTION = 0.887;

/**
 * Per-frame, measures where the board's (Bg1's) bottom line falls across the
 * given wrapper and writes two clip insets (in px) as CSS variables on it:
 *
 *  - `--clip-below`: distance from the wrapper's bottom UP to the line. Use it
 *    to hide content BELOW the line: `clip-path: inset(0 0 var(--clip-below) 0)`
 *    (the head's pencil layer — pencil can't exist below the board).
 *  - `--clip-above`: distance from the wrapper's top DOWN to the line. Use it to
 *    hide content ABOVE the line: `clip-path: inset(var(--clip-above) 0 0 0)`
 *    (the head's colored layer).
 *
 * Runs on the shared scroll driver, only while the wrapper is near the viewport,
 * and only writes when an inset actually changed — once the line is fully above
 * or below the wrapper both insets are constant, and every skipped write is a
 * clip-path repaint avoided. Falls back to "colored render only" (pencil hidden)
 * when there's no board to measure or the user prefers reduced motion.
 */
export function useBoardClip(
  wrapperRef: RefObject<HTMLElement | null>,
  boardRef?: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const board = boardRef?.current ?? null;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!board || reduceMotion) {
      // Colored render only: pencil fully clipped away.
      wrapper.style.setProperty('--clip-below', '100%');
      wrapper.style.setProperty('--clip-above', '0px');
      return;
    }

    const gate = createInViewGate(wrapper);
    let lastBelow = NaN;
    let lastAbove = NaN;

    const unsubscribe = subscribeScroll<{ below: number; above: number }>({
      active: () => gate.current,
      read: (frame) => {
        const r = frame.rect(wrapper);
        const b = frame.rect(board);
        const lineY = b.top + b.height * BOTTOM_LINE_FRACTION;
        return {
          below: Math.min(r.height, Math.max(0, r.bottom - lineY)),
          above: Math.min(r.height, Math.max(0, lineY - r.top)),
        };
      },
      write: (_frame, { below, above }) => {
        if (below !== lastBelow) {
          wrapper.style.setProperty('--clip-below', `${below}px`);
          lastBelow = below;
        }
        if (above !== lastAbove) {
          wrapper.style.setProperty('--clip-above', `${above}px`);
          lastAbove = above;
        }
      },
    });

    return () => {
      unsubscribe();
      gate.disconnect();
    };
  }, [wrapperRef, boardRef]);
}

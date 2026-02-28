'use client';

import { useEffect, useState, useCallback, type RefObject } from 'react';

export interface UseWhatIDoScrollResult {
  activeStepIndex: number;
  scrollProgress: number;
}

/**
 * Tracks which step is active and scroll progress between steps.
 * Uses viewport center to determine active step; progress is 0-1 within the active step.
 */
export function useWhatIDoScroll(
  stepRefs: RefObject<HTMLElement | null>[],
  stepCount: number,
): UseWhatIDoScrollResult {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  const update = useCallback(() => {
    const viewportCenter = window.innerHeight / 2;

    let currentIndex = 0;
    let progress = 0;

    for (let i = 0; i < stepCount; i++) {
      const el = stepRefs[i]?.current;
      if (!el) continue;

      const rect = el.getBoundingClientRect();
      const stepTop = rect.top;

      if (stepTop <= viewportCenter) {
        currentIndex = i;
        if (i < stepCount - 1) {
          const nextEl = stepRefs[i + 1]?.current;
          if (nextEl) {
            const nextRect = nextEl.getBoundingClientRect();
            const segmentHeight = nextRect.top - stepTop;
            const scrolled = viewportCenter - stepTop;
            progress =
              segmentHeight > 0 ? Math.min(1, Math.max(0, scrolled / segmentHeight)) : 0;
          }
        } else {
          progress = 1;
        }
      }
    }

    setActiveStepIndex(currentIndex);
    setScrollProgress(progress);
  }, [stepRefs, stepCount]);

  useEffect(() => {
    const rafId = requestAnimationFrame(() => update());
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [update]);

  return { activeStepIndex, scrollProgress };
}

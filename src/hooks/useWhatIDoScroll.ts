'use client';

import { useEffect, useState, useCallback, useRef, type RefObject } from 'react';

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
  const tickingRef = useRef(false);

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
    // Batch reads to at most once per animation frame — a bare 'scroll' listener
    // can fire dozens of times per frame and each call here does several
    // getBoundingClientRect() reads, which forces a synchronous layout each time.
    const requestUpdate = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;
      requestAnimationFrame(() => {
        update();
        tickingRef.current = false;
      });
    };

    requestUpdate();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
    return () => {
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
    };
  }, [update]);

  return { activeStepIndex, scrollProgress };
}

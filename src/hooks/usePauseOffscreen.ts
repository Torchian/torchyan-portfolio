'use client';

import { useEffect, useRef, type RefObject } from 'react';

/**
 * Pauses the CSS animations inside an element while it's off screen.
 *
 * An infinite animation keeps the browser producing frames for as long as the
 * page is open, even where nobody can see it; paused, it costs nothing. Put the
 * returned ref on the animation's container: it gets `data-offscreen="true"`
 * outside the viewport (with a margin, so it's running again before it
 * scrolls in), and the global style pauses every animation under it. Pass a
 * ref the element already has to use that one instead.
 */
export function usePauseOffscreen<T extends Element>(margin = '25%', existing?: RefObject<T | null>) {
  const own = useRef<T>(null);
  const ref = existing ?? own;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => el.setAttribute('data-offscreen', String(!entry.isIntersecting)),
      { rootMargin: `${margin} 0px` },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [margin, ref]);

  return ref;
}

'use client';

import { useEffect, useState, type RefObject } from 'react';

/**
 * Whether the element has come near the screen, or the page has loaded and
 * gone idle, whichever happens first. Latches true.
 *
 * For heavy images below the first screen. The browser's own lazy loading
 * starts them far too early for this: on a slow connection it fetches anything
 * within about 2,500px of the screen, so the What I Do faces and the About
 * timeline downloaded alongside the first screen's image and held it back (on
 * a phone, they shared the connection with the LCP). Rendering them only once
 * this is true keeps the first screen's bytes to the first screen; the idle
 * fallback still has them in before anyone scrolls there.
 */
export function useNearViewport(ref: RefObject<Element | null>, margin = '50% 0px') {
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || near) return;
    const show = () => setNear(true);

    const observer = new IntersectionObserver(([entry]) => entry.isIntersecting && show(), { rootMargin: margin });
    observer.observe(el);

    const hasIdle = typeof window.requestIdleCallback === 'function';
    let handle = 0;
    const afterLoad = () => {
      handle = hasIdle ? window.requestIdleCallback(show, { timeout: 3000 }) : window.setTimeout(show, 1500);
    };
    if (document.readyState === 'complete') afterLoad();
    else window.addEventListener('load', afterLoad, { once: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('load', afterLoad);
      if (hasIdle) window.cancelIdleCallback(handle);
      else window.clearTimeout(handle);
    };
  }, [ref, margin, near]);

  return near;
}

'use client';

import { useEffect, useRef, useState, useMemo, type RefObject } from 'react';

interface UseIntersectionOptions extends IntersectionObserverInit {
  once?: boolean;
}

export function useIntersection<T extends HTMLElement = HTMLDivElement>(
  options: UseIntersectionOptions = {},
): [RefObject<T | null>, boolean] {
  const { once = false, threshold, root, rootMargin } = options;
  const ref = useRef<T>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  const observerOptions = useMemo<IntersectionObserverInit>(
    () => ({ threshold, root, rootMargin }),
    [threshold, root, rootMargin],
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
      if (entry.isIntersecting && once) {
        observer.unobserve(el);
      }
    }, observerOptions);

    observer.observe(el);
    return () => observer.disconnect();
  }, [once, observerOptions]);

  return [ref, isIntersecting];
}

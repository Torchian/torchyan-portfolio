'use client';

import { useState, useRef, useEffect } from 'react';
import { spacing } from '@/styles/tokens/spacing';

const THRESHOLD = spacing[1000];

export function useScrollDirection() {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const down = y > lastY.current && y > THRESHOLD;
      setHidden(down);
      lastY.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return hidden;
}

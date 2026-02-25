'use client';

import { useEffect, useState } from 'react';
import { useThree } from '@react-three/fiber';

interface PerformanceMonitorProps {
  /** Minimum acceptable FPS before triggering quality reduction */
  minFps?: number;
  /** Callback when performance drops below threshold */
  onDecline?: () => void;
}

export function PerformanceMonitor({
  minFps = 30,
  onDecline,
}: PerformanceMonitorProps) {
  const gl = useThree((s) => s.gl);
  const [, setFrameCount] = useState(0);

  useEffect(() => {
    let frames = 0;
    let lastTime = performance.now();
    let animId: number;

    const measure = () => {
      frames++;
      const now = performance.now();
      if (now - lastTime >= 2000) {
        const fps = (frames * 1000) / (now - lastTime);
        if (fps < minFps) {
          gl.setPixelRatio(1);
          onDecline?.();
        }
        frames = 0;
        lastTime = now;
        setFrameCount((c) => c + 1);
      }
      animId = requestAnimationFrame(measure);
    };

    animId = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(animId);
  }, [gl, minFps, onDecline]);

  return null;
}

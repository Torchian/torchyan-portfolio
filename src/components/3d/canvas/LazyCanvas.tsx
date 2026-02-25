'use client';

import React, { type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import type { CanvasProps } from '@react-three/fiber';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

const SceneCanvas = dynamic(
  () => import('./SceneCanvas').then((mod) => ({ default: mod.SceneCanvas })),
  { ssr: false },
);

interface LazyCanvasProps extends Omit<CanvasProps, 'children'> {
  children: ReactNode;
  fallback?: ReactNode;
  className?: string;
}

export function LazyCanvas({
  children,
  fallback = null,
  className,
  ...canvasProps
}: LazyCanvasProps) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <>{fallback}</>;
  }

  return (
    <SceneCanvas className={className} {...canvasProps}>
      {children}
    </SceneCanvas>
  );
}

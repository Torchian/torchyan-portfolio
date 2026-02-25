'use client';

import React, { type ReactNode } from 'react';
import { Canvas, type CanvasProps } from '@react-three/fiber';
import { Preload } from '@react-three/drei';

interface SceneCanvasProps extends Omit<CanvasProps, 'children'> {
  children: ReactNode;
  className?: string;
}

export function SceneCanvas({ children, className, ...canvasProps }: SceneCanvasProps) {
  return (
    <Canvas
      className={className}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      }}
      dpr={[1, 2]}
      {...canvasProps}
    >
      {children}
      <Preload all />
    </Canvas>
  );
}

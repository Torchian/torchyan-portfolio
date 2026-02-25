'use client';

import { Float, Environment } from '@react-three/drei';
import { AutoRotate } from '../primitives/AutoRotate';
import { PerformanceMonitor } from '../primitives/PerformanceMonitor';
import { accents } from '@/styles/tokens/colors';

export function HeroScene() {
  return (
    <>
      <PerformanceMonitor minFps={24} />
      <Environment preset="city" />
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />

      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <AutoRotate speed={0.3}>
          <mesh>
            <torusKnotGeometry args={[1, 0.35, 128, 32]} />
            <meshStandardMaterial
              color={accents.primary}
              roughness={0.2}
              metalness={0.8}
            />
          </mesh>
        </AutoRotate>
      </Float>
    </>
  );
}

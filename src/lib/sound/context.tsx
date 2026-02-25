'use client';

import React, { createContext, useCallback, useEffect, useRef } from 'react';
import { SoundEngine } from './engine';
import { soundRegistry, type SoundId } from './sounds';
import { useUIStore } from '@/store/ui';

interface SoundContextValue {
  play: (id: SoundId) => void;
  setVolume: (value: number) => void;
  toggle: () => void;
  enabled: boolean;
}

export const SoundContext = createContext<SoundContextValue>({
  play: () => {},
  setVolume: () => {},
  toggle: () => {},
  enabled: true,
});

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const engineRef = useRef<SoundEngine | null>(null);
  const initRef = useRef(false);
  const soundEnabled = useUIStore((s) => s.soundEnabled);
  const toggleSound = useUIStore((s) => s.toggleSound);
  const reducedMotion = useUIStore((s) => s.reducedMotion);

  useEffect(() => {
    const engine = SoundEngine.getInstance();
    engine.registerAll(soundRegistry);
    engineRef.current = engine;

    return () => {
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.enabled = soundEnabled && !reducedMotion;
    }
  }, [soundEnabled, reducedMotion]);

  useEffect(() => {
    if (initRef.current) return;

    const handler = () => {
      engineRef.current?.init();
      initRef.current = true;
      window.removeEventListener('click', handler);
      window.removeEventListener('keydown', handler);
      window.removeEventListener('touchstart', handler);
    };

    window.addEventListener('click', handler, { once: true });
    window.addEventListener('keydown', handler, { once: true });
    window.addEventListener('touchstart', handler, { once: true });

    return () => {
      window.removeEventListener('click', handler);
      window.removeEventListener('keydown', handler);
      window.removeEventListener('touchstart', handler);
    };
  }, []);

  const play = useCallback((id: SoundId) => {
    engineRef.current?.play(id);
  }, []);

  const setVolume = useCallback((value: number) => {
    engineRef.current?.setVolume(value);
  }, []);

  const toggle = useCallback(() => {
    toggleSound();
  }, [toggleSound]);

  return (
    <SoundContext.Provider value={{ play, setVolume, toggle, enabled: soundEnabled }}>
      {children}
    </SoundContext.Provider>
  );
}

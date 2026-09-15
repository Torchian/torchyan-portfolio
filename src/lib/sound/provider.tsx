'use client';

import { useEffect } from 'react';
import { installSound } from './engine';
import { installSoundTriggers } from './triggers';

/**
 * Mount once, beside the app (not around it): it renders nothing and never
 * re-renders. The audio graph outlives unmounts, so Strict Mode's double
 * effect in development only re-attaches listeners.
 */
export function SoundProvider() {
  useEffect(() => {
    const uninstallEngine = installSound();
    const uninstallTriggers = installSoundTriggers();
    return () => {
      uninstallTriggers();
      uninstallEngine();
    };
  }, []);

  return null;
}

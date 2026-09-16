'use client';

import { useEffect } from 'react';
import { installSound } from './engine';
import { installSoundTriggers } from './triggers';

/**
 * Mount once, beside the app (not around it): it renders nothing and never
 * re-renders. Unmounting closes the audio graph, so Strict Mode's double effect
 * and development's hot reloads can't leave an orphaned context playing. The
 * context is only ever built on a gesture, so the extra cycle costs nothing.
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

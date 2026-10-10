'use client';

import { useCallback } from 'react';
import { useSyncExternalStore } from 'react';
import { getServerSoundEnabled, isEnabled, setEnabled, subscribeSoundEnabled } from './engine';

/**
 * The one sound switch the visitor sees: the interface sounds and the music
 * bed go on and off together. Call the setter from a click or key handler:
 * switching on may have to start audio, which only a gesture allows.
 */
export function useSoundEnabled() {
  const enabled = useSyncExternalStore(
    subscribeSoundEnabled,
    useCallback(() => isEnabled('effects') && isEnabled('music'), []),
    getServerSoundEnabled,
  );
  const setter = useCallback((next: boolean) => {
    setEnabled('effects', next);
    setEnabled('music', next);
  }, []);
  return [enabled, setter] as const;
}

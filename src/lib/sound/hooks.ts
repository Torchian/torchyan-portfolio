'use client';

import { useCallback } from 'react';
import { useSyncExternalStore } from 'react';
import { getServerSoundEnabled, isEnabled, setEnabled, subscribeSoundEnabled, type AudioKind } from './engine';

/**
 * One of the two switches — `effects` for the interface sounds, `music` for the
 * background bed — and its setter. Call the setter from a click or key handler:
 * switching on may have to start audio, which only a gesture allows.
 */
export function useAudioEnabled(kind: AudioKind) {
  const enabled = useSyncExternalStore(
    subscribeSoundEnabled,
    useCallback(() => isEnabled(kind), [kind]),
    getServerSoundEnabled,
  );
  const setter = useCallback((next: boolean) => setEnabled(kind, next), [kind]);
  return [enabled, setter] as const;
}

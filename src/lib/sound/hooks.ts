'use client';

import { useSyncExternalStore } from 'react';
import { getServerSoundEnabled, getSoundEnabled, setSoundEnabled, subscribeSoundEnabled } from './engine';

/** The visitor's sound preference and its setter — call the setter from a click or key handler. */
export function useSoundEnabled() {
  const enabled = useSyncExternalStore(subscribeSoundEnabled, getSoundEnabled, getServerSoundEnabled);
  return [enabled, setSoundEnabled] as const;
}

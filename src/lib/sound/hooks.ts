'use client';

import { useContext, useCallback } from 'react';
import { SoundContext } from './context';
import type { SoundId } from './sounds';

export function useSoundEngine() {
  return useContext(SoundContext);
}

export function useSound(id: SoundId) {
  const { play, enabled } = useContext(SoundContext);

  const trigger = useCallback(() => {
    play(id);
  }, [play, id]);

  return { play: trigger, enabled };
}

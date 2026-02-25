'use client';

import { create } from 'zustand';
import type { UIStore, ThemeMode } from './types';

export const useUIStore = create<UIStore>((set) => ({
  theme: 'dark',
  soundEnabled: true,
  menuOpen: false,
  reducedMotion: false,

  setTheme: (theme: ThemeMode) => {
    set({ theme });
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
    }
  },

  toggleTheme: () =>
    set((state) => {
      const next = state.theme === 'dark' ? 'light' : 'dark';
      if (typeof window !== 'undefined') {
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
      }
      return { theme: next };
    }),

  setSoundEnabled: (enabled: boolean) => {
    set({ soundEnabled: enabled });
    if (typeof window !== 'undefined') {
      localStorage.setItem('soundEnabled', String(enabled));
    }
  },

  toggleSound: () =>
    set((state) => {
      const next = !state.soundEnabled;
      if (typeof window !== 'undefined') {
        localStorage.setItem('soundEnabled', String(next));
      }
      return { soundEnabled: next };
    }),

  setMenuOpen: (open: boolean) => set({ menuOpen: open }),

  setReducedMotion: (reduced: boolean) => set({ reducedMotion: reduced }),
}));

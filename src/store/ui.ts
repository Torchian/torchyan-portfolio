'use client';

import { create } from 'zustand';
import type { UIStore, ThemeMode } from './types';

export const useUIStore = create<UIStore>((set) => ({
  theme: 'dark',
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

  setMenuOpen: (open: boolean) => set({ menuOpen: open }),

  setReducedMotion: (reduced: boolean) => set({ reducedMotion: reduced }),
}));

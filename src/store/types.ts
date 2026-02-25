export type ThemeMode = 'dark' | 'light';

export interface UIState {
  theme: ThemeMode;
  soundEnabled: boolean;
  menuOpen: boolean;
  reducedMotion: boolean;
}

export interface UIActions {
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  setSoundEnabled: (enabled: boolean) => void;
  toggleSound: () => void;
  setMenuOpen: (open: boolean) => void;
  setReducedMotion: (reduced: boolean) => void;
}

export type UIStore = UIState & UIActions;

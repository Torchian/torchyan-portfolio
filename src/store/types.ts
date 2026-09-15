export type ThemeMode = 'dark' | 'light';

export interface UIState {
  theme: ThemeMode;
  menuOpen: boolean;
  reducedMotion: boolean;
}

export interface UIActions {
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  setMenuOpen: (open: boolean) => void;
  setReducedMotion: (reduced: boolean) => void;
}

export type UIStore = UIState & UIActions;

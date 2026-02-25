import { neutrals, accents } from '../tokens/colors';
import type { AppTheme } from './types';

export const lightTheme: AppTheme = {
  name: 'light',
  colors: {
    bg: {
      primary: neutrals[100],
      secondary: '#ffffff',
      tertiary: neutrals[500],
      inverse: neutrals[900],
    },
    text: {
      primary: neutrals[900],
      secondary: neutrals[800],
      tertiary: neutrals[700],
      inverse: neutrals[100],
      link: accents.primaryDark,
    },
    border: {
      primary: 'rgba(0, 0, 0, 0.08)',
      secondary: 'rgba(0, 0, 0, 0.15)',
      focus: accents.primaryDark,
    },
    accent: {
      primary: accents.primaryDark,
      primaryHover: accents.primary,
      secondary: accents.secondaryDark,
      secondaryHover: accents.secondary,
    },
    status: {
      success: accents.primaryDark,
      warning: '#ca8a04',
      error: '#dc2626',
    },
  },
};

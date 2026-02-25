import { neutrals, accents, transparents } from '../tokens/colors';
import type { AppTheme } from './types';

export const darkTheme: AppTheme = {
  name: 'dark',
  colors: {
    bg: {
      primary: neutrals[900],
      secondary: neutrals[800],
      tertiary: transparents.transparent4,
      inverse: neutrals[100],
    },
    text: {
      primary: neutrals[100],
      secondary: neutrals[500],
      tertiary: neutrals[700],
      inverse: neutrals[900],
      link: accents.primary,
    },
    border: {
      primary: transparents.transparent4,
      secondary: transparents.transparent25,
      focus: accents.primary,
    },
    accent: {
      primary: accents.primary,
      primaryHover: accents.primaryDark,
      secondary: accents.secondary,
      secondaryHover: accents.secondaryDark,
    },
    status: {
      success: accents.primary,
      warning: '#eab308',
      error: '#ef4444',
    },
  },
};

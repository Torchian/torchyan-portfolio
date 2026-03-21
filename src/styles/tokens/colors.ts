// @generated from tokens.json — DO NOT EDIT (base values)
// Hand-crafted additions marked with ← comment

export const neutrals = {
  900: '#0b0915',
  850: '#151126', // ← interpolated for subtle card elevation
  800: '#1f1a38',
  750: '#2d2650', // ← for secondary surfaces
  700: '#a3a3a3',
  600: '#8a8a8a', // ← between 700 and 500
  500: '#bebebe',
  400: '#d0d0d0', // ← between 500 and 100
  300: '#dbdbdb', // ← between 400 and 100
  200: '#e8e8e8', // ← between 300 and 100
  100: '#f6f6f6',
} as const;

export const palette = {
  green: '#0caf0a',
  green800: '#058403',
  purple: '#8a38f5',
  pink: '#c614e6',
  pink800: '#a00abb',
} as const;

export const accents = {
  primary: '#0caf0a',
  primaryDark: '#058403',
  secondary: '#c614e6',
  secondaryDark: '#a00abb',
} as const;

export const transparents = {
  transparent: 'rgba(255, 255, 255, 0)',
  transparent4: 'rgba(255, 255, 255, 0.04)',
  transparent25: 'rgba(255, 255, 255, 0.25)',
} as const;

export const glass = {
  bg: 'rgba(0, 0, 0, 0.04)',
  bgMedium: 'rgba(0, 0, 0, 0.5)',
  border: 'rgba(255, 255, 255, 0.06)',
  borderSubtle: 'rgba(255, 255, 255, 0.04)',
  shadow: 'rgba(0, 0, 0, 0.3)',
  textHover: 'rgba(246, 246, 246, 0.7)',
} as const;

export const blur = {
  xxs: '0.5px',
  xs: '1px',
  sm: '1.5px',
  md: '2px',
  lg: '2.5px',
  xl: '4px',
  glassSmall: '8px',
  glassMedium: '16px',
  glassLarge: '24px',
} as const;

export const elevation = {
  none: 'none',
  low: '0 1px 3px rgba(0, 0, 0, 0.4), 0 1px 2px rgba(0, 0, 0, 0.3)',
  medium: '0 4px 12px rgba(0, 0, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.3)',
  high: '0 12px 32px rgba(0, 0, 0, 0.5), 0 4px 8px rgba(0, 0, 0, 0.3)',
  higher: '0 20px 48px rgba(0, 0, 0, 0.5), 0 8px 16px rgba(0, 0, 0, 0.3)',
} as const;

export const surface = {
  base: neutrals[900],
  raised: neutrals[850],
  overlay: neutrals[800],
  elevated: neutrals[750],
} as const;

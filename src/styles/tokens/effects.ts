// Hand-authored — NOT part of the Figma token export (tokens.json), so
// scripts/generate-tokens.ts never touches this file. These were previously
// appended by hand to the bottom of the auto-generated colors.ts, which
// meant every `npm run tokens` re-run silently deleted them and broke the
// build wherever they were imported. If/when "glass" and "blur" get proper
// Figma variables of their own, add them to tokens.json and move these back
// into the generated file — until then, this is the source of truth.

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

import type { AppTheme } from './themes/types';
import { spacing } from './tokens/spacing';
import { fluidFontSize, fluidLineHeight } from './fluid';

function flattenObject(obj: Record<string, unknown>, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(obj)) {
    const cssKey = prefix ? `${prefix}-${key}` : key;

    if (typeof value === 'object' && value !== null) {
      Object.assign(result, flattenObject(value as Record<string, unknown>, cssKey));
    } else {
      result[cssKey] = String(value);
    }
  }

  return result;
}

export function generateCSSVariables(theme: AppTheme): string {
  const colorVars = flattenObject(theme.colors as unknown as Record<string, unknown>, 'color');
  return Object.entries(colorVars)
    .map(([key, value]) => `--${key}: ${value};`)
    .join('\n    ');
}

export function generateStaticCSSVariables(): string {
  const vars: string[] = [];

  for (const [key, value] of Object.entries(spacing)) {
    vars.push(`--space-${key}: ${value}px;`);
  }

  const fsFlat = flattenObject(fluidFontSize as unknown as Record<string, unknown>, 'fs');
  for (const [key, value] of Object.entries(fsFlat)) {
    vars.push(`--${key}: ${value};`);
  }

  const lhFlat = flattenObject(fluidLineHeight as unknown as Record<string, unknown>, 'lh');
  for (const [key, value] of Object.entries(lhFlat)) {
    vars.push(`--${key}: ${value};`);
  }

  return vars.join('\n    ');
}

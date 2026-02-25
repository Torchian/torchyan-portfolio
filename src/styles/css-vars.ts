import type { AppTheme } from './themes/types';

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
  const flattened = flattenObject(theme.colors as unknown as Record<string, unknown>, 'color');
  return Object.entries(flattened)
    .map(([key, value]) => `--${key}: ${value};`)
    .join('\n    ');
}

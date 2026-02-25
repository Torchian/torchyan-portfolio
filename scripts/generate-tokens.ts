/**
 * Token generation script.
 * Reads tokens.json (Figma export) and generates TypeScript token files.
 *
 * Usage: npx tsx scripts/generate-tokens.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const TOKENS_PATH = path.resolve(__dirname, '..', 'tokens.json');
const OUTPUT_DIR = path.resolve(__dirname, '..', 'src', 'styles', 'tokens');
const HEADER = '// @generated from tokens.json — DO NOT EDIT\n';

interface TokenNode {
  $value?: unknown;
  $type?: string;
  $description?: string;
  [key: string]: unknown;
}

interface TokenTree {
  [key: string]: TokenNode | TokenTree;
}

function readTokens(): TokenTree {
  const raw = fs.readFileSync(TOKENS_PATH, 'utf-8');
  return JSON.parse(raw);
}

function resolveRef(ref: string, root: TokenTree): unknown {
  const stripped = ref.replace(/^\{/, '').replace(/\}$/, '');
  const parts = stripped.split('.');
  let current: unknown = root;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in (current as Record<string, unknown>)) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return ref;
    }
  }
  if (current && typeof current === 'object' && '$value' in (current as Record<string, unknown>)) {
    const val = (current as TokenNode).$value;
    if (typeof val === 'string' && val.startsWith('{')) {
      return resolveRef(val, root);
    }
    return val;
  }
  return current;
}

function resolveValue(value: unknown, root: TokenTree): unknown {
  if (typeof value === 'string' && value.startsWith('{') && value.endsWith('}')) {
    return resolveRef(value, root);
  }
  return value;
}

function toCamelCase(str: string): string {
  return str.replace(/[-_](\w)/g, (_, c) => c.toUpperCase());
}

function toLowerKey(str: string): string {
  if (str === str.toUpperCase()) return str.toLowerCase();
  return str.charAt(0).toLowerCase() + str.slice(1);
}

function roundNum(n: number): number {
  return Math.round(n * 100) / 100;
}

function formatValue(value: unknown): string {
  if (typeof value === 'string') return `'${value}'`;
  if (typeof value === 'number') return String(roundNum(value));
  return String(value);
}

function generateColors(tokens: TokenTree, root: TokenTree): string {
  const colors = tokens.colors as TokenTree;
  const neutrals = colors.neutrals as TokenTree;
  const rawColors = colors.colors as TokenTree;
  const accentsNode = colors.accents as TokenTree;
  const transparentsNode = colors.transparents as TokenTree;

  let out = HEADER + '\n';

  // Neutrals
  out += 'export const neutrals = {\n';
  for (const [key, node] of Object.entries(neutrals)) {
    const n = node as TokenNode;
    const numKey = key.replace('neutral-', '');
    out += `  ${numKey}: ${formatValue(n.$value)},\n`;
  }
  out += '} as const;\n\n';

  // Palette
  out += 'export const palette = {\n';
  for (const [key, node] of Object.entries(rawColors)) {
    const n = node as TokenNode;
    out += `  ${toCamelCase(key)}: ${formatValue(n.$value)},\n`;
  }
  out += '} as const;\n\n';

  // Accents
  out += 'export const accents = {\n';
  for (const [key, node] of Object.entries(accentsNode)) {
    const n = node as TokenNode;
    const resolved = resolveValue(n.$value, root);
    out += `  ${toCamelCase(key)}: ${formatValue(resolved)},\n`;
  }
  out += '} as const;\n\n';

  // Transparents
  out += 'export const transparents = {\n';
  for (const [key, node] of Object.entries(transparentsNode)) {
    const n = node as TokenNode;
    out += `  ${toCamelCase(key)}: ${formatValue(n.$value)},\n`;
  }
  out += '} as const;\n';

  return out;
}

function generateTypography(tokens: TokenTree): string {
  const typo = tokens.typography as TokenTree;
  let out = HEADER + '\n';

  // Font family
  const ff = typo['font-family'] as TokenTree;
  out += 'export const fontFamily = {\n';
  for (const [key] of Object.entries(ff)) {
    out += `  ${key}: 'var(--font-gilroy)',\n`;
  }
  out += '} as const;\n\n';

  // Font weight
  const fw = typo['font-weight'] as TokenTree;
  out += 'export const fontWeight = {\n';
  for (const [key, node] of Object.entries(fw)) {
    const n = node as TokenNode;
    out += `  ${key}: ${n.$value},\n`;
  }
  out += '} as const;\n\n';

  // Font size (nested by scale)
  const fs = typo['font-size'] as TokenTree;
  out += 'export const fontSize = {\n';
  for (const [scale, sizes] of Object.entries(fs)) {
    out += `  ${toLowerKey(scale)}: { `;
    const entries = Object.entries(sizes as TokenTree)
      .map(([size, node]) => `${toLowerKey(size)}: ${(node as TokenNode).$value}`)
      .join(', ');
    out += entries;
    out += ' },\n';
  }
  out += '} as const;\n\n';

  // Line height (handle typos: lilne-height or line-height)
  const lhKey = 'lilne-height' in typo ? 'lilne-height' : 'line-height';
  const lh = typo[lhKey] as TokenTree;
  out += 'export const lineHeight = {\n';
  for (const [scale, sizes] of Object.entries(lh)) {
    const normalizedScale = scale === 'Headline' ? 'heading' : toLowerKey(scale);
    out += `  ${normalizedScale}: { `;
    const entries = Object.entries(sizes as TokenTree)
      .map(([size, node]) => `${toLowerKey(size)}: ${(node as TokenNode).$value}`)
      .join(', ');
    out += entries;
    out += ' },\n';
  }
  out += '} as const;\n\n';

  // Letter spacing
  const ls = typo['letter-spacing'] as TokenTree;
  out += 'export const letterSpacing = {\n';
  for (const [key, node] of Object.entries(ls)) {
    const n = node as TokenNode;
    out += `  ${toLowerKey(key)}: ${roundNum(n.$value as number)},\n`;
  }
  out += '} as const;\n';

  return out;
}

function generateSpacing(tokens: TokenTree, root: TokenTree): string {
  const spacings = tokens.spacings as TokenTree;
  let out = HEADER + '\n';
  out += 'export const spacing = {\n';
  for (const [key, node] of Object.entries(spacings)) {
    const n = node as TokenNode;
    const resolved = resolveValue(n.$value, root);
    out += `  ${key}: ${resolved},\n`;
  }
  out += '} as const;\n\n';
  out += 'export type SpacingKey = keyof typeof spacing;\n';
  return out;
}

function generateBreakpoints(tokens: TokenTree): string {
  const bp = tokens.breakpoints as TokenTree;
  let out = HEADER + '\n';
  out += 'export const breakpoints = {\n';
  for (const [key, entry] of Object.entries(bp)) {
    const n = entry as TokenNode;
    out += `  ${toLowerKey(key)}: ${n.$value},\n`;
  }
  out += '} as const;\n\n';
  out += 'export type BreakpointKey = keyof typeof breakpoints;\n';
  return out;
}

function generateRadius(tokens: TokenTree, root: TokenTree): string {
  const rad = tokens.radiuses as TokenTree;
  let out = HEADER + '\n';
  out += 'export const radius = {\n';
  for (const [key, node] of Object.entries(rad)) {
    const n = node as TokenNode;
    const resolved = resolveValue(n.$value, root);
    const normalizedKey = key === 'Round' ? 'round' : toLowerKey(key);
    out += `  ${normalizedKey}: ${resolved},\n`;
  }
  out += '} as const;\n\n';
  out += 'export type RadiusKey = keyof typeof radius;\n';
  return out;
}

function generateBorder(tokens: TokenTree): string {
  const b = tokens.border as TokenTree;
  let out = HEADER + '\n';
  out += 'export const border = {\n';
  for (const [key, node] of Object.entries(b)) {
    const n = node as TokenNode;
    out += `  ${key}: ${n.$value},\n`;
  }
  out += '} as const;\n\n';
  out += 'export type BorderKey = keyof typeof border;\n';
  return out;
}

function generateOpacity(tokens: TokenTree): string {
  const op = tokens.opacity as TokenTree;
  let out = HEADER + '\n';
  out += 'export const opacity = {\n';
  for (const [key, node] of Object.entries(op)) {
    const n = node as TokenNode;
    const val = Math.min((n.$value as number) / 100, 1.0);
    out += `  ${toLowerKey(key)}: ${roundNum(val)},\n`;
  }
  out += '} as const;\n\n';
  out += 'export type OpacityKey = keyof typeof opacity;\n';
  return out;
}

function generateGrid(tokens: TokenTree, root: TokenTree): string {
  const gs = (tokens.grid_system as TokenTree).breakpoints as TokenTree;
  let out = HEADER + '\n';
  out += 'export const grid = {\n';

  const columnsNode = gs['columns-count'] as TokenNode;
  out += `  columns: ${columnsNode.$value},\n`;

  const marginNode = gs.margin as TokenNode;
  out += `  margin: ${resolveValue(marginNode.$value, root)},\n`;

  const gutterNode = gs.gutter as TokenNode;
  out += `  gutter: ${resolveValue(gutterNode.$value, root)},\n`;

  const maxWidthNode = gs['max-width'] as TokenNode;
  out += `  maxWidth: ${resolveValue(maxWidthNode.$value, root)},\n`;

  out += '} as const;\n';
  return out;
}

function main() {
  const tokens = readTokens();

  const files: [string, string][] = [
    ['colors.ts', generateColors(tokens, tokens)],
    ['typography.ts', generateTypography(tokens)],
    ['spacing.ts', generateSpacing(tokens, tokens)],
    ['breakpoints.ts', generateBreakpoints(tokens)],
    ['radius.ts', generateRadius(tokens, tokens)],
    ['border.ts', generateBorder(tokens)],
    ['opacity.ts', generateOpacity(tokens)],
    ['grid.ts', generateGrid(tokens, tokens)],
  ];

  for (const [filename, content] of files) {
    const filePath = path.join(OUTPUT_DIR, filename);
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`  Generated ${filename}`);
  }

  console.log(`\n  ${files.length} token files generated in src/styles/tokens/`);
}

main();

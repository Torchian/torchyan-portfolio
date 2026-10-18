/*
 * The paintings site's look: a gallery wall. Warm off-white paper, ink-dark
 * text, and one quiet accent; the paintings bring every other colour. Kept
 * apart from the studio site's tokens on purpose — the two sites share code,
 * not a look.
 */
export const paper = {
  wall: '#F4F0E8',
  wallDeep: '#EAE4D8',
  card: '#FBF9F4',
  ink: '#1F1B17',
  inkSoft: '#544C43',
  inkFaint: '#857C71',
  line: 'rgba(31, 27, 23, 0.14)',
  lineStrong: 'rgba(31, 27, 23, 0.28)',
  /** Oxblood, from the varnish on an old frame. */
  accent: '#86372B',
  accentHover: '#6C2B21',
  error: '#A3261A',
  success: '#2F6B3A',
} as const;

export const fonts = {
  serif: "var(--font-paintings-serif), var(--font-paintings-serif-armenian), 'Times New Roman', serif",
  sans: 'var(--font-gilroy), var(--font-armenian-label), var(--font-armenian), system-ui, sans-serif',
} as const;

/** The column everything lines up to. */
export const PAGE_MAX = 1280;
export const gutter = 'clamp(16px, 4vw, 48px)';

/** A painting hung on the wall: a thin dark frame edge and a soft shadow below. */
export const hung = `
  box-shadow:
    0 0 0 1px rgba(31, 27, 23, 0.18),
    0 2px 4px rgba(31, 27, 23, 0.08),
    0 18px 40px -12px rgba(31, 27, 23, 0.35);
`;

/*
 * The catalogue's shapes and fixed lists, apart from the catalogue itself so
 * browser code can use them without shipping every painting's text.
 */

export type Localized = { en: string; ru?: string; hy?: string };

export const THEMES = ['landscape', 'portrait', 'stillLife', 'city', 'other'] as const;
export type PaintingTheme = (typeof THEMES)[number];

export const MEDIA = ['oilOnCanvas', 'oilOnBoard', 'acrylic', 'watercolour', 'pastel', 'mixed'] as const;
export type PaintingMedium = (typeof MEDIA)[number];

export const STATUSES = ['available', 'privateCollection', 'notForSale'] as const;
export type PaintingStatus = (typeof STATUSES)[number];

export interface PaintingDetail {
  /** The close-up's centre on the photo, 0–1 from the left. */
  x: number;
  /** 0–1 from the top. */
  y: number;
  /** How many times larger than the whole painting shown at the same width. */
  zoom: number;
  caption?: Localized;
}

export interface Painting {
  slug: string;
  title: Localized;
  year?: number;
  medium: PaintingMedium;
  /** Canvas size in centimetres, width × height. */
  size?: { width: number; height: number };
  theme: PaintingTheme;
  status: PaintingStatus;
  image: { src: string; width: number; height: number };
  details: PaintingDetail[];
  /** A few paragraphs about the painting; blank lines separate them. */
  story?: Localized;
  /** Shown in the landing page's opening. */
  featured?: boolean;
  /** A stand-in until the real photographs arrive; the site says so while any remain. */
  sample?: boolean;
}


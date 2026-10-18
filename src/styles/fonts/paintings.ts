import { Cormorant_Garamond, Noto_Serif_Armenian } from 'next/font/google';

/*
 * The paintings site's display face: Cormorant Garamond, a classical serif
 * with Cyrillic, for titles and the artist's name. Armenian falls through to
 * Noto Serif Armenian. Imported only by the paintings layout, so the main
 * site never downloads either. Body text stays in Gilroy, shared with the
 * main site.
 */
export const cormorant = Cormorant_Garamond({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-paintings-serif',
  display: 'swap',
});

export const serifArmenian = Noto_Serif_Armenian({
  subsets: ['armenian'],
  weight: ['400', '500'],
  variable: '--font-paintings-serif-armenian',
  display: 'swap',
  preload: false,
});

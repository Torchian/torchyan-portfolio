import type { Locale } from '@/i18n/routing';

/*
 * The paintings: one entry per work, in the order the gallery shows them.
 *
 * Adding a painting:
 *  1. Put its photo in public/paintings/works/ as <slug>.webp — the long side
 *     about 3000px, so the close-ups stay sharp (`npm run paintings:prepare`
 *     makes that file from a camera original).
 *  2. Add an entry below. `image.width` and `image.height` are the file's
 *     pixel size; `size` is the canvas in centimetres.
 *  3. Close-ups (`details`) are not separate files: each is a point on the same
 *     photo (x, y from 0 to 1, from the top-left) and how far to zoom in.
 *
 * Text is per language. Russian and Armenian may be left out while they're
 * being translated; the English shows instead.
 */

import type { Localized, Painting, PaintingTheme } from './types';

export * from './types';

/** One of the stand-in canvases, with three close-ups. */
function sample(
  n: number,
  slug: string,
  title: string,
  year: number,
  theme: PaintingTheme,
  [width, height]: [number, number],
  extra: Partial<Painting> = {},
): Painting {
  return {
    slug,
    title: { en: title },
    year,
    medium: 'oilOnCanvas',
    size: { width: Math.round(width / 20), height: Math.round(height / 20) },
    theme,
    status: n % 3 === 0 ? 'privateCollection' : 'available',
    image: { src: `/paintings/works/placeholder-${String(n).padStart(2, '0')}.webp`, width, height },
    details: [
      { x: 0.3, y: 0.3, zoom: 3 },
      { x: 0.62, y: 0.55, zoom: 3.5 },
      { x: 0.45, y: 0.78, zoom: 2.6 },
    ],
    story: {
      en: 'A sample entry, standing in for one of the paintings until its photograph and story are added.\n\nThe real entry will say where and when it was painted, what it shows, and anything worth knowing about it.',
    },
    sample: true,
    ...extra,
  };
}

export const PAINTINGS: Painting[] = [
  sample(1, 'evening-over-the-hills', 'Evening over the Hills', 2019, 'landscape', [1200, 1600], { featured: true }),
  sample(2, 'spring-meadow', 'Spring Meadow', 2017, 'landscape', [1600, 1200]),
  sample(3, 'pomegranate-dusk', 'Pomegranate Dusk', 2021, 'landscape', [1400, 1400]),
  sample(4, 'still-water', 'Still Water', 2015, 'landscape', [1200, 1500]),
  sample(5, 'harvest-light', 'Harvest Light', 2018, 'landscape', [1600, 1100]),
  sample(6, 'lilac-hour', 'Lilac Hour', 2022, 'other', [1100, 1600]),
  sample(7, 'autumn-road', 'Autumn Road', 2016, 'landscape', [1500, 1200]),
  sample(8, 'old-town-sunset', 'Old Town at Sunset', 2020, 'city', [1300, 1600]),
  sample(9, 'quiet-orchard', 'Quiet Orchard', 2014, 'landscape', [1400, 1400]),
  sample(10, 'green-valley', 'Green Valley', 2023, 'landscape', [1600, 1000]),
  sample(11, 'festival-night', 'Festival Night', 2012, 'city', [1200, 1600]),
  sample(12, 'first-snow', 'First Snow', 2013, 'landscape', [1600, 1200]),
];

export function getPainting(slug: string) {
  return PAINTINGS.find((painting) => painting.slug === slug);
}

/** The painting either side of this one, wrapping round at the ends. */
export function neighbours(slug: string) {
  const index = PAINTINGS.findIndex((painting) => painting.slug === slug);
  const at = (i: number) => PAINTINGS[(i + PAINTINGS.length) % PAINTINGS.length];
  return { previous: at(index - 1), next: at(index + 1) };
}

export function localized(text: Localized | undefined, locale: Locale) {
  if (!text) return '';
  return text[locale] ?? text.en;
}

/** The year he started painting, for the landing page's numbers. [Placeholder until confirmed.] */
export const PAINTING_SINCE = 1985;

export const FEATURED = PAINTINGS.find((painting) => painting.featured) ?? PAINTINGS[0];
export const HAS_SAMPLES = PAINTINGS.some((painting) => painting.sample);

import type { CaseImage } from './caseStudyConfig';

/*
 * The case hero's carousel: two rows of screenshots (it was three — on a
 * laptop screen they took more than the whole height, and the third mostly
 * repeated the first two), each image a file of its own made at exactly the
 * size it's shown.
 *
 * Why its own files: the screenshots are shown cropped to a fixed shape at
 * 299px tall, and through the image optimizer each one was encoded to AVIF on
 * its first request — a case page is opened rarely, so a visitor often waited
 * for all of them. These are made once, ahead of time
 * (`npm run images:carousel`, run again after changing the carousel in
 * caseStudyConfig.ts), and served as they are.
 */

/** Row height on desktop, the largest the carousel draws (tablet 204, phone 205). */
export const CAROUSEL_ROW = 299;
/** The files are made for screens this dense. */
export const CAROUSEL_DENSITY = 2;

/**
 * Two rows from the configured ones: the first two, with any screen the
 * second repeats from the first swapped for an unused one of the same kind
 * (phone or desktop) from the third, so the two rows show as many different
 * screens as there are.
 */
export function carouselRows(rows: CaseImage[][]): CaseImage[][] {
  const [first = [], second = [], ...rest] = rows;
  const used = new Set(first.map((image) => image.src));
  const spare = rest.flat().filter((image) => !used.has(image.src));
  const swapped = second.map((image) => {
    if (!used.has(image.src)) {
      used.add(image.src);
      return image;
    }
    const at = spare.findIndex((s) => Boolean(s.phone) === Boolean(image.phone) && !used.has(s.src));
    if (at === -1) return image;
    const [replacement] = spare.splice(at, 1);
    used.add(replacement.src);
    return replacement;
  });
  return [first, swapped];
}

/** The pixel size a carousel file is made at. */
export function carouselSize(image: CaseImage) {
  const height = CAROUSEL_ROW * CAROUSEL_DENSITY;
  return { width: Math.round(height * image.aspect), height };
}

/** Where an image's carousel file lives: one per source and shape. */
export function carouselSrc(image: CaseImage) {
  const name = image.src
    .replace(/^\/projects\//, '')
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/[^a-z0-9]+/gi, '-');
  return `/projects/carousel/${name}-${Math.round(image.aspect * 1000)}.webp`;
}

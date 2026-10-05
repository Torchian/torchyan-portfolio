/**
 * Projects page (Figma section 3155:8425 — frames 1920 / 1440 / 1024 / 480):
 * the "Single Project" rows and the screenshot collages beside them.
 *
 * Seven rows, one per project in the approved proof inventory, each with its
 * own copy (messages/*.json, projectsPage.showcase.items.<key>) and its own
 * screenshots. Every collage uses the Picsart row's geometry (Figma 3011:9178):
 * up to three tilted columns — wide desktop shots, a narrow phone column, wide
 * desktop shots — so the rows read as one family. A project with no phone
 * screens simply has no middle column.
 *
 * The rows carry the page's colour: each one is a vertical gradient that ends
 * where the next begins, so the list reads as a single wash. The order keeps
 * the colour sequence that was measured and tuned on the 1440 frame
 * (magenta → violet → green → navy → indigo → amber → sand).
 */

/**
 * Where the Projects list runs as a stage (see ProjectsListSection): every row
 * one screen tall, pinned, and swapped by animation. At every width, as long as
 * the window is tall enough under the header: 720 for the side-by-side row,
 * STACKED_STAGE_MIN_HEIGHT for the stacked one (768 and below). In a shorter
 * window the rows simply stack and scroll. STAGE_QUERY is a media query list,
 * so only use it on its own.
 */
export const STAGE_SPLIT_QUERY = '(min-width: 768.02px) and (min-height: 720px)';

/**
 * How tall the stacked row has to be to hold its own content. Measured on a
 * production build at 360 wide — the narrowest real phone, and the widest of
 * the three locales' text (ru and hy carry en's copy verbatim until they have
 * their own translations, so all three measure the same today): Picsart, the
 * longest row, needs 830 before its collage band is a worthwhile 60px rather
 * than a handful of pixels. Below that the band thins out and View Case Story
 * drops off the bottom edge, out of reach — the row is pinned, so there is
 * nothing to scroll to reach it.
 *
 * It is deliberately not the height at which the text merely fits: a band
 * thinner than that is not worth staging for. Narrower than 360 needs more
 * again, but a 320px-wide device is 568px tall, so it never reaches this
 * threshold anyway. Re-measure Picsart's row (the longest copy) if its content
 * changes again, or once ru/hy get real translations that may run longer.
 *
 * ProjectsListSection checks this against the row's real height rather than the
 * media query's; see smallViewportHeight there.
 */
export const STACKED_STAGE_MIN_HEIGHT = 830;

export const STAGE_STACKED_QUERY = `(max-width: 768px) and (min-height: ${STACKED_STAGE_MIN_HEIGHT}px)`;
export const STAGE_QUERY = `${STAGE_SPLIT_QUERY}, ${STAGE_STACKED_QUERY}`;

export interface CollageImage {
  src: string;
  /** Size of the image's box in Figma, for its aspect ratio. */
  width: number;
  height: number;
  /** A 1px light outline around the screenshot. */
  outlined?: boolean;
}

/**
 * A stack of screenshots in the project's media box (px, as in Figma's 948 × 640
 * box). Tilted collages place the stack by its centre, flat ones by its top-left.
 */
export interface CollageStack {
  x: number;
  y: number;
  width: number;
  /** Figma's own box height when it's shorter than the images; they overflow its bottom as there. */
  height?: number;
  gap?: number;
  images: CollageImage[];
}

/** The two isometric tilts used in the design, or none. */
export type CollageTilt = 'clockwise' | 'counterClockwise' | 'none';

export interface Collage {
  tilt: CollageTilt;
  stacks: CollageStack[];
  /** The media box the coordinates were measured in; the 1920 frame's 948 × 576 unless given. */
  frame?: { width: number; height: number };
}

/** Which copy a row shows, from messages/*.json under projectsPage.showcase.items. */
export type ShowcaseContentKey =
  | 'picsart'
  | 'smartbet'
  | 'soulone'
  | 'ginosi'
  | 'brainstorm'
  | 'benzeen'
  | 'worldEducation';

export interface ShowcaseProject {
  id: string;
  content: ShowcaseContentKey;
  href: string;
  collage: Collage;
  /** The row's own slice of the page-long gradient. */
  background: string;
  /** How dark the row is, which decides whether its text is light or dark. */
  tone: 'dark' | 'light';
}

const DESKTOP = { width: 1366, height: 757 };

const shot = (set: string, name: string, size: { width: number; height: number }): CollageImage => ({
  src: `/projects/collages/${set}/${name}.webp`,
  ...size,
});

/**
 * The Picsart row's three columns (Figma 3011:9178, measured in its 908 × 708
 * media box): wide shots, then a narrow phone column, then wide shots again.
 * Other projects reuse the same placement with their own screenshots.
 */
const FRAME = { width: 908, height: 708 };
const COLUMN_A = { x: 443.94, y: 5.65, width: 516.42, height: 1534.2, gap: 32 };
const COLUMN_PHONE = { x: 562.91, y: 300.68, width: 137.93, height: 1587.61, gap: 32 };
const COLUMN_B = { x: 664.72, y: 605.34, width: 516.42, height: 1534.2, gap: 32 };

/**
 * Repeats a column's screenshots until they cover its full length. The columns
 * slide in along their own length on the stage, so a column with two short
 * screenshots would otherwise show its images at one end and bare background
 * along the rest.
 */
function fill(column: { width: number; height: number; gap: number }, images: CollageImage[]): CollageImage[] {
  if (!images.length) return images;
  const out: CollageImage[] = [];
  let length = 0;
  for (let i = 0; length < column.height; i++) {
    const image = images[i % images.length];
    out.push(image);
    length += (column.width * image.height) / image.width + column.gap;
  }
  return out;
}

function tiltedCollage(wideA: CollageImage[], phones: CollageImage[], wideB: CollageImage[]): Collage {
  return {
    tilt: 'clockwise',
    frame: FRAME,
    stacks: [
      { ...COLUMN_A, images: fill(COLUMN_A, wideA) },
      ...(phones.length ? [{ ...COLUMN_PHONE, images: fill(COLUMN_PHONE, phones) }] : []),
      { ...COLUMN_B, images: fill(COLUMN_B, wideB) },
    ],
  };
}

/** An image anywhere under public/, at its own pixel size (its aspect ratio is all that's used). */
const img = (src: string, width: number, height: number): CollageImage => ({ src, width, height });

const PICSART = tiltedCollage(
  ['marketplace-feed', 'marketplace-item', 'marketplace-search', 'discovery-collections', 'discovery-templates'].map(
    (name) => shot('picsart', name, DESKTOP),
  ),
  [
    shot('picsart', 'mobile-feed', { width: 830, height: 1804 }),
    shot('picsart', 'mobile-item', { width: 830, height: 1804 }),
    shot('picsart', 'mobile-search', { width: 830, height: 1712 }),
    shot('picsart', 'mobile-profile', { width: 830, height: 1806 }),
    shot('picsart', 'mobile-collections', { width: 830, height: 1806 }),
  ],
  ['marketplace-filters', 'marketplace-creator', 'discovery-home', 'marketplace-editor', 'discovery-collections'].map(
    (name) => shot('picsart', name, DESKTOP),
  ),
);

/** Smartbet's company website — the pages of the site, not the betting product. */
const SMARTBET_WIDE = { width: 1280, height: 709 };
const SMARTBET_PHONE = { width: 486, height: 864 };
const SMARTBET = tiltedCollage(
  ['about-our-vision', 'products-overview', 'platform-smart-connect', 'gaming-casino', 'careers'].map((name) =>
    shot('smartbet', name, SMARTBET_WIDE),
  ),
  ['mobile-our-vision', 'mobile-our-mission', 'mobile-smart-sports', 'mobile-smart-feed', 'mobile-kaboom'].map((name) =>
    shot('smartbet', name, SMARTBET_PHONE),
  ),
  ['products-smart-sports', 'platform-smart-control', 'providers', 'ice', 'about-our-vision'].map((name) =>
    shot('smartbet', name, SMARTBET_WIDE),
  ),
);

const SOULONE = tiltedCollage(
  [img('/selected-work/soulone/grid/s-c1.webp', 1366, 3949), img('/selected-work/soulone/grid/s-a2.webp', 1366, 1533)],
  [
    img('/selected-work/soulone/grid/s-b1.webp', 415, 3618),
    img('/selected-work/soulone/grid/s-b3.webp', 415, 3559),
  ],
  [img('/selected-work/soulone/grid/s-c3.webp', 1366, 2754), img('/selected-work/soulone/grid/s-c2.webp', 1333, 4096)],
);

const GINOSI = tiltedCollage(
  [img('/selected-work/various/ginosi-search.webp', 1920, 1265), img('/projects/collages/websites/ginosi-downtown.webp', 673, 319)],
  [],
  [img('/selected-work/various/ginosi-apartel.webp', 1903, 903), img('/projects/collages/websites/ginosi-search.webp', 673, 443)],
);

const BRAINSTORM = tiltedCollage(
  [img('/selected-work/various/brainstormtech.webp', 1082, 4096)],
  [],
  [img('/projects/collages/websites/brainstorm-services.webp', 673, 2548)],
);

const BENZEEN = tiltedCollage(
  [img('/selected-work/various/benzeen-alfa.webp', 1903, 903), img('/projects/collages/websites/benzeen-wheel.webp', 673, 2320)],
  [],
  [img('/selected-work/various/benzeen-wheel.webp', 1188, 4096)],
);

const WORLD_EDUCATION = tiltedCollage(
  [img('/selected-work/various/world-services.webp', 3584, 1994), img('/selected-work/various/world-study.webp', 3584, 1994)],
  [],
  [img('/selected-work/various/world-study.webp', 3584, 1994), img('/selected-work/various/world-services.webp', 3584, 1994)],
);

/** Each row hands its closing colour to the next, so the list reads as one gradient. */
const band = (from: string, to: string) => `linear-gradient(180deg, ${from} 0%, ${to} 100%)`;

export const SHOWCASE_PROJECTS: ShowcaseProject[] = [
  {
    id: 'picsart',
    content: 'picsart',
    href: '/projects/picsart',
    collage: PICSART,
    background: band('#920792', '#1C014A'),
    tone: 'dark',
  },
  {
    id: 'smartbet',
    content: 'smartbet',
    href: '/projects/smartbet',
    collage: SMARTBET,
    background: band('#1C014A', '#20520F'),
    tone: 'dark',
  },
  {
    id: 'soulone',
    content: 'soulone',
    href: '/projects/soulone',
    collage: SOULONE,
    background: band('#20520F', '#102649'),
    tone: 'dark',
  },
  {
    id: 'ginosi',
    content: 'ginosi',
    href: '/projects/ginosi',
    collage: GINOSI,
    background: band('#102649', '#5C4AC0'),
    tone: 'dark',
  },
  {
    id: 'brainstorm',
    content: 'brainstorm',
    href: '/projects/brainstorm',
    collage: BRAINSTORM,
    background: band('#5C4AC0', '#DE9E3C'),
    tone: 'dark',
  },
  {
    id: 'benzeen',
    content: 'benzeen',
    href: '/projects/benzeen',
    collage: BENZEEN,
    background: band('#DE9E3C', '#927F3D'),
    tone: 'light',
  },
  {
    id: 'world-education',
    content: 'worldEducation',
    href: '/projects/world-education',
    collage: WORLD_EDUCATION,
    background: band('#927F3D', '#B6955F'),
    tone: 'light',
  },
];

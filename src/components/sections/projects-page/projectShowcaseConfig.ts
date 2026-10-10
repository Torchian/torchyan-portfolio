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

/**
 * A column of screens, each shown once, in the order given. Unlike `fill` it
 * never repeats a screen: if the ones given don't reach the length the row
 * needs it stops the build, so a row can't ship with bare background showing
 * at the end of a column. `need` is that length in design px, measured from the
 * columns' tilted footprint against the 908 × 708 frame (not the full
 * `column.height`, most of which sits past the frame's edge).
 */
function solid(
  label: string,
  column: { width: number; gap: number },
  images: CollageImage[],
  need: number,
) {
  const length = images.reduce(
    (sum, image, i) => sum + (column.width * image.height) / image.width + (i ? column.gap : 0),
    0,
  );
  if (length < need) {
    throw new Error(`${label}: its screens run ${Math.round(length)} px, the row needs ${need}`);
  }
  return images;
}

/**
 * With no phone screens: two big desktop columns, 640 wide, centred on the
 * frame and staggered along their length. Tilted, two of the Picsart row's 516px
 * columns leave a third of the frame bare; at 640 the pair covers it all, with
 * only the gap between them showing. Placed by centre, the box as tall as its
 * screens, so each needs 1300 px of them.
 */
const TWO_A = { x: 256.5, y: 139.5, width: 640, gap: 32 };
const TWO_B = { x: 651.5, y: 568.5, width: 640, gap: 32 };
const TWO_NEED = 1300;
/** With phones: the Picsart geometry; A and the phone column fill their full length, B needs 1350 of its 1534. */
const THREE_NEED = { A: 1534, phones: 1534, B: 1350 } as const;

/** Two big columns, every screen shown once. */
function twoColumns(label: string, left: CollageImage[], right: CollageImage[]): Collage {
  return {
    tilt: 'clockwise',
    frame: FRAME,
    stacks: [
      { ...TWO_A, images: solid(`${label} left`, TWO_A, left, TWO_NEED) },
      { ...TWO_B, images: solid(`${label} right`, TWO_B, right, TWO_NEED) },
    ],
  };
}

/** Wide, phone, wide — as `tiltedCollage`, with every screen shown once. */
function threeColumns(label: string, wideA: CollageImage[], phones: CollageImage[], wideB: CollageImage[]): Collage {
  return {
    tilt: 'clockwise',
    frame: FRAME,
    stacks: [
      { ...COLUMN_A, images: solid(`${label} A`, COLUMN_A, wideA, THREE_NEED.A) },
      { ...COLUMN_PHONE, images: solid(`${label} phones`, COLUMN_PHONE, phones, THREE_NEED.phones) },
      { ...COLUMN_B, images: solid(`${label} B`, COLUMN_B, wideB, THREE_NEED.B) },
    ],
  };
}

/** A screen chosen in Figma for a project's row (public/projects/collages/work/<project>/), at its pixel size. */
const work = (project: string, name: string, width: number, height: number): CollageImage => ({
  src: `/projects/collages/work/${project}/${name}.webp`,
  width,
  height,
});

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
  [img('/selected-work/soulone/grid/s-c1-v2.webp', 1366, 3949), img('/selected-work/soulone/grid/s-a2-v2.webp', 1366, 1533)],
  [
    img('/selected-work/soulone/grid/s-b1-v2.webp', 415, 3618),
    img('/selected-work/soulone/grid/s-b3-v2.webp', 415, 3559),
  ],
  [img('/selected-work/soulone/grid/s-c3-v2.webp', 1366, 2754), img('/selected-work/soulone/grid/s-c2-v2.webp', 1333, 4096)],
);

/*
 * The four website rows: screens picked from each project's Figma set, each
 * shown once. Ginosi, Brainstorm and Benzeen have no phone screens, so two big
 * desktop columns; World Education has them, so three.
 */
const GINOSI = twoColumns(
  'Ginosi',
  [work('ginosi', 'apartel', 1296, 780), work('ginosi', 'home', 1064, 498), work('ginosi', 'castelldefels', 1296, 1876)],
  [
    work('ginosi', 'location-list', 1294, 1754),
    work('ginosi', 'downtown-search', 1296, 1542),
    work('ginosi', 'news', 1294, 854),
  ],
);

const BRAINSTORM = twoColumns(
  'Brainstorm',
  [work('brainstorm', 'build', 1400, 2369), work('brainstorm', 'ideas', 1400, 1837), work('brainstorm', 'talk', 1400, 660)],
  [work('brainstorm', 'round2', 1400, 1837), work('brainstorm', 'graphic', 1400, 1410), work('brainstorm', 'imagine', 1400, 1315)],
);

const BENZEEN = twoColumns(
  'Benzeen',
  [work('benzeen', 'about', 793, 1084), work('benzeen', 'contact', 1358, 1150), work('benzeen', 'recent-arrivals', 1084, 1206)],
  [work('benzeen', 'homepage', 1356, 970), work('benzeen', 'cut-sheets', 1358, 1156), work('benzeen', 'wheel', 1188, 1272)],
);

const WORLD_EDUCATION = threeColumns(
  'World Education',
  [
    work('world-education', 'connect', 1241, 690),
    work('world-education', 'services', 1241, 690),
    work('world-education', 'article', 1241, 690),
    work('world-education', 'howto', 1241, 690),
    work('world-education', 'about', 1241, 690),
  ],
  [
    work('world-education-mobile', 'pricing', 342, 1188),
    work('world-education-mobile', 'about', 342, 1124),
    work('world-education-mobile', 'studyabroad9', 342, 1070),
    work('world-education-mobile', 'studyabroad7', 342, 1052),
    work('world-education-mobile', 'studyabroad6', 342, 982),
  ],
  [
    work('world-education', 'prices', 1241, 690),
    work('world-education', 'discover', 1241, 690),
    work('world-education', 'blog', 1240, 634),
    work('world-education', 'insights', 1239, 581),
    work('world-education', 'partners', 1238, 489),
  ],
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
    tone: 'dark',
  },
  {
    id: 'world-education',
    content: 'worldEducation',
    href: '/projects/world-education',
    collage: WORLD_EDUCATION,
    background: band('#927F3D', '#B6955F'),
    tone: 'dark',
  },
];

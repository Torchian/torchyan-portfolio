/**
 * Projects page (Figma section 3155:8425 — frames 1920 / 1440 / 1024 / 480):
 * the "Single Project" rows and the screenshot collages beside them.
 *
 * Only the titles are final. Every row still shares one description, tech stack
 * and the Picsart collage (Figma 3011:9178); swap in each project's real content
 * here as it arrives. The copy lives in messages/*.json under
 * projectsPage.showcase.
 *
 * The rows carry the page's colour: each one is a vertical gradient that ends
 * where the next begins, so the ten together read as a single wash from
 * Picsart's magenta round to By Robyn Blair's pink. Sampled from the 1440 frame.
 */

/**
 * Where the Projects list runs as a stage (see ProjectsListSection): every row
 * one screen tall, pinned, and swapped by animation. At every width, as long as
 * the window is tall enough under the header: 720 for the side-by-side row,
 * 560 for the stacked one (768 and below). In a shorter window the rows simply
 * stack. STAGE_QUERY is a media query list, so only use it on its own.
 */
export const STAGE_SPLIT_QUERY = '(min-width: 768.02px) and (min-height: 720px)';
export const STAGE_STACKED_QUERY = '(max-width: 768px) and (min-height: 560px)';
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
  | 'worldEducation'
  | 'infinityRings'
  | 'offMyCase'
  | 'byRobynBlair';

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

/** Figma: Single Project, Name=Picsart (3011:9178): three columns in its 908 × 708 media box. */
const PICSART: Collage = {
  tilt: 'clockwise',
  frame: { width: 908, height: 708 },
  stacks: [
    {
      x: 443.94,
      y: 5.65,
      width: 516.42,
      height: 1534.2,
      gap: 32,
      images: ['marketplace-feed', 'marketplace-item', 'marketplace-search', 'discovery-collections', 'discovery-templates'].map(
        (name) => shot('picsart', name, DESKTOP),
      ),
    },
    {
      x: 562.91,
      y: 300.68,
      width: 137.93,
      height: 1587.61,
      gap: 32,
      images: [
        shot('picsart', 'mobile-feed', { width: 830, height: 1804 }),
        shot('picsart', 'mobile-item', { width: 830, height: 1804 }),
        shot('picsart', 'mobile-search', { width: 830, height: 1712 }),
        shot('picsart', 'mobile-profile', { width: 830, height: 1806 }),
        shot('picsart', 'mobile-collections', { width: 830, height: 1806 }),
      ],
    },
    {
      x: 664.72,
      y: 605.34,
      width: 516.42,
      height: 1534.2,
      gap: 32,
      images: ['marketplace-filters', 'marketplace-creator', 'discovery-home', 'marketplace-editor', 'discovery-collections'].map(
        (name) => shot('picsart', name, DESKTOP),
      ),
    },
  ],
};

/** Each row hands its closing colour to the next, so the list reads as one gradient. */
const band = (from: string, to: string) => `linear-gradient(180deg, ${from} 0%, ${to} 100%)`;

export const SHOWCASE_PROJECTS: ShowcaseProject[] = [
  {
    id: 'picsart-marketplace',
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
    collage: PICSART,
    background: band('#1C014A', '#20520F'),
    tone: 'dark',
  },
  {
    id: 'soulone',
    content: 'soulone',
    href: '/projects/soulone',
    collage: PICSART,
    background: band('#20520F', '#102649'),
    tone: 'dark',
  },
  {
    id: 'ginosi',
    content: 'ginosi',
    href: '/projects/ginosi',
    collage: PICSART,
    background: band('#102649', '#5C4AC0'),
    tone: 'dark',
  },
  {
    id: 'brainstorm',
    content: 'brainstorm',
    href: '/projects/brainstorm',
    collage: PICSART,
    background: band('#5C4AC0', '#DE9E3C'),
    tone: 'dark',
  },
  {
    id: 'benzeen',
    content: 'benzeen',
    href: '/projects/benzeen',
    collage: PICSART,
    background: band('#DE9E3C', '#927F3D'),
    tone: 'light',
  },
  {
    id: 'world-education',
    content: 'worldEducation',
    href: '/projects/world-education',
    collage: PICSART,
    background: band('#927F3D', '#B6955F'),
    tone: 'light',
  },
  {
    id: 'infinity-rings',
    content: 'infinityRings',
    href: '/projects/infinity-rings',
    collage: PICSART,
    background: band('#B6955F', '#F6CEC1'),
    tone: 'light',
  },
  {
    id: 'off-my-case',
    content: 'offMyCase',
    href: '/projects/off-my-case',
    collage: PICSART,
    background: band('#F6CEC1', '#FF8DAA'),
    tone: 'light',
  },
  {
    id: 'by-robyn-blair',
    content: 'byRobynBlair',
    href: '/projects/by-robyn-blair',
    collage: PICSART,
    background: band('#FF8DAA', '#FF8DAA'),
    tone: 'light',
  },
];

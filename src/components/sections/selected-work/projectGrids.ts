/**
 * Selected Work screenshot grids, as laid out in Figma:
 * Smartbet 2283:1279, Picsart 2311:2405, Soulone 2346:512, Various (all projects) 2350:656.
 *
 * Every grid has a design frame per screen: desktop 1440 × 680 (Default and
 * Hover), tablet 976 × 680 (State3) and mobile 448 × 680 (State4). The card
 * scales that frame to cover its media box, so these are all frame px.
 */

export type GridScreen = 'desktop' | 'tablet' | 'mobile';

/** A point in a grid's design frame, in px. */
export type FramePoint = readonly [x: number, y: number];

export const GRID_FRAMES: Record<GridScreen, { width: number; height: number }> = {
  desktop: { width: 1440, height: 680 },
  tablet: { width: 976, height: 680 },
  mobile: { width: 448, height: 680 },
};

export interface GridImage {
  src: string;
  /** The tile's width ÷ height in the design; the screenshot covers it. */
  aspect: number;
  /** CSS object-position, where the design crops a screenshot away from its centre. */
  position?: string;
  /** Only in the design on this screen. */
  only?: GridScreen;
}

/**
 * A column of screenshots projected onto the isometric plane (Figma: rotate ±30°,
 * skew ∓30°, scaleY 86.6%). Positions are the projected column's centre: Figma's
 * bounding box left + width / 2, top + height / 2.
 */
export interface IsometricColumn {
  /** Desktop width in px, before projection; tablet and mobile scale it by the grid's `scale`. */
  width: number;
  images: GridImage[];
  /** Centre per screen, plus `hover`: where the column slides to while the desktop grid is hovered. */
  center: Record<GridScreen | 'hover', FramePoint>;
}

export interface IsometricGrid {
  kind: 'isometric';
  /** Which way the columns run down the screen. */
  axis: 'down-right' | 'down-left';
  /** Column width and gap per screen, relative to desktop. */
  scale: Record<GridScreen, number>;
  columns: IsometricColumn[];
}

/** An upright column: top-left corner and width per screen; on desktop hover it slides to `hoverTop`. */
export interface FlatColumn {
  images: GridImage[];
  frame: Record<GridScreen, { left: number; top: number; width: number }>;
  hoverTop: number;
}

export interface FlatGrid {
  kind: 'flat';
  columns: FlatColumn[];
}

export type ProjectGrid = IsometricGrid | FlatGrid;

/** Gap between isometric tiles at desktop size. */
export const ISOMETRIC_GAP = 32;
/** Gap between flat tiles, per this much column width (27px in a 336.25px column). */
export const FLAT_GAP_RATIO = 27 / 336.25;

const tiles =
  (folder: string) =>
  (file: string, aspect: number, options?: Pick<GridImage, 'position' | 'only'>): GridImage => ({
    src: `/selected-work/${folder}/${file}`,
    aspect,
    ...options,
  });

/* ---------- Smartbet ---------- */

const smartbet = tiles('smartbet');
const SMARTBET_SHOT = 3584 / 1994;
const SMARTBET_PAGE = 2732 / 1514;
const SMARTBET_PHONE = 750 / 1334;

export const SMARTBET_GRID: IsometricGrid = {
  kind: 'isometric',
  axis: 'down-right',
  scale: { desktop: 1, tablet: 0.8113, mobile: 0.6171 },
  columns: [
    {
      width: 640,
      images: [
        smartbet('Screenshot 2025-11-05 at 17.31.10 15.28.58.webp', SMARTBET_SHOT),
        smartbet('Products - Smart Sports.webp', SMARTBET_PAGE),
        smartbet('Platform Proiducts - Smart Connect.webp', SMARTBET_PAGE),
        smartbet('Screenshot 2025-11-05 at 17.32.26 15.28.58.webp', SMARTBET_SHOT),
        smartbet('Home.webp', SMARTBET_PAGE),
      ],
      center: { desktop: [540.45, 754.71], hover: [228.69, 574.71], tablet: [447.8, 713.64], mobile: [263.18, 688.5] },
    },
    {
      width: 243.196,
      images: [
        smartbet('Kaboom.webp', SMARTBET_PHONE),
        smartbet('Smart Sports Copy 3.webp', SMARTBET_PHONE),
        smartbet('Smart Feed.webp', SMARTBET_PHONE),
        smartbet('About Company - Our Mission.webp', SMARTBET_PHONE),
      ],
      center: { desktop: [544.48, 283.43], hover: [830.27, 448.43], tablet: [451.07, 331.29], mobile: [274.32, 392.68] },
    },
    {
      width: 640,
      images: [
        smartbet('Providers.webp', SMARTBET_PAGE),
        smartbet('Screenshot 2025-11-05 at 17.33.22 15.28.58.webp', SMARTBET_SHOT),
        smartbet('Careers.webp', SMARTBET_PAGE),
        smartbet('Gaming Proiducts - Casino.webp', SMARTBET_PAGE),
        smartbet('About - Our Vision.webp', SMARTBET_PAGE),
      ],
      center: { desktop: [1426.53, 319.09], hover: [906.92, 19.09], tablet: [560.47, 10.22], mobile: [99.15, -10.72] },
    },
  ],
};

/* ---------- Picsart ---------- */

const picsart = tiles('picsart');
const PICSART_PAGE = 1366 / 757;

export const PICSART_GRID: IsometricGrid = {
  kind: 'isometric',
  axis: 'down-left',
  scale: { desktop: 1, tablet: 0.8504, mobile: 0.6521 },
  columns: [
    {
      width: 640,
      images: [
        picsart('Screenshot 2026-01-26 at 19.54.03.webp', PICSART_PAGE),
        picsart('Screenshot 2026-01-26 at 19.55.01.webp', PICSART_PAGE),
        picsart('Screenshot 2026-01-26 at 19.54.41.webp', PICSART_PAGE),
        picsart('Screenshot 2026-01-26 at 20.05.59.webp', PICSART_PAGE),
        picsart('Screenshot 2025-11-05 at 17.23.58.webp', PICSART_PAGE),
      ],
      center: { desktop: [525.49, 14.68], hover: [58.7, 284.18], tablet: [398.41, 5.38], mobile: [280.13, 4.31] },
    },
    {
      width: 170.938,
      images: [
        picsart('Screenshot 2026-01-26 at 20.22.35.webp', 830 / 1804),
        picsart('Screenshot 2026-01-26 at 20.22.48.webp', 830 / 1804),
        picsart('Screenshot 2026-01-26 at 20.07.43.webp', 830 / 1712),
        picsart('Screenshot 2026-01-26 at 20.11.32.webp', 830 / 1806),
        picsart('Screenshot 2026-01-26 at 20.11.54.webp', 830 / 1806),
      ],
      /* Hover isn't in the Figma variant (it only moves the first column): 400px up-right, against the
         outer columns like Smartbet and Soulone, short of where the column's lower end would show. */
      center: { desktop: [546.39, 440.08], hover: [892.8, 240.08], tablet: [589.39, 267.14], mobile: [215.81, 336.71] },
    },
    {
      width: 640,
      images: [
        picsart('Screenshot 2026-01-26 at 20.00.55.webp', PICSART_PAGE),
        picsart('Screenshot 2026-01-26 at 20.02.34.webp', PICSART_PAGE),
        picsart('Screenshot 2025-11-05 at 17.24.57.webp', PICSART_PAGE),
        picsart('Screenshot 2026-01-26 at 19.24.48.webp', PICSART_PAGE),
        picsart('Screenshot 2026-01-26 at 20.05.59.webp', PICSART_PAGE),
      ],
      /* Hover isn't in the Figma variant either: 220px down-left with the first column, short of where
         its upper end would show. */
      center: { desktop: [1098.16, 558.65], hover: [907.63, 668.65], tablet: [712.2, 567.96], mobile: [497.68, 469.03] },
    },
  ],
};

/* ---------- Soulone ----------
 * Screens picked in Figma (4205:34678–34705), whole and at their source size.
 * Two more (4205:34685, 34688) lead the wide columns, which the whole screens
 * leave shorter than the Figma crops were.
 */

const soulone = tiles('soulone/grid');
const TOP = '50% 0%';

const SOULONE_SCALE = { desktop: 1, tablet: 0.8418, mobile: 0.6678 } as const;
/** A column runs down-right, 30° below the horizontal. */
const COS30 = Math.cos(Math.PI / 6);
const SIN30 = Math.sin(Math.PI / 6);

/**
 * A column's centre once it's lengthened. Adding tiles at one end moves its
 * centre by half their length, down the column (end) or up it (start), to keep
 * the tiles already there where they were; `slide` then moves the whole column
 * further down, all in desktop frame px (scaled for tablet and phone).
 */
const lengthened = (
  centre: Record<GridScreen | 'hover', FramePoint>,
  options: { startPx?: number; endPx?: number; slide?: number },
): Record<GridScreen | 'hover', FramePoint> => {
  const { startPx = 0, endPx = 0, slide = 0 } = options;
  const px = (scale: number) => ((endPx - startPx) / 2 + slide) * scale;
  const move = ([x, y]: FramePoint, d: number): FramePoint => [x + d * COS30, y + d * SIN30];
  return {
    desktop: move(centre.desktop, px(SOULONE_SCALE.desktop)),
    hover: move(centre.hover, px(SOULONE_SCALE.desktop)),
    tablet: move(centre.tablet, px(SOULONE_SCALE.tablet)),
    mobile: move(centre.mobile, px(SOULONE_SCALE.mobile)),
  };
};

/** The two added screens, 1110px wide in the design, in a 640px column. */
const SO_D1 = 1110 / 1707;
const SO_D2 = 1110 / 1687;
const SO_COLUMN = 640;
const tilePx = (aspect: number) => SO_COLUMN / aspect + ISOMETRIC_GAP;

export const SOULONE_GRID: IsometricGrid = {
  kind: 'isometric',
  axis: 'down-right',
  scale: SOULONE_SCALE,
  columns: [
    {
      width: SO_COLUMN,
      images: [
        soulone('s-d1-v3.webp', SO_D1, { position: TOP }),
        soulone('s-a1-v3.webp', 1110 / 2537, { position: TOP }),
        soulone('s-a2-v3.webp', 1110 / 782, { position: TOP }),
      ],
      center: lengthened(
        { desktop: [777.86, 891.78], hover: [-347.97, 241.78], tablet: [504.23, 728.22], mobile: [440.32, 760.16] },
        { startPx: tilePx(SO_D1), slide: 240 },
      ),
    },
    {
      width: 243.196,
      images: [
        soulone('s-b1-v3.webp', 258 / 565, { position: TOP }),
        soulone('s-b2-v3.webp', 259 / 624, { position: TOP }),
        soulone('s-b3-v4.webp', 402 / 1327, { position: TOP }),
        soulone('s-b4-v3.webp', 259 / 994.766, { position: TOP }),
      ],
      center: { desktop: [165.2, 64.45], hover: [1117.83, 614.45], tablet: [941.13, 581.79], mobile: [386.22, 402.64] },
    },
    {
      width: SO_COLUMN,
      images: [
        soulone('s-d2-v3.webp', SO_D2, { position: TOP }),
        soulone('s-c1-v3.webp', 1110 / 1646, { position: TOP }),
        soulone('s-c2-v3.webp', 1110 / 903, { position: TOP }),
        soulone('s-c3-v3.webp', 1110 / 671, { position: TOP }),
      ],
      center: lengthened(
        { desktop: [1668.73, 458.92], hover: [1062.52, 108.92], tablet: [821.14, 113.85], mobile: [359.78, 61.08] },
        { startPx: tilePx(SO_D2) },
      ),
    },
  ],
};

/* ---------- All projects ----------
 * Seventeen screens picked in Figma across eleven projects, each shown once,
 * sized at 1200px wide. Benzeen, Gemmed and Solomoon (their longer screens) run further
 * down their pages than the Figma crop, so the columns fill without repeats. Each column is long enough to stay filled past the
 * frame: its offset, the desktop hover slide, and the narrower tablet and
 * phone columns.
 */

const ALL_WORK: Record<string, number> = {
  'benzeen-parts': 1200 / 1980,
  gemmed: 1200 / 746,
  'gemmed-style': 1200 / 2388,
  'world-education': 1200 / 668,
  scunci: 1094 / 1712,
  ginosi: 1200 / 791,
  'ginosi-404': 1200 / 833,
  'off-my-case': 1200 / 640,
  'off-my-case-custom': 1200 / 687,
  solomoon: 1200 / 689,
  'solomoon-catalog': 1200 / 2443,
  'infinity-rings': 1200 / 668,
  'infinity-rings-ring': 1200 / 668,
  'by-robyn-blair': 848 / 460,
  'by-robyn-blair-shop': 1200 / 570,
  myzcapital: 1200 / 677,
  adrasheg: 1200 / 570,
};
const work = (name: string): GridImage => ({
  src: `/selected-work/all-work/${name}.webp`,
  aspect: ALL_WORK[name],
  position: '50% 0%',
});

export const ALL_PROJECTS_GRID: FlatGrid = {
  kind: 'flat',
  columns: [
    {
      images: [
        work('benzeen-parts'),
        work('world-education'),
        work('off-my-case'),
        work('solomoon'),
        work('by-robyn-blair'),
      ],
      frame: {
        desktop: { left: 0, top: 0, width: 336.25 },
        tablet: { left: -58, top: -116, width: 255 },
        mobile: { left: -106, top: -5, width: 200 },
      },
      hoverTop: -479,
    },
    {
      images: [
        work('scunci'),
        work('ginosi'),
        work('off-my-case-custom'),
        work('infinity-rings'),
        work('myzcapital'),
      ],
      frame: {
        desktop: { left: 368.25, top: -306, width: 336.25 },
        tablet: { left: 221, top: -25, width: 254 },
        mobile: { left: 123, top: -161, width: 202 },
      },
      hoverTop: 0,
    },
    {
      images: [
        work('gemmed-style'),
        work('ginosi-404'),
        work('infinity-rings-ring'),
        work('by-robyn-blair-shop'),
      ],
      frame: {
        desktop: { left: 736.5, top: 0, width: 336.25 },
        tablet: { left: 501, top: -48, width: 254 },
        mobile: { left: 352, top: -7, width: 201 },
      },
      hoverTop: -593,
    },
    {
      images: [
        work('solomoon-catalog'),
        work('adrasheg'),
        work('gemmed'),
      ],
      frame: {
        desktop: { left: 1104.75, top: -303, width: 336.25 },
        tablet: { left: 779, top: -48, width: 255 },
        mobile: { left: 561, top: -145, width: 200 },
      },
      hoverTop: 0,
    },
  ],
};

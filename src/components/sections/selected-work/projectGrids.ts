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
        smartbet('Screenshot 2025-11-05 at 17.31.10 15.28.58.png', SMARTBET_SHOT),
        smartbet('Products - Smart Sports.png', SMARTBET_PAGE),
        smartbet('Platform Proiducts - Smart Connect.png', SMARTBET_PAGE),
        smartbet('Screenshot 2025-11-05 at 17.32.26 15.28.58.png', SMARTBET_SHOT),
        smartbet('Home.png', SMARTBET_PAGE),
      ],
      center: { desktop: [540.45, 754.71], hover: [228.69, 574.71], tablet: [447.8, 713.64], mobile: [263.18, 688.5] },
    },
    {
      width: 243.196,
      images: [
        smartbet('Kaboom.png', SMARTBET_PHONE),
        smartbet('Smart Sports Copy 3.png', SMARTBET_PHONE),
        smartbet('Smart Feed.png', SMARTBET_PHONE),
        smartbet('About Company - Our Mission.png', SMARTBET_PHONE),
      ],
      center: { desktop: [544.48, 283.43], hover: [830.27, 448.43], tablet: [451.07, 331.29], mobile: [274.32, 392.68] },
    },
    {
      width: 640,
      images: [
        smartbet('Providers.png', SMARTBET_PAGE),
        smartbet('Screenshot 2025-11-05 at 17.33.22 15.28.58.png', SMARTBET_SHOT),
        smartbet('Careers.png', SMARTBET_PAGE),
        smartbet('Gaming Proiducts - Casino.png', SMARTBET_PAGE),
        smartbet('About - Our Vision.png', SMARTBET_PAGE),
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
        picsart('Screenshot 2026-01-26 at 19.54.03.png', PICSART_PAGE),
        picsart('Screenshot 2026-01-26 at 19.55.01.png', PICSART_PAGE),
        picsart('Screenshot 2026-01-26 at 19.54.41.png', PICSART_PAGE),
        picsart('Screenshot 2026-01-26 at 20.05.59.png', PICSART_PAGE),
        picsart('Screenshot 2025-11-05 at 17.23.58.png', PICSART_PAGE),
      ],
      center: { desktop: [525.49, 14.68], hover: [58.7, 284.18], tablet: [398.41, 5.38], mobile: [280.13, 4.31] },
    },
    {
      width: 170.938,
      images: [
        picsart('Screenshot 2026-01-26 at 20.22.35.png', 830 / 1804),
        picsart('Screenshot 2026-01-26 at 20.22.48.png', 830 / 1804),
        picsart('Screenshot 2026-01-26 at 20.07.43.png', 830 / 1712),
        picsart('Screenshot 2026-01-26 at 20.11.32.png', 830 / 1806),
        picsart('Screenshot 2026-01-26 at 20.11.54.png', 830 / 1806),
      ],
      /* Hover isn't in the Figma variant (it only moves the first column): 400px up-right, against the
         outer columns like Smartbet and Soulone, short of where the column's lower end would show. */
      center: { desktop: [546.39, 440.08], hover: [892.8, 240.08], tablet: [589.39, 267.14], mobile: [215.81, 336.71] },
    },
    {
      width: 640,
      images: [
        picsart('Screenshot 2026-01-26 at 20.00.55.png', PICSART_PAGE),
        picsart('Screenshot 2026-01-26 at 20.02.34.png', PICSART_PAGE),
        picsart('Screenshot 2025-11-05 at 17.24.57.png', PICSART_PAGE),
        picsart('Screenshot 2026-01-26 at 19.24.48.png', PICSART_PAGE),
        picsart('Screenshot 2026-01-26 at 20.05.59.png', PICSART_PAGE),
      ],
      /* Hover isn't in the Figma variant either: 220px down-left with the first column, short of where
         its upper end would show. */
      center: { desktop: [1098.16, 558.65], hover: [907.63, 668.65], tablet: [712.2, 567.96], mobile: [497.68, 469.03] },
    },
  ],
};

/* ---------- Soulone ---------- */

const soulone = tiles('soulone/grid');
const TOP = '50% 0%';

export const SOULONE_GRID: IsometricGrid = {
  kind: 'isometric',
  axis: 'down-right',
  scale: { desktop: 1, tablet: 0.8418, mobile: 0.6678 },
  columns: [
    {
      width: 640,
      images: [
        soulone('s-a1.webp', 640 / 1707.58, { position: '50% 4%' }),
        soulone('s-a2.webp', 640 / 712.84, { position: '50% 32%' }),
      ],
      center: { desktop: [777.86, 891.78], hover: [-347.97, 241.78], tablet: [504.23, 728.22], mobile: [440.32, 760.16] },
    },
    {
      width: 243.196,
      images: [
        soulone('s-b1.webp', 243.196 / 528.023, { position: TOP }),
        soulone('s-b2.webp', 243.196 / 1412.61, { position: '50% 79%' }),
        soulone('s-b3.webp', 243.196 / 825.699, { position: TOP }),
      ],
      center: { desktop: [165.2, 64.45], hover: [1117.83, 614.45], tablet: [941.13, 581.79], mobile: [386.22, 402.64] },
    },
    {
      width: 640,
      images: [
        soulone('s-c1.webp', 640 / 610.893, { position: TOP }),
        soulone('s-c2.webp', 640 / 857.64, { position: '50% 81.5%' }),
        soulone('s-c3.webp', 640 / 929.539, { position: TOP }),
      ],
      center: { desktop: [1668.73, 458.92], hover: [1062.52, 108.92], tablet: [821.14, 113.85], mobile: [359.78, 61.08] },
    },
  ],
};

/* ---------- All projects (Various) ---------- */

const various = tiles('various');
const VARIOUS_DASHBOARD = 1440 / 768;
const VARIOUS_LISTING = 1903 / 903;
const VARIOUS_WORLD = 3584 / 1994;

export const ALL_PROJECTS_GRID: FlatGrid = {
  kind: 'flat',
  columns: [
    {
      images: [various('benzeen-wheel.webp', 1188 / 4096)],
      frame: {
        desktop: { left: 0, top: 0, width: 336.25 },
        tablet: { left: -58, top: -116, width: 255 },
        mobile: { left: -106, top: -5, width: 200 },
      },
      hoverTop: -479,
    },
    {
      images: [
        various('backoffice.webp', VARIOUS_DASHBOARD),
        various('ginosi-search.webp', 1920 / 1265),
        various('ginosi-apartel.webp', VARIOUS_LISTING, { only: 'mobile' }),
        various('scunci-shop.webp', 1920 / 3031),
        various('world-services.webp', VARIOUS_WORLD, { only: 'mobile' }),
      ],
      frame: {
        desktop: { left: 368.25, top: -306, width: 336.25 },
        tablet: { left: 221, top: -25, width: 254 },
        mobile: { left: 123, top: -161, width: 202 },
      },
      hoverTop: 0,
    },
    {
      images: [various('brainstormtech.webp', 1082 / 4096)],
      frame: {
        desktop: { left: 736.5, top: 0, width: 336.25 },
        tablet: { left: 501, top: -48, width: 254 },
        mobile: { left: 352, top: -7, width: 201 },
      },
      hoverTop: -593,
    },
    {
      images: [
        various('world-services.webp', VARIOUS_WORLD),
        various('world-study.webp', VARIOUS_WORLD),
        various('ginosi-apartel.webp', VARIOUS_LISTING),
        various('benzeen-alfa.webp', VARIOUS_LISTING),
        various('gamble-dashboard.webp', VARIOUS_DASHBOARD),
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

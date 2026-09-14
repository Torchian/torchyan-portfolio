/**
 * Projects page (Figma 3155:9789): the "Single Project" rows and the screenshot
 * collages beside them.
 *
 * Content mirrors the Figma frame as it is today, where several rows still share
 * copy and artwork; swap in each project's real content here.
 */

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
  gap?: number;
  images: CollageImage[];
}

/** The two isometric tilts used in the design, or none. */
export type CollageTilt = 'clockwise' | 'counterClockwise' | 'none';

export interface Collage {
  tilt: CollageTilt;
  stacks: CollageStack[];
}

export interface ShowcaseProject {
  id: string;
  title: string;
  roles: string[];
  description: string[];
  stack: string[];
  href: string;
  collage: Collage;
}

const DESKTOP = { width: 1366, height: 757 };

const shot = (set: string, name: string, size: { width: number; height: number }): CollageImage => ({
  src: `/projects/collages/${set}/${name}.webp`,
  ...size,
});

const PICSART: Collage = {
  tilt: 'clockwise',
  stacks: [
    {
      x: 513.94,
      y: 21.35,
      width: 640,
      gap: 32,
      images: ['marketplace-home', 'marketplace-feed', 'marketplace-item', 'marketplace-search', 'discovery-collections', 'discovery-templates'].map(
        (name) => shot('picsart', name, DESKTOP),
      ),
    },
    {
      x: 546.39,
      y: 440.08,
      width: 170.94,
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
      x: 1098.45,
      y: 558.82,
      width: 640,
      gap: 32,
      images: ['marketplace-filters', 'marketplace-creator', 'discovery-home', 'marketplace-editor', 'discovery-collections', 'marketplace-checkout'].map(
        (name) => shot('picsart', name, DESKTOP),
      ),
    },
  ],
};

const SOULONE: Collage = {
  tilt: 'counterClockwise',
  stacks: [
    { x: 1415.23, y: 1378.7, width: 180, images: [{ ...shot('soulone', 'iphone-home', { width: 180, height: 5203 }), outlined: true }] },
    { x: 1913.19, y: 391.2, width: 180, images: [shot('soulone', 'iphone-product-3', { width: 180, height: 3993 })] },
    { x: 860.63, y: 698.9, width: 475, images: [shot('soulone', 'plan-diet', { width: 475, height: 2421 })] },
    { x: 565.74, y: 169.15, width: 180, images: [shot('soulone', 'iphone-product-2', { width: 180, height: 3485 })] },
    { x: 1845.73, y: 630.15, width: 312, images: [shot('soulone', 'ipad-home', { width: 312, height: 2805 })] },
  ],
};

const SMARTBET_WIDE = { width: 3584, height: 1994 };
const SMARTBET_PAGE = { width: 2732, height: 1514 };
const SMARTBET_MOBILE = { width: 750, height: 1334 };

const SMARTBET: Collage = {
  tilt: 'counterClockwise',
  stacks: [
    {
      x: 707.88,
      y: 851.38,
      width: 640,
      gap: 32,
      images: [
        shot('smartbet', 'desktop-virtuals', SMARTBET_WIDE),
        shot('smartbet', 'products-smart-sports', SMARTBET_PAGE),
        shot('smartbet', 'platform-smart-connect', SMARTBET_PAGE),
        shot('smartbet', 'desktop-sports', SMARTBET_WIDE),
        shot('smartbet', 'products-overview', SMARTBET_PAGE),
        shot('smartbet', 'platform-smart-control', SMARTBET_PAGE),
      ],
    },
    {
      x: 407.89,
      y: 204.58,
      width: 243.2,
      gap: 32,
      images: ['mobile-our-vision', 'mobile-kaboom', 'mobile-smart-sports', 'mobile-smart-feed', 'mobile-our-mission'].map((name) =>
        shot('smartbet', name, SMARTBET_MOBILE),
      ),
    },
    {
      x: 800.73,
      y: -42.23,
      width: 640,
      gap: 32,
      images: [
        shot('smartbet', 'desktop-careers-hero', SMARTBET_WIDE),
        shot('smartbet', 'providers', SMARTBET_PAGE),
        shot('smartbet', 'desktop-feed', SMARTBET_WIDE),
        shot('smartbet', 'careers', SMARTBET_PAGE),
        shot('smartbet', 'gaming-casino', SMARTBET_PAGE),
        shot('smartbet', 'about-our-vision', SMARTBET_PAGE),
        shot('smartbet', 'ice', SMARTBET_PAGE),
      ],
    },
  ],
};

const WEBSITE_COLUMN = 336.25;

const WEBSITES: Collage = {
  tilt: 'none',
  stacks: [
    { x: 0, y: 0, width: WEBSITE_COLUMN, images: [shot('websites', 'benzeen-wheel', { width: WEBSITE_COLUMN, height: 1159.33 })] },
    {
      x: 368.25,
      y: -306,
      width: WEBSITE_COLUMN,
      gap: 27,
      images: [
        shot('websites', 'backoffice', { width: 1440, height: 768 }),
        shot('websites', 'ginosi-search', { width: 1920, height: 1265 }),
        shot('websites', 'scunci-shop', { width: 1920, height: 3031 }),
      ],
    },
    { x: 736.5, y: 0, width: WEBSITE_COLUMN, images: [shot('websites', 'brainstorm-services', { width: WEBSITE_COLUMN, height: 1272.9 })] },
    {
      x: 1104.75,
      y: -303,
      width: WEBSITE_COLUMN,
      gap: 27,
      images: [
        shot('websites', 'dashboard-dark', SMARTBET_WIDE),
        shot('websites', 'dashboard-analytics', SMARTBET_WIDE),
        shot('websites', 'ginosi-downtown', { width: 1903, height: 903 }),
        shot('websites', 'benzeen-alfa-romeo', { width: 1903, height: 903 }),
        shot('websites', 'dashboard-light', { width: 1440, height: 768 }),
      ],
    },
  ],
};

const DESCRIPTION = [
  'A large-scale digital ecosystem where multiple teams build and ship UI features across the Marketplace and Discovery surfaces.',
  'The product required a unified system that could handle diverse modules, maintain accessibility compliance, support multilingual contexts, and improve rendering performance — all without slowing engineering velocity.',
];

const STACK = ['React', 'JSS', 'Styled Components', 'Localization', 'WCAG Compliance'];

/** World Education has no case study page yet, so its CTA opens the case studies list. */
const NO_CASE_PAGE = '/case-studies';

export const SHOWCASE_PROJECTS: ShowcaseProject[] = [
  {
    id: 'picsart-marketplace',
    title: 'Picsart Marketplace',
    roles: ['UI Architect', 'Frontend Engineer'],
    description: DESCRIPTION,
    stack: STACK,
    href: '/projects/picsart',
    collage: PICSART,
  },
  {
    id: 'soulone',
    title: 'SoulOne',
    roles: ['Product Designer', 'Project Manager'],
    description: DESCRIPTION,
    stack: STACK,
    href: '/projects/soulone',
    collage: SOULONE,
  },
  {
    id: 'smartbet',
    title: 'Smartbet',
    roles: ['UI Engineer'],
    description: DESCRIPTION,
    stack: STACK,
    href: '/projects/smartbet',
    collage: SMARTBET,
  },
  {
    id: 'world-education',
    title: 'World Education',
    roles: ['UI Engineer', 'Frontend Developer'],
    description: DESCRIPTION,
    stack: STACK,
    href: NO_CASE_PAGE,
    collage: PICSART,
  },
  {
    id: 'smartbet-2',
    title: 'Smartbet',
    roles: ['UI Engineer'],
    description: DESCRIPTION,
    stack: STACK,
    href: '/projects/smartbet',
    collage: SOULONE,
  },
  {
    id: 'world-education-2',
    title: 'World Education',
    roles: ['UI Engineer', 'Frontend Developer'],
    description: DESCRIPTION,
    stack: STACK,
    href: NO_CASE_PAGE,
    collage: WEBSITES,
  },
  {
    id: 'smartbet-3',
    title: 'Smartbet',
    roles: ['UI Engineer'],
    description: DESCRIPTION,
    stack: STACK,
    href: '/projects/smartbet',
    collage: SOULONE,
  },
  {
    id: 'world-education-3',
    title: 'World Education',
    roles: ['UI Engineer', 'Frontend Developer'],
    description: DESCRIPTION,
    stack: STACK,
    href: NO_CASE_PAGE,
    collage: PICSART,
  },
];

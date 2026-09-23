import type { CharacterClothes, GlassesStyle } from '@/components/composites/character/characterLayout';

/*
 * What the About page shows that isn't copy: the workplaces in order with their
 * gallery images, and the rules the hero's "Generate Random" plays by.
 * Copy lives in messages/*.json under `about.*`.
 */

export type TimelineEntryId =
  | 'apricode'
  | 'tco'
  | 'volo'
  | 'softconstruct'
  | 'picsart'
  | 'armenianCodeAcademy';

/** An entry's copy, from messages/*.json under about.timeline.entries.<id>. */
export interface TimelineEntryContent {
  stickyContent: string;
  role: string;
  focus: string;
  impact: string;
  coreGrowth: string[];
}

export interface GalleryImage {
  src: string;
  /** Width ÷ height, so the column can lay the image out before it loads. */
  aspect: number;
}

/** What doesn't change between languages: the years, the company, its gallery. */
export interface TimelineEntryConfig {
  id: TimelineEntryId;
  /** As shown on the card. */
  year: string;
  /** The single year the rail shows while this entry is the one in view. */
  railYear: string;
  company: string;
  /** Two columns of screenshots, as in Figma's Timeline Gallery. */
  gallery: [GalleryImage[], GalleryImage[]];
}

export type TimelineEntry = TimelineEntryConfig & TimelineEntryContent;

/**
 * Placeholders: screenshots of projects already in the repo, one set per
 * workplace, until the real ones arrive (see TODO).
 */
const shot = (src: string, aspect: number): GalleryImage => ({ src, aspect });

export const TIMELINE_ENTRIES: TimelineEntryConfig[] = [
  {
    id: 'apricode',
    year: '2016–2018',
    railYear: '2016',
    company: 'Apricode / MyZCapital',
    gallery: [
      [shot('/projects/collages/websites/scunci-shop.webp', 0.63)],
      [
        shot('/projects/collages/websites/backoffice.webp', 1.87),
        shot('/projects/collages/websites/dashboard-light.webp', 1.87),
      ],
    ],
  },
  {
    id: 'tco',
    year: '2019',
    railYear: '2019',
    company: 'TCO / Brainstorm',
    gallery: [
      [shot('/projects/collages/websites/brainstorm-services.webp', 0.26)],
      [
        shot('/projects/collages/websites/dashboard-dark.webp', 1.8),
        shot('/projects/collages/websites/dashboard-analytics.webp', 1.8),
      ],
    ],
  },
  {
    id: 'volo',
    year: '2020',
    railYear: '2020',
    company: 'VOLO',
    gallery: [
      [shot('/projects/collages/websites/benzeen-wheel.webp', 0.29)],
      [
        shot('/projects/collages/websites/ginosi-search.webp', 1.52),
        shot('/projects/collages/websites/ginosi-downtown.webp', 2.11),
      ],
    ],
  },
  {
    id: 'softconstruct',
    year: '2021–2022',
    railYear: '2021',
    company: 'SoftConstruct',
    gallery: [
      [shot('/projects/collages/smartbet/mobile-smart-sports.webp', 0.56)],
      [
        shot('/projects/collages/smartbet/desktop-sports.webp', 1.8),
        shot('/projects/collages/smartbet/desktop-feed.webp', 1.8),
      ],
    ],
  },
  {
    id: 'picsart',
    year: '2023–2024',
    railYear: '2023',
    company: 'Picsart',
    gallery: [
      [shot('/projects/collages/picsart/mobile-search-all.webp', 0.46)],
      [
        shot('/projects/collages/picsart/editor-templates.webp', 1.8),
        shot('/projects/collages/picsart/marketplace-home.webp', 1.8),
      ],
    ],
  },
  {
    id: 'armenianCodeAcademy',
    year: '2024',
    railYear: '2024',
    company: 'Armenian Code Academy',
    gallery: [
      [shot('/projects/collages/soulone/plan-diet.webp', 0.2)],
      [
        shot('/projects/collages/picsart/discovery-home.webp', 1.8),
        shot('/projects/collages/picsart/marketplace-creator.webp', 1.8),
      ],
    ],
  },
];

/* ---------- The hero's random character ---------- */

export interface CharacterLook {
  clothes: CharacterClothes;
  cap: boolean;
  glasses: GlassesStyle | false;
}

/** What the page opens on, and what "Generate Random" moves away from. */
export const DEFAULT_LOOK: CharacterLook = { clothes: 'default', cap: false, glasses: 'default' };

/** The outfits the button draws from. */
const CLOTHES = [
  'russian-90s',
  'hoodie',
  'classic',
  'fight-club',
  'matrix',
  'sopranos',
  'pulp-fiction',
  'big-lebowski',
  'default',
  'armenian-traditional',
] as const satisfies readonly CharacterClothes[];

/** A cap only sits right on these. */
const CAP_FITS = new Set<CharacterClothes>(['russian-90s', 'hoodie', 'default']);
/** The matrix glasses only go with these — and Matrix always wears them. */
const MATRIX_FITS = new Set<CharacterClothes>(['matrix', 'classic', 'pulp-fiction']);
/** Everything but the Armenian traditional outfit takes the plain pairs. */
const PLAIN_FITS = new Set<CharacterClothes>(CLOTHES.filter((c) => c !== 'armenian-traditional'));

const pick = <T>(list: readonly T[]): T => list[Math.floor(Math.random() * list.length)];

/** One valid look at random, never the one already on screen. */
export function randomCharacter(previous?: CharacterLook): CharacterLook {
  for (let tries = 0; tries < 20; tries++) {
    const clothes = pick(CLOTHES);
    const cap = CAP_FITS.has(clothes) ? Math.random() < 0.5 : false;
    const styles: (GlassesStyle | false)[] = MATRIX_FITS.has(clothes) ? ['matrix'] : [];
    if (PLAIN_FITS.has(clothes)) styles.push('default', 'optical', false);
    // Matrix wears its glasses; everyone else may go without.
    const glasses: GlassesStyle | false =
      clothes === 'matrix' ? 'matrix' : styles.length ? pick(styles) : false;
    const look: CharacterLook = { clothes, cap, glasses };
    if (
      !previous ||
      look.clothes !== previous.clothes ||
      look.cap !== previous.cap ||
      look.glasses !== previous.glasses
    ) {
      return look;
    }
  }
  return previous ?? DEFAULT_LOOK;
}

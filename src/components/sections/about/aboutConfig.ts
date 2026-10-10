import type { CharacterClothes, GlassesStyle } from '@/components/composites/character/characterLayout';

/*
 * What the About page shows that isn't copy: the workplaces in order with their
 * gallery images, and the rules the hero's "Generate Random" plays by.
 * Copy lives in messages/*.json under `about.*`.
 */

export type TimelineEntryId =
  | 'apricode'
  | 'brainstorm'
  | 'tco'
  | 'volo'
  | 'softconstruct'
  | 'panika'
  | 'smartbet'
  | 'picsart'
  | 'armenianCodeAcademy'
  | 'brainrocket'
  | 'soulone'
  | 'acentecom'
  | 'torchyan';

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
 * Each workplace shows its own screens. One without any (no material kept)
 * leaves the gallery on the last workplace that had some, rather than going
 * blank, until the next one with screens comes along. Roles and dates are the
 * founder's (LinkedIn-confirmed, facts/2026-09-30-founder-facts.md); entries run
 * in order of start date.
 */
const shot = (src: string, aspect: number): GalleryImage => ({ src, aspect });
const NONE: [GalleryImage[], GalleryImage[]] = [[], []];

export const TIMELINE_ENTRIES: TimelineEntryConfig[] = [
  {
    // Jun 2016 – May 2018
    id: 'apricode',
    year: '2016–2018',
    railYear: '2016',
    company: 'Apricode / MyZCapital',
    gallery: [
      [shot('/about/timeline/apricode/myzcapital-home.webp', 1200 / 3062)],
      [
        shot('/about/timeline/apricode/myzcapital-polls.webp', 1200 / 676),
        shot('/about/timeline/apricode/myzcapital-account.webp', 1200 / 1286),
        shot('/about/timeline/apricode/myzcapital-dashboard.webp', 1200 / 564),
      ],
    ],
  },
  {
    // May–Jul 2018 project, then Jul–Dec 2018 role. Same company the Work
    // page's Brainstorm case is built on.
    id: 'brainstorm',
    year: '2018',
    railYear: '2018',
    company: 'Brainstorm',
    gallery: [
      [shot('/about/timeline/brainstorm/scunci-shop.webp', 1200 / 1894), shot('/about/timeline/brainstorm/offmycase-custom.webp', 1200 / 1523)],
      [
        shot('/about/timeline/brainstorm/brainstorm-studio.webp', 1200 / 570),
        shot('/about/timeline/brainstorm/byrobynblair-customize.webp', 1200 / 1482),
        shot('/about/timeline/brainstorm/gemmed-hoops.webp', 1200 / 1889),
      ],
    ],
  },
  {
    // Jan – Sep 2019. Benzeen Auto Parts was delivered through TCO.
    id: 'tco',
    year: '2019',
    railYear: '2019',
    company: 'TCO',
    gallery: [
      [shot('/about/timeline/tco/benzeen-wheel.webp', 1188 / 4096)],
      [
        shot('/about/timeline/tco/benzeen-alfa.webp', 1200 / 569),
        shot('/about/timeline/tco/benzeen-cut-sheets.webp', 1200 / 2055),
        shot('/about/timeline/tco/benzeen-alfa-parts.webp', 1200 / 569),
      ],
    ],
  },
  {
    // Sep 2019 – Apr 2020
    id: 'volo',
    year: '2019–2020',
    railYear: '2019',
    company: 'VOLO',
    gallery: NONE,
  },
  {
    // Apr – Aug 2020
    id: 'softconstruct',
    year: '2020',
    railYear: '2020',
    company: 'SoftConstruct',
    gallery: NONE,
  },
  {
    // Dec 2020 – Feb 2023, alongside the roles that follow it.
    id: 'panika',
    year: '2020–2023',
    railYear: '2020',
    company: 'Panika Production',
    gallery: [
      [shot('/about/timeline/panika/panika-contacts.webp', 1200 / 2063), shot('/about/timeline/panika/panika-mobile.webp', 1116 / 1688)],
      [
        shot('/about/timeline/panika/panika-films.webp', 1200 / 750),
        shot('/about/timeline/panika/panika-home.webp', 1200 / 1067),
      ],
    ],
  },
  {
    // Aug – Oct 2021; a separate employer from SoftConstruct.
    id: 'smartbet',
    year: '2021',
    railYear: '2021',
    company: 'Smartbet',
    gallery: [
      [
        shot('/projects/collages/smartbet/desktop-feed.webp', 1280 / 712),
        shot('/projects/collages/smartbet/products-smart-sports.webp', 1280 / 709),
        shot('/projects/collages/smartbet/gaming-casino.webp', 1280 / 709),
        shot('/projects/collages/smartbet/platform-smart-connect.webp', 1280 / 709),
        shot('/projects/collages/smartbet/careers.webp', 1280 / 709),
      ],
      [
        shot('/projects/collages/smartbet/about-our-vision.webp', 1280 / 709),
        shot('/projects/collages/smartbet/desktop-sports.webp', 1280 / 712),
        shot('/projects/collages/smartbet/products-overview.webp', 1280 / 709),
        shot('/projects/collages/smartbet/desktop-virtuals.webp', 1280 / 712),
        shot('/projects/collages/smartbet/platform-smart-control.webp', 1280 / 709),
      ],
    ],
  },
  {
    // Oct 2021 – Feb 2024: Growth, then Marketplace.
    id: 'picsart',
    year: '2021–2024',
    railYear: '2021',
    company: 'Picsart',
    gallery: [
      [
        shot('/about/timeline/picsart/search-desktop.webp', 1200 / 668),
        shot('/about/timeline/picsart/templates-themes.webp', 1200 / 668),
        shot('/projects/collages/picsart/marketplace-home.webp', 1280 / 713),
        shot('/about/timeline/picsart/replays.webp', 1200 / 668),
        shot('/projects/collages/picsart/marketplace-item.webp', 1280 / 713),
      ],
      [
        shot('/about/timeline/picsart/images-results.webp', 1200 / 668),
        shot('/projects/collages/picsart/discovery-templates.webp', 1280 / 712),
        shot('/about/timeline/picsart/creators.webp', 1200 / 668),
        shot('/projects/collages/picsart/marketplace-creator.webp', 1280 / 713),
        shot('/about/timeline/picsart/editor.webp', 1200 / 668),
      ],
    ],
  },
  {
    // Nov 2022 – Feb 2023 teaching, alongside Picsart; interviewing lecturer
    // candidates continued past that through 2024.
    id: 'armenianCodeAcademy',
    year: '2022–2023',
    railYear: '2022',
    company: 'Armenian Code Academy',
    gallery: NONE,
  },
  {
    // Jul – Oct 2024
    id: 'brainrocket',
    year: '2024',
    railYear: '2024',
    company: 'BrainRocket',
    gallery: NONE,
  },
  {
    // May – Oct 2025
    id: 'soulone',
    year: '2025',
    railYear: '2025',
    company: 'SoulOne',
    gallery: [
      [
        shot('/projects/sets/soulone/hero.webp', 1600 / 1128),
        shot('/projects/sets/soulone/product.webp', 1600 / 2432),
        shot('/projects/sets/soulone/body-plan.webp', 1600 / 1301),
        shot('/projects/sets/soulone/balls.webp', 1024 / 1300),
      ],
      [
        shot('/projects/sets/soulone/nutritionist.webp', 1600 / 1205),
        shot('/projects/sets/soulone/cakes-1.webp', 1024 / 880),
        shot('/projects/sets/soulone/yin-yang.webp', 1600 / 854),
        shot('/projects/sets/soulone/guidance.webp', 1600 / 968),
        shot('/projects/sets/soulone/customize.webp', 1600 / 966),
      ],
    ],
  },
  {
    // Mar – Jul 2026, remote contract.
    id: 'acentecom',
    year: '2026',
    railYear: '2026',
    company: 'Acentecom',
    gallery: NONE,
  },
  {
    id: 'torchyan',
    year: '2026–now',
    railYear: '2026',
    company: 'Torchyan',
    gallery: [
      [shot('/about/timeline/torchyan/about.webp', 1440 / 900), shot('/about/timeline/torchyan/work.webp', 1440 / 900)],
      [
        shot('/about/timeline/torchyan/home.webp', 1440 / 900),
        shot('/about/timeline/torchyan/services-team.webp', 1440 / 900),
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

import type { CaseVideo } from '@/components/sections/case-study/caseStudyConfig';
import { PICSART_GRID, SMARTBET_GRID, SOULONE_GRID, type IsometricGrid } from './projectGrids';

/**
 * Every project with a case page: company, period, colours and screenshots.
 * Copy (roles, title, description, field, story) lives in messages/*.json
 * under projects.<slug>.
 *
 * This list drives three things: the case routes (/projects/<slug>), the
 * sitemap, and — for the projects that have a `card` — the homepage Selected
 * Work stack, in this order. A card needs a hand-measured screenshot grid
 * (projectGrids.ts), which is why only the featured projects have one.
 */

export type ProjectSlug =
  | 'picsart'
  | 'smartbet'
  | 'soulone'
  | 'ginosi'
  | 'benzeen'
  | 'world-education'
  | 'brainstorm'
  | 'myzcapital'
  | 'solomoon'
  | 'infinity-rings'
  | 'panika'
  | 'by-robyn-blair'
  | 'off-my-case'
  | 'gemmed'
  | 'scunci';

/** A project's copy, from messages/*.json under projects.<slug>. */
export interface ProjectContent {
  roles: string[];
  title: string;
  description: string;
  field: string;
}

/** The homepage Selected Work card: its screenshot grid and CTA fill. */
export interface ProjectCard {
  grid: IsometricGrid;
  /** The card CTA's resting fill (Figma dark/gradient/brands/<slug>). */
  ctaFill: string;
}

export interface ProjectConfig {
  slug: ProjectSlug;
  company: string;
  /** As shown on the card and the case page: a year or a span; empty when it isn't confirmed. */
  year: string;
  gradient: string;
  /**
   * Screenshots for the short case, shown at their own shape (`aspect`, width ÷
   * height; 4:3 when absent). One with a `video` plays that recording instead (CaseMedia).
   */
  images: { src: string; alt: string; aspect?: number; video?: CaseVideo; caption?: string }[];
  /** Listed under "More projects" on the Work page, with its first image as the cover. */
  more?: boolean;
  /** The brand's white mark, shown on the right of the short case's hero. */
  logo?: string;
  /** Present for the projects featured on the homepage. */
  card?: ProjectCard;
}

export type FeaturedProject = ProjectConfig & { card: ProjectCard };

/** Picsart */
const PICSART_GRADIENT = 'linear-gradient(180deg, #920792 0%, #7F4AD9 100%)';

/** Smartbet */
const SMARTBET_GRADIENT = 'linear-gradient(180deg, #1C014A 0%, #30155E 100%)';

/** Soulone */
const SOULONE_GRADIENT = 'linear-gradient(180deg, #20520F 0%, #487A37 100%)';

const PICSART_IMAGES = [
  'Screenshot 2025-11-05 at 17.24.23.webp',
  'Screenshot 2025-11-05 at 17.21.44.webp',
  'portrait-80s-retro-woman-blackandwhite-image-by-picsart-01-26-2026_08_04_PM.webp',
  'Screenshot 2026-01-26 at 20.12.49.webp',
  'Screenshot 2026-01-26 at 20.11.54.webp',
  'Screenshot 2026-01-26 at 20.22.35.webp',
  'Screenshot 2025-11-05 at 17.25.06.webp',
  'Screenshot 2026-01-26 at 19.53.17.webp',
  'Screenshot 2026-01-26 at 19.54.03.webp',
  'Screenshot 2026-01-26 at 19.54.41.webp',
  'Screenshot 2026-01-26 at 19.24.48.webp',
  'Screenshot 2026-01-26 at 20.09.17.webp',
  'Screenshot 2026-01-26 at 20.11.32.webp',
  'Screenshot 2026-01-26 at 20.00.55.webp',
  'Screenshot 2026-01-26 at 20.10.26.webp',
  'Screenshot 2025-11-05 at 17.23.58.webp',
  'Screenshot 2026-01-26 at 20.05.59.webp',
  'Screenshot 2026-01-26 at 20.12.58.webp',
  'Screenshot 2026-01-26 at 20.22.48.webp',
  'Screenshot 2026-01-26 at 20.23.49.webp',
  'Screenshot 2026-01-26 at 20.02.34.webp',
  'Screenshot 2025-11-05 at 17.24.57.webp',
  'Screenshot 2026-01-26 at 20.16.41.webp',
  'Screenshot 2026-01-26 at 19.55.01.webp',
];

const SMARTBET_IMAGES = [
  'About - Our Vision.webp',
  'About Company - Our Mission.webp',
  'Careers.webp',
  'Gaming Proiducts - Casino.webp',
  'ICE.webp',
  'Kaboom.webp',
  'Platform Proiducts - Smart Connect.webp',
  'Platform Proiducts - Smart Control.webp',
  'Products - Smart Sports Inner page Copy 10.webp',
  'Products - Smart Sports Inner page Copy 16.webp',
  'Products - Smart Sports Inner page Copy 4.webp',
  'Products - Smart Sports Inner page.webp',
  'Products - Smart Sports.webp',
  'Providers.webp',
  'Screenshot 2025-11-05 at 17.31.10 15.28.58.webp',
  'Screenshot 2025-11-05 at 17.32.26 15.28.58.webp',
  'Screenshot 2025-11-05 at 17.32.49 15.28.58.webp',
  'Screenshot 2025-11-05 at 17.33.13 15.28.58.webp',
  'Screenshot 2025-11-05 at 17.33.22 15.28.58.webp',
  'Services.webp',
  'Smart Dealer.webp',
  'Smart Feed.webp',
  'Smart Games.webp',
  'Smart Sports Copy 3.webp',
  'Smart Sports.webp',
];

/** Soulone images by height: 4 (1728), 0/1/2 (1200), 6 (837) */
const SOULONE_IMAGES = ['4.webp', '0.webp', '1.webp', '2.webp', '6.webp'];

function toImages(folder: string, files: string[], alt: string) {
  return files.map((f) => ({ src: `/selected-work/${folder}/${f}`, alt }));
}

/** Ginosi, Benzeen, World Education, Brainstorm: case-page colours, from their Work rows. */
const GINOSI_GRADIENT = 'linear-gradient(180deg, #102649 0%, #5C4AC0 100%)';
const BRAINSTORM_GRADIENT = 'linear-gradient(180deg, #5C4AC0 0%, #8A5FA0 100%)';
const BENZEEN_GRADIENT = 'linear-gradient(180deg, #6B4A12 0%, #927F3D 100%)';
const WORLD_EDUCATION_GRADIENT = 'linear-gradient(180deg, #5E5128 0%, #927F3D 100%)';

const various = (files: string[], alt: string) => files.map((f) => ({ src: `/selected-work/various/${f}`, alt }));

export const PROJECTS: ProjectConfig[] = [
  {
    slug: 'picsart',
    company: 'Picsart',
    year: '2021–2024',
    gradient: PICSART_GRADIENT,
    images: toImages('picsart', PICSART_IMAGES, 'Picsart'),
    card: { grid: PICSART_GRID, ctaFill: PICSART_GRADIENT },
  },
  {
    slug: 'smartbet',
    company: 'Smartbet',
    year: '2021',
    gradient: SMARTBET_GRADIENT,
    images: toImages('smartbet', SMARTBET_IMAGES, 'Smartbet'),
    card: { grid: SMARTBET_GRID, ctaFill: SMARTBET_GRADIENT },
  },
  {
    slug: 'soulone',
    company: 'SoulOne',
    year: '2025',
    gradient: SOULONE_GRADIENT,
    images: toImages('soulone', SOULONE_IMAGES, 'SoulOne'),
    card: { grid: SOULONE_GRID, ctaFill: SOULONE_GRADIENT },
  },
  {
    slug: 'ginosi',
    company: 'Ginosi Apartels & Hotels',
    year: '2019',
    gradient: GINOSI_GRADIENT,
    images: various(['ginosi-search.webp', 'ginosi-apartel.webp'], 'Ginosi website'),
  },
  {
    slug: 'benzeen',
    company: 'Benzeen Auto Parts',
    year: '2019',
    gradient: BENZEEN_GRADIENT,
    images: various(['benzeen-alfa.webp', 'benzeen-wheel.webp'], 'Benzeen Auto Parts website'),
  },
  {
    slug: 'world-education',
    company: 'World Education',
    year: '2020',
    gradient: WORLD_EDUCATION_GRADIENT,
    images: various(['world-services.webp', 'world-study.webp'], 'World Education website'),
  },
  {
    slug: 'brainstorm',
    company: 'Brainstorm',
    year: '2018',
    gradient: BRAINSTORM_GRADIENT,
    images: various(['brainstormtech.webp'], 'Brainstorm website'),
  },
];

/** A short project's screenshots, at their own size (public/projects/cases/<folder>). */
const cases = (folder: string, alt: string, files: [name: string, width: number, height: number][]) =>
  files.map(([name, width, height]) => ({
    src: `/projects/cases/${folder}/${name}.webp`,
    alt,
    aspect: width / height,
  }));

/*
 * The short projects: one or two sections of story and their screens, listed
 * under "More projects" on the Work page. From the founder's answers; dates
 * that aren't confirmed are left empty rather than guessed.
 */
PROJECTS.push(
  {
    slug: 'myzcapital',
    company: 'myZcapital',
    year: '2016–2018',
    gradient: 'linear-gradient(180deg, #14325C 0%, #23707F 100%)',
    more: true,
    logo: '/logo/companies/myZcapital.png',
    images: cases('myzcapital', 'myZcapital', [
      ['home', 2512, 1416],
      ['poll', 2560, 1442],
      ['polls', 2560, 1428],
      ['trending', 2560, 2180],
      ['how-it-works', 2560, 1471],
      ['results', 2560, 1204],
      ['balance', 2560, 2741],
      ['purchase', 2560, 2309],
      ['membership', 2560, 1694],
    ]),
  },
  {
    slug: 'solomoon',
    company: 'Solomoon',
    year: '',
    gradient: 'linear-gradient(180deg, #120E22 0%, #5B2A86 100%)',
    more: true,
    logo: '/logo/companies/Solomoon.png',
    images: cases('solomon', 'Solomoon', [
      ['home-hero', 2560, 1226],
      ['home-top', 2560, 1517],
      ['categories', 2560, 1254],
      ['catalogue', 2560, 1576],
      ['product', 2298, 1320],
      ['product-related', 2298, 1494],
      ['popular', 2298, 1526],
      ['news', 2560, 2260],
      ['product-description', 2298, 1178],
    ]),
  },
  {
    slug: 'infinity-rings',
    company: 'Infinity Rings',
    year: '',
    gradient: 'linear-gradient(180deg, #151515 0%, #6E5A38 100%)',
    more: true,
    logo: '/logo/companies/InfinitiRings.svg',
    images: cases('infinity-rings', 'Infinity Rings admin, with order details blurred', [
      ['collections', 1940, 1080],
      ['configurator', 1940, 1080],
      ['configurator-stones', 1940, 1080],
      ['orders', 1938, 1080],
      ['orders-detail', 1940, 1080],
      ['archive', 1940, 1080],
      ['add-ring', 1940, 1080],
      ['import', 1938, 1080],
      ['add-ring-full', 2560, 4005],
    ]),
  },
  {
    slug: 'panika',
    company: 'Panika Production',
    year: '2020–2023',
    gradient: 'linear-gradient(180deg, #161616 0%, #7A1E2C 100%)',
    more: true,
    logo: '/logo/companies/Panika.png',
    images: (
      [
        ['panika-home', 1200, 1067],
        ['panika-films', 1200, 750],
        ['panika-showreel', 1200, 683],
        ['panika-mobile', 1116, 1688],
        ['panika-contacts', 1200, 2063],
      ] as const
    ).map(([name, width, height]) => ({
      src: `/about/timeline/panika/${name}.webp`,
      alt: 'Panika Production',
      aspect: width / height,
    })),
  },
  {
    slug: 'by-robyn-blair',
    company: 'By Robyn Blair',
    year: '2018',
    gradient: 'linear-gradient(180deg, #5E1F45 0%, #A8457A 100%)',
    more: true,
    logo: '/logo/companies/byRobinblair.svg',
    images: cases('by-robyn-blair', 'By Robyn Blair', [
      ['home-hero', 1272, 690],
      ['home', 1272, 1950],
      ['sweeten', 1176, 1329],
      ['customize', 2560, 2259],
      ['lookbook', 1176, 2073],
      ['lookbook-rooms', 1176, 1965],
      ['shop', 2544, 1209],
      ['enquiry', 2560, 1204],
      ['press', 2560, 3601],
    ]),
  },
  {
    slug: 'off-my-case',
    company: 'Off My Case',
    year: '2018',
    gradient: 'linear-gradient(180deg, #4A2129 0%, #9E5560 100%)',
    more: true,
    logo: '/logo/companies/OffMyCase.svg',
    images: cases('off-my-case', 'Off My Case', [
      ['home', 1827, 852],
      ['customize', 1824, 1044],
      ['product', 1956, 1044],
      ['product-info', 1956, 1044],
      ['cart', 1479, 921],
      ['instagram', 1827, 1869],
    ]),
  },
  {
    slug: 'gemmed',
    company: 'Gemmed',
    year: '2018',
    gradient: 'linear-gradient(180deg, #2E241A 0%, #7D6142 100%)',
    more: true,
    logo: '/logo/companies/Gemmed.png',
    images: cases('gemmed', 'Gemmed', [
      ['home', 1506, 936],
      ['bundles', 1508, 1002],
      ['shop-by-style', 1506, 1464],
      ['shop-all', 1836, 2688],
      ['product', 1836, 1064],
      ['product-more', 1836, 1206],
      ['kits', 1228, 750],
      ['shop-the-look', 1228, 2706],
    ]),
  },
  {
    slug: 'scunci',
    company: 'Scunci',
    year: '2018',
    gradient: 'linear-gradient(180deg, #1E1E1E 0%, #8E1B30 100%)',
    more: true,
    logo: '/logo/companies/Scunci.svg',
    images: cases('scunci', 'Scunci', [
      ['home', 1094, 1478],
      ['collaborations', 1094, 1712],
      ['home-video', 1094, 1376],
      ['collab', 2420, 1728],
      ['tutorials', 2420, 1138],
      ['retailers', 2420, 3822],
      ['newsletter-popup', 2394, 1138],
      ['newsletter', 1096, 624],
    ]),
  },
);

/** The short projects listed under "More projects", in order. */
export const MORE_PROJECTS = PROJECTS.filter((p) => p.more);

/** The homepage Selected Work cards, in order. */
export const FEATURED_PROJECTS = PROJECTS.filter((p): p is FeaturedProject => Boolean(p.card));

export function getProjectBySlug(slug: string): ProjectConfig | undefined {
  return PROJECTS.find((p) => p.slug === slug);
}

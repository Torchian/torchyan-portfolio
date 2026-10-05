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
  | 'brainstorm';

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
  /** As shown on the card and the case page: a year or a span. */
  year: string;
  gradient: string;
  images: { src: string; alt: string }[];
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
  'Screenshot 2025-11-05 at 17.24.23.png',
  'Screenshot 2025-11-05 at 17.21.44.png',
  'portrait-80s-retro-woman-blackandwhite-image-by-picsart-01-26-2026_08_04_PM.png',
  'Screenshot 2026-01-26 at 20.12.49.png',
  'Screenshot 2026-01-26 at 20.11.54.png',
  'Screenshot 2026-01-26 at 20.22.35.png',
  'Screenshot 2025-11-05 at 17.25.06.png',
  'Screenshot 2026-01-26 at 19.53.17.png',
  'Screenshot 2026-01-26 at 19.54.03.png',
  'Screenshot 2026-01-26 at 19.54.41.png',
  'Screenshot 2026-01-26 at 19.24.48.png',
  'Screenshot 2026-01-26 at 20.09.17.png',
  'Screenshot 2026-01-26 at 20.11.32.png',
  'Screenshot 2026-01-26 at 20.00.55.png',
  'Screenshot 2026-01-26 at 20.10.26.png',
  'Screenshot 2025-11-05 at 17.23.58.png',
  'Screenshot 2026-01-26 at 20.05.59.png',
  'Screenshot 2026-01-26 at 20.12.58.png',
  'Screenshot 2026-01-26 at 20.22.48.png',
  'Screenshot 2026-01-26 at 20.23.49.png',
  'Screenshot 2026-01-26 at 20.02.34.png',
  'Screenshot 2025-11-05 at 17.24.57.png',
  'Screenshot 2026-01-26 at 20.16.41.png',
  'Screenshot 2026-01-26 at 19.55.01.png',
];

const SMARTBET_IMAGES = [
  'About - Our Vision.png',
  'About Company - Our Mission.png',
  'Careers.png',
  'Gaming Proiducts - Casino.png',
  'ICE.png',
  'Kaboom.png',
  'Platform Proiducts - Smart Connect.png',
  'Platform Proiducts - Smart Control.png',
  'Products - Smart Sports Inner page Copy 10.png',
  'Products - Smart Sports Inner page Copy 16.png',
  'Products - Smart Sports Inner page Copy 4.png',
  'Products - Smart Sports Inner page.png',
  'Products - Smart Sports.png',
  'Providers.png',
  'Screenshot 2025-11-05 at 17.31.10 15.28.58.png',
  'Screenshot 2025-11-05 at 17.32.26 15.28.58.png',
  'Screenshot 2025-11-05 at 17.32.49 15.28.58.png',
  'Screenshot 2025-11-05 at 17.33.13 15.28.58.png',
  'Screenshot 2025-11-05 at 17.33.22 15.28.58.png',
  'Services.png',
  'Smart Dealer.png',
  'Smart Feed.png',
  'Smart Games.png',
  'Smart Sports Copy 3.png',
  'Smart Sports.png',
];

/** Soulone images by height: 4 (1728), 0/1/2 (1200), 6 (837) */
const SOULONE_IMAGES = ['4.png', '0.png', '1.png', '2.png', '6.png'];

function toImages(folder: string, files: string[], alt: string) {
  return files.map((f) => ({ src: `/selected-work/${folder}/${f}`, alt }));
}

/** Ginosi, Benzeen, World Education, Brainstorm: case-page colours, from their Work rows. */
const GINOSI_GRADIENT = 'linear-gradient(180deg, #102649 0%, #5C4AC0 100%)';
const BRAINSTORM_GRADIENT = 'linear-gradient(180deg, #5C4AC0 0%, #8A5FA0 100%)';
const BENZEEN_GRADIENT = 'linear-gradient(180deg, #6B4A12 0%, #927F3D 100%)';
const WORLD_EDUCATION_GRADIENT = 'linear-gradient(180deg, #5E5128 0%, #927F3D 100%)';

const various = (files: string[], alt: string) =>
  files.map((f) => ({ src: `/selected-work/various/${f}`, alt }));

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

/** The homepage Selected Work cards, in order. */
export const FEATURED_PROJECTS = PROJECTS.filter((p): p is FeaturedProject => Boolean(p.card));

export function getProjectBySlug(slug: string): ProjectConfig | undefined {
  return PROJECTS.find((p) => p.slug === slug);
}

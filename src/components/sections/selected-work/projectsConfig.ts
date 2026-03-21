/**
 * Project config with company-specific gradients.
 * Each project has a full-screen 2-color gradient background.
 */

export interface ProjectConfig {
  slug: string;
  company: string;
  roles: string[];
  title: string;
  description: string;
  field: string;
  year: string;
  gradient: string;
  images: { src: string; alt: string }[];
  href?: string;
  /** Masonry columns (default 4) */
  masonryColumns?: number;
  /** Grid rotation in degrees (default 45) */
  masonryRotation?: number;
  /** Column display order, e.g. [1, 0, 2] swaps first two columns */
  masonryColumnOrder?: number[];
  /** Custom images per column; when set, overrides default distribution */
  masonryColumnImages?: { src: string; alt: string }[][];
}

/** Picsart */
const PICSART_GRADIENT = 'linear-gradient(180deg, #920792 0%, #7F4AD9 100%)';

/** Smartbet */
const SMARTBET_GRADIENT = 'linear-gradient(180deg, #1C014A 0%, #30155E 100%)';

/** Soulone */
const SOULONE_GRADIENT = 'linear-gradient(180deg, #8FAF52 0%, #487A37 100%)';

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

function souloneColumnImages(): { src: string; alt: string }[][] {
  const imgs = toImages('soulone', SOULONE_IMAGES, 'Soulone');
  // Col 1 & 5: largest (4.png), 2nd largest (0.png)
  // Col 2 & 4: next longest (1.png, 2.png)
  // Col 3: other (6.png)
  return [[imgs[0]], [imgs[2]], [imgs[4]], [imgs[3]], [imgs[1]]];
}

export const PROJECTS: ProjectConfig[] = [
  {
    slug: 'picsart',
    company: 'Picsart',
    roles: ['Product Design', 'Frontend', 'Design System'],
    title: 'Creative Platform',
    description: 'End-to-end product design and frontend development for the world\'s largest creative platform.',
    field: 'Design · Development',
    year: '2024',
    gradient: PICSART_GRADIENT,
    images: toImages('picsart', PICSART_IMAGES, 'Picsart'),
    masonryColumns: 4,
    masonryRotation: 45,
    href: '/projects/picsart',
  },
  {
    slug: 'smartbet',
    company: 'Smartbet',
    roles: ['Product Design', 'Frontend', 'Backend'],
    title: 'Sports & Gaming Platform',
    description: 'Design engineering for a B2B sports betting and gaming platform.',
    field: 'Fintech · Gaming',
    year: '2024',
    gradient: SMARTBET_GRADIENT,
    images: toImages('smartbet', SMARTBET_IMAGES, 'Smartbet'),
    masonryColumns: 3,
    masonryRotation: -45,
    masonryColumnOrder: [1, 0, 2],
    href: '/projects/smartbet',
  },
  {
    slug: 'soulone',
    company: 'Soulone',
    roles: ['Design Lead', 'Full-stack'],
    title: 'Product Suite',
    description: 'Brand identity and product design for a tech startup.',
    field: 'SaaS · Branding',
    year: '2024',
    gradient: SOULONE_GRADIENT,
    images: toImages('soulone', SOULONE_IMAGES, 'Soulone'),
    masonryColumns: 5,
    masonryRotation: 45,
    masonryColumnImages: souloneColumnImages(),
    href: '/projects/soulone',
  },
];

export function getProjectBySlug(slug: string): ProjectConfig | undefined {
  return PROJECTS.find((p) => p.slug === slug);
}

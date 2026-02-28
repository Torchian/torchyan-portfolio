/**
 * Project config with company-specific gradients.
 * Each project has a full-screen 2-color gradient background.
 */

export interface ProjectConfig {
  company: string;
  roles: string[];
  title: string;
  description: string;
  field: string;
  year: string;
  gradient: string;
  images: { src: string; alt: string }[];
  href?: string;
}

/** Picsart: purple to pink */
const PICSART_GRADIENT = 'linear-gradient(180deg, #4C1D95 0%, #A21CAF 50%, #EC4899 100%)';

/** Smartbet: dark purple-blue (from design) */
const SMARTBET_GRADIENT = 'linear-gradient(180deg, #0B0915 0%, #1F1A38 100%)';

/** Soulone: deep blue to teal */
const SOULONE_GRADIENT = 'linear-gradient(180deg, #0F172A 0%, #1E3A5F 50%, #0D9488 100%)';

export const PROJECTS: ProjectConfig[] = [
  {
    company: 'Picsart',
    roles: ['Product Design', 'Frontend', 'Design System'],
    title: 'Creative Platform',
    description: 'End-to-end product design and frontend development for the world\'s largest creative platform.',
    field: 'Design · Development',
    year: '2024',
    gradient: PICSART_GRADIENT,
    images: [
      { src: '/selected-work/Screenshot 2025-11-05 at 17.24.23.png', alt: 'Picsart' },
      { src: '/selected-work/Screenshot 2025-11-05 at 17.21.44.png', alt: 'Picsart' },
      { src: '/selected-work/portrait-80s-retro-woman-blackandwhite-image-by-picsart-01-26-2026_08_04_PM.png', alt: 'Picsart' },
      { src: '/selected-work/Screenshot 2026-01-26 at 20.12.49.png', alt: 'Picsart' },
      { src: '/selected-work/Screenshot 2026-01-26 at 20.11.54.png', alt: 'Picsart' },
      { src: '/selected-work/Screenshot 2026-01-26 at 20.22.35.png', alt: 'Picsart' },
      { src: '/selected-work/Screenshot 2025-11-05 at 17.25.06.png', alt: 'Picsart' },
      { src: '/selected-work/Screenshot 2026-01-26 at 19.53.17.png', alt: 'Picsart' },
      { src: '/selected-work/Screenshot 2026-01-26 at 19.54.03.png', alt: 'Picsart' },
      { src: '/selected-work/Screenshot 2026-01-26 at 19.54.41.png', alt: 'Picsart' },
      { src: '/selected-work/Screenshot 2026-01-26 at 19.24.48.png', alt: 'Picsart' },
      { src: '/selected-work/Screenshot 2026-01-26 at 20.09.17.png', alt: 'Picsart' },
      { src: '/selected-work/Screenshot 2026-01-26 at 20.11.32.png', alt: 'Picsart' },
      { src: '/selected-work/Screenshot 2026-01-26 at 20.00.55.png', alt: 'Picsart' },
      { src: '/selected-work/Screenshot 2026-01-26 at 20.10.26.png', alt: 'Picsart' },
      { src: '/selected-work/Screenshot 2025-11-05 at 17.23.58.png', alt: 'Picsart' },
      { src: '/selected-work/Screenshot 2026-01-26 at 20.05.59.png', alt: 'Picsart' },
      { src: '/selected-work/Screenshot 2026-01-26 at 20.12.58.png', alt: 'Picsart' },
      { src: '/selected-work/Screenshot 2026-01-26 at 20.22.48.png', alt: 'Picsart' },
      { src: '/selected-work/Screenshot 2026-01-26 at 20.23.49.png', alt: 'Picsart' },
      { src: '/selected-work/Screenshot 2026-01-26 at 20.02.34.png', alt: 'Picsart' },
      { src: '/selected-work/Screenshot 2025-11-05 at 17.24.57.png', alt: 'Picsart' },
      { src: '/selected-work/Screenshot 2026-01-26 at 20.16.41.png', alt: 'Picsart' },
      { src: '/selected-work/Screenshot 2026-01-26 at 19.55.01.png', alt: 'Picsart' },
    ],
    href: '#',
  },
  {
    company: 'Smartbet',
    roles: ['Product Design', 'Frontend', 'Backend'],
    title: 'Sports & Gaming Platform',
    description: 'Design engineering for a B2B sports betting and gaming platform.',
    field: 'Fintech · Gaming',
    year: '2024',
    gradient: SMARTBET_GRADIENT,
    images: [],
    href: '#',
  },
  {
    company: 'Soulone',
    roles: ['Design Lead', 'Full-stack'],
    title: 'Product Suite',
    description: 'Brand identity and product design for a tech startup.',
    field: 'SaaS · Branding',
    year: '2024',
    gradient: SOULONE_GRADIENT,
    images: [],
    href: '#',
  },
];

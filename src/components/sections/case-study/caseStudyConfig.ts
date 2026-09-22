/**
 * Case Study page (Figma section 3155:9107 — Desktop 3155:10960, Tablet 3920:8937,
 * Mobile 3921:10850): the per-project imagery. The copy lives in
 * messages/*.json under caseStudy.<slug>; a project gets the page once it has
 * both an entry here and its copy.
 *
 * Only Picsart is filled in. The Timeline gallery and the use-case images are
 * placeholders drawn from the Picsart screenshots until the real ones arrive.
 */

import type { ProjectSlug } from '@/components/sections/selected-work/projectsConfig';

export interface CaseImage {
  src: string;
  /** Width ÷ height of the screenshot. */
  aspect: number;
}

/** What the sticky Timeline gallery shows for one step: a tall image, and two beside it. */
export interface GallerySet {
  main: CaseImage;
  side: [CaseImage, CaseImage];
}

export interface CaseStudyImagery {
  /**
   * The hero carousel's rows, left to right as they start. On scroll the first
   * row drifts left, the second right and the third left at half pace. Phones
   * show the first two.
   */
  carousel: CaseImage[][];
  /** One per Timeline step (caseStudy.<slug>.timeline.steps), in order. */
  timeline: GallerySet[];
  /** One per Visual System Architecture use case, in order. */
  useCases: CaseImage[];
}

const DESKTOP = 1280 / 713;
const PHONE = 342 / 744;

const picsart = (name: string, aspect: number): CaseImage => ({
  src: `/projects/collages/picsart/${name}.webp`,
  aspect,
});
const desk = (name: string) => picsart(name, DESKTOP);
const phone = (name: string) => picsart(name, PHONE);

const gallery = (main: string, a: string, b: string): GallerySet => ({
  main: phone(main),
  side: [desk(a), desk(b)],
});

export const CASE_STUDIES: Partial<Record<ProjectSlug, CaseStudyImagery>> = {
  picsart: {
    // Figma: Case Study Carousel (3073:2504), state Start.
    carousel: [
      [
        phone('mobile-feed'),
        desk('marketplace-home'),
        phone('mobile-search-all'),
        desk('marketplace-filters'),
        phone('mobile-search'),
        desk('marketplace-home'),
        phone('mobile-collections'),
        desk('editor-templates'),
      ],
      [
        desk('marketplace-item'),
        phone('mobile-item'),
        phone('mobile-profile'),
        desk('discovery-collections'),
        phone('mobile-creator-profile'),
        desk('marketplace-checkout'),
        phone('mobile-actions'),
        desk('marketplace-creator'),
      ],
      [
        phone('mobile-creator-profile'),
        desk('marketplace-feed'),
        desk('marketplace-search'),
        phone('mobile-filters'),
        phone('mobile-templates'),
        desk('discovery-home'),
        desk('marketplace-editor'),
        phone('mobile-search-stickers'),
      ],
    ],
    timeline: [
      gallery('mobile-feed', 'marketplace-home', 'discovery-home'),
      gallery('mobile-search-all', 'marketplace-search', 'marketplace-filters'),
      gallery('mobile-item', 'marketplace-item', 'marketplace-checkout'),
      gallery('mobile-profile', 'discovery-collections', 'marketplace-creator'),
      gallery('mobile-filters', 'marketplace-editor', 'editor-templates'),
      gallery('mobile-templates', 'discovery-templates', 'marketplace-feed'),
      gallery('mobile-actions', 'marketplace-checkout', 'discovery-home'),
      gallery('mobile-search-stickers', 'marketplace-filters', 'marketplace-search'),
      gallery('mobile-collections', 'marketplace-creator', 'discovery-collections'),
      gallery('mobile-creator-profile', 'marketplace-home', 'editor-templates'),
    ],
    useCases: [
      desk('discovery-templates'),
      desk('marketplace-filters'),
      desk('discovery-home'),
      desk('marketplace-item'),
      desk('marketplace-search'),
    ],
  },
};

/** A paragraph, or a bulleted list. */
export type CaseLine = string | string[];
/** Lines that sit together; blocks are spaced apart. */
export type CaseBlock = CaseLine[];

export interface CaseStudyCopy {
  hero: {
    title: string;
    subtitle: string;
    description: string[];
    meta: { label: string; items: string[] }[];
  };
  timeline: {
    title: string;
    subtitle: string[];
    /** Each step is one card, or a run of phases that share a gallery set. */
    steps: { phase?: string; title: string; blocks: CaseBlock[] }[][];
  };
  blueprint: { title: string; subtitle: string; cards: { title: string; body: string }[] };
  architecture: {
    title: string;
    subtitle: string;
    useCases: { title: string; blocks: CaseBlock[] }[];
  };
}

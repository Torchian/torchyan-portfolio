/**
 * Case Study page (Figma section 3155:9107 — Desktop 3155:10960, Tablet 3920:8937,
 * Mobile 3921:10850): the per-project imagery. The copy lives in
 * messages/*.json under caseStudy.<slug>; a project gets the page once it has
 * both an entry here and its copy.
 *
 * A case needs a hero and a timeline; the principles cards (blueprint) and
 * the "In detail" use cases (architecture) are left out when a project has no
 * material for them. Only Picsart has the full case. Its galleries and use-case images are Picsart
 * screenshots, matched to each step as closely as the repo's set allows.
 */

import type { ProjectSlug } from '@/components/sections/selected-work/projectsConfig';

/** A short screen recording, played muted and looped in place of a screenshot (CaseMedia). */
export interface CaseVideo {
  /** MP4 (H.264), under public/. */
  src: string;
  /** Its first frame as an image: shown before it plays, and to reduced-motion visitors. */
  poster: string;
}

export interface CaseImage {
  src: string;
  /** Width ÷ height of the screenshot. */
  aspect: number;
  /** Shown instead of the screenshot where the slot can play it (not in the hero carousel). */
  video?: CaseVideo;
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
    // One set per Timeline step (caseStudy.picsart.timeline.steps), in order:
    // context, Growth, Ad Wizard, Marketplace, performance, what changed, what
    // it shows. Picsart's own screens; Ad Wizard has none in the repo yet, so
    // its step shows editor screens until those arrive.
    timeline: [
      gallery('mobile-feed', 'marketplace-home', 'discovery-home'),
      gallery('mobile-templates', 'discovery-templates', 'discovery-collections'),
      gallery('mobile-filters', 'marketplace-editor', 'editor-templates'),
      gallery('mobile-search-all', 'marketplace-search', 'marketplace-filters'),
      gallery('mobile-collections', 'discovery-collections', 'discovery-home'),
      gallery('mobile-item', 'marketplace-item', 'marketplace-checkout'),
      gallery('mobile-creator-profile', 'marketplace-creator', 'marketplace-feed'),
    ],
    // One per Architecture use case: RTL/LTR, Design System integration, team
    // components, accessibility, Ad Wizard (editor screens until its own arrive).
    useCases: [
      desk('marketplace-search'),
      desk('discovery-home'),
      desk('marketplace-filters'),
      desk('marketplace-item'),
      desk('editor-templates'),
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
  blueprint?: { title: string; subtitle: string; cards: { title: string; body: string }[] };
  architecture?: {
    title: string;
    subtitle: string;
    useCases: { title: string; blocks: CaseBlock[] }[];
  };
}

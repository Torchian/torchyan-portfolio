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

const PICSART_CASE: Partial<Record<ProjectSlug, CaseStudyImagery>> = {
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

/* ---------- The other full cases ----------
 * Screens from each project's Figma board (Benzeen 4193:15320, Brainstorm
 * 4193:15355, World Education 4193:15404), and the Smartbet, SoulOne and
 * Ginosi screens already in the repo. Long page captures are framed from the
 * top: `frame` gives them a screen's proportions in the hero carousel, and the
 * other slots fill their boxes from the top anyway.
 */

/** An image at its real size. */
const at =
  (base: string) =>
  (name: string, width: number, height: number): CaseImage => ({ src: `${base}/${name}.webp`, aspect: width / height });

/** Shown in a screen-shaped frame: a desktop's 16:9-ish, or a phone's. */
const frame = (image: CaseImage, shape: 'desktop' | 'phone'): CaseImage => ({
  ...image,
  aspect: shape === 'desktop' ? DESKTOP : PHONE,
});
const set = (main: CaseImage, a: CaseImage, b: CaseImage): GallerySet => ({ main, side: [a, b] });

/* Smartbet: the Selected Work collage's screens. */
const sb = at('/projects/collages/smartbet');
const sbDesk = (name: string) => sb(name, 1280, 709);
const sbPhone = (name: string) => sb(name, 486, 864);

/* SoulOne: the concept's screens, from the About timeline and the homepage card. */
const so = at('/about/timeline/soulone');
const soGrid = at('/selected-work/soulone/grid');
const soPhones = at('/projects/collages/soulone');
const SO = {
  hero: so('hero', 1200, 858),
  home: so('home', 1200, 1347),
  product: so('product', 1200, 3469),
  body: so('body', 1200, 917),
  cakes: so('cakes', 837, 1200),
  yinYang: so('yin-yang', 1200, 642),
  guidance: so('guidance', 1200, 2419),
  plans: so('plans', 1200, 995),
  pageA: soGrid('s-a1-v2', 1180, 4096),
  pageB: soGrid('s-a2-v2', 1366, 1533),
  pageC: soGrid('s-c1-v2', 1366, 3949),
  pageD: soGrid('s-c2-v2', 1333, 4096),
  pageE: soGrid('s-c3-v2', 1366, 2754),
  phoneA: soGrid('s-b1-v2', 415, 3618),
  phoneB: soGrid('s-b2-v2', 410, 4096),
  phoneC: soGrid('s-b3-v2', 415, 3559),
  phoneHome: soPhones('iphone-home', 142, 4096),
  phoneProduct: soPhones('iphone-product-2', 212, 4096),
  phoneProduct2: soPhones('iphone-product-3', 185, 4096),
};

/* Ginosi: archived screens of the original build. */
const GI = {
  search: at('/selected-work/various')('ginosi-search', 1920, 1265),
  apartel: at('/selected-work/various')('ginosi-apartel', 1903, 903),
  downtown: at('/projects/collages/websites')('ginosi-downtown', 673, 319),
  searchCrop: at('/projects/collages/websites')('ginosi-search', 673, 443),
};

const bz = at('/projects/cases/benzeen');
const BZ = {
  home: bz('home-hero', 1356, 970),
  categories: bz('categories', 1356, 876),
  usedParts: bz('used-parts', 1358, 1406),
  arrivals: bz('recent-arrivals', 1356, 1508),
  stock: bz('stock', 1356, 1360),
  wheel: bz('wheel', 1356, 1452),
  moreParts: bz('more-parts', 1356, 1608),
  lexus: bz('stock-lexus', 1356, 1688),
  cutSheets: bz('cut-sheets', 1358, 1156),
  contact: bz('contact', 1358, 1150),
  quote: bz('quote', 1354, 1466),
  shipping: bz('shipping-modal', 1356, 642),
  makeFilter: bz('make-filter', 1356, 644),
  partModal: bz('part-modal', 1356, 600),
  search: bz('search', 1356, 642),
  saved: bz('saved-items', 1354, 902),
  settings: bz('settings', 1352, 900),
  footer: bz('footer', 1356, 930),
  vision: bz('vision', 1356, 1854),
  facility: bz('facility', 1356, 936),
};

const bs = at('/projects/cases/brainstorm');
const BS = {
  home: bs('home', 1416, 1330),
  homeProjects: bs('home-projects', 1416, 1858),
  contact: bs('contact-cta', 1416, 668),
  careers: bs('careers', 1416, 1182),
  jobs: bs('careers-jobs', 1416, 1182),
  projects: bs('projects', 1416, 1858),
  ux: bs('services-ux', 1416, 874),
  services: bs('services', 1416, 2396),
  design: bs('services-design', 1416, 1426),
  menu: bs('menu', 1416, 666),
};

const we = at('/projects/cases/world-education');
const WE = {
  hero: we('hero', 2482, 1380),
  connect: we('connect', 2482, 1380),
  servicesMap: we('services-map', 2482, 1380),
  article: we('article', 2482, 1380),
  howTo: we('how-to', 2482, 1380),
  about: we('about', 2482, 1380),
  prices: we('prices', 2482, 1380),
  insights: we('insights', 2478, 1162),
  partners: we('partners', 2476, 978),
  blog: we('blog', 2480, 1268),
  mHero: we('m-hero', 342, 590),
  mAbout: we('m-about', 342, 1124),
  mPricing: we('m-pricing', 342, 1188),
  mSignIn: we('m-sign-in', 342, 742),
  mCommunities: we('m-communities', 342, 980),
  mUniversities: we('m-universities', 342, 1052),
  mServices: we('m-services', 342, 686),
  mPartners: we('m-partners', 342, 1070),
  mInsights: we('m-insights', 342, 860),
  mGrants: we('m-grants', 652, 1380),
  mBenefits: we('m-benefits', 650, 1316),
};

const d = (image: CaseImage) => frame(image, 'desktop');
const p = (image: CaseImage) => frame(image, 'phone');

export const MORE_CASE_STUDIES: Partial<Record<ProjectSlug, CaseStudyImagery>> = {
  smartbet: {
    carousel: [
      [
        sbPhone('mobile-kaboom'),
        sbDesk('products-overview'),
        sbPhone('mobile-smart-sports'),
        sb('desktop-sports', 1280, 712),
        sbPhone('mobile-our-vision'),
        sbDesk('gaming-casino'),
        sbPhone('mobile-smart-feed'),
        sbDesk('providers'),
      ],
      [
        sbDesk('platform-smart-connect'),
        sbPhone('mobile-our-mission'),
        sb('desktop-virtuals', 1280, 712),
        sbPhone('mobile-kaboom'),
        sbDesk('products-smart-sports'),
        sbPhone('mobile-smart-sports'),
        sb('desktop-feed', 1280, 712),
        sbDesk('careers'),
      ],
      [
        sbPhone('mobile-smart-feed'),
        sbDesk('about-our-vision'),
        sbDesk('ice'),
        sbPhone('mobile-our-vision'),
        sbDesk('platform-smart-control'),
        sb('desktop-careers-hero', 1280, 712),
        sbPhone('mobile-our-mission'),
        sbDesk('products-overview'),
      ],
    ],
    // Context, UI foundation, product pages, motion, supporting sections, what changed, what it shows.
    timeline: [
      set(sbPhone('mobile-kaboom'), sbDesk('products-overview'), sb('desktop-sports', 1280, 712)),
      set(sbPhone('mobile-smart-feed'), sbDesk('platform-smart-connect'), sbDesk('platform-smart-control')),
      set(sbPhone('mobile-smart-sports'), sbDesk('products-smart-sports'), sbDesk('gaming-casino')),
      set(sbPhone('mobile-our-vision'), sb('desktop-virtuals', 1280, 712), sb('desktop-feed', 1280, 712)),
      set(sbPhone('mobile-our-mission'), sbDesk('providers'), sbDesk('ice')),
      set(sbPhone('mobile-kaboom'), sb('desktop-careers-hero', 1280, 712), sbDesk('careers')),
      set(sbPhone('mobile-smart-sports'), sbDesk('about-our-vision'), sbDesk('products-overview')),
    ],
    // Product navigation, product identities, the hero, the menu, staged reveals.
    useCases: [
      sb('desktop-sports', 1280, 712),
      sbDesk('gaming-casino'),
      sbDesk('products-overview'),
      sbDesk('platform-smart-control'),
      sbDesk('providers'),
    ],
  },
  soulone: {
    carousel: [
      [p(SO.phoneA), SO.hero, p(SO.phoneB), d(SO.home), p(SO.phoneC), SO.yinYang, p(SO.phoneProduct), SO.plans],
      [d(SO.pageB), p(SO.phoneHome), SO.body, p(SO.phoneA), d(SO.product), p(SO.phoneProduct2), d(SO.pageC), SO.cakes],
      [p(SO.phoneC), d(SO.guidance), SO.hero, p(SO.phoneB), d(SO.pageE), p(SO.phoneProduct), d(SO.pageD), SO.yinYang],
    ],
    // Context, brand foundations, messaging, homepage, product pages, prototype and social, what changed, what it shows.
    timeline: [
      set(SO.phoneA, SO.hero, SO.yinYang),
      set(SO.phoneB, SO.body, SO.plans),
      set(SO.phoneC, SO.home, SO.guidance),
      set(SO.phoneHome, SO.pageA, SO.cakes),
      set(SO.phoneProduct, SO.product, SO.pageC),
      set(SO.phoneProduct2, SO.pageD, SO.pageE),
      set(SO.phoneA, SO.pageB, SO.hero),
      set(SO.phoneB, SO.home, SO.cakes),
    ],
    // Brand presentation, cakes and balls together, product detail, prototype, logo.
    useCases: [SO.hero, SO.home, SO.product, SO.pageC, SO.yinYang],
  },
  ginosi: {
    carousel: [
      [GI.search, GI.downtown, GI.apartel, GI.searchCrop, GI.search, GI.downtown],
      [GI.apartel, GI.searchCrop, GI.search, GI.downtown, GI.apartel, GI.searchCrop],
      [GI.downtown, GI.search, GI.searchCrop, GI.apartel, GI.downtown, GI.search],
    ],
    // Context, designs into structure, search and properties, responsive, what changed, what it shows.
    timeline: [
      set(GI.search, GI.apartel, GI.downtown),
      set(GI.apartel, GI.search, GI.searchCrop),
      set(GI.searchCrop, GI.search, GI.apartel),
      set(GI.downtown, GI.apartel, GI.search),
      set(GI.search, GI.downtown, GI.searchCrop),
      set(GI.apartel, GI.searchCrop, GI.downtown),
    ],
    useCases: [],
  },
  benzeen: {
    carousel: [
      [BZ.home, d(BZ.arrivals), BZ.categories, d(BZ.wheel), BZ.cutSheets, d(BZ.usedParts), BZ.search, d(BZ.quote)],
      [d(BZ.stock), BZ.makeFilter, d(BZ.lexus), BZ.partModal, d(BZ.moreParts), BZ.saved, d(BZ.vision), BZ.facility],
      [BZ.categories, d(BZ.contact), BZ.shipping, d(BZ.vision), BZ.home, d(BZ.wheel), BZ.settings, d(BZ.arrivals)],
    ],
    // Context, structure and styling, alongside the designers, the storefront, interaction and AMP, what changed, what it shows.
    timeline: [
      set(BZ.arrivals, BZ.home, BZ.categories),
      set(BZ.usedParts, BZ.footer, BZ.cutSheets),
      set(BZ.vision, BZ.cutSheets, BZ.facility),
      set(BZ.wheel, BZ.stock, BZ.moreParts),
      set(BZ.lexus, BZ.makeFilter, BZ.partModal),
      set(BZ.quote, BZ.saved, BZ.shipping),
      set(BZ.moreParts, BZ.search, BZ.contact),
    ],
    // A design that kept changing; Google AMP.
    useCases: [BZ.cutSheets, BZ.wheel],
  },
  brainstorm: {
    carousel: [
      [BS.home, d(BS.homeProjects), BS.ux, d(BS.services), BS.menu, d(BS.projects), BS.careers, BS.contact],
      [d(BS.design), BS.jobs, d(BS.home), BS.ux, d(BS.homeProjects), BS.menu, d(BS.services), BS.careers],
      [BS.contact, d(BS.projects), BS.careers, d(BS.design), BS.home, d(BS.services), BS.jobs, BS.ux],
    ],
    // Context, evolving design, layouts, animation, scroll events, what changed, what it shows.
    timeline: [
      set(BS.homeProjects, BS.home, BS.menu),
      set(BS.projects, BS.design, BS.ux),
      set(BS.services, BS.careers, BS.jobs),
      set(BS.home, BS.design, BS.contact),
      set(BS.homeProjects, BS.services, BS.ux),
      set(BS.projects, BS.careers, BS.home),
      set(BS.services, BS.jobs, BS.menu),
    ],
    // Scroll-driven animation; a design still taking shape.
    useCases: [BS.services, BS.home],
  },
  'world-education': {
    carousel: [
      [
        p(WE.mHero),
        WE.hero,
        p(WE.mCommunities),
        WE.connect,
        p(WE.mServices),
        WE.servicesMap,
        p(WE.mInsights),
        WE.prices,
      ],
      [WE.about, p(WE.mUniversities), WE.article, p(WE.mPricing), WE.howTo, p(WE.mSignIn), WE.insights, p(WE.mAbout)],
      [p(WE.mPartners), WE.blog, WE.partners, p(WE.mGrants), WE.hero, p(WE.mBenefits), WE.connect, p(WE.mHero)],
    ],
    // Context, responsive pages, content and services, animation and interaction, what changed, what it shows.
    timeline: [
      set(WE.mHero, WE.hero, WE.connect),
      set(WE.mCommunities, WE.about, WE.prices),
      set(WE.mServices, WE.servicesMap, WE.article),
      set(WE.mInsights, WE.howTo, WE.insights),
      set(WE.mGrants, WE.blog, WE.partners),
      set(WE.mUniversities, WE.hero, WE.servicesMap),
    ],
    useCases: [],
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

/** Every project with a full case, by slug. */
export const CASE_STUDIES: Partial<Record<ProjectSlug, CaseStudyImagery>> = { ...PICSART_CASE, ...MORE_CASE_STUDIES };

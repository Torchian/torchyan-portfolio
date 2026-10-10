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
  /**
   * A phone's screen. Its captures are narrow, so a gallery whose tall image is
   * one gives it 30% of the width rather than half, where it would be blown up
   * past its own pixels. Marked, not guessed from the shape: a desktop page
   * captured whole is as tall and narrow as a phone screen.
   */
  phone?: boolean;
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
const phone = (name: string) => ({ ...picsart(name, PHONE), phone: true });

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
  ...(shape === 'phone' ? { phone: true } : {}),
});
/** A phone's screen (CaseImage.phone). */
const mobile = (image: CaseImage): CaseImage => ({ ...image, phone: true });
const set = (main: CaseImage, a: CaseImage, b: CaseImage): GallerySet => ({ main, side: [a, b] });

/* Smartbet: the Selected Work collage's screens. */
const sb = at('/projects/collages/smartbet');
const sbDesk = (name: string) => sb(name, 1280, 709);
const sbPhone = (name: string) => mobile(sb(name, 486, 864));

/*
 * SoulOne: its Figma board (4205:34708), every screen once — sixteen desktop
 * pages and fifteen phone screens, each framed from its full capture, in
 * public/projects/sets/soulone.
 */
const sos = at('/projects/sets/soulone');
const soPhone = (name: string, width: number, height: number) => mobile(sos(name, width, height));
const SO = {
  hero: sos('hero', 1600, 1128),
  cakes: sos('cakes-1', 1024, 880),
  chocoFit: sos('cakes-3', 1024, 623),
  honey: sos('cakes-4', 1024, 837),
  catalogue: sos('catalogue', 1600, 2460),
  product: sos('product', 1600, 2432),
  story: sos('story', 1600, 2372),
  balls: sos('balls', 1024, 1300),
  bodyPlan: sos('body-plan', 1600, 1301),
  nutritionist: sos('nutritionist', 1600, 1205),
  locations: sos('locations', 1600, 1037),
  experts: sos('experts', 1600, 1012),
  guidance: sos('guidance', 1600, 968),
  customize: sos('customize', 1600, 966),
  yinYang: sos('yin-yang', 1600, 854),
  footer: sos('footer', 1600, 500),
  mCakes: soPhone('m-cakes', 402, 3701),
  mHome: soPhone('m-home', 402, 3509),
  mProduct: soPhone('m-product', 402, 2774),
  mStory: soPhone('m-story', 402, 2564),
  mBalls: soPhone('m-balls', 402, 1626),
  mCakeDetail: soPhone('m-cake-detail', 402, 1544),
  mHero: soPhone('m-hero', 402, 1343),
  mCakesCard: soPhone('m-cakes-card', 421, 1327),
  mCustomize: soPhone('m-customize', 402, 1245),
  mMenu: soPhone('m-menu', 402, 1142),
  mExperts: soPhone('m-experts', 402, 1083),
  mLocations: soPhone('m-locations', 402, 969),
  mPlans: soPhone('m-plans', 402, 915),
  mGuidance: soPhone('m-guidance', 402, 880),
  mFooter: soPhone('m-footer', 402, 833),
};

/*
 * Ginosi: archived screens of the original build — its whole Figma board
 * (4205:18814), each framed there from its full capture, in
 * public/projects/sets/ginosi.
 */
const gi = at('/projects/sets/ginosi');
const GI = {
  home: gi('home-1', 1064, 498),
  homeOffers: gi('home-2', 1064, 1046),
  homeCities: gi('home-3', 1064, 1157),
  apartel: gi('downtown-apartel', 1284, 610),
  additional: gi('additional', 1294, 898),
  blog: gi('blog', 1296, 1656),
  guide: gi('guide-1', 1121, 1337),
  guideMore: gi('guide-2', 1121, 1114),
  careers: gi('careers', 1296, 2198),
  job: gi('careers-job', 1296, 2300),
  castelldefels: gi('castelldefels-1', 1296, 780),
  castelldefelsRooms: gi('castelldefels-2', 1296, 1068),
  castelldefelsNearby: gi('castelldefels-3', 1296, 1153),
  downtown: gi('downtown-search', 1296, 1542),
  faq: gi('faq', 1294, 2006),
  locations: gi('locations', 1294, 1753),
  location: gi('location', 1296, 1876),
  news: gi('news', 1292, 1202),
  newsArticle: gi('news-article', 1294, 854),
  reservation: gi('reservation', 1294, 998),
  search: gi('search', 1294, 854),
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
  // The About page's top and its values, from the Figma board (4193:15299, 15302).
  aboutTop: bz('about-top', 793, 722),
  aboutValues: bz('about-values', 793, 944),
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
  mHero: mobile(we('m-hero', 342, 590)),
  mAbout: mobile(we('m-about', 342, 1124)),
  mPricing: mobile(we('m-pricing', 342, 1188)),
  mSignIn: mobile(we('m-sign-in', 342, 742)),
  mCommunities: mobile(we('m-communities', 342, 980)),
  mUniversities: mobile(we('m-universities', 342, 1052)),
  mServices: mobile(we('m-services', 342, 686)),
  mPartners: mobile(we('m-partners', 342, 1070)),
  mInsights: mobile(we('m-insights', 342, 860)),
  mGrants: mobile(we('m-grants', 652, 1380)),
  mBenefits: mobile(we('m-benefits', 650, 1316)),
  /** The app's screens side by side: wide enough for a desktop slot. */
  app: we('m-app', 650, 668),
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
    // No screen twice in the rows: twelve pages and twelve phone screens.
    carousel: [
      [p(SO.mHero), SO.hero, p(SO.mCakes), SO.cakes, p(SO.mBalls), SO.balls, p(SO.mCustomize), SO.customize],
      [d(SO.story), p(SO.mStory), d(SO.product), p(SO.mProduct), SO.nutritionist, p(SO.mHome), SO.locations, p(SO.mCakeDetail)],
      [p(SO.mCakesCard), SO.experts, p(SO.mExperts), SO.guidance, p(SO.mLocations), d(SO.catalogue), p(SO.mGuidance), SO.yinYang],
    ],
    // Context, brand foundations, messaging, homepage, product pages, prototype and social, what changed, what it shows.
    // Every page once, each with its own phone screen.
    timeline: [
      set(SO.mHome, SO.hero, SO.nutritionist),
      set(SO.mMenu, SO.yinYang, SO.footer),
      set(SO.mGuidance, SO.guidance, SO.bodyPlan),
      set(SO.mCakesCard, SO.cakes, SO.chocoFit),
      set(SO.mProduct, SO.product, SO.honey),
      set(SO.mCustomize, SO.customize, SO.balls),
      set(SO.mPlans, SO.catalogue, SO.locations),
      set(SO.mFooter, SO.story, SO.experts),
    ],
    // Brand presentation, cakes and balls together, product detail, prototype, logo.
    useCases: [SO.hero, SO.balls, SO.product, SO.catalogue, SO.yinYang],
  },
  ginosi: {
    // Every screen of the board once across the three rows.
    carousel: [
      [GI.home, d(GI.blog), GI.apartel, d(GI.locations), GI.search, d(GI.downtown), GI.castelldefels],
      [d(GI.location), GI.reservation, d(GI.careers), GI.newsArticle, d(GI.faq), GI.additional, d(GI.guide)],
      [GI.castelldefelsRooms, d(GI.homeCities), GI.guideMore, d(GI.job), GI.castelldefelsNearby, d(GI.news), GI.homeOffers],
    ],
    // Context, designs into structure, search and properties, responsive, what changed, what it shows.
    timeline: [
      set(GI.blog, GI.home, GI.apartel),
      set(GI.locations, GI.castelldefels, GI.homeOffers),
      set(GI.downtown, GI.search, GI.reservation),
      set(GI.location, GI.castelldefelsRooms, GI.castelldefelsNearby),
      set(GI.careers, GI.news, GI.additional),
      set(GI.faq, GI.newsArticle, GI.guide),
    ],
    useCases: [],
  },
  benzeen: {
    carousel: [
      [BZ.home, d(BZ.arrivals), BZ.categories, d(BZ.wheel), BZ.cutSheets, d(BZ.usedParts), BZ.search, d(BZ.quote)],
      [d(BZ.stock), BZ.makeFilter, d(BZ.lexus), BZ.partModal, d(BZ.moreParts), BZ.saved, d(BZ.vision), BZ.facility],
      [BZ.categories, d(BZ.contact), BZ.shipping, d(BZ.aboutValues), BZ.aboutTop, d(BZ.wheel), BZ.settings, d(BZ.arrivals)],
    ],
    // Context, structure and styling, alongside the designers, the storefront, interaction and AMP, what changed, what it shows.
    timeline: [
      set(BZ.arrivals, BZ.home, BZ.categories),
      set(BZ.usedParts, BZ.footer, BZ.cutSheets),
      set(BZ.vision, BZ.aboutTop, BZ.aboutValues),
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
      [p(WE.mPartners), WE.blog, WE.partners, p(WE.mGrants), WE.app, p(WE.mBenefits), WE.connect, p(WE.mHero)],
    ],
    // Context, responsive pages, content and services, animation and interaction, what changed, what it shows.
    timeline: [
      set(WE.mHero, WE.hero, WE.connect),
      set(WE.mCommunities, WE.about, WE.prices),
      set(WE.mServices, WE.servicesMap, WE.article),
      set(WE.mInsights, WE.howTo, WE.insights),
      set(WE.mGrants, WE.blog, WE.partners),
      set(WE.mUniversities, WE.app, WE.servicesMap),
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

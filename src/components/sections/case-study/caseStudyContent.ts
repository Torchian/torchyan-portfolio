import type { ProjectConfig } from '@/components/sections/selected-work/projectsConfig';
import type { TimelineEntry } from '@/components/sections/about/timelineConfig';

export interface CaseStudyHeroMeta {
  role: string[];
  scope: string[];
  platform: string[];
  stack: string[];
}

/** Optional blueprint rows (Role / Company / Timeline / Tools) — overrides flat meta when set. */
export interface CaseStudyHeroMetaRow {
  label: string;
  values: string[];
}

export interface CaseStudyBlueprintCard {
  title: string;
  body: string;
}

export interface CaseStudyBlueprintBlock {
  title: string;
  subtitle: string;
  cards: CaseStudyBlueprintCard[];
}

export interface CaseStudyVisualArchRow {
  title: string;
  body: string;
}

export interface CaseStudyVisualArchitectureBlock {
  title: string;
  subtitle: string;
  rows: CaseStudyVisualArchRow[];
}

export interface CaseStudyContent {
  heroTitle: string;
  tagline: string;
  intro: string;
  /** Legacy grid; ignored when heroMetaRows is set */
  meta: CaseStudyHeroMeta;
  /** When set, hero shows these labeled rows (matches case study blueprint). */
  heroMetaRows?: CaseStudyHeroMetaRow[];
  timelineHeading: string;
  timelineSubtitle: string;
  timeline: TimelineEntry[];
  blueprint?: CaseStudyBlueprintBlock;
  visualArchitecture?: CaseStudyVisualArchitectureBlock;
}

const PICSART_CASE: CaseStudyContent = {
  heroTitle: 'Picsart Marketplace',
  tagline: 'Global creative tools & content ecosystem',
  intro:
    'Work focused on systemic coherence across Marketplace and Discovery—not cosmetic iteration. ' +
    'Design tokens, component contracts, and delivery pipelines were aligned so the experience ' +
    'could scale without visual or engineering drift.',
  meta: {
    role: ['UI Architect', 'Frontend Engineer'],
    scope: ['Design System Migration', 'Accessibility', 'Performance Optimization'],
    platform: ['Web (Marketplace + Discovery)'],
    stack: ['React', 'JSS', 'Styled Components', 'i18n'],
  },
  heroMetaRows: [
    { label: 'Role', values: ['Lead Product Designer', 'UI Architect × Frontend Engineer'] },
    { label: 'Company', values: ['Picsart'] },
    { label: 'Timeline', values: ['2021 — 2023'] },
    { label: 'Tools', values: ['Figma', 'Adobe CC', 'Jira'] },
  ],
  timelineHeading: 'Project overview & delivery',
  timelineSubtitle:
    'Phases of systems work, from token governance through shipping outcomes—aligned to how the product actually scales.',
  timeline: [
    {
      year: 'Phase 01',
      stickyContent: 'Systems &\nGovernance',
      company: 'Design Systems',
      role: 'Token architecture & component governance',
      focus:
        'Semantic typography scale, color roles, spacing, and motion tokens shared across Marketplace and Discovery. Figma libraries aligned to code exports.',
      impact:
        'Reduced one-off variants, improved handoff clarity, and shortened build time for new surfaces.',
      coreGrowth: ['Token discipline', 'Single source of truth', 'Cross-squad alignment'],
    },
    {
      year: 'Phase 02',
      stickyContent: 'Structure &\nClarity',
      company: 'UI Architecture',
      role: 'Composable UI and layout contracts',
      focus:
        'Grid systems, responsive breakpoints, and module boundaries for listing, search, and asset detail flows.',
      impact:
        'More predictable layouts across locales and viewport sizes; fewer regressions when extending features.',
      coreGrowth: ['Layout contracts', 'Reusable modules', 'Responsive discipline'],
    },
    {
      year: 'Phase 03',
      stickyContent: 'Quality &\nScale',
      company: 'Accessibility & Performance',
      role: 'WCAG-oriented delivery and runtime cost',
      focus:
        'Keyboard flows, contrast, focus management, and bundle/render strategies for heavy media surfaces.',
      impact:
        'Improved inclusive defaults and measurable gains in perceived performance on key journeys.',
      coreGrowth: ['A11y baked in', 'Render strategy', 'Monitoring'],
    },
    {
      year: 'Phase 04',
      stickyContent: 'Localization &\nContent',
      company: 'Internationalization',
      role: 'Copy-safe layouts and messaging',
      focus:
        'String expansion, RTL considerations where applicable, and CMS-driven content without breaking layout.',
      impact:
        'Safer launches in multiple languages with fewer layout hotfixes post-release.',
      coreGrowth: ['i18n-ready UI', 'Content flexibility', 'Stable rhythm'],
    },
    {
      year: 'Phase 05',
      stickyContent: 'Workflow &\nHandoff',
      company: 'Design–Engineering workflow',
      role: 'Documentation and review rituals',
      focus:
        'Contribution models for the design system, PR review for UI changes, and visual regression awareness.',
      impact:
        'Clearer ownership and faster reviews when evolving shared primitives.',
      coreGrowth: ['Shared rituals', 'Docs that ship', 'Trust in the system'],
    },
    {
      year: 'Outcome',
      stickyContent: 'Coherent\nproduct',
      company: 'Product impact',
      role: 'Scalable marketplace experience',
      focus:
        'Connecting discovery, trust, and creation flows into one coherent architecture users could learn once and reuse everywhere.',
      impact:
        'A more maintainable surface area for teams building on top of Marketplace and related properties.',
      coreGrowth: ['Coherence', 'Maintainability', 'Velocity'],
    },
  ],
  blueprint: {
    title: 'System Blueprint & Visual Governance',
    subtitle:
      'A structured overview of design tokens, component logic, spatial rhythm, and interaction matrices that define internal product coherence.',
    cards: [
      {
        title: 'Typography Scale',
        body:
          'Typography is defined semantically (Display through Caption) and tied to tokens so teams cannot introduce arbitrary font sizing outside the rhythm grid.',
      },
      {
        title: 'Token Architecture',
        body:
          'Color roles, spacing scale, border radius logic, elevation levels — abstracted for scalability and theme adjustments.',
      },
      {
        title: 'Layout Grid System',
        body:
          'Responsive breakpoints and alignment governance; spacing adheres to the predefined modular token scale.',
      },
      {
        title: 'Component Hierarchy',
        body:
          'Base primitives → composite units → contextual modules, with required props, states, and usage constraints.',
      },
      {
        title: 'State Matrix',
        body:
          'Complete interaction coverage: default, hover, focus, active, disabled, loading — with accessibility and layout stability.',
      },
    ],
  },
  visualArchitecture: {
    title: 'Visual System Architecture',
    subtitle:
      'How typography, tokens, components, interaction states, and the layout grid interlock across the marketplace experience.',
    rows: [
      {
        title: 'Typography Scale System',
        body:
          'Typography is defined semantically: Display for emphasis, Heading for structure, Subheading for grouping, Body for readable blocks, Caption for metadata. Sizes, weights, line-heights, and letter-spacing are tokenized and aligned to a vertical rhythm grid — no arbitrary sizing.',
      },
      {
        title: 'Token Architecture',
        body:
          'Visual values are abstracted into tokens: color (Primary, Surface, Accent, Error, Success, Warning), spacing on a modular scale, radius tiers, elevation, opacity, and motion timing — reducing drift and redundant CSS.',
      },
      {
        title: 'Component Hierarchy Diagram',
        body:
          'Layer 1 — Primitives: buttons, inputs, typography, icons. Layer 2 — Composites: cards, modals, dropdowns. Layer 3 — Contextual modules: marketplace grids, discovery feeds, filtering panels — each with props, a11y, and responsive behavior.',
      },
      {
        title: 'Interaction State Matrix',
        body:
          'Every interactive element defines Default, Hover, Focus, Active, Disabled, and Loading. Focus meets accessibility requirements; loading states preserve layout to avoid content shift.',
      },
      {
        title: 'Layout Grid System',
        body:
          'Responsive architecture with a 12-column desktop grid, modular reduction for tablet and mobile, consistent gutters, defined max-content width, and density control — all on the same spacing token scale.',
      },
    ],
  },
};

const SMARTBET_CASE: CaseStudyContent = {
  heroTitle: 'Smartbet Platform',
  tagline: 'Product design & frontend for B2B sports and gaming',
  intro:
    'Design engineering work focused on complex product surfaces, brand consistency, and reliable delivery across multiple squads.',
  meta: {
    role: ['Product Design', 'Frontend', 'Backend'],
    scope: ['Marketing sites', 'Product dashboards', 'Brand systems'],
    platform: ['Web'],
    stack: ['React', 'Design system', 'API-driven UI'],
  },
  timelineHeading: 'Product delivery narrative',
  timelineSubtitle:
    'Major themes from research through implementation for this engagement.',
  timeline: [
    {
      year: '01',
      stickyContent: 'Discovery\n& scope',
      company: 'Problem framing',
      role: 'Stakeholder alignment',
      focus: 'Mapping user journeys and technical constraints for gaming and sports products.',
      impact: 'Clear priorities for MVP and phased delivery.',
      coreGrowth: ['Clarity', 'Roadmap', 'Constraints'],
    },
    {
      year: '02',
      stickyContent: 'Design\nsystems',
      company: 'UI systems',
      role: 'Components & patterns',
      focus: 'Reusable modules for marketing and app shells; documentation for handoff.',
      impact: 'Faster iteration on new pages and campaigns.',
      coreGrowth: ['Reuse', 'Consistency', 'Speed'],
    },
    {
      year: '03',
      stickyContent: 'Build\n& ship',
      company: 'Implementation',
      role: 'Frontend delivery',
      focus: 'Responsive layouts, integration with backend services, and performance basics.',
      impact: 'Stable releases with fewer UI regressions.',
      coreGrowth: ['Quality', 'Integration', 'Stability'],
    },
    {
      year: '04',
      stickyContent: 'Iterate',
      company: 'Optimization',
      role: 'Refinement',
      focus: 'Analytics-informed tweaks and accessibility passes on critical flows.',
      impact: 'Improved usability on high-traffic paths.',
      coreGrowth: ['Iteration', 'A11y', 'Metrics'],
    },
  ],
};

const SOULONE_CASE: CaseStudyContent = {
  heroTitle: 'Soulone Suite',
  tagline: 'Brand and product design for an emerging product line',
  intro:
    'End-to-end work spanning identity, interface design, and build-ready artifacts for a cohesive product story.',
  meta: {
    role: ['Design Lead', 'Full-stack'],
    scope: ['Branding', 'Product UI', 'Web presence'],
    platform: ['Web'],
    stack: ['Design', 'Frontend', 'Content'],
  },
  timelineHeading: 'From brand to build',
  timelineSubtitle:
    'Key phases from positioning through shipped interfaces.',
  timeline: [
    {
      year: '01',
      stickyContent: 'Brand\nfoundation',
      company: 'Identity',
      role: 'Positioning & visual language',
      focus: 'Core narrative, typography, and color system for the product family.',
      impact: 'A recognizable baseline for all touchpoints.',
      coreGrowth: ['Story', 'Visual DNA', 'Flexibility'],
    },
    {
      year: '02',
      stickyContent: 'Product\nUX',
      company: 'Experience design',
      role: 'Flows & IA',
      focus: 'Information architecture and primary user journeys.',
      impact: 'Reduced ambiguity before build.',
      coreGrowth: ['IA', 'Flows', 'Clarity'],
    },
    {
      year: '03',
      stickyContent: 'UI\nbuild',
      company: 'Interface',
      role: 'High-fidelity UI',
      focus: 'Screens, components, and states ready for development.',
      impact: 'Smooth handoff and fewer rework cycles.',
      coreGrowth: ['Craft', 'States', 'Handoff'],
    },
    {
      year: '04',
      stickyContent: 'Launch',
      company: 'Delivery',
      role: 'Ship & learn',
      focus: 'Supporting launch, gathering feedback, and planning next iterations.',
      impact: 'Solid foundation for growth.',
      coreGrowth: ['Launch', 'Feedback', 'Growth'],
    },
  ],
};

const BY_SLUG: Record<string, CaseStudyContent> = {
  picsart: PICSART_CASE,
  smartbet: SMARTBET_CASE,
  soulone: SOULONE_CASE,
};

export function padGridImages(
  images: { src: string; alt: string }[],
  target = 16
): { src: string; alt: string }[] {
  if (images.length === 0) return [];
  const out: { src: string; alt: string }[] = [];
  let i = 0;
  while (out.length < target) {
    out.push(images[i % images.length]);
    i += 1;
  }
  return out.slice(0, target);
}

export function getCaseStudyContent(project: ProjectConfig): CaseStudyContent {
  return BY_SLUG[project.slug] ?? {
    heroTitle: project.company,
    tagline: project.title,
    intro: project.description,
    meta: {
      role: project.roles,
      scope: [project.field],
      platform: ['Web'],
      stack: ['See project details'],
    },
    timelineHeading: 'Project narrative',
    timelineSubtitle: 'Overview of focus, impact, and outcomes for this engagement.',
    timeline: [
      {
        year: project.year,
        stickyContent: 'Overview',
        company: project.company,
        role: project.title,
        focus: project.description,
        impact: 'Delivered scoped work aligned with product goals.',
        coreGrowth: ['Execution', 'Collaboration', 'Quality'],
      },
    ],
  };
}

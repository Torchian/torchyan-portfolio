export interface CapabilityList {
  lead: string;
  items: string[];
}

export interface Capability {
  title: string;
  /** Main copy — a paragraph, or a lead line with a bulleted list. */
  text: string | CapabilityList;
  footnote: string;
  /** Shown inside the centre circle while the card is hovered (desktop), and as a row under the copy (tablet / mobile). */
  skills: string[];
}

/** Order matters: top-left, top-right, bottom-left, bottom-right on desktop. */
export const CAPABILITIES: Capability[] = [
  {
    title: 'Product UI Architecture',
    text: 'Designing the structural foundation of a product - how screens, components, and interactions relate and scale.',
    footnote: 'A UI that feels intentional, consistent, and future-proof.',
    skills: [
      'Figma',
      'UX heuristics',
      'Cross-team alignment',
      'Information Architecture',
      'Component logic & states',
      'Accessibility & WCAG',
      'Design systems',
      'User flows',
    ],
  },
  {
    title: 'Experimental & Systems Work',
    text: 'Exploring new interaction models, logic systems, and ideas beyond standard UI patterns.',
    footnote: 'I design interface structures that scale - from navigation logic to component ecosystems.',
    skills: [
      'Logic-driven UI',
      'Concept validation',
      'Playground experiments',
      'Creative coding concepts',
      'Sound interaction (Howler.js)',
      'Rapid iteration workflows',
      'Interactive prototypes',
      'State machines',
    ],
  },
  {
    title: 'Frontend Engineering',
    text: 'Turning design intent into production-ready interfaces that are accessible, performant, and maintainable.',
    footnote: 'Interfaces that look right, feel right, and hold up in production.',
    skills: [
      'Semantic HTML5',
      'Accessibility & WCAG',
      'CSS / SCSS architecture',
      'Styled Components / JSS',
      'Performance optimization',
      'Git-based workflows',
      'Responsive layouts',
      'React & Next.js',
    ],
  },
  {
    title: 'Motion & Interaction',
    text: {
      lead: 'What clients get',
      items: [
        'Better user orientation',
        'Clear feedback and transitions',
        'More intuitive interactions',
        'Motion that supports, not distracts',
      ],
    },
    footnote: 'Using motion and interaction to guide attention, communicate state, and improve usability.',
    skills: [
      'CSS animations',
      'Page transitions',
      'Microinteractions',
      'GPU-friendly animation',
      'Interaction feedback systems',
      'Timing & easing curves',
      'Motion hierarchy',
      'Framer Motion',
    ],
  },
];

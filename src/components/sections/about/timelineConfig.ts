export interface TimelineEntry {
  year: string;
  stickyContent: string;
  company: string;
  role: string;
  focus: string;
  impact: string;
  coreGrowth: string[];
}

export const TIMELINE_ENTRIES: TimelineEntry[] = [
  {
    year: '2016–2018',
    stickyContent: 'Foundation &\nStructural\nDiscipline',
    company: 'Apricode / MyZCapital',
    role: 'Web UI Developer / Web Designer',
    focus:
      'HTML5 / CSS3 / LESS / front-end implementation. UI development from Photoshop mockups. Shopware (8+ projects) ecosystems. Admin dashboards with charts and timelines. Collaboration with PHP backend teams.',
    impact:
      'Built scalable UI foundations for e-commerce platforms. Developed strong responsive and cross-browser standards. Established early discipline in semantic structure and modular styling.',
    coreGrowth: ['Precision', 'Structure', 'Systematic CSS architecture'],
  },
  {
    year: '2019',
    stickyContent: 'Precision &\nStructure',
    company: 'TCO / Brainstorm',
    role: 'UI Developer',
    focus:
      'HTML5 / CSS3 / LESS / front-end implementation. UI development from Photoshop mockups. Shopware ecosystems. Admin dashboards. Collaboration with PHP backend teams.',
    impact:
      'Built scalable UI foundations for e-commerce platforms. Developed strong responsive and cross-browser standards. Established early discipline in semantic structure and modular styling.',
    coreGrowth: ['Precision', 'Structure'],
  },
  {
    year: '2020',
    stickyContent: 'Scale &\nConsistency',
    company: 'VOLO',
    role: 'Frontend Developer',
    focus:
      'Component-based UI. Design systems. Cross-team collaboration. Performance and accessibility.',
    impact:
      'Shipped production-grade frontend applications. Improved code reuse and consistency across products.',
    coreGrowth: ['Precision', 'Structure'],
  },
  {
    year: '2021–2022',
    stickyContent: 'Systems &\nLeadership',
    company: 'SoftConstruct',
    role: 'Frontend Engineer (Lead)',
    focus:
      'Leading frontend architecture. Design systems. Mentorship. Complex product UIs.',
    impact:
      'Scaled UI foundations. Established patterns for responsive and accessible interfaces.',
    coreGrowth: ['Precision', 'Structure', 'Systematic CSS architecture'],
  },
  {
    year: '2023–2024',
    stickyContent: 'Platform &\nCollaboration',
    company: 'Picsart',
    role: 'Senior UI Engineer',
    focus:
      'Design systems. Creative tooling UI. Cross-organizational alignment. Performance and consistency.',
    impact:
      'Improved page rendering performance. Improved consistency. Increased cross-organizational collaboration. Enhanced engineering efficiency.',
    coreGrowth: ['Precision', 'Structure', 'Systematic CSS architecture'],
  },
  {
    year: '2024',
    stickyContent: 'Teaching &\nStructured Knowledge',
    company: 'Armenian Code Academy',
    role: 'UI Lecturer',
    focus: 'Teaching UI development. Workshops. Structured curriculum.',
    impact: 'Trained developers in modern frontend and design-system practices.',
    coreGrowth: ['From raw workshop to pure structured knowledge'],
  },
];

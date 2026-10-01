import type { ProjectSlug } from '@/components/sections/selected-work/projectsConfig';

/**
 * The four areas Torchyan takes responsibility for, in the order the homepage
 * cards show them (capabilities.items). Copy lives in messages/*.json under
 * servicesPage.areas.items, index for index; what doesn't change between
 * languages — the anchor and the related case pages — lives here.
 */
export const AREAS: { id: string; proof: ProjectSlug[] }[] = [
  { id: 'websites', proof: ['soulone', 'ginosi', 'benzeen', 'world-education', 'brainstorm'] },
  { id: 'product-interfaces', proof: ['picsart', 'smartbet'] },
  { id: 'design-systems', proof: ['picsart'] },
  { id: 'launch-and-improvement', proof: ['picsart'] },
];

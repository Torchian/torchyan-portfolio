/**
 * The four areas Torchyan takes responsibility for, in the order the homepage
 * cards show them (capabilities.items). Copy lives in messages/*.json under
 * servicesPage.areas.items, index for index; the anchor, which doesn't
 * change between languages, lives here.
 */
export const AREAS: { id: string }[] = [
  { id: 'websites' },
  { id: 'product-interfaces' },
  { id: 'design-systems' },
  { id: 'launch-and-improvement' },
];

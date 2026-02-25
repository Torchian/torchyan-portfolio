import imageUrlBuilder from '@sanity/image-url';
import { getClient } from './client';
import type { SanityImage } from '@/types/sanity';

let builder: ReturnType<typeof imageUrlBuilder> | null = null;

function getBuilder() {
  if (!builder) {
    const client = getClient();
    if (!client) return null;
    builder = imageUrlBuilder(client);
  }
  return builder;
}

export function urlFor(source: SanityImage) {
  const b = getBuilder();
  if (!b) return null;
  return b.image(source);
}

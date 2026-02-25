import { getClient } from '../client';

const pageBySlugQuery = `
  *[_type == "page" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    body,
    seo
  }
`;

const siteSettingsQuery = `
  *[_type == "siteSettings"][0] {
    title,
    description,
    ogImage,
    socialLinks
  }
`;

export async function getPageBySlug(slug: string, preview = false) {
  const client = getClient(preview);
  if (!client) return null;
  return client.fetch(pageBySlugQuery, { slug });
}

export async function getSiteSettings(preview = false) {
  const client = getClient(preview);
  if (!client) return null;
  return client.fetch(siteSettingsQuery);
}

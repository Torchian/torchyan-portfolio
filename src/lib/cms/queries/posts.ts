import { getClient } from '../client';

const allPostsQuery = `
  *[_type == "post"] | order(publishedAt desc) {
    _id,
    title,
    slug,
    excerpt,
    mainImage,
    publishedAt
  }
`;

const postBySlugQuery = `
  *[_type == "post" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    excerpt,
    mainImage,
    body,
    publishedAt,
    author->{name, image},
    seo
  }
`;

const postSlugsQuery = `
  *[_type == "post"] { "slug": slug.current }
`;

export async function getAllPosts(preview = false) {
  const client = getClient(preview);
  if (!client) return [];
  return client.fetch(allPostsQuery);
}

export async function getPostBySlug(slug: string, preview = false) {
  const client = getClient(preview);
  if (!client) return null;
  return client.fetch(postBySlugQuery, { slug });
}

export async function getPostSlugs() {
  const client = getClient();
  if (!client) return [];
  return client.fetch<{ slug: string }[]>(postSlugsQuery);
}

import { getClient } from '../client';

const allProjectsQuery = `
  *[_type == "project"] | order(order asc) {
    _id,
    title,
    slug,
    description,
    mainImage,
    tags,
    url,
    githubUrl,
    featured
  }
`;

const featuredProjectsQuery = `
  *[_type == "project" && featured == true] | order(order asc) {
    _id,
    title,
    slug,
    description,
    mainImage,
    tags,
    url
  }
`;

const projectBySlugQuery = `
  *[_type == "project" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    description,
    mainImage,
    body,
    tags,
    url,
    githubUrl,
    seo
  }
`;

const projectSlugsQuery = `
  *[_type == "project"] { "slug": slug.current }
`;

export async function getAllProjects(preview = false) {
  const client = getClient(preview);
  if (!client) return [];
  return client.fetch(allProjectsQuery);
}

export async function getFeaturedProjects(preview = false) {
  const client = getClient(preview);
  if (!client) return [];
  return client.fetch(featuredProjectsQuery);
}

export async function getProjectBySlug(slug: string, preview = false) {
  const client = getClient(preview);
  if (!client) return null;
  return client.fetch(projectBySlugQuery, { slug });
}

export async function getProjectSlugs() {
  const client = getClient();
  if (!client) return [];
  return client.fetch<{ slug: string }[]>(projectSlugsQuery);
}

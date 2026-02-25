import type { MetadataRoute } from 'next';
import { getProjectSlugs } from '@/lib/cms/queries/projects';
import { getPostSlugs } from '@/lib/cms/queries/posts';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://torchyan.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: new Date(), changeFrequency: 'monthly', priority: 1 },
    { url: `${siteUrl}/projects`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${siteUrl}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${siteUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${siteUrl}/consulting`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
  ];

  let projectRoutes: MetadataRoute.Sitemap = [];
  let postRoutes: MetadataRoute.Sitemap = [];

  try {
    const projectSlugs = await getProjectSlugs();
    projectRoutes = projectSlugs.map((p) => ({
      url: `${siteUrl}/projects/${p.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));
  } catch {
    // Sanity not configured yet
  }

  try {
    const postSlugs = await getPostSlugs();
    postRoutes = postSlugs.map((p) => ({
      url: `${siteUrl}/blog/${p.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));
  } catch {
    // Sanity not configured yet
  }

  return [...staticRoutes, ...projectRoutes, ...postRoutes];
}

import type { MetadataRoute } from 'next';
import { PROJECTS } from '@/components/sections/selected-work/projectsConfig';
import { routing } from '@/i18n/routing';
import { languageAlternates, localizedUrl } from '@/lib/seo/metadata';

interface Route {
  path: string;
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]['changeFrequency']>;
  priority: number;
}

/** Every page, once per language, each entry listing its other-language versions. */
const ROUTES: Route[] = [
  { path: '/', changeFrequency: 'monthly', priority: 1 },
  { path: '/projects', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/about', changeFrequency: 'monthly', priority: 0.6 },
  ...PROJECTS.map((project): Route => ({
    path: `/projects/${project.slug}`,
    changeFrequency: 'monthly',
    priority: 0.7,
  })),
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return ROUTES.flatMap((route) =>
    routing.locales.map((locale) => ({
      url: localizedUrl(locale, route.path),
      lastModified,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
      alternates: { languages: languageAlternates(route.path) },
    })),
  );
}

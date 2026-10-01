import type { MetadataRoute } from 'next';
import { PROJECTS } from '@/components/sections/selected-work/projectsConfig';
import { routing } from '@/i18n/routing';
import { languageAlternates, localizedUrl } from '@/lib/seo/metadata';
import { maintenanceIsOn } from '@/lib/maintenance';

interface Route {
  path: string;
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]['changeFrequency']>;
  priority: number;
}

/** Every page, once per language, each entry listing its other-language versions. */
const ROUTES: Route[] = [
  { path: '/', changeFrequency: 'monthly', priority: 1 },
  { path: '/services', changeFrequency: 'monthly', priority: 0.9 },
  { path: '/projects', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/contact', changeFrequency: 'yearly', priority: 0.7 },
  { path: '/about', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/privacy', changeFrequency: 'yearly', priority: 0.2 },
  ...PROJECTS.map((project): Route => ({
    path: `/projects/${project.slug}`,
    changeFrequency: 'monthly',
    priority: 0.7,
  })),
];

export default function sitemap(): MetadataRoute.Sitemap {
  // Nothing to offer while the site is closed; listing pages that all answer
  // 503 only invites a crawler to keep asking for them.
  if (maintenanceIsOn()) return [];

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

import type { MetadataRoute } from 'next';
import { siteMetadata } from '@/lib/seo/constants';
import { maintenanceIsOn } from '@/lib/maintenance';

export default function robots(): MetadataRoute.Robots {
  // While the site is closed, say so here too: every page answers 503 anyway,
  // and a crawler told to stay away stops asking.
  if (maintenanceIsOn()) {
    return { rules: [{ userAgent: '*', disallow: '/' }] };
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/'],
      },
    ],
    sitemap: `${siteMetadata.siteUrl}/sitemap.xml`,
  };
}

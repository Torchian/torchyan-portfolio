import { siteMetadata } from './constants';

export function personJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: siteMetadata.siteName,
    url: siteMetadata.siteUrl,
    jobTitle: 'Design Engineer',
    sameAs: [] as string[],
  };
}

export function webSiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteMetadata.siteName,
    url: siteMetadata.siteUrl,
    description: siteMetadata.defaultDescription,
  };
}

interface ArticleJsonLdProps {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  modifiedAt?: string;
  image?: string;
  authorName?: string;
}

export function articleJsonLd({
  title,
  description,
  url,
  publishedAt,
  modifiedAt,
  image,
  authorName,
}: ArticleJsonLdProps) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    url,
    datePublished: publishedAt,
    ...(modifiedAt && { dateModified: modifiedAt }),
    ...(image && { image }),
    author: {
      '@type': 'Person',
      name: authorName ?? siteMetadata.siteName,
    },
    publisher: {
      '@type': 'Person',
      name: siteMetadata.siteName,
    },
  };
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

export function breadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function JsonLdScript({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

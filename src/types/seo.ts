export interface SEOFields {
  title?: string;
  description?: string;
  ogImage?: string;
  noIndex?: boolean;
}

export interface SiteMetadata {
  siteName: string;
  siteUrl: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultOgImage: string;
  twitterHandle?: string;
  locale: string;
}

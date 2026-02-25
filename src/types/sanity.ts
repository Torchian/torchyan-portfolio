export interface SanityDocument {
  _id: string;
  _type: string;
  _createdAt: string;
  _updatedAt: string;
  _rev: string;
}

export interface SanityImage {
  _type: 'image';
  asset: {
    _ref: string;
    _type: 'reference';
  };
  alt?: string;
}

export interface SanitySlug {
  _type: 'slug';
  current: string;
}

export interface Project extends SanityDocument {
  _type: 'project';
  title: string;
  slug: SanitySlug;
  description?: string;
  mainImage?: SanityImage;
  tags?: string[];
  url?: string;
  githubUrl?: string;
}

export interface Post extends SanityDocument {
  _type: 'post';
  title: string;
  slug: SanitySlug;
  excerpt?: string;
  mainImage?: SanityImage;
  publishedAt?: string;
}

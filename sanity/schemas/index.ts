import { project } from './documents/project';
import { post } from './documents/post';
import { author } from './documents/author';
import { page } from './documents/page';
import { siteSettings } from './documents/site-settings';
import { portableText } from './objects/portable-text';
import { seoFields } from './objects/seo-fields';
import { cta } from './objects/cta';
import { imageWithAlt } from './objects/image-with-alt';

export const schemaTypes = [
  project,
  post,
  author,
  page,
  siteSettings,
  portableText,
  seoFields,
  cta,
  imageWithAlt,
];

import type { SchemaTypeDefinition } from "sanity";

import { seo } from "./objects/seo";

import { video } from "./video";
import { song } from "./song";
import { playlist } from "./playlist";
import { product } from "./product";
import { printable } from "./printable";
import { holidayHub } from "./holidayHub";
import { blogCategory } from "./blogCategory";
import { blogArticle } from "./blogArticle";
import { educatorResource } from "./educatorResource";
import { newsletterBlock } from "./newsletterBlock";
import { galleryItem } from "./galleryItem";

/**
 * Sanity schema registry.
 * Source of truth: ../../OWL-Obsidian-Brain/03_Website_Build/WEBSITE_REQUIREMENTS.md § Content Model
 */
export const schemaTypes: SchemaTypeDefinition[] = [
  // Objects (reusable embedded types)
  seo,
  // Documents
  video,
  song,
  playlist,
  product,
  printable,
  holidayHub,
  blogCategory,
  blogArticle,
  educatorResource,
  newsletterBlock,
  galleryItem,
];

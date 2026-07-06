/**
 * News seed data ΓÇö category definitions for the OWL News section.
 * Articles are stored in Supabase content_posts (content_type = 'news').
 * This file provides the category taxonomy for the /news routes.
 */

export type NewsCategorySlug =
  | "announcements"
  | "events"
  | "resources"
  | "community"
  | "press";

export type SeedNewsCategory = {
  slug: NewsCategorySlug;
  name: string;
  description: string;
  icon: string;
};

export const SEED_NEWS_CATEGORIES: SeedNewsCategory[] = [
  {
    slug: "announcements",
    name: "Announcements",
    description: "Official OWL product launches, updates, and important news from the team.",
    icon: "≡ƒôú",
  },
  {
    slug: "events",
    name: "Events",
    description: "Upcoming workshops, live sessions, and community gatherings with OWL families.",
    icon: "≡ƒùô∩╕Å",
  },
  {
    slug: "resources",
    name: "Resources",
    description: "Free downloads, tools, and educational materials for families and educators.",
    icon: "≡ƒôÜ",
  },
  {
    slug: "community",
    name: "Community",
    description: "Stories, spotlights, and updates from the OWL Sing Together family community.",
    icon: "≡ƒñ¥",
  },
  {
    slug: "press",
    name: "Press",
    description: "Media coverage, features, and press releases about OWL Sing Together.",
    icon: "≡ƒô░",
  },
];

export function findNewsCategoryBySlug(slug: string): SeedNewsCategory | undefined {
  return SEED_NEWS_CATEGORIES.find((c) => c.slug === slug);
}

export function isNewsCategorySlug(slug: string): slug is NewsCategorySlug {
  return SEED_NEWS_CATEGORIES.some((c) => c.slug === slug);
}

/**
 * News seed data - category definitions for the OWL News section.
 * Articles are stored in Supabase content_posts (content_type = 'news').
 * This file provides the category taxonomy for the /news routes
 * AND fallback seed articles for when Supabase returns no published news.
 *
 * NOTE: No emoji icons stored here. Category chips use lucide-react icons
 * directly in the page component to avoid encoding issues.
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
};

export type SeedNewsArticle = {
  slug: string;
  title: string;
  category: NewsCategorySlug;
  excerpt: string;
  body: string;
  author: string;
  publishedAt: string;
  tone: "teal" | "amber" | "forest" | "rose" | "mist" | "cream";
};

export const SEED_NEWS_CATEGORIES: SeedNewsCategory[] = [
  {
    slug: "announcements",
    name: "Announcements",
    description: "Official OWL product launches, updates, and important news from the team.",
  },
  {
    slug: "events",
    name: "Events",
    description: "Upcoming workshops, live sessions, and community gatherings with OWL families.",
  },
  {
    slug: "resources",
    name: "Resources",
    description: "Free downloads, tools, and educational materials for families and educators.",
  },
  {
    slug: "community",
    name: "Community",
    description: "Stories, spotlights, and updates from the OWL Sing Together family community.",
  },
  {
    slug: "press",
    name: "Press",
    description: "Media coverage, features, and press releases about OWL Sing Together.",
  },
];

/**
 * Fallback news articles shown when Supabase returns zero published news.
 * These represent real OWL milestones and announcements.
 */
export const SEED_NEWS_ARTICLES: SeedNewsArticle[] = [
  {
    slug: "owl-sing-together-launches-blog-and-news-center",
    title: "OWL Sing Together Launches New Blog and News Center",
    category: "announcements",
    excerpt: "OWL families now have a dedicated home for parenting insights, learning tips, and community stories - updated every week.",
    body: "We are thrilled to announce the launch of the OWL Blog and News Center. Starting this week, owlsingtogether.com is home to a growing library of parenting articles, child development research, music-learning guides, and community spotlights. Larissa and the OWL team publish new content every week - covering homeschooling routines, feelings activities, multicultural education, and the science behind why music helps children learn. Subscribe to the OWL Weekly newsletter to get every new post delivered to your inbox every Sunday.",
    author: "Larissa",
    publishedAt: "2026-07-01",
    tone: "teal",
  },
  {
    slug: "free-summer-printable-pack-now-available",
    title: "Free Summer Learning Printable Pack - Now Available",
    category: "resources",
    excerpt: "Download our free summer printable pack: 8 pages of multicultural activities, counting mats, and alphabet pages for ages 2-6.",
    body: "Summer learning does not have to look like school. Our free Summer Learning Pack includes 8 printable pages designed for kitchen tables, backyards, and road trips. Inside: a multicultural alphabet mat, a feelings check-in chart, a counting activity with nature objects, two coloring pages, a bilingual greeting card, and a simple family rhythm game. All pages are printer-friendly on standard 8.5x11 paper. Download is free - no email required. Just click, print, and play.",
    author: "Larissa",
    publishedAt: "2026-06-28",
    tone: "amber",
  },
  {
    slug: "owl-live-family-music-session-july-2026",
    title: "Join Our First Live Family Music Session - July 2026",
    category: "events",
    excerpt: "OWL is hosting its first live interactive music session for families. Free to join, 30 minutes, designed for children ages 1-5.",
    body: "We are hosting our first OWL Live Family Music Session on Saturday, July 19th at 10:00 AM Pacific. This is a free, 30-minute interactive session led by Larissa, designed for children ages 1 to 5. We will sing together, move together, and explore one new vocabulary theme as a community. Parents, caregivers, and educators are all welcome. The session will be held via Zoom - register through the OWL newsletter or visit the Events page for the link. Limited to 200 families. Registration opens July 10th.",
    author: "Larissa",
    publishedAt: "2026-06-25",
    tone: "forest",
  },
  {
    slug: "owl-family-spotlight-july-2026",
    title: "OWL Family Spotlight: Learning Across Three Languages",
    category: "community",
    excerpt: "This month we spotlight the Reyes family - learning in English, Spanish, and Tagalog with OWL videos and printables.",
    body: "Every month we spotlight an OWL family from our community. This July, we are celebrating the Reyes family from San Diego, California, who use OWL Sing Together as part of their trilingual home learning routine. Mom uses the OWL ABC videos for English letter recognition. Grandma sings the Spanish-language songs with the kids during afternoon playtime. And the bilingual flashcards have become a beloved bedtime routine. OWL makes it easy to bring all three languages into the same learning moment, says Maria Reyes. If you would like to be featured in a future community spotlight, write to us at hello@owlsingtogether.com.",
    author: "Larissa",
    publishedAt: "2026-06-20",
    tone: "rose",
  },
  {
    slug: "owl-featured-in-early-childhood-educator-guide",
    title: "OWL Sing Together Featured in 2026 Early Childhood Educator Guide",
    category: "press",
    excerpt: "OWL was selected as a recommended multicultural music resource in the 2026 National Early Childhood Educator Resource Guide.",
    body: "We are honored to share that OWL Sing Together has been selected as a recommended multicultural music resource in the 2026 National Early Childhood Educator Resource Guide, published by the Early Learning Alliance. OWL was recognized for its commitment to inclusive design, culturally responsive content, and standards-aligned curriculum materials. The guide is distributed to over 40,000 educators across the United States each year. We are proud to be listed alongside other outstanding early learning organizations, and grateful to every family and educator who has shared OWL with their communities.",
    author: "Larissa",
    publishedAt: "2026-06-15",
    tone: "mist",
  },
];

export function findNewsCategoryBySlug(slug: string): SeedNewsCategory | undefined {
  return SEED_NEWS_CATEGORIES.find((c) => c.slug === slug);
}

export function isNewsCategorySlug(slug: string): slug is NewsCategorySlug {
  return SEED_NEWS_CATEGORIES.some((c) => c.slug === slug);
}

export function findNewsArticleBySlug(slug: string): SeedNewsArticle | undefined {
  return SEED_NEWS_ARTICLES.find((a) => a.slug === slug);
}

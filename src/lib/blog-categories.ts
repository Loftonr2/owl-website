/**
 * blog-categories.ts
 * Blog-specific category normalization layer.
 *
 * Re-exports the shared 10 UI category config from news-categories.ts.
 * Adds getBlogUICategory() which maps OWL Blog CRM categories
 * (homeschooling, parenting-tips, child-development, music-and-learning,
 *  activities, safety-wellness) and article slug keywords to the correct
 * UI category, using the same priority system as the News page.
 *
 * Priority:
 *  1. Explicit article-slug override
 *  2. Slug keyword inference
 *  3. CRM category map
 *  4. Default: "parenting"
 */
export {
  UI_NEWS_CATEGORIES,
  type UINewsCategory,
  type UINewsCategorySlug,
} from "@/lib/news-categories";

import {
  UI_NEWS_CATEGORIES,
  type UINewsCategory,
  type UINewsCategorySlug,
} from "@/lib/news-categories";

/** Rebuild lookup maps from the shared category list */
const CATEGORY_BY_SLUG = new Map<UINewsCategorySlug, UINewsCategory>(
  UI_NEWS_CATEGORIES.map((c) => [c.slug, c])
);

const DEFAULT_CATEGORY = UI_NEWS_CATEGORIES.find((c) => c.slug === "parenting")!;

/**
 * OWL Blog CRM category slug → UI category.
 * CRM uses 6 legacy category slugs; map them to the 10 new UI categories.
 */
const BLOG_CRM_MAP: Record<string, UINewsCategorySlug> = {
  homeschooling:      "education",
  "parenting-tips":   "parenting",
  "child-development":"parenting",
  "music-and-learning":"activities",
  activities:         "activities",
  "safety-wellness":  "newborn-care",
};

/**
 * Explicit blog article-slug → UI category overrides.
 * Add entries here when CRM category or slug keywords are ambiguous.
 */
const BLOG_SLUG_MAP: Record<string, UINewsCategorySlug> = {
  // Activities / cultural
  "how-to-explain-diwali-to-a-3-year-old":         "activities",
  "creating-a-home-learning-environment":            "education",
  "why-music-matters-for-early-brain-development":   "activities",
  "music-and-emotional-regulation-in-children":      "mental-health",
  "homeschool-morning-basket-routine":               "education",
  "screen-time-and-children-a-balanced-approach":    "mental-health",
  // Parenting
  "gentle-discipline-techniques-that-work":          "toddler-tips",
  "raising-confident-children":                      "parenting",
  "building-emotional-intelligence-in-toddlers":     "toddler-tips",
  // Baby/newborn
  "newborn-sleep-survival-guide":                    "baby-sleep",
  "breastfeeding-basics-for-new-moms":               "newborn-care",
  "postpartum-recovery-what-to-expect":              "newborn-care",
  // Family
  "how-to-build-family-traditions":                  "family-life",
  "sibling-bonding-activities":                      "family-life",
};

/** Keyword inference for unknown slugs */
function inferFromSlugKeywords(slug: string): UINewsCategorySlug | null {
  if (/pregnan|prenatal/.test(slug))                             return "pregnancy";
  if (/sleep|nap|night.terror|bedtime|crib/.test(slug))         return "baby-sleep";
  if (/toddler|tantrum|biting|potty|strong.will|meltdown|discipline/.test(slug))
                                                                  return "toddler-tips";
  if (/newborn|infant|teething|reflux|tummy.time|vaccine|breastfeed|postpartum/.test(slug))
                                                                  return "newborn-care";
  if (/nutrition|food|eat|snack|picky|meal/.test(slug))          return "nutrition";
  if (/activit|diwali|craft|sensory|music|play|learn|homeschool|educati/.test(slug))
                                                                  return "activities";
  if (/mental|anxiety|stress|screen|emotional|self.care/.test(slug)) return "mental-health";
  if (/school|preschool|daycare|literacy|curriculum/.test(slug)) return "education";
  if (/family|sibling|tradition|togeth|community/.test(slug))    return "family-life";
  if (/baby/.test(slug))                                         return "newborn-care";
  return null;
}

/**
 * Resolve the UI category for a blog article.
 *
 * Priority:
 *  1. Explicit article-slug override
 *  2. Slug keyword inference
 *  3. CRM category map (homeschooling → education, etc.)
 *  4. Default: "parenting"
 */
export function getBlogUICategory(
  articleSlug: string,
  crmCategory: string
): UINewsCategory {
  const explicit = BLOG_SLUG_MAP[articleSlug] as UINewsCategorySlug | undefined;
  if (explicit) return CATEGORY_BY_SLUG.get(explicit) ?? DEFAULT_CATEGORY;

  const keyword = inferFromSlugKeywords(articleSlug);
  if (keyword) return CATEGORY_BY_SLUG.get(keyword) ?? DEFAULT_CATEGORY;

  const crmMapped = BLOG_CRM_MAP[crmCategory] as UINewsCategorySlug | undefined;
  if (crmMapped) return CATEGORY_BY_SLUG.get(crmMapped) ?? DEFAULT_CATEGORY;

  return DEFAULT_CATEGORY;
}

/**
 * content-images.ts
 * Maps blog and news category slugs to real OWL images from public/.
 * Used as fallback images when a post has no featured_image set.
 */

const BLOG_CATEGORY_IMAGES: Record<string, string> = {
  "homeschooling":      "/images/printables/homeschool-week-1.png",
  "parenting-tips":     "/images/headers/about-hero.png",
  "child-development":  "/images/headers/programs-hero.png",
  "music-and-learning": "/images/headers/music-hero.png",
  "activities":         "/images/printables/counting-mat.png",
  "safety-wellness":    "/images/discovery/theme-feelings.png",
};

const NEWS_CATEGORY_IMAGES: Record<string, string> = {
  "announcements": "/images/headers/blog-hero.png",
  "events":        "/images/headers/educators-hero.png",
  "resources":     "/images/headers/printables-hero.png",
  "community":     "/images/headers/newsletter-hero.png",
  "press":         "/images/headers/watch-hero.png",
};

const DEFAULT_BLOG_IMAGE = "/images/headers/blog-hero.png";
const DEFAULT_NEWS_IMAGE  = "/images/headers/newsletter-hero.png";

/**
 * Returns a local OWL image path for a given category slug.
 * Always returns a non-empty string - never a placeholder.
 */
export function getCategoryFallbackImage(
  category: string,
  contentType: "blog" | "news" = "blog"
): string {
  if (contentType === "news") {
    return NEWS_CATEGORY_IMAGES[category] ?? DEFAULT_NEWS_IMAGE;
  }
  return BLOG_CATEGORY_IMAGES[category] ?? DEFAULT_BLOG_IMAGE;
}

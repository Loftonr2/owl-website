/**
 * content-images.ts
 * ─────────────────
 * Canonical image resolver for blog and news content cards.
 *
 * Priority order for resolveContentCardImage():
 *  1. post.featured_image  — explicit per-article image from the DB (most authoritative)
 *  2. Slug-based local file — /images/blog/{slug}.jpg | .png (for blog only)
 *  3. Category fallback     — OWL theme or activity image (never a page header)
 *  4. Brand mascot          — absolute last resort (never a page/hero banner)
 *
 * Rules enforced:
 *  - Header/hero images (paths containing /headers/ or /heroes/) are REJECTED
 *    as card images. They are page-level art, not article thumbnails.
 *  - Empty strings and null values are rejected.
 *  - Invalid paths (not starting with / or http) are rejected.
 */

// ---------------------------------------------------------------------------
// Page-header guard — never use these as card images
// ---------------------------------------------------------------------------

const HEADER_PATTERN = /\/(headers|heroes|videos)\//i;

function isHeaderImage(path: string | null | undefined): boolean {
  if (!path) return false;
  return HEADER_PATTERN.test(path);
}

function isValidImagePath(path: string | null | undefined): boolean {
  if (!path || path.trim() === "") return false;
  if (isHeaderImage(path)) return false;
  if (!path.startsWith("/") && !path.startsWith("http")) return false;
  return true;
}

// ---------------------------------------------------------------------------
// Slug → local image map (tier-2 fallback for blog posts)
// ---------------------------------------------------------------------------

const BLOG_SLUG_IMAGES: Record<string, string> = {
  "20-screen-free-activities-for-rainy-days":              "/images/blog/20-screen-free-activities-for-rainy-days.png",
  "baby-hiccups-sneezes-and-weird-noises-whats-normal":    "/images/blog/baby-hiccups-sneezes-and-weird-noises-whats-normal.jpg",
  "baby-milestones-what-to-expect-in-the-first-6-months": "/images/blog/baby-milestones-what-to-expect-in-the-first-6-months.jpg",
  "babys-first-smile-when-it-happens-and-what-it-means":  "/images/blog/babys-first-smile-when-it-happens-and-what-it-means.jpg",
  "best-educational-gifts-for-3-year-olds-2026":          "/images/blog/best-educational-gifts-for-3-year-olds-2026.png",
  "bilingual-baby-advantage":                              "/images/blog/bilingual-baby-advantage.png",
  "build-the-perfect-reading-corner-for-under-50":        "/images/blog/build-the-perfect-reading-corner-for-under-50.png",
  "counting-mat-games-for-toddlers":                       "/images/blog/counting-mat-games-for-toddlers.png",
  "going-back-to-work-after-baby":                         "/images/blog/going-back-to-work-after-baby.jpg",
  "how-to-bathe-a-newborn-without-panicking":              "/images/blog/how-to-bathe-a-newborn-without-panicking.jpg",
  "how-to-build-a-baby-sleep-routine-that-actually-works": "/images/blog/how-to-build-a-baby-sleep-routine-that-actually-works.jpg",
  "how-to-build-a-homeschool-routine":                     "/images/blog/how-to-build-a-homeschool-routine.png",
  "how-to-handle-a-baby-who-only-sleeps-when-held":       "/images/blog/how-to-handle-a-baby-who-only-sleeps-when-held.jpg",
  "how-to-survive-the-first-week-home-with-a-newborn":    "/images/blog/how-to-survive-the-first-week-home-with-a-newborn.jpg",
  "how-to-talk-to-kids-about-hard-things":                 "/images/blog/how-to-talk-to-kids-about-hard-things.png",
  "how-to-teach-your-child-to-read-in-12-weeks":          "/images/blog/how-to-teach-your-child-to-read-in-12-weeks.png",
  "introducing-a-bottle-to-a-breastfed-baby":             "/images/blog/introducing-a-bottle-to-a-breastfed-baby.jpg",
  "is-your-4-year-old-ready-for-kindergarten":            "/images/blog/is-your-4-year-old-ready-for-kindergarten.png",
  "meet-larissa-the-owl-character":                        "/images/blog/meet-larissa-the-owl-character.png",
  "montessori-at-home-principles-every-parent":           "/images/blog/montessori-at-home-principles-every-parent.png",
  "owl-deals-discounts-and-bundles":                       "/images/blog/owl-deals-discounts-and-bundles.png",
  "owl-emotion-tiles-help-toddlers-name-feelings":        "/images/blog/owl-emotion-tiles-help-toddlers-name-feelings.png",
  "phonics-vs-sight-words-what-parents-need-to-know":     "/images/blog/phonics-vs-sight-words-what-parents-need-to-know.png",
  "proven-ways-to-get-your-baby-talking-faster":          "/images/blog/proven-ways-to-get-your-baby-talking-faster.png",
  "science-of-music-and-language-development":            "/images/blog/science-of-music-and-language-development.png",
  "sensory-activities-for-babies-under-12-months":        "/images/blog/sensory-activities-for-babies-under-12-months.png",
  "stem-activities-for-kids-ages-5-8":                   "/images/blog/stem-activities-for-kids-ages-5-8.png",
  "swaddling-your-baby-how-to-do-it-and-when-to-stop":   "/images/blog/swaddling-your-baby-how-to-do-it-and-when-to-stop.jpg",
  "talking-to-your-baby-why-it-matters-more-than-you-think": "/images/blog/talking-to-your-baby-why-it-matters-more-than-you-think.jpg",
  "the-4th-trimester-what-no-one-tells-new-parents":      "/images/blog/the-4th-trimester-what-no-one-tells-new-parents.jpg",
  "the-5-baby-cries-and-what-they-actually-mean":         "/images/blog/the-5-baby-cries-and-what-they-actually-mean.jpg",
  "the-truth-about-postpartum-hair-loss":                  "/images/blog/the-truth-about-postpartum-hair-loss.jpg",
  "tummy-time-tricks-when-your-baby-hates-it":            "/images/blog/tummy-time-tricks-when-your-baby-hates-it.jpg",
  "understanding-newborn-sleep-cycles":                    "/images/blog/understanding-newborn-sleep-cycles.jpg",
  "what-is-a-growth-spurt-signs-timing-and-how-to-survive": "/images/blog/what-is-a-growth-spurt-signs-timing-and-how-to-survive.jpg",
  "when-do-babies-start-sleeping-through-the-night":      "/images/blog/when-do-babies-start-sleeping-through-the-night.jpg",
  "why-diverse-dolls-matter-the-research":                "/images/blog/why-diverse-dolls-matter-the-research.png",
  "why-owl-is-built-for-your-childs-future":              "/images/blog/why-owl-is-built-for-your-childs-future.png",
  "why-your-baby-stares-at-you":                          "/images/blog/why-your-baby-stares-at-you.jpg",
};

const BLOG_CATEGORY_IMAGES: Record<string, string> = {
  "homeschooling":      "/images/printables/homeschool-week-1.png",
  "parenting-tips":     "/images/discovery/theme-feelings.png",
  "child-development":  "/images/discovery/theme-abcs.png",
  "music-and-learning": "/images/discovery/mascot-headphones.png",
  "activities":         "/images/printables/counting-mat.png",
  "safety-wellness":    "/images/discovery/theme-feelings.png",
};

const NEWS_CATEGORY_IMAGES: Record<string, string> = {
  "announcements": "/images/discovery/theme-abcs.png",
  "events":        "/images/discovery/theme-movement.png",
  "resources":     "/images/printables/counting-mat.png",
  "community":     "/images/discovery/theme-feelings.png",
  "press":         "/images/brand/youtube-header.png",
};

const BRAND_FALLBACK = "/images/brand/mascot.png";

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface ContentCardImageInput {
  slug: string;
  featured_image: string | null | undefined;
  category: string;
  content_type: "blog" | "news";
}

export function resolveContentCardImage(post: ContentCardImageInput): string {
  if (isValidImagePath(post.featured_image)) {
    return post.featured_image!;
  }
  if (post.content_type === "blog") {
    const slugImg = BLOG_SLUG_IMAGES[post.slug];
    if (slugImg) return slugImg;
  }
  const catImages =
    post.content_type === "news" ? NEWS_CATEGORY_IMAGES : BLOG_CATEGORY_IMAGES;
  const catImg = catImages[post.category];
  if (catImg) return catImg;
  return BRAND_FALLBACK;
}

export function getCategoryFallbackImage(
  category: string,
  contentType: "blog" | "news" = "blog"
): string {
  if (contentType === "news") {
    return NEWS_CATEGORY_IMAGES[category] ?? BRAND_FALLBACK;
  }
  return BLOG_CATEGORY_IMAGES[category] ?? BRAND_FALLBACK;
}

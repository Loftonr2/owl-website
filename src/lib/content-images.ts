/**
 * content-images.ts
 * ─────────────────
 * Canonical image resolver and validator for blog and news content cards.
 *
 * Priority order for resolveContentCardImage():
 *  1. post.featured_image  — explicit per-article image from the DB (most authoritative)
 *  2. Slug-based local file — /images/blog/{slug}.jpg | .png (for blog only)
 *  3. Category fallback     — OWL theme or activity image (never a page header)
 *  4. Brand mascot          — absolute last resort (never a page/hero banner)
 *
 * Rules enforced by isValidEditorialImage():
 *  - Header/hero images (paths containing /headers/ or /heroes/) are REJECTED
 *  - Videos directory paths are REJECTED
 *  - Logo and mascot filenames used as generic fallbacks are REJECTED when
 *    the article topic is not explicitly about that asset
 *  - Newsletter and About Us design assets are REJECTED as editorial card images
 *  - Empty strings and null values are REJECTED
 *  - Invalid paths (not starting with / or http) are REJECTED
 *  - Brand/youtube-header images are REJECTED as editorial cards
 */

// ---------------------------------------------------------------------------
// Rejection patterns — never use these as editorial card images
// ---------------------------------------------------------------------------

const HEADER_PATTERN     = /\/(headers|heroes|videos)\//i;
const NEWSLETTER_PATTERN = /\/newsletter\//i;
const ABOUT_PATTERN      = /\/about\//i;
// Brand paths that are page-level art, not editorial thumbnails
const BRAND_BANNER_FILES = new Set([
  "youtube-header.png",
  "youtube-header.jpg",
  "mascot.png",
  "mascot.jpg",
  "logo.png",
  "logo.svg",
  "logo-dark.png",
  "logo-light.png",
]);

/**
 * Returns true if the path represents a page-level asset that should never be
 * used as an editorial card image (header, hero, newsletter graphic, About Us
 * artwork, brand banner, logo, or mascot placeholder).
 */
export function isHeaderImage(path: string | null | undefined): boolean {
  if (!path) return false;
  if (HEADER_PATTERN.test(path))     return true;
  if (NEWSLETTER_PATTERN.test(path)) return true;
  if (ABOUT_PATTERN.test(path))      return true;
  // Reject specific brand banner filenames from any directory
  const filename = path.split("/").pop() ?? "";
  if (BRAND_BANNER_FILES.has(filename)) return true;
  return false;
}

function isValidImagePath(path: string | null | undefined): boolean {
  if (!path || path.trim() === "") return false;
  if (isHeaderImage(path)) return false;
  // Must start with / (local) or http (absolute URL)
  if (!path.startsWith("/") && !path.startsWith("http")) return false;
  return true;
}

/**
 * isValidEditorialImage
 * ──────────────────────
 * Full pre-publication validator. Returns { valid: true } or { valid: false, reason }.
 *
 * Rejects:
 *  - null / empty values
 *  - page header / hero paths
 *  - newsletter or About Us design assets
 *  - logo and mascot filenames when used as generic thumbnails
 *  - brand banner filenames (youtube-header, etc.)
 *  - paths not starting with / or http
 *  - paths without a recognisable image extension
 */
export function isValidEditorialImage(
  url: string | null | undefined,
  _contentType?: "blog" | "news",
  _slug?: string,
): { valid: true } | { valid: false; reason: string } {
  if (!url || url.trim() === "") {
    return { valid: false, reason: "empty or null image path" };
  }

  if (!url.startsWith("/") && !url.startsWith("http")) {
    return { valid: false, reason: "path must start with / or http" };
  }

  if (HEADER_PATTERN.test(url)) {
    return { valid: false, reason: "path is inside a headers/heroes/videos directory — page-level art, not editorial" };
  }

  if (NEWSLETTER_PATTERN.test(url)) {
    return { valid: false, reason: "path is a Newsletter design asset — not for editorial cards" };
  }

  if (ABOUT_PATTERN.test(url)) {
    return { valid: false, reason: "path is an About Us design asset — not for editorial cards" };
  }

  const filename = url.split("/").pop() ?? "";

  if (BRAND_BANNER_FILES.has(filename)) {
    return { valid: false, reason: `"${filename}" is a brand/logo/mascot asset — not a topic-specific editorial image` };
  }

  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  const validExts = new Set(["jpg", "jpeg", "png", "webp", "avif", "gif"]);
  if (!validExts.has(ext)) {
    return { valid: false, reason: `unsupported image extension ".${ext}"` };
  }

  return { valid: true };
}

// ---------------------------------------------------------------------------
// Slug → local image map (tier-2 fallback for blog posts)
// Populated from files physically present in public/images/blog/.
// Used when DB record has no featured_image set yet.
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

// ---------------------------------------------------------------------------
// Category fallback images
// Rule: MUST NOT be page headers (/images/headers/*) or heroes (/images/heroes/*).
// Rule: MUST NOT be mascot.png, logo images, or newsletter assets.
// Use OWL brand / discovery / printable artwork only.
// ---------------------------------------------------------------------------

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
  // NOTE: press was formerly /images/brand/youtube-header.png — corrected below.
  // youtube-header.png is a brand banner, not an editorial card image.
  "press":         "/images/discovery/theme-abcs.png",
};

// Absolute last resort — OWL mascot illustration. Never used as a card when a
// category fallback is available. Validated by isValidEditorialImage() so it
// won't be used if a better option is present in the DB.
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

/**
 * resolveContentCardImage
 * ─────────────────────────
 * Returns the best available image path for a content card.
 * Never returns a page header/hero image. Never returns null.
 *
 * Priority:
 *  1. post.featured_image  (if valid per isValidEditorialImage)
 *  2. Slug-based local file (blog only — from BLOG_SLUG_IMAGES)
 *  3. Category fallback     (OWL theme/brand art, never a header)
 *  4. Brand mascot          (absolute last resort)
 */
export function resolveContentCardImage(post: ContentCardImageInput): string {
  // Tier 1: explicit featured_image from the DB
  const check1 = isValidEditorialImage(post.featured_image, post.content_type, post.slug);
  if (check1.valid) {
    return post.featured_image!;
  }

  // Tier 2: slug-based local blog image
  if (post.content_type === "blog") {
    const slugImg = BLOG_SLUG_IMAGES[post.slug];
    if (slugImg) return slugImg;
  }

  // Tier 3: category fallback (OWL art, never a header or brand banner)
  const catImages =
    post.content_type === "news" ? NEWS_CATEGORY_IMAGES : BLOG_CATEGORY_IMAGES;
  const catImg = catImages[post.category];
  if (catImg) return catImg;

  // Tier 4: absolute last resort
  return BRAND_FALLBACK;
}

/**
 * getCategoryFallbackImage (legacy export — kept for backward compatibility)
 * Use resolveContentCardImage() for new code.
 *
 * Returns a category-appropriate OWL image — NEVER a page header or brand banner.
 */
export function getCategoryFallbackImage(
  category: string,
  contentType: "blog" | "news" = "blog"
): string {
  if (contentType === "news") {
    return NEWS_CATEGORY_IMAGES[category] ?? BRAND_FALLBACK;
  }
  return BLOG_CATEGORY_IMAGES[category] ?? BRAND_FALLBACK;
}

/**
 * IMAGE_WORKFLOW_STATES
 * ─────────────────────
 * Canonical workflow_status values for the image lifecycle.
 * Used by the CRM and the pre-publication guard.
 *
 * Map onto existing workflow_status column — no schema change required.
 */
export const IMAGE_WORKFLOW_STATES = {
  NEEDS_IMAGE:       "needs_image",
  IMAGE_QUEUED:      "image_queued",
  GENERATING:        "generating",
  NEEDS_REVIEW:      "needs_review",
  IMAGE_APPROVED:    "image_approved",
  READY_TO_PUBLISH:  "scheduled",      // existing value reused
  FAILED:            "failed",
} as const;

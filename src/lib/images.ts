/**
 * Image manifest — typed map of every page's header image and brand asset.
 *
 * Source of truth: ../../OWL Sing Together/OWL Website Header Images/
 * Mapping rationale: ../../ASSET_IMPLEMENTATION_PLAN.md
 *
 * Use these constants instead of hard-coded paths so we can swap a header
 * in one place and have it propagate site-wide.
 *
 *   import { headers } from "@/lib/images";
 *   <Image src={headers.home.src} alt={headers.home.alt} ... />
 */

type HeaderImage = {
  /** Path under /public — pass to next/image */
  src: string;
  /** Required alt text */
  alt: string;
  /** Original source filename (for traceability back to OneDrive) */
  source: string;
  /** Marker for assets that are placeholders / borrowed and want a custom replacement */
  isPlaceholder?: boolean;
};

export const headers = {
  home: {
    src: "/images/headers/home-hero.png",
    alt: "Larissa with multicultural children and the OWL mascot — 'Every Child Belongs Here'.",
    source: "OWL Landing Page 2.png",
  },
  about: {
    src: "/images/headers/about-hero.png",
    alt: "Larissa portrait with OWL Sing Together logo treatment.",
    source: "OWL Sing Together With Larissa Logo 3.png",
  },
  app: {
    src: "/images/headers/app-hero.png",
    alt: "Preview of the OWL parent app with Larissa and the OWL mascot.",
    source: "OWL App Page.png",
  },
  appAlt: {
    src: "/images/headers/app-alt-hero.png",
    alt: "OWL app secondary illustration.",
    source: "OWL App.png",
  },
  blog: {
    src: "/images/headers/blog-hero.png",
    alt: "Children reading together with Larissa — OWL blog header.",
    source: "OWL Reading.png",
  },
  contact: {
    src: "/images/headers/contact-hero.png",
    alt: "OWL community — diverse families and educators connecting.",
    source: "OWL Community.png",
  },
  educators: {
    src: "/images/headers/educators-hero.png",
    alt: "Classroom scene with Larissa and multicultural students engaged in learning.",
    source: "OWL Classroom.png",
  },
  teacherResources: {
    src: "/images/headers/teacher-resources-hero.png",
    alt: "OWL classroom — teacher resources and curriculum-aligned activities.",
    source: "OWL Classroom 2.png",
  },
  programs: {
    src: "/images/headers/programs-hero.png",
    alt: "OWL learning programs — classroom and at-home activities.",
    source: "OWL Classroom 3.png",
  },
  holidays: {
    src: "/images/headers/holidays-hero.png",
    alt: "Multicultural cultural celebrations across the OWL calendar.",
    source: "OWL Multi- Cultural.png",
  },
  gallery: {
    src: "/images/headers/gallery-hero.png",
    alt: "OWL arts and crafts — colorful kids' creative work.",
    source: "OWL Arts & Crafts.png",
  },
  music: {
    src: "/images/headers/music-hero.png",
    alt: "Larissa and the OWL mascot leading a multicultural sing-along.",
    source: "OWL Music.png",
  },
  watch: {
    src: "/images/headers/watch-hero.png",
    alt: "OWL music and video archive — Larissa with instruments and children.",
    source: "OWL Music 2.png",
    isPlaceholder: true, // Wants a video-archive-specific image.
  },
  newsletter: {
    src: "/images/headers/newsletter-hero.png",
    alt: "OWL newsletter — weekly notes from Larissa for parents and educators.",
    source: "OWL Newsletter.png",
  },
  recommendations: {
    src: "/images/headers/recommendations-hero.png",
    alt: "OWL entertainment and recommended learning resources.",
    source: "OWL Entertainment.png",
  },
  shop: {
    src: "/images/headers/shop-hero.png",
    alt: "OWL Sing Together store — multicultural products with Larissa branding.",
    source: "OWL Sing Together With Larissa Logo 2.png",
    isPlaceholder: true, // Wants a store-specific commerce-focused image.
  },
  curriculum: {
    src: "/images/headers/curriculum-hero.png",
    alt: "OWL Birth–5 curriculum — Larissa with diverse learners.",
    source: "OWL Curriculum.png",
  },
  printables: {
    src: "/images/headers/printables-hero.png",
    alt: "OWL printables — hands-on learning sheets with Larissa.",
    source: "OWL Learning.png",
  },
} as const satisfies Record<string, HeaderImage>;

export const brand = {
  circularLogo: {
    src: "/images/brand/circular-logo.png",
    alt: "OWL Sing Together circular logo.",
    source: "OWL Circular Logo.png",
  },
  circularLogoAlt: {
    src: "/images/brand/circular-logo-alt.png",
    alt: "OWL Sing Together alternate circular logo.",
    source: "OWL Circular Logo 2.png",
  },
  mascot: {
    src: "/images/brand/mascot.png",
    alt: "OWL — the brand mascot, a wise and gentle owl.",
    source: "OWL Mascot Owl.png",
  },
  fullLogoLarissa: {
    src: "/images/brand/full-logo-larissa.png",
    alt: "OWL Sing Together — full logo lockup with Larissa.",
    source: "OWL Song Together With Larissa Logo.png",
  },
  youtubeHeader: {
    src: "/images/brand/youtube-header.png",
    alt: "OWL Sing Together YouTube channel header banner.",
    source: "OWL Sing Together YouTube Header Image.png",
  },
} as const satisfies Record<string, HeaderImage>;

export type HeaderKey = keyof typeof headers;
export type BrandKey = keyof typeof brand;

/* ──────────────────────────────────────────────────────────────────────────────
 * Asset interfaces for upcoming categories (Phase 1 of the redesign).
 *
 * Each manifest is an empty record at first — populate as commissioned art
 * lands in the matching `public/images/<category>/` folder. The matching
 * READMEs in those folders document the file conventions.
 *
 * The TYPES are exported so callers (cards, players) can compile-check their
 * lookups even when the manifest is empty.
 * ────────────────────────────────────────────────────────────────────────────── */

/** Horizontal banner posters per page — see `public/images/banners/README.md`. */
export type BannerImage = {
  src: string;
  alt: string;
  /** Optional 2x retina variant. */
  src2x?: string;
};
export const banners = {} as const satisfies Record<string, BannerImage>;
export type BannerKey = keyof typeof banners;

/** Per-product photography — see `public/images/products/README.md`. */
export type ProductImages = {
  primary: { src: string; alt: string };
  gallery?: { src: string; alt: string }[];
};
export const products = {
  // ── Real product imagery shipped May 18, 2026 ──────────────────────────
  // Files live flat (one PNG per slug) instead of the subfolder convention
  // documented in the README — keep both shapes supported, the resolver
  // doesn't care which one a product uses.
  "larissa-plush": {
    primary: {
      src: "/images/products/larissa-plush-set.png",
      alt: "Six Larissa plush dolls — Black/African American, Latina, Asian, White, Middle Eastern, and Native American — each in OWL Sing Together's signature jacket.",
    },
  },
  "rhyme-time-game": {
    primary: {
      src: "/images/products/owl-rhyme-time-game.png",
      alt: "OWL Rhyme Time Card Game — 48 thick cards for ages 4–5 with four play modes for building early literacy through rhyming.",
    },
  },
  "bilingual-word-cards": {
    primary: {
      src: "/images/products/owl-word-cards.png",
      alt: "OWL Toddler Word Cards — 50 large 4×4 inch bilingual flash cards organized into People, Food, Animals, Actions, and Objects.",
    },
  },
  "big-feelings-posters": {
    primary: {
      src: "/images/products/owl-big-feelings-poster-set.png",
      alt: "OWL Big Feelings Poster Set — three large 11×17 laminated SEL posters for ages 3–4 ('How Am I Feeling?', 'What To Do When I Feel...', 'Daily Mood Check-In').",
    },
  },
  // ── Bundle slug intentionally has NO image entry — the user's prompt
  //    listed a $129 "OWL Babies Complete Learning Bundle" but no matching
  //    product photo was uploaded. The card falls back to the tonal panel
  //    + initials, which is the honest "asset pending" state.
  //    When commissioned, drop the image into public/images/products/
  //    and add the entry here.
} as const satisfies Record<string, ProductImages>;
export type ProductImageKey = keyof typeof products;

/** Per-video poster frames — see `public/images/video-posters/README.md`. */
export type VideoPosterImage = { src: string; alt: string };
export const videoPosters = {} as const satisfies Record<string, VideoPosterImage>;
export type VideoPosterKey = keyof typeof videoPosters;

/**
 * One playable variant of a frame sequence. The default lives at `basePath`
 * with the manifest's `frameCount/width/height`. Optional variants override
 * those for narrower viewports (mobile) or wider art-directed crops (desktop).
 */
export type HeroFrameVariant = {
  /** Folder path under /public for this variant's frames. */
  basePath: string;
  /** Width in pixels of each frame in this variant. */
  width: number;
  /** Height in pixels of each frame in this variant. */
  height: number;
  /**
   * Optional per-variant frame count override. When unset, falls back to the
   * parent sequence's `frameCount`. Use this when the mobile variant has a
   * shorter loop than desktop (e.g. 120 frames on mobile, 240 on desktop).
   */
  frameCount?: number;
};

/** Hero frame sequences — see `public/images/hero-frames/README.md`. */
export type HeroFrameSequence = {
  /** Folder path under /public, e.g. "/images/hero-frames/home-kitchen-walkin". */
  basePath: string;
  /** Number of frames in the sequence. */
  frameCount: number;
  /** File extension without the dot. `svg` is reserved for dev smoke fixtures. */
  ext: "webp" | "png" | "jpg" | "svg";
  /** Width in pixels of each frame. */
  width: number;
  /** Height in pixels of each frame. */
  height: number;
  /** Alt text used when the sequence is rendered as a static fallback. */
  alt: string;
  /**
   * Whether the frame files actually exist on disk. **Defaults to `false`** to
   * avoid mounting a runtime that 408s every frame. Flip to `true` once the
   * commissioned art lands in `basePath/`. <HeroFrameSequence> short-circuits
   * (renders null + dev-warn) when this is not `true`.
   */
  available?: boolean;
  /**
   * Optional desktop/mobile art-directed variants. The runtime picks `mobile`
   * when `matchMedia("(max-width: 767px)")` matches, `desktop` otherwise.
   * When a variant is missing for the current viewport, the runtime falls
   * back to the top-level `basePath`/dimensions.
   *
   * Example:
   *   variants: {
   *     desktop: { basePath: "/images/hero-frames/home/desktop", width: 1920, height: 1080 },
   *     mobile:  { basePath: "/images/hero-frames/home/mobile",  width: 750,  height: 1000, frameCount: 120 },
   *   }
   */
  variants?: {
    desktop?: HeroFrameVariant;
    mobile?: HeroFrameVariant;
  };
  /**
   * Static poster used when reduced motion is preferred / the runtime is
   * unavailable. When unset, the runtime falls back to `frame-001.<ext>` from
   * the resolved variant. Use this to point at a hand-picked "hero frame"
   * (often *not* the literal first frame — designers may want a calmer beat).
   *
   * Path under /public, e.g. "/images/hero-frames/home-kitchen-walkin/poster.webp".
   */
  posterFallback?: string;
};
export const heroFrames = {
  /**
   * Home page hero — "kitchen-light walk-in" cinematic sequence.
   *
   * **ASSET INTERFACE (TODO):** This entry is registered but **no production
   * frames exist**. The corresponding folder `public/images/hero-frames/home-kitchen-walkin/`
   * is empty. The runtime in `<HeroFrameSequence>` will warn (dev) and render
   * nothing until frames land.
   *
   * To exercise the runtime without commissioning art, run:
   *   npm run generate:hero-frame-smoke
   * which writes clearly-labeled SVG dev fixtures into
   * `public/images/hero-frames/_dev-smoke/` (a SEPARATE slug from this one)
   * and updates the manifest temporarily for QA. Production never sees those.
   *
   * `width` and `height` reflect the target final aspect (16:10). Frame
   * count is a target — the script generates exactly this many smoke frames.
   */
  "home-kitchen-walkin": {
    basePath: "/images/hero-frames/home-kitchen-walkin",
    frameCount: 240,
    ext: "webp",
    width: 1600,
    height: 1000,
    alt: "Larissa walks into a sunlit kitchen while children settle in.",
  },
  /**
   * About-page welcome sequence — Larissa portrait turning toward camera,
   * cream/forest interior fading from soft morning light to warm gold-hour.
   *
   * `available: false` — register the slot, no frames yet. CinematicHero
   * transparently falls back to `banners.about` → `headers.about` for the
   * static poster path.
   */
  "about-welcome": {
    basePath: "/images/hero-frames/about-welcome",
    frameCount: 240,
    ext: "webp",
    width: 1600,
    height: 1000,
    alt: "Larissa welcomes the viewer into the OWL world.",
  },
  /**
   * Educators-page classroom sequence — pan across a multicultural classroom
   * mid-activity, ending on a centered group reading together.
   *
   * `available: false` — register the slot, no frames yet. Static poster
   * fallback resolves to `banners.educators` → `headers.educators`.
   */
  "educators-classroom": {
    basePath: "/images/hero-frames/educators-classroom",
    frameCount: 240,
    ext: "webp",
    width: 1600,
    height: 1000,
    alt: "Multicultural classroom mid-activity, Larissa visible at the back.",
  },
  /**
   * Holidays-page celebration sequence — gentle camera push across a table
   * of cultural celebrations (diyas, candles, lanterns), color saturation
   * gradually lifting as the scroll progresses. Controlled jubilation.
   *
   * `available: false` — registered, no frames yet. Static fallback uses
   * `headers.holidays` via the banner resolver.
   */
  "holidays-celebration": {
    basePath: "/images/hero-frames/holidays-celebration",
    frameCount: 240,
    ext: "webp",
    width: 1600,
    height: 1000,
    alt: "Cultural celebrations table — diyas, candles, lanterns lit in sequence.",
  },
  /**
   * Music-page recording-room sequence — Larissa at an upright piano, OWL
   * mascot atop the music stand, slow camera dolly as instruments enter
   * the frame one by one (guitar, drum, glockenspiel).
   *
   * `available: false` — registered, no frames yet. Static fallback uses
   * `headers.music`.
   */
  "music-recording-room": {
    basePath: "/images/hero-frames/music-recording-room",
    frameCount: 240,
    ext: "webp",
    width: 1600,
    height: 1000,
    alt: "Larissa at an upright piano with OWL mascot, warm recording-room light.",
  },
  /**
   * Newsletter-page welcome sequence — close-up of a handwritten letter
   * forming on cream paper, Larissa's hand visible at the edge, soft
   * Sunday-morning light. Calm, intimate, single beat from blank page to
   * signed letter.
   *
   * `available: false` — registered, no frames yet. Static fallback uses
   * `headers.newsletter`.
   */
  "newsletter-welcome": {
    basePath: "/images/hero-frames/newsletter-welcome",
    frameCount: 240,
    ext: "webp",
    width: 1600,
    height: 1000,
    alt: "Handwritten Sunday letter forming on cream paper, warm light.",
  },
  /**
   * Recommendations-page editorial sequence — pan across a curated bookshelf
   * (OWL plush, printables, a few partner products), Larissa's hand placing the
   * weekly pick on a small wooden stand at the end.
   *
   * `available: false` — static fallback uses `headers.recommendations`.
   */
  "recommendations-bookshelf": {
    basePath: "/images/hero-frames/recommendations-bookshelf",
    frameCount: 240,
    ext: "webp",
    width: 1600,
    height: 1000,
    alt: "Curated bookshelf of OWL products and Larissa's recommended picks.",
  },
  /**
   * Shop-page flatlay sequence — overhead push-in on a flatlay of plush,
   * flashcards, printables, and coloring books arranged on cream linen.
   * Slight color saturation lift as scroll advances.
   *
   * `available: false` — static fallback uses `headers.shop`.
   */
  "shop-flatlay": {
    basePath: "/images/hero-frames/shop-flatlay",
    frameCount: 240,
    ext: "webp",
    width: 1600,
    height: 1000,
    alt: "Overhead flatlay of OWL plush, flashcards, printables, and coloring books on cream linen.",
  },
  /**
   * Watch-page archive sequence — slow camera glide past video posters mounted
   * on a warm-cream wall, like a curated picture frame display. Posters
   * brighten into focus as the camera passes them.
   *
   * `available: false` — static fallback uses `headers.watch`.
   */
  "watch-archive": {
    basePath: "/images/hero-frames/watch-archive",
    frameCount: 240,
    ext: "webp",
    width: 1600,
    height: 1000,
    alt: "Wall of OWL video posters in framed displays, slow camera glide past them.",
  },
  /**
   * Developer smoke-test slug — populated by `npm run generate:hero-frame-smoke`.
   * Folder is gitignored. Useful for proving the runtime works end-to-end
   * without commissioning real art. Never use in production routes.
   *
   * `available: true` because the generator script guarantees the files exist
   * after a single `npm run generate:hero-frame-smoke`. In a fresh clone where
   * the script hasn't been run yet, the runtime will warn (dev) and bail safely.
   */
  "_dev-smoke": {
    basePath: "/images/hero-frames/_dev-smoke",
    frameCount: 6,
    ext: "svg",
    width: 1600,
    height: 900,
    alt: "Dev smoke-test frame sequence — replace with commissioned art.",
    available: true,
  },
} as const satisfies Record<string, HeroFrameSequence>;
export type HeroFrameKey = keyof typeof heroFrames;

/**
 * Helper — build a YouTube CDN poster URL from a video ID.
 *
 * Used by `<VideoPoster>` as a fallback when no local poster file exists for
 * a given video but the video has a `youtubeId`. Wired in Phase 2.
 *
 *   import { youtubePosterUrl } from "@/lib/images";
 *   const src = youtubePosterUrl(video.youtubeId);
 */
export function youtubePosterUrl(youtubeId: string, quality: "max" | "hq" | "mq" = "max"): string {
  const file =
    quality === "max" ? "maxresdefault.jpg" : quality === "hq" ? "hqdefault.jpg" : "mqdefault.jpg";
  return `https://img.youtube.com/vi/${youtubeId}/${file}`;
}

/**
 * Three-tier poster resolver — used by <VideoPoster>.
 *
 *   1. `posterSrc` (local file under /public)        → preferred
 *   2. `youtubeId` (CDN fallback via youtubePosterUrl) → second choice
 *   3. null                                          → caller renders tonal placeholder
 *
 * The resolver is intentionally a plain function (not a hook) so it can run
 * in server components. Callers decide what to do with `null`.
 *
 *   const url = resolveVideoPoster(video.posterSrc, video.youtubeId);
 *   if (!url) return <TonalPlaceholder />;
 *   return <Image src={url} alt="..." fill />;
 *
 * The `source` tag in the return value lets components attribute the choice
 * (useful for the dev-hint banner that surfaces which path is active).
 */
export type VideoPosterSource = "local" | "youtube" | "none";
export type ResolvedVideoPoster = {
  url: string | null;
  source: VideoPosterSource;
};

export function resolveVideoPoster(
  posterSrc?: string | null,
  youtubeId?: string | null
): ResolvedVideoPoster {
  if (posterSrc) return { url: posterSrc, source: "local" };
  if (youtubeId) return { url: youtubePosterUrl(youtubeId, "max"), source: "youtube" };
  return { url: null, source: "none" };
}

/* ──────────────────────────────────────────────────────────────────────────────
 * Banner-poster resolver — used by <BannerHero> / <PageHero>.
 *
 *   1. `banners[slug]`  (commissioned wide horizontal poster, 16:9)  → preferred
 *   2. `headers[slug]`  (existing illustrated portrait imagery)        → fallback
 *   3. null              → caller renders cream solid + ambient layer only
 *
 * The key accepted is intentionally `BannerKey | HeaderKey | string` so callers
 * can use any existing route slug. Both `banners` and `headers` are typed maps
 * — we cast through `string` to avoid forcing every consumer to narrow.
 * ────────────────────────────────────────────────────────────────────────────── */
export type BannerPosterSource = "banner" | "header" | "none";
export type ResolvedBanner = {
  src: string | null;
  alt: string;
  source: BannerPosterSource;
};

export function resolveBanner(key: string): ResolvedBanner {
  const banner = (banners as Record<string, BannerImage>)[key];
  if (banner) {
    return { src: banner.src, alt: banner.alt, source: "banner" };
  }
  const header = (headers as Record<string, HeaderImage>)[key];
  if (header) {
    return { src: header.src, alt: header.alt, source: "header" };
  }
  return { src: null, alt: "", source: "none" };
}

/* ──────────────────────────────────────────────────────────────────────────────
 * Product-image resolver — used by <ProductCard> + product detail pages.
 *
 *   1. `products[slug].primary`  (commissioned 1:1 hero photo)  → preferred
 *   2. null                        → caller renders tonal placeholder
 *
 * Phase 3 adds the *primary* tier. Gallery shots are exposed separately via
 * `resolveProductGallery(slug)` for the detail page.
 * ────────────────────────────────────────────────────────────────────────────── */
export type ProductImageSource = "local" | "none";
export type ResolvedProductImage = {
  src: string | null;
  alt: string;
  source: ProductImageSource;
};

export function resolveProductImage(slug: string): ResolvedProductImage {
  const p = (products as Record<string, ProductImages>)[slug];
  if (p?.primary) return { src: p.primary.src, alt: p.primary.alt, source: "local" };
  return { src: null, alt: "", source: "none" };
}

export function resolveProductGallery(slug: string): { src: string; alt: string }[] {
  const p = (products as Record<string, ProductImages>)[slug];
  return p?.gallery ?? [];
}

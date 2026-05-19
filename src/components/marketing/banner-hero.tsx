import Image from "next/image";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { resolveBanner } from "@/lib/images";

/**
 * BannerHero — the 5-layer composition primitive required on every page.
 *
 * The non-negotiable design constraint from the redesign brief:
 *
 *   1) background color layer
 *   2) horizontal rectangular hero banner layer
 *   3) interactive UI layer (buttons, chips, cards, rails)
 *   4) text/content layer
 *   5) optional ambient accent layer
 *
 * This is a server component by default — it just composes layers. Children
 * are rendered into named slots. Scroll-linked parallax on the banner is
 * applied via the CSS class `owl-scroll-banner-parallax` (defined in
 * globals.css) so we don't ship JS for the common case.
 *
 * Usage:
 *   <BannerHero
 *     tone="cream"
 *     banner={{ src: headers.home.src, alt: headers.home.alt }}
 *     eyebrow="OWL Sing Together — With Larissa"
 *     heading={<>Every Child <span className="text-owl-teal">Belongs Here.</span></>}
 *     subhead="Warm, multicultural music, videos, printables..."
 *     primaryCta={<Button intent="primary" size="lg" asChild><Link href="/watch">Watch free videos</Link></Button>}
 *     secondaryCta={<Button intent="secondary" size="lg" asChild><Link href="/printables">Get free printables</Link></Button>}
 *     ambient={<HomeAmbient />}
 *   />
 *
 * Layered z-index is owned by the Tailwind `zIndex` scale: `bg | banner | ui | text | ambient`.
 *
 * IMPORTANT: This component DOES NOT autoplay video, mount heavy assets, or
 * ship any client JS in its default form. Anything dynamic must be passed
 * in as children (and should be a client island).
 */

export type BannerHeroTone = "cream" | "amber" | "teal" | "forest";

export interface BannerHeroProps {
  /** Background color of the page band behind the banner. */
  tone?: BannerHeroTone;
  /**
   * The rectangular hero banner image. Pass one of:
   *   - `banner={{ src, alt }}` — direct (legacy + most call sites today).
   *   - `slug="home"` — resolver-based; prefers `banners[slug]` over `headers[slug]`.
   *     When neither manifest has the key, the layer is hidden but the
   *     surrounding composition still renders (text + ambient).
   *
   * If both are supplied, the explicit `banner` wins.
   */
  banner?: { src: string; alt: string };
  /** Resolver key for the new asset interface (Phase 3). */
  slug?: string;
  /**
   * Custom Layer-2 renderer. When provided, REPLACES the default `<Image>`
   * banner. Use this to plug in `<HeroFrameSequence>` (Phase 5) or any other
   * media (looping illustration, Lottie animation) without forking the
   * surrounding 5-layer composition.
   *
   * The slot is wrapped in the same aspect-ratio container + rounded-banner
   * shell that the default image gets, so callers don't manage geometry.
   * When `bannerSlot` is set, the resolver/banner props are ignored.
   */
  bannerSlot?: ReactNode;
  /** Small caps eyebrow above the heading. */
  eyebrow?: ReactNode;
  /** Heading element. Pass JSX so callers can style word spans. */
  heading: ReactNode;
  /** Sub-headline copy. */
  subhead?: ReactNode;
  /** Primary CTA — usually a <Button> wrapped around a <Link>. */
  primaryCta?: ReactNode;
  /** Secondary CTA. Optional. */
  secondaryCta?: ReactNode;
  /** Tertiary content under the CTAs — quote, trust marks, etc. */
  meta?: ReactNode;
  /** Slot 5: ambient accents — pass <AmbientLayer pattern="notes" /> etc. */
  ambient?: ReactNode;
  /** Slot 3 overlay: extra UI surface that overlaps the banner (chips, search). */
  overlay?: ReactNode;
  /** Aspect ratio for the rectangular banner — defaults to a horizontal banner. */
  bannerAspect?: "wide" | "square" | "tall";
  /** Whether the banner art is decorative — defaults to true since we have a heading. */
  bannerDecorative?: boolean;
  /** Use scroll-linked parallax on the banner. Defaults to true. */
  scrollParallax?: boolean;
  /** Render the banner at right (default) or left of the copy column on desktop. */
  bannerSide?: "right" | "left";
  /** Optional pass-through className for the outer section. */
  className?: string;
  /** ID for the heading — wired to aria-labelledby. */
  headingId?: string;
}

const toneStyles: Record<BannerHeroTone, { bg: string; text: string; eyebrow: string }> = {
  cream: {
    bg: "bg-owl-cream-deep",
    text: "text-owl-ink",
    eyebrow: "text-owl-teal",
  },
  amber: {
    bg: "bg-owl-amber-soft/40",
    text: "text-owl-ink",
    eyebrow: "text-owl-teal-deep",
  },
  teal: {
    bg: "bg-owl-teal text-white",
    text: "text-white",
    eyebrow: "text-owl-amber-soft",
  },
  forest: {
    bg: "bg-owl-forest text-white",
    text: "text-white",
    eyebrow: "text-owl-amber-soft",
  },
};

const aspectStyles: Record<NonNullable<BannerHeroProps["bannerAspect"]>, string> = {
  wide: "aspect-[16/10] md:aspect-[5/4]",
  square: "aspect-square md:aspect-[4/5]",
  tall: "aspect-[4/5] md:aspect-[3/4]",
};

export function BannerHero({
  tone = "cream",
  banner,
  slug,
  bannerSlot,
  eyebrow,
  heading,
  subhead,
  primaryCta,
  secondaryCta,
  meta,
  ambient,
  overlay,
  bannerAspect = "wide",
  bannerDecorative = true,
  scrollParallax = true,
  bannerSide = "right",
  className,
  headingId = "hero-heading",
}: BannerHeroProps) {
  const t = toneStyles[tone];
  const inverted = tone === "teal" || tone === "forest";

  // Phase 3 resolver: explicit `banner` wins; otherwise resolve via slug.
  // Phase 5: a `bannerSlot` always wins regardless of image resolution.
  const resolved = banner
    ? { src: banner.src, alt: banner.alt, source: "explicit" as const }
    : slug
      ? resolveBanner(slug)
      : { src: null as string | null, alt: "", source: "none" as const };
  const hasBannerSlot = bannerSlot != null;
  const hasBanner = hasBannerSlot || resolved.src !== null;

  return (
    <section
      aria-labelledby={headingId}
      // Layer 1 — background color
      className={cn("relative isolate overflow-hidden", t.bg, className)}
    >
      {/* Subtle decorative wash — non-blocking, behind everything */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 z-bg",
          tone === "cream" &&
            "bg-[radial-gradient(ellipse_at_top_right,rgba(245,166,35,0.18),transparent_55%),radial-gradient(ellipse_at_bottom_left,rgba(26,153,148,0.10),transparent_55%)]",
          tone === "amber" &&
            "bg-[radial-gradient(ellipse_at_center,rgba(245,166,35,0.18),transparent_60%)]",
          tone === "teal" &&
            "bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.10),transparent_55%)]",
          tone === "forest" &&
            "bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.06),transparent_55%)]"
        )}
      />

      <div
        className={cn(
          "mx-auto grid max-w-7xl items-center gap-10 px-6 py-14 sm:px-10 md:gap-12 md:py-20 lg:py-24",
          "md:grid-cols-[1.05fr,1fr]",
          bannerSide === "left" && "md:[&>div:first-child]:order-2"
        )}
      >
        {/* Layer 4 — text/content (sits on top of bg, alongside banner) */}
        <div className={cn("relative z-text", t.text)}>
          {eyebrow && (
            <p
              className={cn(
                "font-display text-xs font-bold uppercase tracking-[0.22em] sm:text-sm",
                t.eyebrow
              )}
            >
              {eyebrow}
            </p>
          )}
          <h1
            id={headingId}
            className={cn(
              "mt-4 font-display font-extrabold leading-[1.05]",
              // Scale: 40px mobile → 60px tablet → 68px desktop on cream/amber,
              // a hair smaller on inverted (forest/teal) for legibility.
              inverted
                ? "text-4xl sm:text-5xl lg:text-[56px]"
                : "text-4xl sm:text-5xl lg:text-[64px]"
            )}
          >
            {heading}
          </h1>
          {subhead && (
            <p
              className={cn(
                "mt-5 max-w-prose text-base leading-relaxed sm:mt-6 sm:text-lg",
                inverted ? "text-white/85" : "text-owl-ink/80"
              )}
            >
              {subhead}
            </p>
          )}

          {/* Layer 3 — interactive UI (buttons) */}
          {(primaryCta || secondaryCta) && (
            <div className="relative z-ui mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:items-center">
              {primaryCta}
              {secondaryCta}
            </div>
          )}

          {meta && (
            <div
              className={cn(
                "relative z-ui mt-7 text-sm",
                inverted ? "text-white/75" : "text-owl-mist"
              )}
            >
              {meta}
            </div>
          )}
        </div>

        {/* Layer 2 — banner (custom slot wins, otherwise resolved image,
            otherwise hidden so the rest of the composition still renders) */}
        {hasBanner && (
          <div className="relative">
            <div
              className={cn(
                "relative w-full overflow-hidden rounded-owl-banner shadow-owl-2",
                aspectStyles[bannerAspect]
              )}
            >
              {hasBannerSlot ? (
                <div className="absolute inset-0 z-banner">{bannerSlot}</div>
              ) : (
                <div
                  className={cn(
                    "absolute inset-0 z-banner",
                    scrollParallax && "owl-scroll-banner-parallax",
                    "will-change-transform"
                  )}
                >
                  <Image
                    src={resolved.src as string}
                    alt={bannerDecorative ? "" : resolved.alt}
                    aria-hidden={bannerDecorative}
                    fill
                    priority
                    sizes="(min-width: 1024px) 640px, (min-width: 768px) 50vw, 100vw"
                    className="object-cover"
                    data-banner-source={resolved.source}
                  />
                </div>
              )}
              {/* Subtle inner ring — gives the banner a clean editorial frame */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 z-banner rounded-owl-banner ring-1 ring-inset ring-owl-cream/50"
              />
              {/* Optional overlay — chips, search, mini-CTAs that sit on the banner */}
              {overlay && (
                <div className="absolute inset-x-0 bottom-0 z-ui p-5 sm:p-6">{overlay}</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Layer 5 — ambient (always last so it draws on top, but pointer-events-none) */}
      {ambient && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-ambient"
        >
          {ambient}
        </div>
      )}
    </section>
  );
}

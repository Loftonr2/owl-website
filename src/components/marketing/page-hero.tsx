import type { ReactNode } from "react";
import { BannerHero, type BannerHeroTone } from "./banner-hero";
import { AmbientLayer, type AmbientPattern } from "./ambient-layer";

/**
 * PageHero — v2 (redesign).
 *
 * Compatibility-preserving wrapper around <BannerHero>. The existing API
 * (eyebrow / title / subtitle / image / children / tone) is unchanged — every
 * page that was already using <PageHero> picks up the 5-layer composition,
 * scroll-linked parallax, ambient layer, and refined styling automatically.
 *
 *   - `children` continues to render in the BannerHero `overlay` slot
 *     (search input, chips, etc. sit on top of the banner).
 *   - New optional `ambient` prop accepts an `AmbientPattern` ("notes" |
 *     "leaves" | "sparkles" | "stars" | "paper") that auto-mounts an
 *     <AmbientLayer> with sensible defaults for the page mood.
 *
 * Wireframe-consistent: every page is banner-led per the redesign brief.
 */

type PageHeroProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  /**
   * Banner image. One of:
   *   - `image={{ src, alt }}` — explicit (the path most call sites use today).
   *   - omit `image` and pass `slug="…"` to use the Phase 3 resolver
   *     (`banners[slug]` → `headers[slug]` → null).
   * If both are supplied, the explicit `image` wins.
   */
  image?: { src: string; alt: string };
  /** Resolver key (Phase 3). Migrates a page from explicit to manifest-driven. */
  slug?: string;
  /** Children render in the BannerHero `overlay` slot (sit on the banner). */
  children?: React.ReactNode;
  /** Visual variant. Mapped to BannerHero tones. */
  tone?: "cream" | "amber" | "forest" | "teal";
  /** Optional ambient pattern. Choose to match the page mood. */
  ambient?: AmbientPattern;
  /** Optional primary CTA — passed through as BannerHero `primaryCta`. */
  primaryCta?: ReactNode;
  /** Optional secondary CTA — passed through as BannerHero `secondaryCta`. */
  secondaryCta?: ReactNode;
  /** Trailing meta line (quote, trust marks, fine print). */
  meta?: ReactNode;
  /** Pass-through className applied to the BannerHero wrapper. */
  className?: string;
};

const TONE_MAP: Record<NonNullable<PageHeroProps["tone"]>, BannerHeroTone> = {
  cream: "cream",
  amber: "amber",
  forest: "forest",
  teal: "teal",
};

export function PageHero({
  eyebrow,
  title,
  subtitle,
  image,
  slug,
  children,
  tone = "cream",
  ambient,
  primaryCta,
  secondaryCta,
  meta,
  className,
}: PageHeroProps) {
  return (
    <BannerHero
      tone={TONE_MAP[tone]}
      banner={image}
      slug={slug}
      bannerAspect="wide"
      eyebrow={eyebrow}
      heading={title}
      subhead={subtitle}
      primaryCta={primaryCta}
      secondaryCta={secondaryCta}
      meta={meta}
      overlay={children}
      ambient={ambient ? <AmbientLayer pattern={ambient} density={4} /> : undefined}
      className={className}
    />
  );
}

import type { ReactNode } from "react";
import { BannerHero, type BannerHeroProps } from "./banner-hero";
import { HeroFrameSequence } from "./hero-frame-sequence";
import { heroFrames, type HeroFrameKey } from "@/lib/images";

/**
 * CinematicHero — composition primitive that picks the best banner renderer
 * available and routes the rest of the 5-layer composition through
 * `<BannerHero>`.
 *
 * Decision tree:
 *   1. `sequenceSlug` is set AND `heroFrames[sequenceSlug].available === true`
 *      → mount `<HeroFrameSequence>` as the Layer-2 slot. The scroll-scrubbed
 *        canvas plays inside the banner shell; text + UI + ambient layers
 *        come from BannerHero unchanged.
 *   2. Otherwise → render a regular `<BannerHero>` with the explicit `banner`
 *      prop or `slug` resolver path.
 *
 * That means a single call site like:
 *
 *   <CinematicHero
 *     sequenceSlug="home-kitchen-walkin"
 *     slug="home"
 *     eyebrow="OWL Sing Together"
 *     heading={…}
 *     primaryCta={…}
 *     ambient={…}
 *   />
 *
 * automatically upgrades from the static banner to the cinematic sequence the
 * moment someone flips `available: true` in the manifest after commissioned
 * frames land. No call-site change needed.
 *
 * Server component by default — `<HeroFrameSequence>` is the only client
 * boundary, and it only mounts when the sequence is available.
 */

export interface CinematicHeroProps extends Omit<BannerHeroProps, "bannerSlot"> {
  /**
   * Optional hero-frame sequence to render in the banner slot.
   * Falls through to a static banner image when the sequence isn't available.
   */
  sequenceSlug?: HeroFrameKey;
  /**
   * Override `scrollDistance` passed to `<HeroFrameSequence>` when active.
   * Default: "150vh".
   */
  sequenceScrollDistance?: string;
}

export function CinematicHero({
  sequenceSlug,
  sequenceScrollDistance,
  ...bannerProps
}: CinematicHeroProps) {
  const sequence = sequenceSlug
    ? (heroFrames as Record<string, { available?: boolean }>)[sequenceSlug as string]
    : undefined;
  const useSequence = Boolean(sequenceSlug && sequence?.available);

  const slot: ReactNode | undefined = useSequence ? (
    <HeroFrameSequence
      slug={sequenceSlug as HeroFrameKey}
      scrollDistance={sequenceScrollDistance}
      // The BannerHero shell already handles the rounded corners + shadow,
      // so the inner sequence container should drop them to avoid double-borders.
      className="h-full w-full !rounded-none !shadow-none"
    />
  ) : undefined;

  return <BannerHero {...bannerProps} bannerSlot={slot} />;
}

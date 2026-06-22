/**
 * HeroBanner — alias for <BannerHero>.
 *
 * The 5-layer composition primitive (background → banner → UI → text → ambient).
 * The "HeroBanner" name reads better in component briefs and call sites that
 * think of the surface as the hero rather than as a banner. Identical export.
 *
 *   import { HeroBanner }  from "@/components/marketing/hero-banner";
 *   import { BannerHero }  from "@/components/marketing/banner-hero";  // legacy
 *
 * New code should prefer `HeroBanner`. The `BannerHero` name stays exported —
 * <PageHero> and <CinematicHero> both still reference it internally.
 */
export { BannerHero as HeroBanner } from "./banner-hero";
export type { BannerHeroProps as HeroBannerProps, BannerHeroTone } from "./banner-hero";

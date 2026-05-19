import Link from "next/link";
import { Play, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { CinematicHero } from "./cinematic-hero";
import { HeroMascots } from "./hero-mascots";
import { HomeAmbient } from "./home-ambient";

/**
 * Homepage hero — v3 (Phase 5).
 *
 * Now composed via <CinematicHero>:
 *   - `sequenceSlug="home-kitchen-walkin"` opts into the scroll-scrubbed
 *     image-sequence runtime IF and only if that sequence is `available: true`
 *     in `src/lib/images.ts → heroFrames`. Today it's unavailable, so the
 *     primitive transparently falls back to the static banner path.
 *   - `slug="home"` routes the static fallback through the Phase 3 banner
 *     resolver (`banners[home]` → `headers.home` → null). Today there's no
 *     entry in `banners`, so it resolves to `headers.home` — identical visual
 *     to before the migration.
 *
 * The day the commissioned kitchen-walkin frames land:
 *   1. Drop 60 webp frames into `public/images/hero-frames/home-kitchen-walkin/`.
 *   2. Set `available: true` on the manifest entry.
 *   No call-site changes here.
 *
 * Wireframe: public/images/wireframes-reference/OWL Home Page.png § Hero.
 */
export function Hero() {
  return (
    <CinematicHero
      tone="cream"
      slug="home"
      sequenceSlug="home-kitchen-walkin"
      bannerAspect="square"
      eyebrow="OWL Sing Together — With Larissa"
      heading={
        <>
          Every Child <span className="text-owl-teal">Belongs Here.</span>
        </>
      }
      subhead="Warm, multicultural music, videos, printables, and curriculum for children Birth–14. Slow pacing, big feelings, joyful learning."
      primaryCta={
        <Button intent="primary" size="lg" asChild>
          <Link href="/watch">
            <Play className="h-4 w-4" aria-hidden />
            Watch free videos
          </Link>
        </Button>
      }
      secondaryCta={
        <Button intent="secondary" size="lg" asChild>
          <Link href="/printables">
            <Sparkles className="h-4 w-4" aria-hidden />
            Get free printables
          </Link>
        </Button>
      }
      meta={
        <p className="italic">
          &ldquo;I&apos;m so glad you&apos;re here today.&rdquo; — Larissa
        </p>
      }
      overlay={
        <GlassCard
          variant="frost"
          className="mx-auto max-w-md text-center sm:text-left"
        >
          <p className="font-display text-xs font-bold uppercase tracking-[0.18em] text-owl-teal">
            Free this week
          </p>
          <p className="mt-1 font-display text-base font-semibold text-owl-ink">
            ABC Printable Pack — joined by 1,200+ families.
          </p>
        </GlassCard>
      }
      ambient={
        <>
          <HeroMascots />
          <HomeAmbient />
        </>
      }
    />
  );
}

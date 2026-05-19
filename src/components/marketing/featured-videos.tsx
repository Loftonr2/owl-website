import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Section, SectionHeader } from "@/components/ui/section";
import { VideoCard } from "./video-card";
import { MediaRail } from "./media-rail";
import { SEED_VIDEOS } from "@/lib/seed/videos";

/**
 * Featured Videos row — v3 (homepage row pulls from the real seed).
 *
 * Uses <MediaRail> so it scrolls horizontally on mobile with snap stops, and
 * becomes a 3-column grid on desktop. Each card is a <VideoCard> with a real
 * YouTube poster resolved via `resolveVideoPoster(posterSrc, youtubeId)`.
 *
 * Phase 5 (data) replaces the seed module with `videoArchiveQuery` from Sanity.
 * v3 of this row already reads from a single source of truth (SEED_VIDEOS),
 * so the Sanity swap will be a one-line change.
 */

const FEATURED_SLUGS = [
  "owl-sing-together-greatest-hits",
  "learning-the-abcs",
  "letter-sound-song",
  "this-little-light-of-mine",
  "the-radish-song",
  "shell-be-comin-round-the-mountain",
] as const;

const FEATURED = FEATURED_SLUGS
  .map((slug) => SEED_VIDEOS.find((v) => v.slug === slug))
  .filter((v): v is NonNullable<typeof v> => Boolean(v));

export function FeaturedVideos() {
  return (
    <Section width="wide" pad="lg" bg="cream">
      <SectionHeader
        eyebrow="This week's videos"
        title="Sing-along learning, with Larissa"
        subtitle="Multicultural music videos that grow with your child — from first lullabies to character lessons."
      />
      <MediaRail
        ariaLabel="Featured OWL videos"
        columns={{ md: 2, lg: 3 }}
        className="mt-8"
      >
        {FEATURED.map((v) => (
          <VideoCard
            key={v.slug}
            slug={v.slug}
            title={v.title}
            ageRange={v.ageRange}
            theme={v.theme}
            duration={v.duration}
            tone={v.tone}
            posterSrc={v.posterSrc}
            youtubeId={v.youtubeId}
          />
        ))}
      </MediaRail>

      <div className="mt-10 text-center">
        <Link
          href="/watch"
          className="group inline-flex items-center gap-1.5 rounded-full px-4 py-2 font-display text-sm font-semibold text-owl-teal transition-all duration-200 ease-owl-quick hover:bg-owl-cream-deep hover:text-owl-teal-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-owl-teal focus-visible:ring-offset-2 focus-visible:ring-offset-owl-cream"
        >
          Browse the full video library
          <ArrowRight className="h-4 w-4 transition-transform duration-200 ease-owl-quick group-hover:translate-x-0.5" aria-hidden />
        </Link>
      </div>
    </Section>
  );
}

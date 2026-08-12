import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Section, SectionHeader } from "@/components/ui/section";
import { VideoCard } from "./video-card";
import { MediaRail } from "./media-rail";
import { getLatestChannelVideos } from "@/lib/youtube/get-latest-channel-videos";

/**
 * Featured Videos row — v4 (live YouTube feed, homepage).
 *
 * Pulls the newest public uploads directly from the OWL Sing Together
 * YouTube channel via `getLatestChannelVideos()` (YouTube Data API -> RSS ->
 * last-known-good hardcoded fallback; never throws, never returns empty).
 * Result is cached/revalidated server-side every 30 minutes
 * (`REVALIDATE = 1800` in get-latest-channel-videos.ts) — the browser never
 * fetches YouTube directly, so this never blocks navigation or hydration.
 *
 * No source-code edit is required when OWL uploads a new video: it appears
 * here automatically after the next cache revalidation.
 *
 * Uses <MediaRail> so it scrolls horizontally on mobile with snap stops, and
 * becomes a 3-column grid on desktop. Each card renders a YouTube CDN
 * thumbnail only (no iframe) via <VideoCard>/<VideoPoster> — clicking opens
 * the video on YouTube (href = watchUrl), so this section never instantiates
 * a player on initial homepage load.
 */
export async function FeaturedVideos() {
  const latestVideos = await getLatestChannelVideos(6);

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
        {latestVideos.map((v) => (
          <VideoCard
            key={v.id}
            slug={v.id}
            title={v.title}
            ageRange="0–8"
            duration="Video"
            tone="teal"
            youtubeId={v.id}
            href={v.watchUrl}
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

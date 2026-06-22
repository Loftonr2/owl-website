import Link from "next/link";
import {
  Download,
  Music2,
} from "lucide-react";
import { pageMetadata } from "@/lib/seo/metadata";

import { VideoHeroBanner } from "@/components/marketing/video-hero-banner";
import { Section } from "@/components/ui/section";
import { SectionIntro } from "@/components/ui/section-intro";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";
import { VideoCard } from "@/components/marketing/video-card";
import { MediaRail } from "@/components/marketing/media-rail";
import { SectionReveal } from "@/components/marketing/section-reveal";
// VideoCard + MediaRail still used by featured rail above
import { StreamingPlatforms } from "@/components/marketing/streaming-platforms";
import { NewsletterSection } from "@/components/marketing/newsletter-section";
import { OwlDiscoveryArcade } from "@/components/marketing/owl-discovery-arcade";
import { BrowseVideosSection } from "@/components/marketing/browse-videos-section";

import { SEED_VIDEOS } from "@/lib/seed/videos";

export const metadata = pageMetadata({
  title: "Watch — OWL Video Library",
  description:
    "Multicultural music videos that grow with your child. Sort by age, theme, holiday, and format.",
  path: "/watch",
});

/**
 * /watch — v3 (Visual-track Phase 5, video-nook).
 *
 * Page sections:
 *   1. Video-nook hero (CinematicHero, sequenceSlug="watch-archive", slug="watch")
 *   2. Featured videos rail (MediaRail — poster-first <VideoCard>s)
 *   3. Search + filter chips (age × theme)
 *   4. Browse by theme/category icons (StaggerGrid)
 *   5. Full archive grid (MediaRail)
 *   6. Printable download CTA (cream-deep band)
 *   7. Streaming CTA (StreamingPlatforms)
 *   8. Newsletter band
 *
 * Poster-first guarantee:
 *   Every <VideoCard> uses <VideoPoster> internally, which resolves through
 *   `resolveVideoPoster(posterSrc, youtubeId)`:
 *     1. local file → 2. YouTube CDN → 3. tonal placeholder.
 *   NO <iframe> mounts on this page. Player is only loaded on the detail page
 *   AFTER the visitor clicks the play badge. Bundle stays small, no autoplay,
 *   COPPA-safe.
 *
 * Why thumbnails look like tonal panels today: every seed entry has
 * `youtubeId: null` AND `posterSrc: null`. Set either in src/lib/seed/videos.ts
 * to switch a card to a real thumbnail. No code change needed.
 */


export default function WatchPage() {
  const featured = SEED_VIDEOS.slice(0, 3);

  return (
    <>
      {/* Hero */}
      <VideoHeroBanner
        src="/videos/watch-hero.mp4"
        poster="/images/headers/watch-hero.png"
        eyebrow="Watch"
        heading={
          <>Watch, Sing, and{" "}<span className="text-owl-teal">Learn Together.</span></>
        }
        subhead="Free multicultural sing-along videos for children Birth–14. New songs every month."
        primaryCta={{ label: "Browse Videos", href: "#videos" }}
        secondaryCta={{ label: "Watch on YouTube", href: "https://www.youtube.com/@Owlsingtogetherchannel" }}
      />

      {/* 2 — Featured videos rail */}
      <SectionReveal>
        <Section width="wide" pad="lg" bg="cream" id="featured">
          <SectionIntro
            eyebrow="Hand-picked"
            title="Featured this week"
            subtitle="Three videos Larissa is highlighting right now — paired printables included."
          />
          <MediaRail
            ariaLabel="Featured OWL videos"
            columns={{ md: 2, lg: 3 }}
            className="mt-8"
            stagger={0.07}
          >
            {featured.map((v) => (
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
        </Section>
      </SectionReveal>

      {/* 3+4 — OWL Discovery Arcade (search + theme browse) */}
      <OwlDiscoveryArcade />

      {/* 5 — Browse Videos (6 preview + More Videos modal) */}
      <SectionReveal>
        <BrowseVideosSection videos={SEED_VIDEOS} />
      </SectionReveal>

      {/* 6 — Printable download CTA */}
      <SectionReveal>
        <Section width="wide" pad="lg" bg="cream-deep">
          <div className="relative isolate overflow-hidden rounded-owl-hero bg-owl-amber-soft/40 p-8 shadow-owl-1 md:p-12">
            <div className="relative z-text grid grid-cols-1 items-center gap-8 md:grid-cols-[1.3fr,1fr]">
              <div>
                <p className="font-display text-xs font-bold uppercase tracking-[0.22em] text-owl-teal">
                  Companion printable
                </p>
                <h2 className="mt-3 font-display text-3xl font-extrabold text-owl-ink sm:text-4xl">
                  Every video ships with a free printable.
                </h2>
                <p className="mt-4 max-w-prose text-base leading-relaxed text-owl-ink/80">
                  Print on regular paper. Lay it on the kitchen table. Sing it together. The
                  matching printable for each video is one click from the detail page.
                </p>
                <Button intent="primary" size="lg" asChild className="mt-6">
                  <Link href="/printables">
                    <Download className="h-4 w-4" aria-hidden />
                    Browse printables
                  </Link>
                </Button>
              </div>
              <GlassPanel variant="frost">
                <p className="font-display text-xs font-bold uppercase tracking-wide text-owl-teal">
                  Always included
                </p>
                <ul className="mt-3 space-y-1.5 text-sm text-owl-ink">
                  <li>🎵 Lyric sheet</li>
                  <li>🎨 Coloring page</li>
                  <li>📝 Parent guide</li>
                  <li>🌍 EN/ES variant</li>
                </ul>
              </GlassPanel>
            </div>
          </div>
        </Section>
      </SectionReveal>

      {/* 7 — Streaming CTA */}
      <SectionReveal>
        <Section width="wide" pad="lg" bg="white">
          <SectionIntro
            eyebrow="Or listen instead"
            title="Stream the songs anywhere"
            subtitle="Same songs, same masters. Pick the app you already use."
            align="center"
          />
          <div className="flex justify-center">
            <StreamingPlatforms
              spotify="https://open.spotify.com/artist/example"
              appleMusic="https://music.apple.com/artist/example"
              youtubeMusic="https://music.youtube.com/channel/example"
              amazonMusic="https://music.amazon.com/artists/example"
            />
          </div>
          <div className="mt-6 flex justify-center">
            <Button intent="tertiary" size="md" asChild>
              <Link href="/music">
                <Music2 className="h-4 w-4" aria-hidden />
                Explore the music library
              </Link>
            </Button>
          </div>
        </Section>
      </SectionReveal>

      <SectionReveal>
        <NewsletterSection />
      </SectionReveal>
    </>
  );
}

import Link from "next/link";
import {
  Play,
  Search,
  Download,
  Music2,
  HeartHandshake,
  Sparkles,
  Moon,
  Wind,
  Sun,
  BookOpen,
} from "lucide-react";
import { pageMetadata } from "@/lib/seo/metadata";

import { CinematicHero } from "@/components/marketing/cinematic-hero";
import { Section } from "@/components/ui/section";
import { SectionIntro } from "@/components/ui/section-intro";
import { Button } from "@/components/ui/button";
import { CategoryChip } from "@/components/ui/category-chip";
import { GlassPanel } from "@/components/ui/glass-panel";
import { VideoCard } from "@/components/marketing/video-card";
import { MediaRail } from "@/components/marketing/media-rail";
import { StaggerGrid } from "@/components/marketing/stagger-grid";
import { SectionReveal } from "@/components/marketing/section-reveal";
import { AmbientLayer } from "@/components/marketing/ambient-layer";
import { StreamingPlatforms } from "@/components/marketing/streaming-platforms";
import { NewsletterSection } from "@/components/marketing/newsletter-section";

import { SEED_VIDEOS, VIDEO_AGE_OPTIONS, VIDEO_THEME_OPTIONS } from "@/lib/seed/videos";

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

const THEMES = [
  { value: "abcs", label: "ABCs", icon: BookOpen },
  { value: "numbers", label: "Numbers", icon: Sun },
  { value: "feelings", label: "Feelings", icon: HeartHandshake },
  { value: "holiday", label: "Holidays", icon: Sparkles },
  { value: "lullaby", label: "Lullabies", icon: Moon },
  { value: "movement", label: "Movement", icon: Wind },
];

export default function WatchPage() {
  const featured = SEED_VIDEOS.slice(0, 3);
  const recent = SEED_VIDEOS;

  return (
    <>
      {/* 1 — Video-nook hero (cream, notes ambient) */}
      <CinematicHero
        tone="cream"
        slug="watch"
        sequenceSlug="watch-archive"
        bannerAspect="wide"
        eyebrow="Watch"
        heading={
          <>
            Explore & sing together in our{" "}
            <span className="text-owl-teal">video nook.</span>
          </>
        }
        subhead="Every video is multicultural, slow-paced, and tied to a free printable. Pick by age, theme, or holiday."
        primaryCta={
          <Button intent="primary" size="lg" asChild>
            <Link href="#featured">
              <Play className="h-4 w-4" aria-hidden />
              Featured this week
            </Link>
          </Button>
        }
        secondaryCta={
          <Button intent="secondary" size="lg" asChild>
            <Link href="#archive">Browse the archive</Link>
          </Button>
        }
        meta={
          <p>No autoplay anywhere. Players load only after you click the poster.</p>
        }
        ambient={<AmbientLayer pattern="notes" density={4} seed={181} />}
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

      {/* 3 — Search + filter chips */}
      <SectionReveal>
        <Section width="wide" pad="md" bg="white">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <label className="relative block max-w-md flex-1">
              <span className="sr-only">Search videos</span>
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-owl-mist"
                aria-hidden
              />
              <input
                type="search"
                placeholder="Search by title, theme, age band"
                className="h-11 w-full rounded-owl-btn border border-owl-cream-deep bg-owl-white pl-9 pr-4 text-sm text-owl-ink shadow-owl-1 placeholder:text-owl-mist focus:border-owl-teal focus:outline-none focus:ring-2 focus:ring-owl-teal/40"
              />
            </label>

            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <div className="flex flex-wrap gap-2">
                <p className="self-center text-[10px] font-bold uppercase tracking-wide text-owl-mist">
                  Age
                </p>
                {VIDEO_AGE_OPTIONS.map((a) => (
                  <CategoryChip
                    key={a.value}
                    href={`/watch?age=${a.value}`}
                    label={a.label}
                    intent="teal"
                  />
                ))}
              </div>
              <div className="flex flex-wrap gap-2 sm:ml-3">
                <p className="self-center text-[10px] font-bold uppercase tracking-wide text-owl-mist">
                  Theme
                </p>
                {VIDEO_THEME_OPTIONS.slice(0, 4).map((t) => (
                  <CategoryChip
                    key={t.value}
                    href={`/watch?theme=${t.value}`}
                    label={t.label}
                    intent="amber"
                  />
                ))}
              </div>
            </div>
          </div>
        </Section>
      </SectionReveal>

      {/* 4 — Browse by theme icons */}
      <SectionReveal>
        <Section width="wide" pad="lg" bg="cream">
          <SectionIntro
            eyebrow="Browse"
            title="By theme"
            subtitle="Pick a feeling, a holiday, or a skill. The archive will filter to match."
          />
          <StaggerGrid
            asList
            ariaLabel="Video themes"
            className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6"
            stagger={0.06}
            offsetY={12}
          >
            {THEMES.map(({ value, label, icon: Icon }) => (
              <Link
                key={value}
                href={`/watch?theme=${value}`}
                className="group flex h-full flex-col items-center gap-3 rounded-owl-card border border-owl-cream-deep bg-owl-white p-5 text-center shadow-owl-1 transition-all duration-200 ease-owl-quick hover:-translate-y-0.5 hover:shadow-owl-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-owl-teal/60 focus-visible:ring-offset-2 focus-visible:ring-offset-owl-cream"
              >
                <span
                  aria-hidden
                  className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-owl-teal/10 text-owl-teal transition-transform duration-200 ease-owl-quick group-hover:scale-110"
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span className="font-display text-sm font-semibold text-owl-ink">{label}</span>
              </Link>
            ))}
          </StaggerGrid>
        </Section>
      </SectionReveal>

      {/* 5 — Full archive grid */}
      <SectionReveal>
        <Section width="wide" pad="lg" bg="white" id="archive">
          <SectionIntro
            eyebrow="The library"
            title="Browse all videos"
            subtitle="More is added every Monday, Wednesday, and Friday."
          />
          <MediaRail
            ariaLabel="OWL video archive"
            columns={{ md: 2, lg: 3 }}
            className="mt-8"
            stagger={0.05}
          >
            {recent.map((v) => (
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

      {/* 6 — Printable download CTA */}
      <SectionReveal>
        <Section width="wide" pad="lg" bg="cream-deep">
          <div className="relative isolate overflow-hidden rounded-owl-hero bg-owl-amber-soft/40 p-8 shadow-owl-1 md:p-12">
            <AmbientLayer pattern="paper" density={3} seed={191} className="inset-0" />
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

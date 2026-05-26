import Link from "next/link";
import {
  Music2,
  HeartHandshake,
  Search,
  Download,
  GraduationCap,
  Bird,
  BookOpen,
  Leaf,
  Palette,
  MoreHorizontal,
} from "lucide-react";
import { pageMetadata } from "@/lib/seo/metadata";

import { CinematicHero } from "@/components/marketing/cinematic-hero";
import { Section } from "@/components/ui/section";
import { SectionIntro } from "@/components/ui/section-intro";
import { Button } from "@/components/ui/button";
import { CategoryChip } from "@/components/ui/category-chip";
import { GlassPanel } from "@/components/ui/glass-panel";
import { SectionReveal } from "@/components/marketing/section-reveal";
import { StaggerGrid } from "@/components/marketing/stagger-grid";
import { MediaRail } from "@/components/marketing/media-rail";
import { AmbientLayer } from "@/components/marketing/ambient-layer";
import { PlaylistCard } from "@/components/marketing/playlist-card";
import { StreamingPlatforms } from "@/components/marketing/streaming-platforms";
import { NewsletterSection } from "@/components/marketing/newsletter-section";

import { SEED_PLAYLISTS, PLAYLIST_CATEGORY_OPTIONS } from "@/lib/seed/playlists";

export const metadata = pageMetadata({
  title: "Music & Playlists",
  description:
    "Listen to every OWL song on Spotify, Apple Music, YouTube Music, and Amazon Music.",
  path: "/music",
});

/**
 * /music — v3 (Visual-track Phase 4, rhythmic motion).
 *
 * Page sections:
 *   1. Music hero (CinematicHero, sequenceSlug="music-recording-room", slug="music")
 *      + StreamingPlatforms overlay
 *   2. Search + filter chips
 *   3. Featured playlists rail (MediaRail)
 *   4. Browse-by-category icons (StaggerGrid)
 *   5. Streaming CTA modules (StreamingPlatforms full-row)
 *   6. Downloadable activity CTA (GlassPanel band)
 *   7. Seasonal / Calm / Classroom sections (three themed rails)
 *   8. Newsletter band
 *
 * Motion vocabulary: rhythmic. Notes ambient floats throughout. Stagger
 * timings echo a song's beat — 60–80ms between category icons (fast tempo),
 * 70ms between playlist cards in rails (mid-tempo). Above-the-fold
 * StreamingPlatforms strip plays the role of a "downbeat" CTA.
 */

const BROWSE_CATEGORIES = [
  { value: "animals", label: "Animals", icon: Bird },
  { value: "alphabet", label: "Alphabet", icon: BookOpen },
  { value: "seasons", label: "Seasons", icon: Leaf },
  { value: "theme", label: "Theme", icon: Palette },
  { value: "feelings", label: "Feelings", icon: HeartHandshake },
  { value: "others", label: "Others", icon: MoreHorizontal },
];

const AGE_CHIPS = [
  { value: "toddler", label: "Toddler" },
  { value: "prek", label: "Pre-K" },
  { value: "k5", label: "K–5" },
];

const TEMPO_CHIPS = [
  { value: "ago", label: "Ago" },
  { value: "calm", label: "Calm" },
  { value: "upbeat", label: "Upbeat" },
];

export default function MusicPage() {
  const featuredPlaylists = SEED_PLAYLISTS.slice(0, 4);

  const seasonal = SEED_PLAYLISTS.filter((p) => p.category === "holiday");
  const calm = SEED_PLAYLISTS.filter((p) => p.category === "bedtime");
  const classroom = SEED_PLAYLISTS.filter((p) =>
    ["alphabet", "feelings", "counting"].includes(p.category)
  );

  return (
    <>
      {/* 1 — Music hero (cream, notes ambient, streaming overlay) */}
      <CinematicHero
        tone="cream"
        slug="music"
        sequenceSlug="music-recording-room"
        bannerAspect="wide"
        eyebrow="Music"
        heading={
          <>
            Explore Our{" "}
            <span className="text-owl-teal">Sing-Along Playlists!</span>
          </>
        }
        subhead="Same songs, every platform. Stream on Spotify, Apple Music, YouTube Music, or Amazon Music — or download the activity sheets."
        primaryCta={
          <Button intent="primary" size="lg" asChild>
            <Link href="#playlists">
              <Music2 className="h-4 w-4" aria-hidden />
              Browse playlists
            </Link>
          </Button>
        }
        secondaryCta={
          <Button intent="secondary" size="lg" asChild>
            <Link href="#streaming">Listen on every platform</Link>
          </Button>
        }
        meta={
          <p>
            All songs mastered at 432 Hz, –14 LUFS. No autoplay anywhere on this site.
          </p>
        }
        overlay={
          <GlassPanel variant="frost" className="text-center sm:text-left">
            <p className="font-display text-xs font-bold uppercase tracking-wide text-owl-teal">
              Stream OWL
            </p>
            <div className="mt-2">
              <StreamingPlatforms
                spotify="https://open.spotify.com/artist/example"
                appleMusic="https://music.apple.com/artist/example"
                youtubeMusic="https://music.youtube.com/channel/example"
                amazonMusic="https://music.amazon.com/artists/example"
                size="sm"
              />
            </div>
          </GlassPanel>
        }
        ambient={<AmbientLayer pattern="notes" density={5} seed={47} />}
      />

      {/* 2 — Search + filter chips (Age × Theme × Tempo) */}
      <SectionReveal>
        <Section width="wide" pad="md" bg="cream">
          <div className="flex flex-col gap-4">
            {/* Search bar */}
            <label className="relative block w-full max-w-2xl mx-auto">
              <span className="sr-only">Search playlists, songs, topics</span>
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-owl-mist"
                aria-hidden
              />
              <input
                type="search"
                placeholder="Search playlists, songs, topics..."
                className="h-12 w-full rounded-owl-btn border border-owl-cream-deep bg-owl-white pl-9 pr-4 text-sm text-owl-ink shadow-owl-1 transition-colors duration-150 placeholder:text-owl-mist focus:border-owl-teal focus:outline-none focus:ring-2 focus:ring-owl-teal/40"
              />
            </label>
            {/* Filter rows */}
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[10px] font-bold uppercase tracking-wide text-owl-mist">Age</p>
                {AGE_CHIPS.map((c) => (
                  <CategoryChip key={c.value} href={`/music?age=${c.value}`} label={c.label} intent="teal" />
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:ml-4">
                <p className="text-[10px] font-bold uppercase tracking-wide text-owl-mist">Theme</p>
                {PLAYLIST_CATEGORY_OPTIONS.slice(0, 3).map((c) => (
                  <CategoryChip key={c.value} href={`/music?category=${c.value}`} label={c.label} intent="amber" />
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:ml-4">
                <p className="text-[10px] font-bold uppercase tracking-wide text-owl-mist">Tempo</p>
                {TEMPO_CHIPS.map((c) => (
                  <CategoryChip key={c.value} href={`/music?tempo=${c.value}`} label={c.label} intent="teal" />
                ))}
              </div>
            </div>
          </div>
        </Section>
      </SectionReveal>

      {/* 3 — Featured playlists rail */}
      <SectionReveal>
        <Section width="wide" pad="lg" bg="cream" id="playlists">
          <SectionIntro
            eyebrow="Featured"
            title="Playlists this season"
            subtitle="Themed collections, updated as Larissa releases new songs."
          />
          <MediaRail
            ariaLabel="Featured OWL playlists"
            columns={{ md: 2, lg: 4 }}
            className="mt-8"
            stagger={0.07}
          >
            {featuredPlaylists.map((p) => (
              <PlaylistCard key={p.slug} {...p} />
            ))}
          </MediaRail>
        </Section>
      </SectionReveal>

      {/* 4 — Browse-by-category icons (rhythmic stagger) */}
      <SectionReveal>
        <Section width="wide" pad="lg" bg="white">
          <SectionIntro
            eyebrow="Browse"
            title="By category"
            subtitle="Pick a mood; we'll start there."
          />
          <StaggerGrid
            asList
            ariaLabel="Playlist categories"
            className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6"
            stagger={0.06}
            offsetY={12}
          >
            {BROWSE_CATEGORIES.map(({ value, label, icon: Icon }) => (
              <Link
                key={value}
                href={`/music?category=${value}`}
                className="group flex h-full flex-col items-center gap-3 rounded-owl-card border border-owl-cream-deep bg-owl-cream p-5 text-center shadow-owl-1 transition-all duration-200 ease-owl-quick hover:-translate-y-0.5 hover:bg-owl-white hover:shadow-owl-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-owl-teal/60 focus-visible:ring-offset-2 focus-visible:ring-offset-owl-cream"
              >
                <span
                  aria-hidden
                  className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-owl-teal/10 text-owl-teal transition-transform duration-200 ease-owl-quick group-hover:scale-110"
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span className="font-display text-sm font-semibold text-owl-ink">
                  {label}
                </span>
              </Link>
            ))}
          </StaggerGrid>
        </Section>
      </SectionReveal>

      {/* 5 — Streaming CTA modules (downbeat row) */}
      <SectionReveal>
        <Section width="wide" pad="lg" bg="cream-deep" id="streaming">
          <SectionIntro
            eyebrow="Listen anywhere"
            title="Stream OWL on every platform"
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
        </Section>
      </SectionReveal>

      {/* 6 — Downloadable activity CTA */}
      <SectionReveal>
        <Section width="wide" pad="lg" bg="white">
          <div className="relative isolate overflow-hidden rounded-owl-hero bg-owl-amber-soft/40 p-8 shadow-owl-1 md:p-12">
            <AmbientLayer pattern="notes" density={3} seed={59} className="inset-0" />
            <div className="relative z-text grid grid-cols-1 items-center gap-8 md:grid-cols-[1.3fr,1fr]">
              <div>
                <p className="font-display text-xs font-bold uppercase tracking-[0.22em] text-owl-teal">
                  Free download
                </p>
                <h2 className="mt-3 font-display text-3xl font-extrabold text-owl-ink sm:text-4xl">
                  Activity sheets to sing along with.
                </h2>
                <p className="mt-4 max-w-prose text-base leading-relaxed text-owl-ink/80">
                  Every featured playlist ships with a printable lyric sheet, an action card for
                  movement songs, and a parent-friendly &ldquo;how to use it&rdquo; guide. Print on
                  regular paper.
                </p>
                <div className="mt-6">
                  <Button intent="primary" size="lg" asChild>
                    <Link href="/printables">
                      <Download className="h-4 w-4" aria-hidden />
                      Get the activity sheets
                    </Link>
                  </Button>
                </div>
              </div>
              <GlassPanel variant="frost">
                <p className="font-display text-xs font-bold uppercase tracking-wide text-owl-teal">
                  Bundle includes
                </p>
                <ul className="mt-3 space-y-1.5 text-sm text-owl-ink">
                  <li>🎶 Printable lyric sheets</li>
                  <li>🤸 Movement-song action cards</li>
                  <li>🎨 Coloring page per song</li>
                  <li>📝 Parent guide</li>
                </ul>
              </GlassPanel>
            </div>
          </div>
        </Section>
      </SectionReveal>

      {/* 7 — Seasonal · Calm · Classroom sections (three themed rails) */}
      {seasonal.length > 0 && (
        <SectionReveal>
          <Section width="wide" pad="lg" bg="cream">
            <SectionIntro
              eyebrow="Seasonal"
              title="Holiday playlists"
              subtitle="Refreshed each year — cultural celebrations across the OWL calendar."
            />
            <MediaRail
              ariaLabel="Seasonal playlists"
              columns={{ md: 2, lg: 4 }}
              className="mt-8"
            >
              {seasonal.map((p) => (
                <PlaylistCard key={p.slug} {...p} />
              ))}
            </MediaRail>
          </Section>
        </SectionReveal>
      )}

      {calm.length > 0 && (
        <SectionReveal>
          <Section width="wide" pad="lg" bg="white">
            <SectionIntro
              eyebrow="Calm"
              title="Bedtime + wind-down"
              subtitle="Slow tempos, 432 Hz masters, no bright transients."
            />
            <MediaRail
              ariaLabel="Calm playlists"
              columns={{ md: 2, lg: 4 }}
              className="mt-8"
            >
              {calm.map((p) => (
                <PlaylistCard key={p.slug} {...p} />
              ))}
            </MediaRail>
          </Section>
        </SectionReveal>
      )}

      {classroom.length > 0 && (
        <SectionReveal>
          <Section width="wide" pad="lg" bg="cream-deep">
            <SectionIntro
              eyebrow="Classroom"
              title="Learn-along playlists"
              subtitle="Alphabet, counting, feelings — songs you can drop into circle time."
            />
            <MediaRail
              ariaLabel="Classroom playlists"
              columns={{ md: 2, lg: 4 }}
              className="mt-8"
            >
              {classroom.map((p) => (
                <PlaylistCard key={p.slug} {...p} />
              ))}
            </MediaRail>
            <div className="mt-8 flex justify-center">
              <Button intent="secondary" size="lg" asChild>
                <Link href="/educators">
                  <GraduationCap className="h-4 w-4" aria-hidden />
                  For educators
                </Link>
              </Button>
            </div>
          </Section>
        </SectionReveal>
      )}

      {/* 8 — Newsletter band */}
      <SectionReveal>
        <NewsletterSection />
      </SectionReveal>
    </>
  );
}

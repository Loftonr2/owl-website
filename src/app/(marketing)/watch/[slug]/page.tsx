import Script from "next/script";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Download, Mail, Sparkles, Music2 } from "lucide-react";

import { Section } from "@/components/ui/section";
import { SectionIntro } from "@/components/ui/section-intro";
import { Chip } from "@/components/ui/chip";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";

import { VideoCard } from "@/components/marketing/video-card";
import { VideoPlayer } from "@/components/marketing/video-player";
import { DevHintBanner } from "@/components/marketing/dev-hint-banner";
import { MediaRail } from "@/components/marketing/media-rail";
import { SectionReveal } from "@/components/marketing/section-reveal";
import { NewsletterSection } from "@/components/marketing/newsletter-section";

import { pageMetadata } from "@/lib/seo/metadata";
import { videoSchema } from "@/lib/seo/structured-data";
import { siteConfig } from "@/lib/site-config";
import { SEED_VIDEOS, findVideoBySlug } from "@/lib/seed/videos";
import { SEED_PRINTABLES } from "@/lib/seed/printables";

type Params = { slug: string };

export async function generateStaticParams(): Promise<Params[]> {
  return SEED_VIDEOS.map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const video = findVideoBySlug(slug);
  if (!video) return pageMetadata({ title: "Video not found", noIndex: true });
  return pageMetadata({
    title: video.title,
    description: video.summary,
    path: `/watch/${video.slug}`,
  });
}

/**
 * /watch/[slug] — v3 (Visual-track Phase 5).
 *
 * Layout:
 *   - Player column (2/3): <VideoPlayer> (poster-first, on-interaction iframe load)
 *     + metadata + dev hint banner when no video data
 *   - Sidebar (1/3): learning goals + companion-printable panel
 *   - Below the fold: "Suggested next" rail (MediaRail) → newsletter band
 *
 * Companion printable resolution:
 *   For each video, we look up the printable whose `relatedVideoSlug` matches.
 *   When found, we render a real link to that printable's detail page. When
 *   missing, we keep the generic /printables CTA (truthful — there's nothing
 *   specific to point at).
 *
 * Poster-first guarantee:
 *   <VideoPlayer> renders <VideoPoster> until the user clicks. Only at that
 *   moment does an <iframe> mount, pointed at youtube-nocookie.com with
 *   autoplay=1. NO heavyweight player loads on page paint.
 */
export default async function VideoDetailPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const video = findVideoBySlug(slug);
  if (!video) notFound();

  // Resolve a real companion printable (single, by `relatedVideoSlug`).
  const companion = SEED_PRINTABLES.find((p) => p.relatedVideoSlug === video.slug);

  // Suggested next — same-theme videos first, fallback to any others.
  const sameTheme = SEED_VIDEOS.filter(
    (v) => v.slug !== video.slug && v.themeSlug && v.themeSlug === video.themeSlug
  );
  const others = SEED_VIDEOS.filter((v) => v.slug !== video.slug);
  const suggested = (sameTheme.length >= 3 ? sameTheme : [...sameTheme, ...others])
    .filter((v, i, arr) => arr.findIndex((x) => x.slug === v.slug) === i)
    .slice(0, 4);

  const ld = JSON.stringify(
    videoSchema({
      name: video.title,
      description: video.summary,
      thumbnailUrl: `${siteConfig.url}/images/headers/watch-hero.png`,
      uploadDate: video.publishedAt,
      embedUrl: `https://www.youtube-nocookie.com/embed/${video.slug}`,
    })
  );

  return (
    <>
      <Script
        id={`ld-video-${video.slug}`}
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: ld }}
      />

      <Section width="wide" pad="lg" bg="cream-deep">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[2fr,1fr]">
          {/* Player column */}
          <div>
            <Chip intent="teal" className="mb-3">
              Ages {video.ageRange}
            </Chip>
            <h1 className="font-display text-3xl font-extrabold text-owl-ink sm:text-4xl">
              {video.title}
            </h1>
            <p className="mt-4 max-w-prose text-base leading-relaxed text-owl-ink/85">
              {video.summary}
            </p>

            {/* Poster-first playback shell.
                <VideoPlayer> stays a poster until the user clicks.
                Only on click does an <iframe> mount → autoplay starts THEN. */}
            <div className="mt-6">
              <VideoPlayer
                title={video.title}
                tone={video.tone}
                duration={video.duration}
                youtubeId={video.youtubeId ?? undefined}
                posterSrc={video.posterSrc ?? undefined}
                size="lg"
              />
            </div>

            {/* Dev-only hint when both `youtubeId` and `posterSrc` are absent —
                explains the "broken-looking" Coming Soon state in development. */}
            {!video.youtubeId && !video.posterSrc && (
              <DevHintBanner
                className="mt-4"
                title="This player is in “Coming soon” state."
                body={
                  "No `youtubeId` and no `posterSrc` are set on this video yet, " +
                  "so <VideoPlayer> renders a tonal placeholder with a disabled " +
                  "play button. This is the truthful state until real assets land. " +
                  "To enable playback for QA, edit src/lib/seed/videos.ts."
                }
                hint={`// src/lib/seed/videos.ts → SEED_VIDEOS[…]\n{ slug: "${video.slug}", …, youtubeId: "<11-char id>", posterSrc: "/images/video-posters/${video.slug}.webp" }`}
              />
            )}

            <div className="mt-6 flex flex-wrap items-center gap-2">
              <Chip intent="neutral">{video.duration}</Chip>
              {video.theme && <Chip intent="amber">{video.theme}</Chip>}
              {video.themeSlug && (
                <Chip intent="forest">Theme: {video.themeSlug}</Chip>
              )}
            </div>
          </div>

          {/* Sidebar — learning goals + companion printable CTA */}
          <aside className="space-y-6">
            <div className="rounded-owl-card border border-owl-cream-deep bg-owl-white p-6 shadow-owl-1">
              <p className="font-display text-xs font-semibold uppercase tracking-wide text-owl-teal">
                Learning goals
              </p>
              <ul className="mt-3 space-y-2 text-sm text-owl-ink">
                {video.learningGoals.map((g) => (
                  <li key={g}>✓ {g}</li>
                ))}
              </ul>
            </div>

            {/* Companion printable panel — resolves a real printable when one
                links to this video; falls back to a generic /printables CTA. */}
            <GlassPanel variant="frost" className="space-y-3">
              <div className="inline-flex items-center gap-2">
                <Download className="h-4 w-4 text-owl-amber" aria-hidden />
                <p className="font-display text-xs font-bold uppercase tracking-[0.18em] text-owl-teal">
                  Companion printable
                </p>
              </div>
              {companion ? (
                <>
                  <p className="font-display text-lg font-bold text-owl-ink">{companion.title}</p>
                  <p className="text-sm leading-relaxed text-owl-ink/80">
                    {companion.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-owl-mist">
                    <Chip intent="amber">{companion.skill}</Chip>
                    <span>Ages {companion.ageRange}</span>
                    <span>·</span>
                    <span>{companion.pages} page{companion.pages === 1 ? "" : "s"}</span>
                    <span>·</span>
                    <span className="uppercase">{companion.freeOrPaid}</span>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button intent="primary" size="md" asChild className="w-full sm:w-auto">
                      <Link href={`/printables/${companion.slug}`}>
                        <Download className="h-4 w-4" aria-hidden />
                        Get the printable
                      </Link>
                    </Button>
                    <Button intent="ghost" size="md" asChild className="w-full sm:w-auto">
                      <Link href="/newsletter">
                        <Mail className="h-4 w-4" aria-hidden />
                        Email it to me
                      </Link>
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm leading-relaxed text-owl-ink/80">
                    No printable links to this video yet — but we have plenty in the library that
                    pair well with the same age + theme.
                  </p>
                  <Button intent="primary" size="md" asChild className="w-full">
                    <Link href="/printables">
                      <Download className="h-4 w-4" aria-hidden />
                      Browse printables
                    </Link>
                  </Button>
                </>
              )}
            </GlassPanel>

            <div className="rounded-owl-card border border-owl-cream-deep bg-owl-cream p-6 shadow-owl-1">
              <p className="font-display text-xs font-semibold uppercase tracking-wide text-owl-teal">
                Or listen instead
              </p>
              <p className="mt-2 text-sm leading-relaxed text-owl-ink/80">
                The same song lives on every streaming platform — pre-cleared for classroom
                playback.
              </p>
              <Button intent="secondary" size="md" asChild className="mt-4 w-full">
                <Link href="/music">
                  <Music2 className="h-4 w-4" aria-hidden />
                  Open the music library
                </Link>
              </Button>
            </div>
          </aside>
        </div>
      </Section>

      {/* Suggested next videos (MediaRail) */}
      {suggested.length > 0 && (
        <SectionReveal>
          <Section width="wide" pad="lg" bg="white">
            <SectionIntro
              eyebrow="Keep watching"
              title="Suggested next"
              subtitle="Same theme first, then a few more from across the OWL library."
            />
            <MediaRail
              ariaLabel="Suggested next videos"
              columns={{ md: 2, lg: 4 }}
              className="mt-8"
              stagger={0.06}
            >
              {suggested.map((v) => (
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
      )}

      <SectionReveal>
        <Section width="wide" pad="md" bg="cream">
          <div className="flex flex-col items-center gap-3 text-center">
            <Sparkles className="h-6 w-6 text-owl-amber" aria-hidden />
            <p className="font-display text-sm font-semibold text-owl-ink">
              Got a moment to subscribe? One short letter from Larissa every Sunday.
            </p>
            <Button intent="primary" size="md" asChild>
              <Link href="/newsletter">Subscribe to the OWL Weekly</Link>
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

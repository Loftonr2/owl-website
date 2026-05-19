import { notFound } from "next/navigation";
import Link from "next/link";
import { Section, SectionHeader } from "@/components/ui/section";
import { Chip } from "@/components/ui/chip";
import { Button } from "@/components/ui/button";
import { PlaylistCard } from "@/components/marketing/playlist-card";
import { StreamingPlatforms } from "@/components/marketing/streaming-platforms";
import { SectionReveal } from "@/components/marketing/section-reveal";
import { NewsletterSection } from "@/components/marketing/newsletter-section";
import { pageMetadata } from "@/lib/seo/metadata";
import { SEED_PLAYLISTS, findPlaylistBySlug } from "@/lib/seed/playlists";

type Params = { slug: string };

export async function generateStaticParams(): Promise<Params[]> {
  return SEED_PLAYLISTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const playlist = findPlaylistBySlug(slug);
  if (!playlist) return pageMetadata({ title: "Playlist not found", noIndex: true });
  return pageMetadata({
    title: `${playlist.title} — OWL Playlist`,
    description: playlist.description ?? `OWL playlist: ${playlist.title}`,
    path: `/music/${playlist.slug}`,
  });
}

export default async function PlaylistDetailPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const playlist = findPlaylistBySlug(slug);
  if (!playlist) notFound();

  const related = SEED_PLAYLISTS.filter((p) => p.slug !== playlist.slug).slice(0, 3);

  return (
    <>
      <Section width="wide" pad="lg" bg="cream-deep">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr,2fr]">
          <div className="flex aspect-square items-center justify-center rounded-owl-hero bg-owl-amber-soft/40">
            <playlist.icon className="h-24 w-24 text-owl-ink/40" aria-hidden />
          </div>
          <div>
            <Chip intent="amber" className="mb-3">
              Playlist
            </Chip>
            <h1 className="font-display text-3xl font-extrabold text-owl-ink sm:text-4xl">
              {playlist.title}
            </h1>
            {playlist.description && (
              <p className="mt-3 max-w-prose text-base text-owl-mist">{playlist.description}</p>
            )}
            <p className="mt-4 text-sm text-owl-mist">{playlist.songCount} songs</p>

            <div className="mt-6">
              <StreamingPlatforms {...playlist.platformLinks} size="sm" />
            </div>

            <div className="mt-8">
              <Button asChild intent="secondary" size="md">
                <Link href="/watch">Watch matching videos</Link>
              </Button>
            </div>
          </div>
        </div>
      </Section>

      {/* Track list — Phase 5 placeholder. Phase 6 swaps to Sanity songs[]. */}
      <SectionReveal>
        <Section width="wide" pad="lg" bg="white">
          <SectionHeader eyebrow="Track list" title="Songs in this playlist" />
          <ol role="list" className="divide-y divide-owl-cream-deep rounded-owl-card border border-owl-cream-deep bg-white">
            {playlist.songSlugs.map((s, i) => (
              <li key={s} className="flex items-center gap-4 p-4">
                <span className="w-6 text-sm font-semibold text-owl-mist">{i + 1}</span>
                <span className="flex-1 font-display text-sm font-semibold text-owl-ink">
                  {s.replace(/-/g, " ")}
                </span>
                <Link href={`/watch/${s}`} className="text-sm font-semibold text-owl-teal hover:text-owl-teal-deep">
                  Watch →
                </Link>
              </li>
            ))}
          </ol>
        </Section>
      </SectionReveal>

      {related.length > 0 && (
        <SectionReveal>
          <Section width="wide" pad="lg" bg="cream">
            <SectionHeader eyebrow="More music" title="Other playlists" />
            <ul role="list" className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <li key={p.slug}>
                  <PlaylistCard {...p} />
                </li>
              ))}
            </ul>
          </Section>
        </SectionReveal>
      )}

      <SectionReveal>
        <NewsletterSection />
      </SectionReveal>
    </>
  );
}

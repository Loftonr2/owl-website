import { HeartHandshake, Moon, Music2, Sparkles } from "lucide-react";
import { Section, SectionHeader } from "@/components/ui/section";
import { PlaylistCard } from "./playlist-card";
import { MediaRail } from "./media-rail";

/**
 * Featured Playlists — v2 (redesign).
 *
 * 4 anchor playlists, now rendered through <PlaylistCard> (new tonal ribbon +
 * streaming hint on hover) inside a <MediaRail> (snap-x rail on mobile,
 * 4-col grid on desktop).
 *
 * Phase 5 (data) will swap the hardcoded list for Sanity
 * `playlist[featured == true]`.
 */
const PLAYLISTS = [
  { slug: "abc-songs", title: "ABC songs", icon: Music2, description: "Sing your way through the alphabet.", tone: "teal", songCount: 12 },
  { slug: "feelings", title: "Feelings & friends", icon: HeartHandshake, description: "Naming big feelings together.", tone: "rose", songCount: 9 },
  { slug: "holiday", title: "Holiday songs", icon: Sparkles, description: "Cultural celebrations, in song.", tone: "amber", songCount: 14 },
  { slug: "bedtime", title: "Bedtime lullabies", icon: Moon, description: "Slow tempos to wind the day down.", tone: "forest", songCount: 11 },
] as const;

export function FeaturedPlaylists() {
  return (
    <Section width="wide" pad="lg" bg="cream">
      <SectionHeader
        eyebrow="Listen anywhere"
        title="Featured playlists"
        subtitle="Stream on Spotify, Apple Music, YouTube Music, and Amazon Music — same songs, every platform."
      />
      <MediaRail
        ariaLabel="Featured OWL playlists"
        columns={{ md: 2, lg: 4 }}
        className="mt-8"
      >
        {PLAYLISTS.map((p) => (
          <PlaylistCard
            key={p.slug}
            slug={p.slug}
            title={p.title}
            description={p.description}
            songCount={p.songCount}
            tone={p.tone}
            icon={p.icon}
          />
        ))}
      </MediaRail>
    </Section>
  );
}

import { HeartHandshake, Moon, Music2, Sparkles, Sun, Wind } from "lucide-react";
import type { PlaylistCardProps } from "@/components/marketing/playlist-card";

export type SeedPlaylist = PlaylistCardProps & {
  ageBand: "0-1" | "1-2" | "2-3" | "3-4" | "4-5" | "5-8";
  category: "alphabet" | "feelings" | "holiday" | "bedtime" | "movement" | "counting";
  platformLinks: { spotify?: string; appleMusic?: string; youtubeMusic?: string; amazonMusic?: string };
  songSlugs: string[];
};

export const SEED_PLAYLISTS: SeedPlaylist[] = [
  {
    slug: "abc-songs",
    title: "ABC songs",
    description: "Sing your way through the alphabet — call-and-response.",
    songCount: 12,
    tone: "teal",
    icon: Music2,
    ageBand: "2-3",
    category: "alphabet",
    platformLinks: {
      spotify: "https://open.spotify.com/playlist/example-abc",
      appleMusic: "https://music.apple.com/playlist/example-abc",
      youtubeMusic: "https://music.youtube.com/playlist?list=example-abc",
    },
    songSlugs: ["learning-the-abcs", "letter-sound-song"],
  },
  {
    slug: "feelings",
    title: "Feelings & friends",
    description: "Naming big feelings together.",
    songCount: 9,
    tone: "rose",
    icon: HeartHandshake,
    ageBand: "3-4",
    category: "feelings",
    platformLinks: {
      spotify: "https://open.spotify.com/playlist/example-feelings",
      appleMusic: "https://music.apple.com/playlist/example-feelings",
    },
    songSlugs: ["this-little-light-of-mine", "lchaim-we-love-life"],
  },
  {
    slug: "holiday",
    title: "Holiday songs",
    description: "Cultural celebrations, in song.",
    songCount: 14,
    tone: "amber",
    icon: Sparkles,
    ageBand: "3-4",
    category: "holiday",
    platformLinks: {
      spotify: "https://open.spotify.com/playlist/example-holiday",
      appleMusic: "https://music.apple.com/playlist/example-holiday",
    },
    songSlugs: ["lchaim-we-love-life", "when-the-saints-go-marching-in", "old-folks-at-home-swanee-river"],
  },
  {
    slug: "bedtime",
    title: "Bedtime lullabies",
    description: "Slow tempos to wind the day down.",
    songCount: 11,
    tone: "forest",
    icon: Moon,
    ageBand: "0-1",
    category: "bedtime",
    platformLinks: {
      spotify: "https://open.spotify.com/playlist/example-bedtime",
      appleMusic: "https://music.apple.com/playlist/example-bedtime",
    },
    songSlugs: ["old-folks-at-home-swanee-river"],
  },
  {
    slug: "movement",
    title: "Movement & motor",
    description: "Songs that get little bodies moving.",
    songCount: 8,
    tone: "mist",
    icon: Wind,
    ageBand: "1-2",
    category: "movement",
    platformLinks: {
      spotify: "https://open.spotify.com/playlist/example-movement",
    },
    songSlugs: ["shell-be-comin-round-the-mountain", "the-radish-song"],
  },
  {
    slug: "counting",
    title: "Counting songs",
    description: "Build number sense, one verse at a time.",
    songCount: 7,
    tone: "amber",
    icon: Sun,
    ageBand: "2-3",
    category: "counting",
    platformLinks: {
      spotify: "https://open.spotify.com/playlist/example-counting",
      appleMusic: "https://music.apple.com/playlist/example-counting",
    },
    songSlugs: ["owl-sing-together-greatest-hits", "were-in-the-money"],
  },
];

export const PLAYLIST_CATEGORY_OPTIONS = [
  { value: "alphabet", label: "Alphabet" },
  { value: "feelings", label: "Feelings" },
  { value: "holiday", label: "Holidays" },
  { value: "bedtime", label: "Bedtime" },
  { value: "movement", label: "Movement" },
  { value: "counting", label: "Counting" },
] as const;

export function findPlaylistBySlug(slug: string) {
  return SEED_PLAYLISTS.find((p) => p.slug === slug);
}

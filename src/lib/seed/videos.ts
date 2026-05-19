import type { VideoCardProps } from "@/components/marketing/video-card";

/**
 * Seed video data — 10 real OWL videos shipped May 18, 2026.
 *
 * Every entry has a real `youtubeId` (11-char ID extracted from the
 * `?v=…` segment of the YouTube URL). Posters auto-resolve via the
 * three-tier resolver in `src/lib/images.ts → resolveVideoPoster()`:
 *
 *   1. `posterSrc` (local file under /public)   → preferred when art lands
 *   2. `youtubeId` → `youtubePosterUrl(id, "max")` → CDN poster   ← active path today
 *   3. null                                     → tonal placeholder
 *
 * The CDN URLs hit `https://img.youtube.com/vi/<id>/maxresdefault.jpg`
 * (whitelisted in next.config.ts). next/image runs with `unoptimized` for
 * YouTube hosts so we don't need to proxy them.
 *
 * COPPA: the on-page embed uses `youtube-nocookie.com` and only loads after
 * a user click (see <VideoPlayer>). No autoplay, no third-party cookies on
 * page load.
 */
export type SeedVideo = VideoCardProps & {
  summary: string;
  learningGoals: string[];
  ageBand: "0-1" | "1-2" | "2-3" | "3-4" | "4-5" | "5-8" | "8-11";
  themeSlug?:
    | "abcs"
    | "numbers"
    | "feelings"
    | "diwali"
    | "black-history-month"
    | "lullaby"
    | "movement"
    | "hispanic-heritage"
    | "cultural"
    | "literacy"
    | "compilation";
  publishedAt: string;
  /** Real YouTube ID (11 chars). */
  youtubeId: string;
  /** Local poster — null until art is commissioned. CDN poster is the fallback. */
  posterSrc?: string | null;
};

export const SEED_VIDEOS: SeedVideo[] = [
  {
    slug: "owl-sing-together-greatest-hits",
    title: "OWL Sing Together — Greatest Hits",
    ageRange: "0–8",
    ageBand: "2-3",
    themeSlug: "compilation",
    duration: "Compilation",
    tone: "amber",
    summary:
      "A long-form compilation of OWL's most-loved songs with Larissa — perfect for road trips, quiet afternoons, and circle-time playlists.",
    learningGoals: [
      "Repeated exposure to OWL's anchor songs",
      "Multicultural music vocabulary",
      "Sustained listening practice",
    ],
    publishedAt: "2026-05-01",
    youtubeId: "zrtwck76T1I",
  },
  {
    slug: "learning-the-abcs",
    title: "Learning the ABCs",
    ageRange: "2–5",
    ageBand: "2-3",
    themeSlug: "abcs",
    duration: "Song",
    tone: "teal",
    summary:
      "Larissa walks through the alphabet at a toddler-friendly tempo with call-and-response phrasing — the OWL anchor song for foundational literacy.",
    learningGoals: ["Letter names A–Z", "Letter-sound recognition", "Call-and-response"],
    publishedAt: "2026-05-04",
    youtubeId: "TzcY0JR6P5M",
  },
  {
    slug: "the-radish-song",
    title: "The Radish Song — Root for the Radish",
    ageRange: "2–6",
    ageBand: "3-4",
    theme: "Food & growing",
    themeSlug: "cultural",
    duration: "Song",
    tone: "rose",
    summary:
      "A playful root-vegetable sing-along that turns a radish into a cheer. Builds plant vocabulary and gets little bodies moving.",
    learningGoals: ["Plant vocabulary", "Movement participation", "Healthy food cues"],
    publishedAt: "2026-04-27",
    youtubeId: "X4xms5ABYMg",
  },
  {
    slug: "old-folks-at-home-swanee-river",
    title: "Old Folks at Home (Swanee River)",
    ageRange: "3–8",
    ageBand: "3-4",
    themeSlug: "cultural",
    duration: "Song",
    tone: "cream",
    summary:
      "A gentle, slow rendition of the classic American folk song — a calm-the-room track for transitions and quiet listening.",
    learningGoals: ["American folk tradition", "Calm listening", "Vocal modeling"],
    publishedAt: "2026-04-22",
    youtubeId: "hsSMHqCJvq0",
  },
  {
    slug: "this-little-light-of-mine",
    title: "This Little Light of Mine",
    ageRange: "3–8",
    ageBand: "3-4",
    themeSlug: "feelings",
    duration: "Song",
    tone: "amber",
    summary:
      "Larissa leads the beloved gospel-rooted song with multicultural casting and a slow, singable tempo.",
    learningGoals: ["Confidence singing", "Belonging", "Vocal participation"],
    publishedAt: "2026-04-18",
    youtubeId: "4iMd4xf5vVk",
  },
  {
    slug: "lchaim-we-love-life",
    title: "L'Chaim (We Love Life!)",
    ageRange: "3–8",
    ageBand: "3-4",
    theme: "Jewish heritage",
    themeSlug: "cultural",
    duration: "Song",
    tone: "rose",
    summary:
      "A joyful 'To life!' sing-along introducing the Hebrew toast and the warmth of Jewish family celebration.",
    learningGoals: ["Hebrew vocabulary", "Cultural exposure", "Joyful expression"],
    publishedAt: "2026-04-12",
    youtubeId: "fhLxOnxTiNg",
  },
  {
    slug: "when-the-saints-go-marching-in",
    title: "When the Saints Go Marching In",
    ageRange: "3–8",
    ageBand: "3-4",
    theme: "New Orleans",
    themeSlug: "cultural",
    duration: "Song",
    tone: "forest",
    summary:
      "An OWL take on the New Orleans jazz standard — celebrating the second-line tradition, parade rhythms, and community joy.",
    learningGoals: ["Jazz tradition", "Rhythm awareness", "Community celebration"],
    publishedAt: "2026-04-08",
    youtubeId: "ytOiLv0DKqw",
  },
  {
    slug: "were-in-the-money",
    title: "We're in the Money",
    ageRange: "3–8",
    ageBand: "3-4",
    themeSlug: "cultural",
    duration: "Song",
    tone: "mist",
    summary:
      "A vintage Broadway standard reimagined for kids — bright, playful, and a great introduction to American songbook history.",
    learningGoals: ["American songbook", "Joyful performance", "Vocabulary"],
    publishedAt: "2026-04-04",
    youtubeId: "MRt-WGWarV8",
  },
  {
    slug: "letter-sound-song",
    title: "Letter-Sound Song",
    ageRange: "2–5",
    ageBand: "3-4",
    themeSlug: "literacy",
    duration: "Song",
    tone: "teal",
    summary:
      "Each letter paired with its phonetic sound at a deliberate pace — the OWL companion song to the alphabet learning ladder.",
    learningGoals: ["Letter-sound correspondence", "Phonemic awareness", "Pre-reading"],
    publishedAt: "2026-03-30",
    youtubeId: "VbbuY2za7M4",
  },
  {
    slug: "shell-be-comin-round-the-mountain",
    title: "She'll Be Comin' Round the Mountain When She Comes",
    ageRange: "3–8",
    ageBand: "3-4",
    themeSlug: "movement",
    duration: "Song",
    tone: "forest",
    summary:
      "The classic American folk circle song with movement cues — clap, stomp, wave. A circle-time staple.",
    learningGoals: ["Sequential listening", "Gross-motor participation", "Folk tradition"],
    publishedAt: "2026-03-24",
    youtubeId: "FFIG9Jb5zGo",
  },
];

export const VIDEO_AGE_OPTIONS = [
  { value: "0-1", label: "Birth–1" },
  { value: "1-2", label: "1–2" },
  { value: "2-3", label: "2–3" },
  { value: "3-4", label: "3–4" },
  { value: "4-5", label: "4–5" },
  { value: "5-8", label: "5–8" },
] as const;

export const VIDEO_THEME_OPTIONS = [
  { value: "abcs", label: "ABCs" },
  { value: "literacy", label: "Letters & sounds" },
  { value: "feelings", label: "Feelings (SEL)" },
  { value: "cultural", label: "Cultural heritage" },
  { value: "movement", label: "Movement" },
  { value: "compilation", label: "Compilations" },
] as const;

export function findVideoBySlug(slug: string) {
  return SEED_VIDEOS.find((v) => v.slug === slug);
}

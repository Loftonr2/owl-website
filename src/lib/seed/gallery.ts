import type { GalleryCardProps } from "@/components/marketing/gallery-card";

export type SeedGalleryItem = GalleryCardProps & {
  slug: string;
  collectionSlug: "character" | "seasonal" | "stills" | "previews" | "mascot" | "bts" | "press";
};

export const SEED_GALLERY: SeedGalleryItem[] = [
  { slug: "larissa-portrait-amber", title: "Larissa portrait — amber light", caption: "Studio reference, May 2026", collection: "Character", collectionSlug: "character", tone: "amber", span: "wide" },
  { slug: "owl-mascot-still", title: "OWL mascot still", caption: "Reference, episode 4", collection: "Mascot", collectionSlug: "mascot", tone: "teal" },
  { slug: "diwali-celebration", title: "Diwali celebration scene", caption: "Cultural episode set", collection: "Seasonal", collectionSlug: "seasonal", tone: "amber" },
  { slug: "kwanzaa-table", title: "Kwanzaa table layout", collection: "Seasonal", collectionSlug: "seasonal", tone: "forest" },
  { slug: "abc-flash-card-preview", title: "ABC flash card preview", collection: "Previews", collectionSlug: "previews", tone: "rose", span: "tall" },
  { slug: "behind-the-scenes-studio", title: "Behind the scenes — studio", caption: "Recording day, March", collection: "BTS", collectionSlug: "bts", tone: "mist" },
  { slug: "press-shot-1", title: "Press kit hero shot 1", collection: "Press", collectionSlug: "press", tone: "cream" },
  { slug: "video-still-feelings", title: "Video still — Feelings Are Okay", collection: "Stills", collectionSlug: "stills", tone: "rose" },
  { slug: "video-still-abc", title: "Video still — ABCs with Larissa", collection: "Stills", collectionSlug: "stills", tone: "teal" },
  { slug: "video-still-counting", title: "Video still — Let's Count", collection: "Stills", collectionSlug: "stills", tone: "forest" },
  { slug: "character-larissa-line-art", title: "Larissa line-art reference", collection: "Character", collectionSlug: "character", tone: "amber" },
  { slug: "owl-mascot-pose-2", title: "OWL mascot — pose 2", collection: "Mascot", collectionSlug: "mascot", tone: "teal" },
];

export const GALLERY_COLLECTION_OPTIONS = [
  { value: "character", label: "Character art" },
  { value: "seasonal", label: "Seasonal" },
  { value: "stills", label: "Video stills" },
  { value: "previews", label: "Printable previews" },
  { value: "mascot", label: "Mascot" },
  { value: "bts", label: "Behind the scenes" },
  { value: "press", label: "Press kit" },
] as const;

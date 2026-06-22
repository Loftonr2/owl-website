import Image from "next/image";
import { PlayButton } from "@/components/ui/play-button";
import { OwlMark } from "@/components/brand/owl-logo";
import { resolveVideoPoster } from "@/lib/images";
import { cn } from "@/lib/cn";

/**
 * VideoPoster — the visual poster frame used for any OWL video.
 *
 * v3 (Phase 2 resolver):
 *   Three-tier image resolver via `resolveVideoPoster()`:
 *     1. `posterSrc` (local file under /public)        → preferred
 *     2. `youtubeId` (CDN fallback via youtubePosterUrl) → second choice
 *     3. null                                          → tonal placeholder + initials
 *
 *   The tonal panel that used to be the only visual now sits BEHIND the
 *   resolved <Image> so it's a graceful skeleton while the image loads, and
 *   it's the final visual when the resolver returns `null`.
 *
 * Used in three places:
 *   1. <VideoCard>      — small poster on /watch grid + homepage rail
 *   2. <VideoPlayer>    — large poster on /watch/[slug] (before user clicks play)
 *   3. Embedded modules — related videos, search results, gift guides
 *
 * No client JS — all hover/focus is delegated to the parent (e.g. <VideoCard>
 * wraps it in a <Link group>). Renders on the server.
 */

type Tone = "teal" | "amber" | "forest" | "rose" | "mist" | "cream";

const toneStyles: Record<Tone, { base: string; gradient: string }> = {
  teal: {
    base: "bg-owl-teal/20",
    gradient:
      "bg-[linear-gradient(135deg,rgba(26,153,148,0.10)_0%,rgba(26,153,148,0.30)_70%,rgba(19,112,112,0.45)_100%)]",
  },
  amber: {
    base: "bg-owl-amber/25",
    gradient:
      "bg-[linear-gradient(135deg,rgba(248,201,117,0.20)_0%,rgba(245,166,35,0.30)_70%,rgba(245,166,35,0.50)_100%)]",
  },
  forest: {
    base: "bg-owl-forest/20",
    gradient:
      "bg-[linear-gradient(135deg,rgba(45,74,58,0.15)_0%,rgba(45,74,58,0.30)_70%,rgba(45,74,58,0.50)_100%)]",
  },
  rose: {
    base: "bg-owl-rose/30",
    gradient:
      "bg-[linear-gradient(135deg,rgba(232,159,142,0.25)_0%,rgba(232,159,142,0.35)_70%,rgba(232,159,142,0.55)_100%)]",
  },
  mist: {
    base: "bg-owl-mist/25",
    gradient:
      "bg-[linear-gradient(135deg,rgba(122,135,148,0.20)_0%,rgba(122,135,148,0.30)_70%,rgba(122,135,148,0.50)_100%)]",
  },
  cream: {
    base: "bg-owl-cream-deep",
    gradient:
      "bg-[linear-gradient(135deg,rgba(243,235,218,0.50)_0%,rgba(243,235,218,0.70)_70%,rgba(232,159,142,0.30)_100%)]",
  },
};

const sizeStyles = {
  sm: { play: "sm" as const, mark: "h-8 w-8 left-3 bottom-3", imgSizes: "(min-width:1024px) 25vw, 50vw" },
  md: { play: "md" as const, mark: "h-10 w-10 left-4 bottom-4", imgSizes: "(min-width:1024px) 33vw, 100vw" },
  lg: { play: "lg" as const, mark: "h-12 w-12 left-5 bottom-5", imgSizes: "(min-width:1024px) 66vw, 100vw" },
};

export interface VideoPosterProps {
  tone: Tone;
  duration?: string;
  size?: keyof typeof sizeStyles;
  insideGroup?: boolean;
  caption?: string;
  className?: string;
  /** Optional title — used to render initials when falling back to tonal panel. */
  title?: string;
  /** Local poster file under /public. Takes precedence over `youtubeId`. */
  posterSrc?: string | null;
  /** YouTube video ID for CDN poster fallback. */
  youtubeId?: string | null;
  /** Alt text for the resolved poster image. */
  alt?: string;
}

export function VideoPoster({
  tone,
  duration,
  size = "md",
  insideGroup = true,
  caption,
  className,
  title,
  posterSrc,
  youtubeId,
  alt,
}: VideoPosterProps) {
  const s = sizeStyles[size];
  const t = toneStyles[tone];
  const resolved = resolveVideoPoster(posterSrc, youtubeId);
  const initials = title
    ? title
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : null;

  return (
    <div
      className={cn(
        "relative isolate overflow-hidden rounded-t-owl-card aspect-video",
        t.base,
        className
      )}
    >
      {/* Tier 3 — tonal placeholder. Always rendered as the skeleton/floor.
          When tier 1 or 2 resolves, the image stacks on top. */}
      <div aria-hidden className={cn("absolute inset-0", t.gradient)} />
      {initials && !resolved.url && (
        <span
          aria-hidden
          className="absolute inset-0 flex items-center justify-center font-display text-5xl font-extrabold text-owl-ink/20"
        >
          {initials}
        </span>
      )}

      {/* Tier 1 or 2 — resolved image. Sits above the tonal panel. */}
      {resolved.url && (
        <Image
          src={resolved.url}
          alt={alt ?? title ?? ""}
          fill
          sizes={s.imgSizes}
          // YouTube CDN URLs are remote — set `unoptimized` to bypass the
          // next/image optimizer (avoids requiring a remotePatterns config
          // entry for img.youtube.com). Local posters get full optimization.
          unoptimized={resolved.source === "youtube"}
          className="absolute inset-0 object-cover"
          data-poster-source={resolved.source}
        />
      )}

      {/* OwlMark watermark — bottom-left, always on top of any image */}
      <OwlMark
        decorative
        className={cn("absolute opacity-90 drop-shadow-sm", s.mark)}
      />

      {/* Center play badge */}
      <div className="absolute inset-0 flex items-center justify-center">
        <PlayButton size={s.play} tone="light" insideGroup={insideGroup} />
      </div>

      {/* Optional caption under the play button */}
      {caption && (
        <span className="absolute bottom-12 left-1/2 -translate-x-1/2 rounded-full bg-owl-white/85 px-3 py-1 text-xs font-bold uppercase tracking-wide text-owl-ink shadow-owl-1 backdrop-blur-owl-soft">
          {caption}
        </span>
      )}

      {/* Duration pill */}
      {duration && (
        <span className="absolute bottom-3 right-3 rounded-full bg-owl-ink/80 px-2.5 py-0.5 text-xs font-bold text-owl-cream backdrop-blur-owl-soft">
          {duration}
        </span>
      )}
    </div>
  );
}

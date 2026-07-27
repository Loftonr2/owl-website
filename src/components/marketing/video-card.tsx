import Link from "next/link";
import { Chip } from "@/components/ui/chip";
import { VideoPoster } from "./video-poster";

/**
 * VideoCard -- v3 (Phase 2 resolver-aware).
 *
 * Passes the video's `posterSrc` + `youtubeId` through to <VideoPoster> so the
 * card's thumbnail is resolved via the three-tier resolver:
 *   1. local poster file -> 2. YouTube CDN URL -> 3. tonal placeholder.
 *
 * API is preserved (slug / title / ageRange / theme / duration / tone) plus
 * two new optional fields (posterSrc / youtubeId). Existing call sites still
 * work -- they just don't get real imagery until the seed entry has data.
 */

type ThumbnailTone = "teal" | "amber" | "forest" | "rose" | "mist" | "cream";

export type VideoCardProps = {
  slug: string;
  title: string;
  ageRange: string;
  theme?: string;
  duration: string;
  tone: ThumbnailTone;
  /** Local poster file. Takes precedence over `youtubeId`. */
  posterSrc?: string | null;
  /** YouTube video ID for CDN poster fallback. */
  youtubeId?: string | null;
  /**
   * Optional href override. When set, the card links here instead of the
   * internal /watch/[slug] route. External URLs (http) open in a new tab.
   * Used by the Watch page featured rail when showing live YouTube videos.
   */
  href?: string;
};

export function VideoCard({
  slug,
  title,
  ageRange,
  theme,
  duration,
  tone,
  posterSrc,
  youtubeId,
  href,
}: VideoCardProps) {
  const linkHref = href ?? `/watch/${slug}`;
  const isExternal = linkHref.startsWith("http");

  return (
    <Link
      href={linkHref}
      {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      aria-label={`Open "${title}" -- ages ${ageRange}, ${duration}`}
      className={[
        "group block h-full overflow-hidden rounded-owl-card border border-owl-cream-deep bg-owl-white",
        "shadow-owl-1 transition-all duration-300 ease-owl",
        "hover:-translate-y-0.5 hover:shadow-owl-2 hover:border-owl-teal/40",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-owl-teal focus-visible:ring-offset-2 focus-visible:ring-offset-owl-cream",
      ].join(" ")}
    >
      <VideoPoster
        tone={tone}
        duration={duration}
        size="md"
        insideGroup
        title={title}
        posterSrc={posterSrc}
        youtubeId={youtubeId}
        alt={`Preview of "${title}"`}
      />
      <div className="p-5">
        <h3 className="font-display text-lg font-semibold leading-tight text-owl-ink">
          {title}
        </h3>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Chip intent="teal">Ages {ageRange}</Chip>
          {theme && <Chip intent="amber">{theme}</Chip>}
        </div>
      </div>
    </Link>
  );
}

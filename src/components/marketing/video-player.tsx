"use client";

import { useState } from "react";
import { VideoPoster, type VideoPosterProps } from "./video-poster";
import { cn } from "@/lib/cn";

/**
 * VideoPlayer — poster-first YouTube embed loader.
 *
 * Behavior (the non-negotiable from the redesign brief):
 *   - Renders <VideoPoster> only on first paint.
 *   - When the user clicks the poster (or hits Enter/Space when focused),
 *     swaps the poster for a <iframe> with `autoplay=1` so playback starts.
 *   - NO heavyweight YouTube SDK is loaded until interaction.
 *
 * This means the page weight stays low — until the user opts in, the player
 * is just a 1KB poster with a play badge. The iframe + YouTube's ~600KB SDK
 * load only on demand.
 *
 * Privacy: uses youtube-nocookie.com as the host. No third-party cookies set
 * until the user interacts. Aligns with OWL_BUILD_RULES §8 COPPA/privacy.
 *
 * Accessibility:
 *   - Poster is a real <button> while idle, so it's keyboard-focusable and
 *     announced by screen readers.
 *   - When playing, the iframe carries its own title for SR support.
 *   - We don't add `autoplay` parameter without the explicit click — never
 *     autoplay on page load, no exceptions (CLAUDE_READ_FIRST §13).
 *
 * Props:
 *   - `youtubeId` — the v=… ID from the canonical YouTube URL. If absent,
 *     the component renders the poster but the play button is visually
 *     disabled and labeled "Coming soon" (matches OWL "asset pending" pattern).
 *   - All <VideoPoster> props are forwarded.
 */

export interface VideoPlayerProps extends VideoPosterProps {
  /** YouTube video ID. Optional — when absent, renders as "coming soon". */
  youtubeId?: string;
  /** Title for the iframe (announced by screen readers). Required. */
  title: string;
  /** Optional className applied to the outer wrapper. */
  wrapperClassName?: string;
}

export function VideoPlayer({
  youtubeId,
  title,
  wrapperClassName,
  ...posterProps
}: VideoPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const hasVideo = Boolean(youtubeId);

  // Once the user clicks, mount the iframe with autoplay=1.
  if (playing && hasVideo) {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-owl-banner shadow-owl-2",
          wrapperClassName
        )}
      >
        <div className="aspect-video">
          <iframe
            // Use the privacy-enhanced YouTube domain — no third-party cookies
            // are set unless the visitor interacts with the embed UI itself.
            src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full border-0"
          />
        </div>
      </div>
    );
  }

  // Idle state — poster with click target.
  //
  // Per the OWL non-negotiable: videos never carry a "Coming Soon" badge.
  // That language is reserved for store products. When `youtubeId` is absent,
  // the poster still renders (resolver tries local → YouTube CDN → tonal),
  // and the play button stays present but disabled. No misleading copy.
  return (
    <button
      type="button"
      onClick={() => hasVideo && setPlaying(true)}
      disabled={!hasVideo}
      aria-label={hasVideo ? `Play "${title}"` : `"${title}" — playback not available yet`}
      className={cn(
        "group relative block w-full overflow-hidden rounded-owl-banner shadow-owl-2",
        "transition-shadow duration-300 ease-owl",
        hasVideo
          ? "cursor-pointer hover:shadow-owl-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-owl-teal focus-visible:ring-offset-2 focus-visible:ring-offset-owl-cream"
          : "cursor-not-allowed",
        wrapperClassName
      )}
    >
      <VideoPoster
        {...posterProps}
        insideGroup
        size={posterProps.size ?? "lg"}
        title={title}
        youtubeId={youtubeId}
        alt={`Poster for "${title}"`}
        // No `caption` — videos do NOT show "Coming Soon" or any equivalent.
      />
    </button>
  );
}

"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useMouseTilt } from "@/lib/motion/mouse";
import { cn } from "@/lib/cn";

/**
 * MediaPosterCard — generic poster-first card.
 *
 * v2 (cursor-tilt hover): wraps the card in a `useMouseTilt` perspective
 * transform so the card subtly tilts toward the cursor on fine-pointer
 * devices. Reduced-motion + touch skip the effect automatically inside the
 * hook. Falls back to the Tailwind `hover:-translate-y-0.5` lift in those
 * cases, so behaviour is consistent.
 *
 * The shared shape behind every "tile with a poster + a meta block":
 *   - <VideoCard>     (poster = <VideoPoster>)
 *   - <PlaylistCard>  (poster = colored disc / album art slot)
 *   - <PrintableCard> (poster = printable preview thumbnail)
 *   - any new media surface in the future
 *
 * Specialised cards build on top:
 *
 *   <MediaPosterCard
 *     href={`/watch/${slug}`}
 *     ariaLabel={`Open "${title}"`}
 *     poster={<VideoPoster tone={tone} duration={duration} ... />}
 *   >
 *     <h3 …>{title}</h3>
 *     <div …><Chip intent="teal">Ages {ageRange}</Chip></div>
 *   </MediaPosterCard>
 */

export interface MediaPosterCardProps {
  /** Where the card links to. */
  href: string;
  /** Accessible name for the wrapping link. */
  ariaLabel?: string;
  /** Whatever poster art belongs in the top slot. Required. */
  poster: ReactNode;
  /** Meta footer — title, chips, price, etc. */
  children?: ReactNode;
  /** Optional ribbon overlay (Coming Soon, New, Free, …). */
  ribbon?: ReactNode;
  /** Tone hint used by an optional border accent on hover. */
  accent?: "teal" | "amber" | "rose" | "forest";
  /** Disable interactivity (use when href is placeholder). */
  disabled?: boolean;
  /** Opt out of the 3D tilt effect. Default true (tilt on). */
  tilt?: boolean;
  className?: string;
}

const accentBorder = {
  teal: "hover:border-owl-teal/40",
  amber: "hover:border-owl-amber/50",
  rose: "hover:border-owl-rose/50",
  forest: "hover:border-owl-forest/40",
} as const;

export function MediaPosterCard({
  href,
  ariaLabel,
  poster,
  children,
  ribbon,
  accent = "teal",
  disabled,
  tilt = true,
  className,
}: MediaPosterCardProps) {
  const { ref: tiltRef, style: tiltStyle } = useMouseTilt<HTMLAnchorElement>({
    strength: 1.5, // subtle — 1.5deg max
    translate: 2, // tiny secondary translate toward the cursor
  });

  const shellClasses = cn(
    "group relative block h-full overflow-hidden rounded-owl-card border border-owl-cream-deep bg-owl-white",
    "shadow-owl-1 transition-shadow duration-300 ease-owl",
    !disabled && [
      "hover:shadow-owl-2",
      accentBorder[accent],
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-owl-teal focus-visible:ring-offset-2 focus-visible:ring-offset-owl-cream",
    ],
    disabled && "pointer-events-none opacity-70",
    className
  );

  const content = (
    <>
      {poster}
      {ribbon}
      {children && <div className="p-5">{children}</div>}
    </>
  );

  if (disabled) {
    return (
      <div className={shellClasses} aria-disabled="true">
        {content}
      </div>
    );
  }

  return (
    <Link
      href={href}
      ref={tilt ? tiltRef : undefined}
      aria-label={ariaLabel}
      className={shellClasses}
      style={tilt ? tiltStyle : undefined}
    >
      {content}
    </Link>
  );
}

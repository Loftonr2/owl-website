import Link from "next/link";
import { Headphones, Music2, type LucideIcon } from "lucide-react";

type Tone = "teal" | "amber" | "forest" | "rose" | "mist";

const toneStyles: Record<
  Tone,
  { iconBg: string; ribbon: string; accent: string }
> = {
  teal: {
    iconBg: "bg-owl-teal/12 text-owl-teal",
    ribbon: "bg-owl-teal/10",
    accent: "from-owl-teal/30 to-transparent",
  },
  amber: {
    iconBg: "bg-owl-amber/15 text-owl-amber",
    ribbon: "bg-owl-amber/10",
    accent: "from-owl-amber/30 to-transparent",
  },
  forest: {
    iconBg: "bg-owl-forest/12 text-owl-forest",
    ribbon: "bg-owl-forest/10",
    accent: "from-owl-forest/25 to-transparent",
  },
  rose: {
    iconBg: "bg-owl-rose/20 text-owl-rose",
    ribbon: "bg-owl-rose/15",
    accent: "from-owl-rose/35 to-transparent",
  },
  mist: {
    iconBg: "bg-owl-mist/20 text-owl-mist",
    ribbon: "bg-owl-mist/15",
    accent: "from-owl-mist/30 to-transparent",
  },
};

export type PlaylistCardProps = {
  slug: string;
  title: string;
  description?: string;
  songCount?: number;
  tone: Tone;
  icon: LucideIcon;
};

/**
 * PlaylistCard — v2 (redesign).
 *
 * Layered composition:
 *   1. Card surface (white)
 *   2. Tinted accent ribbon at the top (color per tone)
 *   3. Icon disc + title + description
 *   4. Footer: song count (left) + listen arrow (right)
 *   5. Streaming-platform hint appears on hover/focus (Spotify · Apple · YT Music)
 *
 * Streaming icons are revealed via group-hover/group-focus-within so the card
 * stays calm at rest. No iframe or audio is loaded — clicking the card just
 * navigates to /music/[slug] where the platform CTAs live.
 */
export function PlaylistCard({
  slug,
  title,
  description,
  songCount,
  tone,
  icon: Icon,
}: PlaylistCardProps) {
  const t = toneStyles[tone];
  return (
    <Link
      href={`/music/${slug}`}
      aria-label={`Open the "${title}" playlist`}
      className={[
        "group relative flex h-full flex-col overflow-hidden rounded-owl-card",
        "border border-owl-cream-deep bg-owl-white p-6 shadow-owl-1",
        "transition-all duration-300 ease-owl",
        "hover:-translate-y-0.5 hover:shadow-owl-2 hover:border-owl-teal/40",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-owl-teal focus-visible:ring-offset-2 focus-visible:ring-offset-owl-cream",
      ].join(" ")}
    >
      {/* Tonal ribbon at the top — gives each playlist a flag of color */}
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-x-0 top-0 h-1.5 ${t.ribbon}`}
      />
      {/* Soft tonal accent radial behind the icon */}
      <span
        aria-hidden
        className={`pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-br ${t.accent} opacity-70`}
      />

      <span
        className={`mb-5 inline-flex h-14 w-14 items-center justify-center rounded-full transition-transform duration-300 ease-owl group-hover:scale-110 ${t.iconBg}`}
      >
        <Icon className="h-6 w-6" aria-hidden />
      </span>

      <h3 className="font-display text-lg font-semibold text-owl-ink">
        {title}
      </h3>
      {description && (
        <p className="mt-1 text-sm text-owl-mist">{description}</p>
      )}

      <div className="mt-auto flex items-center justify-between pt-6">
        <span className="inline-flex items-center gap-2 text-xs font-medium text-owl-mist">
          {songCount !== undefined && (
            <>
              <Music2 className="h-3.5 w-3.5" aria-hidden />
              {songCount} songs
            </>
          )}
        </span>
        <span className="font-display text-sm font-semibold text-owl-teal transition-colors duration-200 ease-owl-quick group-hover:text-owl-teal-deep">
          Listen →
        </span>
      </div>

      {/* Streaming hint — reveals on hover/focus, hidden at rest */}
      <span
        aria-hidden
        className="pointer-events-none mt-4 flex items-center gap-2 border-t border-owl-cream-deep pt-3 text-[10px] font-bold uppercase tracking-wide text-owl-mist opacity-0 transition-opacity duration-200 ease-owl-quick group-hover:opacity-100 group-focus-within:opacity-100"
      >
        <Headphones className="h-3 w-3" aria-hidden />
        Spotify · Apple Music · YouTube Music
      </span>
    </Link>
  );
}

import Link from "next/link";
import { Headphones, Music2, type LucideIcon } from "lucide-react";

type Tone = "teal" | "amber" | "forest" | "rose" | "mist";

/**
 * Per-tone colour tokens.
 * cardGrad  — full-card soft pastel gradient background
 * bar       — top colour bar (thicker, more visible)
 * iconBg    — icon disc fill
 * iconColor — icon stroke colour
 * listenColor — "Listen →" link accent
 * hover     — hover border tint
 */
const toneStyles: Record<
  Tone,
  {
    cardGrad: string;
    bar: string;
    iconBg: string;
    iconColor: string;
    listenColor: string;
    hoverBorder: string;
  }
> = {
  teal: {
    cardGrad: "bg-gradient-to-br from-[#e5f8f4] via-[#f0faf7] to-[#fff8ec]",
    bar: "bg-owl-teal",
    iconBg: "bg-owl-teal/15",
    iconColor: "text-owl-teal",
    listenColor: "text-owl-teal group-hover:text-owl-teal-deep",
    hoverBorder: "hover:border-owl-teal/50",
  },
  rose: {
    cardGrad: "bg-gradient-to-br from-[#fce8e4] via-[#fdf3f1] to-[#fff8ec]",
    bar: "bg-owl-rose",
    iconBg: "bg-owl-rose/15",
    iconColor: "text-owl-rose",
    listenColor: "text-owl-rose group-hover:text-[#c0503a]",
    hoverBorder: "hover:border-owl-rose/50",
  },
  amber: {
    cardGrad: "bg-gradient-to-br from-[#fef3d8] via-[#fdf7eb] to-[#eefae5]",
    bar: "bg-owl-amber",
    iconBg: "bg-owl-amber/20",
    iconColor: "text-owl-amber",
    listenColor: "text-owl-amber group-hover:text-[#b07010]",
    hoverBorder: "hover:border-owl-amber/50",
  },
  forest: {
    cardGrad: "bg-gradient-to-br from-[#dff0e6] via-[#eef6f1] to-[#fff8ec]",
    bar: "bg-owl-forest",
    iconBg: "bg-owl-forest/12",
    iconColor: "text-owl-forest",
    listenColor: "text-owl-forest group-hover:text-[#1a3d28]",
    hoverBorder: "hover:border-owl-forest/40",
  },
  mist: {
    cardGrad: "bg-gradient-to-br from-[#e6edf5] via-[#f1f5fa] to-[#fff8ec]",
    bar: "bg-owl-mist",
    iconBg: "bg-owl-mist/20",
    iconColor: "text-owl-mist",
    listenColor: "text-owl-mist group-hover:text-[#4a5a6a]",
    hoverBorder: "hover:border-owl-mist/50",
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
      aria-label={"Open the " + title + " playlist"}
      className={[
        "group relative flex h-full flex-col overflow-hidden rounded-owl-card",
        t.cardGrad,
        "border border-owl-cream-deep/70 shadow-owl-1",
        "transition-all duration-300 ease-owl",
        "hover:-translate-y-1 hover:shadow-owl-2",
        t.hoverBorder,
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-owl-teal focus-visible:ring-offset-2",
      ].join(" ")}
    >
      {/* Colour bar — thicker, clearly toned */}
      <span
        aria-hidden
        className={"pointer-events-none absolute inset-x-0 top-0 h-2 " + t.bar}
      />

      <div className="flex flex-1 flex-col p-6 pt-8">
        {/* Icon disc */}
        <span
          className={[
            "mb-5 inline-flex h-14 w-14 items-center justify-center rounded-full",
            "transition-transform duration-300 ease-owl group-hover:scale-110",
            t.iconBg,
            t.iconColor,
          ].join(" ")}
        >
          <Icon className="h-6 w-6" aria-hidden />
        </span>

        <h3 className="font-display text-lg font-semibold text-owl-ink">
          {title}
        </h3>
        {description && (
          <p className="mt-1 text-sm text-owl-ink/60">{description}</p>
        )}

        <div className="mt-auto flex items-center justify-between pt-6 border-t border-black/5">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-owl-ink/50">
            {songCount !== undefined && (
              <>
                <Music2 className="h-3.5 w-3.5" aria-hidden />
                {songCount} songs
              </>
            )}
          </span>
          <span className={"font-display text-sm font-semibold transition-colors duration-200 ease-owl-quick " + t.listenColor}>
            Listen →
          </span>
        </div>

        {/* Streaming hint on hover */}
        <span
          aria-hidden
          className="pointer-events-none mt-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide text-owl-ink/40 opacity-0 transition-opacity duration-200 ease-owl-quick group-hover:opacity-100 group-focus-within:opacity-100"
        >
          <Headphones className="h-3 w-3" aria-hidden />
          Spotify · Apple Music · YouTube Music
        </span>
      </div>
    </Link>
  );
}

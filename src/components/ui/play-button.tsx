import { Play } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * PlayButton — the glass play badge that sits on every video poster.
 *
 * Subtle frosted disc with the OWL amber play arrow. Animates a soft hover
 * scale + shadow bump when its parent is hovered (so the card lift and the
 * button lift feel like one motion).
 *
 * Three sizes: sm (rail card), md (default), lg (detail page hero).
 * Two tones: light (default, on photographic/dark backgrounds) and warm (on cream).
 *
 * Stateless / no-JS — purely visual. Click is owned by the parent <Link>
 * or <button>.
 */

type PlayButtonSize = "sm" | "md" | "lg";
type PlayButtonTone = "light" | "warm";

const sizeStyles: Record<PlayButtonSize, { box: string; icon: string }> = {
  sm: { box: "h-12 w-12", icon: "h-5 w-5" },
  md: { box: "h-16 w-16", icon: "h-7 w-7" },
  lg: { box: "h-20 w-20", icon: "h-8 w-8" },
};

const toneStyles: Record<PlayButtonTone, string> = {
  light:
    "bg-owl-white/85 text-owl-amber ring-1 ring-owl-white/70 backdrop-blur-owl-soft",
  warm:
    "bg-owl-amber text-owl-ink ring-1 ring-owl-amber/40",
};

export interface PlayButtonProps {
  size?: PlayButtonSize;
  tone?: PlayButtonTone;
  /** Whether this is rendered inside a group-hover parent (rail card). */
  insideGroup?: boolean;
  /** SR label for accessibility. Defaults to "Play". */
  label?: string;
  className?: string;
}

export function PlayButton({
  size = "md",
  tone = "light",
  insideGroup = false,
  label = "Play",
  className,
}: PlayButtonProps) {
  const s = sizeStyles[size];
  return (
    <span
      role="presentation"
      aria-label={label}
      className={cn(
        "inline-flex items-center justify-center rounded-full shadow-owl-2",
        "transition-transform duration-300 ease-owl",
        s.box,
        toneStyles[tone],
        insideGroup && "group-hover:scale-110 group-focus-within:scale-110",
        className
      )}
    >
      {/* Triangle nudged 1px right so it visually centers */}
      <Play className={cn("translate-x-px fill-current", s.icon)} aria-hidden />
    </span>
  );
}

import { cn } from "@/lib/cn";

/**
 * ComingSoonRibbon — overlay badge for non-live store products.
 *
 * Variants:
 *   - "corner" (default) — 45° angled ribbon at top-right corner
 *   - "pill"             — flat pill at top-left (less attention-grabbing)
 *   - "banner"           — full-width teal overlay at bottom of image area
 */

export type ComingSoonVariant = "corner" | "pill" | "banner";

export interface ComingSoonRibbonProps {
  variant?: ComingSoonVariant;
  /** Override the label. Defaults to "Coming Soon". */
  label?: string;
  className?: string;
}

export function ComingSoonRibbon({
  variant = "corner",
  label = "Coming Soon",
  className,
}: ComingSoonRibbonProps) {
  if (variant === "banner") {
    return (
      <span
        aria-label={label}
        className={cn(
          "pointer-events-none absolute bottom-0 left-0 right-0 z-ui",
          "bg-owl-teal py-2 text-center text-xs font-extrabold uppercase tracking-[0.18em] text-white",
          className
        )}
      >
        {label}
      </span>
    );
  }

  if (variant === "pill") {
    return (
      <span
        className={cn(
          "absolute left-3 top-3 z-ui inline-flex items-center gap-1 rounded-full bg-owl-amber px-3 py-1 text-xs font-bold uppercase tracking-wide text-owl-ink shadow-owl-1",
          className
        )}
      >
        {label}
      </span>
    );
  }

  // Corner ribbon: a 45° rotated band anchored to the top-right.
  // Implemented as an absolutely-positioned wrapper (clipping) + a rotated bar.
  return (
    <span
      aria-label={label}
      className={cn(
        "pointer-events-none absolute right-0 top-0 z-ui h-24 w-24 overflow-hidden rounded-tr-owl-card",
        className
      )}
    >
      <span
        className={cn(
          "absolute -right-10 top-5 inline-block w-[140px] rotate-45",
          "bg-owl-amber py-1 text-center text-[11px] font-extrabold uppercase tracking-[0.18em] text-owl-ink",
          "shadow-owl-1"
        )}
      >
        {label}
      </span>
    </span>
  );
}

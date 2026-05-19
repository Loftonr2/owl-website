import { cn } from "@/lib/cn";

/**
 * ComingSoonRibbon — diagonal corner ribbon for non-live store products.
 *
 * The redesign brief requires:
 *   "All product cards in the store that are not yet live must show a visible
 *   'Coming Soon' ribbon."
 *
 * Default placement: top-right corner of a relatively-positioned <ProductCard>.
 * It uses the OWL amber palette so it reads as friendly anticipation, not warning.
 *
 * Usage:
 *   <ProductCard className="relative">
 *     {product.isComingSoon && <ComingSoonRibbon />}
 *     ...
 *   </ProductCard>
 *
 * Variants:
 *   - "corner" (default) — 45° angled ribbon at the corner
 *   - "pill"             — a flat pill at top-left (less attention-grabbing)
 */

export type ComingSoonVariant = "corner" | "pill";

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

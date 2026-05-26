"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * StickyMiniCart — persistent shopping reminder, mounted on /shop.
 *
 * Today this is a presentational shell. When commerce wakes up (Phase 3 of the
 * OWL build plan — Stripe + Shopify), wire its props to a real cart store
 * (zustand, jotai, or React context).
 *
 * Behavior:
 *   - Hidden when `itemCount === 0` (default). No empty cart bug.
 *   - Bottom-right floating card on `sm+`. Full-width band on `<sm`.
 *   - Slides up + fades in on first render with items. Slides down on dismiss
 *     (parent owns dismiss state — set itemCount to 0 to hide).
 *   - Reduced-motion: renders instantly, no slide-in.
 *
 * Accessibility:
 *   - role="region" + aria-label so screen readers announce "shopping cart
 *     with N items".
 *   - "View cart" + "Checkout" are real <Link> elements, keyboard-focusable.
 *   - z-overlay so it draws over <ScrollProgress> and any modal underlay.
 *
 * Demo state:
 *   - For QA without a real cart, pass static props from /shop:
 *       <StickyMiniCart itemCount={3} total="$67.97" />
 *     The component itself does NOT fabricate items — that's a page decision.
 */

export interface StickyMiniCartProps {
  /** Number of distinct line items in the cart. 0 hides the cart. */
  itemCount: number;
  /** Formatted total with currency (e.g. "$24.99"). */
  total: string;
  /** Optional thumbnails to preview (max 3 shown). Each is a short label. */
  previewLabels?: string[];
  /** Override the "View cart" href. */
  viewHref?: string;
  /** Override the "Checkout" href. */
  checkoutHref?: string;
  /** Disable interactive CTAs (when commerce isn't live yet). */
  disabled?: boolean;
  className?: string;
}

export function StickyMiniCart({
  itemCount,
  total,
  previewLabels,
  viewHref = "/shop/cart",
  checkoutHref = "/shop/checkout",
  disabled = false,
  className,
}: StickyMiniCartProps) {
  const reduced = useReducedMotion();
  if (itemCount <= 0) return null;

  const inner = (
    <div
      role="region"
      aria-label={`Shopping cart, ${itemCount} ${itemCount === 1 ? "item" : "items"}`}
      className={cn(
        "pointer-events-auto flex w-full items-center gap-3 rounded-owl-card border border-owl-cream-deep bg-owl-white/95 p-3 shadow-owl-2 backdrop-blur-owl-medium",
        "sm:w-auto sm:max-w-md sm:p-3.5",
        className
      )}
    >
      {/* Icon disc */}
      <span
        aria-hidden
        className="relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-owl-amber/15 text-owl-amber"
      >
        <ShoppingBag className="h-5 w-5" />
        <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-owl-amber px-1 text-[10px] font-extrabold text-owl-ink shadow-owl-1">
          {itemCount}
        </span>
      </span>

      {/* Title + total + optional preview labels */}
      <div className="min-w-0 flex-1">
        <p className="font-display text-sm font-bold text-owl-ink">
          {itemCount} {itemCount === 1 ? "item" : "items"} · {total}
        </p>
        {previewLabels && previewLabels.length > 0 && (
          <p className="truncate text-xs text-owl-mist">
            {previewLabels.slice(0, 3).join(", ")}
            {previewLabels.length > 3 && ` +${previewLabels.length - 3}`}
          </p>
        )}
        {disabled && (
          <p className="text-[10px] font-semibold uppercase tracking-wide text-owl-amber">
            Checkout opens Phase 3
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-2">
        <Link
          href={viewHref}
          aria-label="View cart"
          className={cn(
            "hidden h-9 items-center rounded-owl-btn px-3 text-xs font-semibold transition-colors duration-150 ease-owl-quick sm:inline-flex",
            disabled
              ? "pointer-events-none text-owl-mist"
              : "text-owl-forest hover:bg-owl-cream-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-owl-teal/60"
          )}
        >
          View
        </Link>
        <Link
          href={checkoutHref}
          aria-label="Checkout"
          aria-disabled={disabled || undefined}
          className={cn(
            "inline-flex h-9 items-center gap-1.5 rounded-owl-btn px-3 text-xs font-bold shadow-owl-1 transition-all duration-150 ease-owl-quick",
            disabled
              ? "pointer-events-none bg-owl-mist/40 text-owl-ink/50"
              : "bg-owl-amber text-owl-ink hover:bg-owl-amber-soft hover:shadow-owl-amber-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-owl-teal focus-visible:ring-offset-1"
          )}
        >
          Checkout
          <ArrowRight className="h-3 w-3" aria-hidden />
        </Link>
      </div>
    </div>
  );

  return (
    <div className="pointer-events-none fixed inset-x-3 bottom-3 z-overlay sm:inset-x-auto sm:bottom-5 sm:right-5">
      {reduced ? (
        inner
      ) : (
        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 24, opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          {inner}
        </motion.div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * StickyCTA — bottom-of-viewport conversion band.
 *
 * Appears after the visitor has scrolled past a threshold (default 60% of
 * viewport height). Dismissable per session via the close button — once
 * dismissed it stays hidden until the user reloads.
 *
 * Use sparingly: long marketing pages (newsletter, app waitlist, educator
 * landing) where a persistent reminder of the primary action helps. Do NOT
 * mount on every page — that's a popup pattern and conflicts with
 * OWL_BUILD_RULES §8 ("no popup spam, no scroll-triggered popups").
 *
 * The component is a band, not a modal. It doesn't block content. It uses
 * an aside element so screen readers announce it once and move on.
 *
 * Mobile: full-width band at the bottom.
 * Desktop: same band, capped at content width.
 *
 * Reduced-motion: no slide-in. Renders instantly when shown.
 */

export interface StickyCTAProps {
  /** Short label, e.g. "Get the free printable pack". */
  title: ReactNode;
  /** Optional supporting copy under the title. */
  subtitle?: ReactNode;
  /** Primary action — usually a <Button> wrapped around a <Link>. */
  action: ReactNode;
  /**
   * Show the band once the user scrolls this fraction of the viewport.
   * Default 0.6 = appears after one screen of content has scrolled past.
   */
  showAfter?: number;
  /** Optional className for the band wrapper. */
  className?: string;
  /** Tone — band background color. */
  tone?: "cream" | "forest" | "teal";
}

const toneStyles: Record<NonNullable<StickyCTAProps["tone"]>, string> = {
  cream: "bg-owl-cream/95 text-owl-ink border-owl-cream-deep",
  forest: "bg-owl-forest/95 text-owl-cream border-owl-forest/50",
  teal: "bg-owl-teal/95 text-owl-cream border-owl-teal-deep/50",
};

export function StickyCTA({
  title,
  subtitle,
  action,
  showAfter = 0.6,
  className,
  tone = "cream",
}: StickyCTAProps) {
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let rafId = 0;
    const onScroll = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(() => {
        const vh = window.innerHeight || document.documentElement.clientHeight;
        const past = window.scrollY > vh * showAfter;
        setVisible(past);
        rafId = 0;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [showAfter]);

  if (dismissed || !visible) return null;

  const inner = (
    <aside
      role="complementary"
      aria-label="Persistent call to action"
      className={cn(
        "pointer-events-auto mx-auto flex w-full max-w-5xl items-center gap-4 rounded-owl-card border p-3 shadow-owl-2 backdrop-blur-owl-medium sm:p-4",
        toneStyles[tone],
        className
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-sm font-bold sm:text-base">{title}</p>
        {subtitle && (
          <p className="hidden truncate text-xs opacity-80 sm:block sm:text-sm">{subtitle}</p>
        )}
      </div>
      <div className="shrink-0">{action}</div>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
        className="ml-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-current/70 transition-colors hover:bg-owl-ink/10 hover:text-current focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/40"
      >
        <X className="h-4 w-4" aria-hidden />
      </button>
    </aside>
  );

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-3 z-overlay px-3 sm:bottom-5 sm:px-6"
      aria-live="polite"
    >
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

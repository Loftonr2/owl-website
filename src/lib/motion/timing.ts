/**
 * Motion timing — shared easing/duration constants for OWL animations.
 *
 * Single source of truth, mirrored from `src/lib/tokens.ts`. Importing motion
 * primitives (Framer Motion / GSAP / native CSS) all pull from here so the
 * site speaks one motion vocabulary.
 *
 *   import { D, E } from "@/lib/motion/timing";
 *
 *   <motion.div
 *     initial={{ opacity: 0, y: 8 }}
 *     animate={{ opacity: 1, y: 0 }}
 *     transition={{ duration: D.reveal / 1000, ease: E.owl }}
 *   />
 *
 *   gsap.to(target, { y: -40, duration: D.cinematic / 1000, ease: E.owl });
 */

import { owlDuration, owlEasing, owlEasingCss } from "@/lib/tokens";

/** Duration constants (ms). Divide by 1000 for Framer / GSAP `seconds` APIs. */
export const D = owlDuration;

/** Easing curves as [n, n, n, n] tuples — ready for Framer Motion / GSAP. */
export const E = owlEasing;

/** Easing curves as CSS `cubic-bezier(...)` strings — ready for inline style. */
export const Ecss = owlEasingCss;

/**
 * Helper — convert a millisecond duration into the seconds Framer Motion /
 * GSAP expect. Use this so callers don't sprinkle `/ 1000` across the codebase.
 *
 *   transition={{ duration: secs(D.reveal), ease: E.owl }}
 */
export function secs(ms: number): number {
  return ms / 1000;
}

/**
 * Stagger constants for child sequences (rails, lists, hero element drops).
 * Children fade-up one after the other.
 */
export const stagger = {
  /** Tight stagger — used inside a single card. */
  tight: 0.04,
  /** Standard — siblings inside a section. */
  standard: 0.07,
  /** Generous — top-level hero elements. */
  generous: 0.12,
} as const;

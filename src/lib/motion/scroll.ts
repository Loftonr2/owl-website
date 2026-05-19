"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Scroll-progress utilities for the redesign.
 *
 * Philosophy:
 *   - Prefer native CSS `animation-timeline: scroll()` for simple parallax/fade.
 *     See globals.css `@supports (animation-timeline: scroll())`.
 *   - Use these JS hooks ONLY when:
 *       1) The browser doesn't support scroll-driven animations (Safari today),
 *       2) The motion is complex enough to need a normalized [0..1] progress,
 *       3) We need to gate behavior on reduced-motion or the site motion toggle.
 *
 * All hooks return 0 under `data-motion="off"` or `prefers-reduced-motion: reduce`.
 */

/**
 * useScrollProgress
 *
 * Returns the scroll progress (0..1) of the target element relative to the
 * viewport. 0 = element's top edge is at the bottom of the viewport.
 * 1 = element's bottom edge is at the top of the viewport.
 *
 * Cheap: a single requestAnimationFrame-throttled scroll listener per call.
 */
export function useScrollProgress<T extends HTMLElement = HTMLElement>(): {
  ref: React.RefObject<T | null>;
  progress: number;
} {
  const ref = useRef<T>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (motionDisabled()) {
      setProgress(0);
      return;
    }

    const el = ref.current;
    if (!el) return;

    let rafId = 0;
    const compute = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const total = rect.height + vh;
      const seen = vh - rect.top;
      const ratio = Math.max(0, Math.min(1, seen / total));
      setProgress(ratio);
    };

    const onScroll = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(() => {
        compute();
        rafId = 0;
      });
    };

    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);

  return { ref, progress };
}

/**
 * useScrollLinked
 *
 * Maps the result of useScrollProgress through a numeric range.
 * Use case: bind a banner's translateY to scroll without recomputing manually.
 */
export function useScrollLinked<T extends HTMLElement = HTMLElement>(
  from: number,
  to: number
): { ref: React.RefObject<T | null>; value: number } {
  const { ref, progress } = useScrollProgress<T>();
  const value = from + (to - from) * progress;
  return { ref, value };
}

/**
 * Internal: check whether motion is disabled (OS pref OR site toggle).
 * Has to read DOM directly because this runs outside the React tree.
 */
function motionDisabled(): boolean {
  if (typeof window === "undefined") return true; // SSR-safe
  const html = document.documentElement;
  const setting = html.getAttribute("data-motion");
  if (setting === "off") return true;
  if (setting === "on") return false;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

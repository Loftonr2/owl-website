"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * PageFade — route-transition scaffolding for the marketing area.
 *
 * Wraps the active route's content in a Framer-Motion AnimatePresence keyed
 * by pathname. When the user navigates, the old content fades out + drifts
 * down 8px, the new content fades in from 8px above. Subtle, parent-friendly,
 * and short (180ms in, 120ms out) so it doesn't feel like a page is loading.
 *
 * Reduced motion: AnimatePresence's `initial={false}` plus zero-duration
 * variants means the swap is instant. No `<motion.div>` props go through.
 *
 * SSR-safe: the wrapper renders the children as-is on first paint. The
 * transition only engages on client-side navigation. No hydration mismatch.
 *
 * Placement: mount once in `src/app/(marketing)/layout.tsx`, wrapping
 * `<main>`. Do NOT wrap admin/studio routes — those want hard cuts.
 *
 * Why a key on pathname?
 *   - `usePathname()` gives a stable string per route.
 *   - AnimatePresence needs a key change to trigger exit + enter.
 *   - This avoids the brittleness of Next's experimental view transitions.
 */

export function PageFade({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  const pathname = usePathname();

  if (reduced) {
    // No transition at all — assistive users get clean cuts.
    return <>{children}</>;
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{
          duration: 0.18,
          ease: [0.22, 1, 0.36, 1],
        }}
        // Avoid layout shifting on first paint by keeping the div display:contents
        // analog — actually we let it be a normal block so Framer can apply transforms.
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

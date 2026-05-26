"use client";

import { useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useRef } from "react";

/**
 * Scroll-scene helpers — utility hooks for layered scroll-linked scenes.
 *
 * Use cases (from the redesign brief):
 *   - "Use regular keyframes whose progress is linked to scroll, not just time."
 *   - "Prefer native CSS scroll-driven animations for simple cases."
 *   - "Use GSAP ScrollTrigger only where needed for pinning / scrubbing /
 *     multi-layer scenes / image-sequence control."
 *
 * The HOOKS in this module are for the **multi-layer scene** case where you
 * need a single `scrollYProgress` motion value driving several layers with
 * different rates (background slower than mid-ground, mid-ground slower than
 * foreground — classic parallax stack).
 *
 * For pinning / image-sequence scrubbing, drop down to `loadGsap()` from
 * `@/lib/motion/gsap`.
 *
 * For simple "fade up on view", keep using `<SectionReveal>`.
 */

export type SceneOffset = ["start end" | "start start", "end start" | "end end"];

/**
 * useLayeredScene
 *
 * Returns a ref to attach to the scene container, plus three pre-computed
 * MotionValues for back / mid / fore layers — each moves at a different rate
 * as the scene scrolls through the viewport.
 *
 * Typical use:
 *
 *   const { ref, back, mid, fore, enabled } = useLayeredScene();
 *   return (
 *     <section ref={ref} className="relative">
 *       <motion.div style={{ y: back }}>{bannerImage}</motion.div>
 *       <motion.div style={{ y: mid }}>{glassCard}</motion.div>
 *       <motion.div style={{ y: fore }}>{headline}</motion.div>
 *     </section>
 *   );
 *
 * When reduced motion is preferred, all three values stay at 0 and `enabled`
 * is false — callers can shortcut to the final UI without animation.
 */
export function useLayeredScene(
  offset: SceneOffset = ["start end", "end start"]
): {
  ref: React.RefObject<HTMLElement | null>;
  back: MotionValue<number>;
  mid: MotionValue<number>;
  fore: MotionValue<number>;
  scrollYProgress: MotionValue<number>;
  enabled: boolean;
} {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset });

  // Rate scale (px translation across the full scene):
  //   back  = -60  (slowest, deepest)
  //   mid   = -30  (mid-ground)
  //   fore  =  +20 (front sits slightly forward — small parallax pop)
  // When motion is off, all three are zeroed.
  const back = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [0, -60]);
  const mid = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [0, -30]);
  const fore = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [0, 20]);

  return { ref, back, mid, fore, scrollYProgress, enabled: !reduced };
}

/**
 * useSceneOpacity — pair with useLayeredScene when a layer should fade
 * out as it scrolls past. Returns a 1 → 0 motion value tied to the same
 * scrollYProgress range.
 */
export function useSceneOpacity(
  progress: MotionValue<number>,
  fadeOutAt: number = 0.7
): MotionValue<number> {
  return useTransform(progress, [0, fadeOutAt, 1], [1, 1, 0]);
}

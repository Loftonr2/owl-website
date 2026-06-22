"use client";

import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * ScrollScene — Framer-Motion-powered scroll-linked region.
 *
 * Use cases that don't fit native CSS scroll-driven animation:
 *   - Multi-element coordinated parallax (background image + foreground card
 *     moving at different rates).
 *   - Tying a value to scroll progress that drives more than transform/opacity
 *     (rare — prefer transform/opacity).
 *   - Pinning a layered hero so children animate in sequence as you scroll past.
 *
 * For simple "fade up on view" sections, keep using <SectionReveal>.
 * For pinning, use GSAP via @/lib/motion/gsap.
 *
 * The render prop receives the [0..1] scrollYProgress motion value and a boolean
 * `enabled` flag. When motion is off, scrollYProgress is a static 0 and enabled
 * is false — callers should render the final-state UI in that case.
 *
 * Example:
 *   <ScrollScene>
 *     {({ scrollYProgress, enabled }) => {
 *       const y = useTransform(scrollYProgress, [0, 1], ["0%", "-8%"]);
 *       const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0.7]);
 *       return <motion.div style={{ y, opacity }}>...</motion.div>;
 *     }}
 *   </ScrollScene>
 */

type ScrollSceneRender = (ctx: {
  scrollYProgress: MotionValue<number>;
  enabled: boolean;
}) => ReactNode;

export interface ScrollSceneProps {
  /** Render prop receives scrollYProgress and enabled flag. */
  children: ScrollSceneRender;
  /** When does the scroll progress start / end? Defaults to [start end] -> [end start]. */
  offset?: ["start end" | "start start", "end start" | "end end"];
  /** Tag for the wrapper element. */
  as?: "section" | "div" | "article";
  /** Class for the wrapper. */
  className?: string;
  /** Pass-through aria-labelledby. */
  ariaLabelledBy?: string;
}

export function ScrollScene({
  children,
  offset = ["start end", "end start"],
  as = "div",
  className,
  ariaLabelledBy,
}: ScrollSceneProps) {
  // All hooks MUST be called unconditionally at the top — no ternary, no
  // short-circuit. We compute both motion values and then pick which one
  // gets forwarded to the render prop.
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset });
  // Frozen-at-zero MotionValue, used when reduced motion is on. Calling
  // useTransform here unconditionally satisfies the Rules of Hooks; the
  // resulting value is cheap (no animation runs).
  const frozenProgress = useTransform(scrollYProgress, [0, 1], [0, 0]);

  const value: MotionValue<number> = reduced ? frozenProgress : scrollYProgress;

  const Tag = motion[as] as typeof motion.div;
  return (
    <Tag
      ref={ref}
      className={cn("relative", className)}
      aria-labelledby={ariaLabelledBy}
    >
      {children({ scrollYProgress: value, enabled: !reduced })}
    </Tag>
  );
}

// Re-export Framer Motion helpers so callers don't need to import from two
// places when using ScrollScene.
export { useTransform, motion } from "framer-motion";

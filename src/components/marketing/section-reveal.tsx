"use client";

import { motion, useReducedMotion } from "framer-motion";
import { type ReactNode } from "react";

/**
 * SectionReveal — wraps a section so its children fade + lift in on scroll.
 *
 * Behavior matches DESIGN_STYLE_GUIDE §6 Motion:
 *  - 0.4s gentle fade, slight y-translate (8px)
 *  - One-shot (does not re-animate on scroll-back)
 *  - Honors `prefers-reduced-motion` — falls back to a no-op render
 *
 * Use as:
 *   <SectionReveal><FeaturedVideos /></SectionReveal>
 *
 * Above-the-fold sections (hero, trust strip) should NOT be wrapped — they
 * should render synchronously without delay.
 */
type Props = {
  children: ReactNode;
  /** Delay before the section starts animating (seconds) */
  delay?: number;
  /** Override the y offset (px) — defaults to 8 */
  offset?: number;
  /** Class passthrough */
  className?: string;
};

export function SectionReveal({ children, delay = 0, offset = 8, className }: Props) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: offset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px 0px" }}
      transition={{
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1], // cubic-bezier "owl" curve from tailwind.config
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}

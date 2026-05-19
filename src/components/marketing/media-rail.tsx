"use client";

import { motion, useReducedMotion } from "framer-motion";
import { type ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * MediaRail — shared horizontal scroll-snap rail (mobile) + grid (desktop).
 *
 * On mobile (< md), children flow horizontally with `scroll-snap-x mandatory`,
 * so the user can swipe through cards with native momentum. Each card occupies
 * ~85vw so the next card peeks in to signal "more here".
 *
 * On md+, children switch to a grid (configurable columns).
 *
 * Each child enters with a 60–80ms staggered fade-up (DESIGN.md §9). One-shot
 * per scroll. Respects prefers-reduced-motion + the site motion toggle (uses
 * Framer Motion's useReducedMotion).
 *
 * Usage:
 *   <MediaRail columns={{ md: 2, lg: 3 }}>
 *     {videos.map((v) => <VideoCard key={v.slug} {...v} />)}
 *   </MediaRail>
 *
 * IMPORTANT: This is a client island (uses Framer Motion + IntersectionObserver
 * via whileInView). The rail data + cards remain server-rendered. The wrapper
 * does NOT autoplay or auto-advance — DESIGN_STYLE_GUIDE §6 forbids it.
 */

const columnsClasses: Record<number, string> = {
  1: "md:grid-cols-1",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
};

const lgColumnsClasses: Record<number, string> = {
  1: "lg:grid-cols-1",
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
};

export interface MediaRailProps {
  children: ReactNode[];
  columns?: { md?: 1 | 2 | 3 | 4; lg?: 1 | 2 | 3 | 4 };
  className?: string;
  /** Stagger delay between items, in seconds. */
  stagger?: number;
  /** Label for the list. Required for a11y. */
  ariaLabel: string;
}

export function MediaRail({
  children,
  columns = { md: 2, lg: 3 },
  className,
  stagger = 0.07,
  ariaLabel,
}: MediaRailProps) {
  const reduced = useReducedMotion();
  const colMd = columnsClasses[columns.md ?? 2];
  const colLg = lgColumnsClasses[columns.lg ?? 3];

  return (
    <ul
      role="list"
      aria-label={ariaLabel}
      className={cn(
        // Mobile: horizontal scroll-snap rail
        "flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4",
        "owl-rail-hide-scrollbar",
        // Desktop: switch to grid; no horizontal scroll
        "md:grid md:snap-none md:overflow-visible md:gap-6 md:px-0 md:pb-0",
        colMd,
        colLg,
        className
      )}
    >
      {children.map((child, idx) => (
        <motion.li
          key={idx}
          className={cn(
            // Mobile: 85vw card width so the next card peeks
            "shrink-0 snap-start basis-[85%]",
            // Desktop: let the grid do its thing
            "md:basis-auto"
          )}
          initial={reduced ? false : { opacity: 0, y: 12 }}
          whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px 0px" }}
          transition={{
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1],
            delay: reduced ? 0 : idx * stagger,
          }}
        >
          {child}
        </motion.li>
      ))}
    </ul>
  );
}

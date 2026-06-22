"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * StaggerGrid — non-rail grid wrapper that staggers child reveal on scroll.
 *
 * Used by the Educators page where the brief asks for **more structured
 * motion** than the homepage / About page. Each child fades up 12px with a
 * 60–80ms stagger as the grid scrolls into view.
 *
 * Differs from `<MediaRail>` in two ways:
 *   1. No horizontal scroll-snap behaviour — pure grid at every breakpoint.
 *   2. No `<ul>`/`<li>` semantics imposed. The caller passes any layout
 *      element; StaggerGrid just animates the immediate children.
 *
 * Reduced-motion / `data-motion="off"`: renders children as-is. No stagger,
 * no offset, no `<motion.div>` wrappers around children.
 *
 * Use:
 *   <StaggerGrid className="grid grid-cols-1 md:grid-cols-4 gap-5">
 *     {benefits.map(b => <BenefitCard key={b.title} {...b} />)}
 *   </StaggerGrid>
 */

export interface StaggerGridProps {
  children: ReactNode[];
  /** Tailwind grid classes (caller controls columns + gap). */
  className?: string;
  /** Delay between children, seconds. Default 0.07s. */
  stagger?: number;
  /** Per-child y offset on enter (px). Default 12. */
  offsetY?: number;
  /** Aria-label for the implicit list (when role="list"). */
  ariaLabel?: string;
  /** Set true if the children themselves are list items (renders <ul>). */
  asList?: boolean;
}

export function StaggerGrid({
  children,
  className,
  stagger = 0.07,
  offsetY = 12,
  ariaLabel,
  asList = false,
}: StaggerGridProps) {
  const reduced = useReducedMotion();

  // Wrapper element — <ul> when caller asks for list semantics, otherwise <div>.
  const Wrapper = asList ? motion.ul : motion.div;
  const Child = asList ? motion.li : motion.div;

  if (reduced) {
    // Plain HTML, no motion. Preserve semantics if asList.
    const PlainWrapper = (asList ? "ul" : "div") as "ul" | "div";
    return (
      <PlainWrapper className={cn(className)} aria-label={ariaLabel} role={asList ? "list" : undefined}>
        {children.map((child, idx) => {
          const PlainChild = (asList ? "li" : "div") as "li" | "div";
          return <PlainChild key={idx}>{child}</PlainChild>;
        })}
      </PlainWrapper>
    );
  }

  return (
    <Wrapper
      className={cn(className)}
      aria-label={ariaLabel}
      role={asList ? "list" : undefined}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px 0px" }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger } },
      }}
    >
      {children.map((child, idx) => (
        <Child
          key={idx}
          variants={{
            hidden: { opacity: 0, y: offsetY },
            show: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
            },
          }}
        >
          {child}
        </Child>
      ))}
    </Wrapper>
  );
}

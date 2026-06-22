"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { OwlMark } from "@/components/brand/owl-logo";

/**
 * Decorative floating mascot pair, used in the hero corners.
 *
 * v2 (redesign):
 *   - Uses <OwlMark> SVG instead of the brand mascot PNG so the mascots
 *     remain crisp at any size and don't ship a 1.7 MB image just for decor.
 *   - Scroll-linked parallax: as the page scrolls, the mascots drift in
 *     opposite directions (subtle, max 32px).
 *   - Mouse-triggered drift: pointer position offsets each mascot by ±6px so
 *     they feel alive when hovering near them. Disabled on touch + reduced motion.
 *   - Time-based gentle float continues as before, on top of scroll/mouse.
 *
 * All animation is paused entirely under prefers-reduced-motion or
 * data-motion="off". Decorative — alt="" via OwlMark `decorative`.
 */

export function HeroMascots() {
  const prefersReduced = useReducedMotion();
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Mouse offset, in px. Set on pointermove (pointer-fine only) inside wrapper.
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (prefersReduced) return;
    if (typeof window === "undefined") return;
    // Skip mouse parallax on touch — coarse pointer = nothing to follow.
    const finePtr = window.matchMedia?.("(pointer: fine)").matches;
    if (!finePtr) return;

    const el = wrapperRef.current;
    if (!el) return;

    let rafId = 0;
    let nextX = 0;
    let nextY = 0;
    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      // Normalize cursor pos to [-1, 1] inside the wrapper, then scale to ±6px.
      const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      nextX = Math.max(-1, Math.min(1, nx)) * 6;
      nextY = Math.max(-1, Math.min(1, ny)) * 6;
      if (rafId) return;
      rafId = window.requestAnimationFrame(() => {
        setMouse({ x: nextX, y: nextY });
        rafId = 0;
      });
    };

    const onLeave = () => setMouse({ x: 0, y: 0 });
    // Attach to the parent banner section (one level up) so the area is the
    // whole hero, not just the mascot wrapper.
    const section = el.closest("section") || el;
    section.addEventListener("pointermove", onMove as EventListener);
    section.addEventListener("pointerleave", onLeave);
    return () => {
      section.removeEventListener("pointermove", onMove as EventListener);
      section.removeEventListener("pointerleave", onLeave);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [prefersReduced]);

  // Scroll-linked parallax: 0 at hero top, 1 at hero bottom-out-of-view.
  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end start"],
  });
  // Move mascot A up; mascot B down — opposite directions = depth illusion.
  const scrollA = useTransform(scrollYProgress, [0, 1], [0, -32]);
  const scrollB = useTransform(scrollYProgress, [0, 1], [0, 18]);

  // Time-based gentle float (unchanged, lower amplitude now that we have more motion).
  const float = prefersReduced
    ? {}
    : {
        animate: { y: [0, -6, 0] },
        transition: { duration: 5, repeat: Infinity, ease: "easeInOut" as const },
      };

  return (
    <div ref={wrapperRef} aria-hidden className="pointer-events-none absolute inset-0">
      {/* Top-right mascot */}
      <motion.div
        className="absolute right-4 top-4 hidden md:block"
        style={{
          y: prefersReduced ? 0 : scrollA,
          x: prefersReduced ? 0 : mouse.x * 0.8,
        }}
      >
        <motion.div {...float} style={{ x: prefersReduced ? 0 : mouse.x * 0.4 }}>
          <OwlMark
            decorative
            className="h-14 w-14 opacity-95 drop-shadow-[0_8px_16px_rgba(28,43,74,0.18)]"
          />
        </motion.div>
      </motion.div>

      {/* Bottom-left mascot — smaller, opposite scroll direction */}
      <motion.div
        className="absolute bottom-6 left-3 hidden md:block"
        style={{
          y: prefersReduced ? 0 : scrollB,
          x: prefersReduced ? 0 : mouse.x * -0.6,
        }}
      >
        <motion.div
          {...float}
          transition={{ duration: 5.6, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
          style={{ x: prefersReduced ? 0 : mouse.x * -0.3 }}
        >
          <OwlMark
            decorative
            className="h-10 w-10 opacity-85 drop-shadow-[0_6px_14px_rgba(28,43,74,0.14)]"
          />
        </motion.div>
      </motion.div>
    </div>
  );
}

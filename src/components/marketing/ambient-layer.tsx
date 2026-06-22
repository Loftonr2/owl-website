"use client";

import { useMemo } from "react";
import { cn } from "@/lib/cn";

/**
 * AmbientLayer — slot system for storybook-premium accent particles.
 *
 * The redesign brief reserves layer 5 for "optional ambient accent layer
 * (notes, leaves, sparkles, stars, paper shapes, particles)". This component
 * draws those accents as pure SVG (no images, no binaries).
 *
 * Every particle is decorative (`aria-hidden`) and `pointer-events-none`.
 * Animations respect `data-motion="off"` via the global CSS rule.
 *
 * The pattern is chosen per page mood:
 *   - "notes"     → musical notes (Music / Watch pages)
 *   - "leaves"    → drifting leaves (About / Educators / Nature themes)
 *   - "sparkles"  → small twinkling stars (Holiday / Shop / Newsletter)
 *   - "stars"     → editorial constellation (App / Contact)
 *   - "paper"     → torn paper shapes (Blog / Printables)
 *
 * Density controls how many particles render (3 = subtle, 5 = rich).
 *
 * IMPORTANT: this is a client component because particle positions are computed
 * with a seeded pseudo-random sequence (so the layout doesn't shift on each
 * render). The seed is derived from the pattern name + density only — same
 * inputs produce the same output, server and client.
 */

export type AmbientPattern = "notes" | "leaves" | "sparkles" | "stars" | "paper";

export interface AmbientLayerProps {
  pattern: AmbientPattern;
  /** 3 (subtle) – 8 (rich). Defaults to 5. */
  density?: number;
  /** Optional tint override. Defaults to the brand colors chosen per pattern. */
  tint?: string;
  /** Optional class for the bounding wrapper (e.g. `inset-0`, `inset-x-0 top-0 h-1/2`). */
  className?: string;
  /** Override the random seed so two ambients on the same page differ. */
  seed?: number;
}

export function AmbientLayer({
  pattern,
  density = 5,
  tint,
  className,
  seed = 1,
}: AmbientLayerProps) {
  const count = Math.max(3, Math.min(8, density));
  const items = useMemo(() => buildParticles(pattern, count, seed), [pattern, count, seed]);

  return (
    <div className={cn("absolute inset-0", className)} aria-hidden>
      {items.map((p) => (
        <span
          key={p.id}
          data-ambient
          className={cn(
            "absolute will-change-transform",
            p.animation,
            // Stagger by negating animation-delay so they don't pulse in unison
            "[animation-delay:var(--owl-ambient-delay)]"
          )}
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            // CSS custom prop set inline; consumed by the `[animation-delay:...]`
            // arbitrary-value Tailwind class above.
            ["--owl-ambient-delay" as string]: `${p.delay}s`,
            color: tint ?? p.tint,
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: p.opacity,
          }}
        >
          <Particle pattern={pattern} />
        </span>
      ))}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────── */

function Particle({ pattern }: { pattern: AmbientPattern }) {
  switch (pattern) {
    case "notes":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full">
          <path d="M9 4 L 9 16.5 A 3 3 0 1 1 7 13.5 L 7 6 L 17 4 L 17 14 A 3 3 0 1 1 15 11 L 15 4.6 Z" />
        </svg>
      );
    case "leaves":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full">
          <path d="M3 21 C 3 12, 12 3, 21 3 C 21 12, 12 21, 3 21 Z M 6 18 L 18 6" stroke="currentColor" strokeWidth="0.6" fill="currentColor" />
        </svg>
      );
    case "sparkles":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full">
          <path d="M12 2 L 13.5 10.5 L 22 12 L 13.5 13.5 L 12 22 L 10.5 13.5 L 2 12 L 10.5 10.5 Z" />
        </svg>
      );
    case "stars":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full">
          <path d="M12 3 L 14 10 L 21 12 L 14 14 L 12 21 L 10 14 L 3 12 L 10 10 Z" />
        </svg>
      );
    case "paper":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full">
          <path d="M4 4 L 18 3 L 21 8 L 20 19 L 6 21 L 3 16 Z" stroke="currentColor" strokeWidth="0.5" fill="currentColor" />
        </svg>
      );
    default:
      return null;
  }
}

/* ──────────────────────────────────────────────────────────────────────────── */

type Particle = {
  id: string;
  x: number; // 0..100, % of parent
  y: number; // 0..100, % of parent
  size: number; // px
  opacity: number;
  delay: number; // seconds
  tint: string;
  animation: string;
};

const defaultTints: Record<AmbientPattern, string> = {
  notes: "var(--owl-teal)",
  leaves: "var(--owl-forest)",
  sparkles: "var(--owl-amber)",
  stars: "var(--owl-amber-soft)",
  paper: "var(--owl-rose)",
};

const animations: Record<AmbientPattern, string> = {
  notes: "animate-float",
  leaves: "animate-drift",
  sparkles: "animate-sparkle",
  stars: "animate-sparkle",
  paper: "animate-float",
};

function buildParticles(pattern: AmbientPattern, count: number, seed: number): Particle[] {
  const rand = mulberry32(seed * 1000 + count + pattern.length * 13);
  const tint = defaultTints[pattern];
  const anim = animations[pattern];
  const out: Particle[] = [];
  for (let i = 0; i < count; i++) {
    out.push({
      id: `p-${pattern}-${seed}-${i}`,
      x: 5 + rand() * 90,
      y: 5 + rand() * 85,
      size: 14 + rand() * 26,
      opacity: 0.4 + rand() * 0.4,
      delay: rand() * 4,
      tint,
      animation: anim,
    });
  }
  return out;
}

/** Mulberry32 — tiny deterministic PRNG so server/client match. */
function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

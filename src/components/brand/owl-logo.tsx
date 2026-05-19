import { cn } from "@/lib/cn";

/**
 * OWL Logo — vector-ready system.
 *
 * NOTE FOR FINAL ART: This is a **clean refinement** of the OWL identity in SVG
 * form. It preserves the recognizable owl character (round body, two large eyes,
 * ear tufts, soft horizon) and uses the canonical OWL palette tokens. It is
 * intentionally a system component, NOT a faked final illustration — Larissa /
 * Rick should swap in the production owl illustration whenever it's commissioned.
 *
 * Three variants:
 *   <OwlMark />       — symbol only (round badge with owl glyph)
 *   <OwlWordmark />   — "OWL Sing Together" type lockup
 *   <OwlLockup />     — Mark + Wordmark, horizontal
 *
 * All scale to their container. Sizes (`sm | md | lg`) only adjust the default
 * dimensions; you can also override via `className`.
 *
 * Accessibility:
 *   - Pass `title` to label the SVG for screen readers, or `decorative` to hide it.
 *   - Both forms are exposed because the same logo is sometimes structural
 *     (the site-header link) and sometimes decorative (a hero accent).
 */

type CommonProps = {
  size?: "sm" | "md" | "lg";
  className?: string;
  /** Provide a screen-reader label. If omitted, falls back to defaultTitle. */
  title?: string;
  /** Hide from assistive tech entirely. */
  decorative?: boolean;
};

const sizes = {
  mark: { sm: "h-7 w-7", md: "h-9 w-9", lg: "h-14 w-14" },
  lockup: { sm: "h-7", md: "h-9", lg: "h-12" },
  wordmark: { sm: "h-5", md: "h-7", lg: "h-10" },
} as const;

/* ──────────────────────────────────────────────────────────────────────────────
 * OwlMark — the symbol (round badge with stylised owl).
 * Designed inside a 48×48 viewBox so it crops cleanly to a circle.
 * ────────────────────────────────────────────────────────────────────────────── */
export function OwlMark({
  size = "md",
  className,
  title = "OWL Sing Together",
  decorative,
}: CommonProps) {
  const a11y = decorative
    ? { "aria-hidden": true as const, role: "presentation" as const }
    : { role: "img" as const, "aria-label": title };

  return (
    <svg
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(sizes.mark[size], className)}
      {...a11y}
    >
      {/* Cream disc background */}
      <circle cx="24" cy="24" r="23" fill="var(--owl-cream)" />
      {/* Forest soft inner ring */}
      <circle cx="24" cy="24" r="22" fill="none" stroke="var(--owl-forest)" strokeWidth="1.2" opacity="0.18" />

      {/* Branch */}
      <path
        d="M6 36 C 14 34, 34 34, 42 36"
        stroke="var(--owl-forest)"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
      />

      {/* Owl body — soft teardrop */}
      <path
        d="M24 9
           C 14 9, 9 16, 9 24
           C 9 32, 14 38, 24 38
           C 34 38, 39 32, 39 24
           C 39 16, 34 9, 24 9
           Z"
        fill="var(--owl-teal)"
      />

      {/* Owl chest highlight */}
      <ellipse cx="24" cy="28" rx="9" ry="6" fill="var(--owl-cream)" opacity="0.85" />

      {/* Ear tufts */}
      <path d="M14 11 L 17 7 L 19 12 Z" fill="var(--owl-teal-deep)" />
      <path d="M34 11 L 31 7 L 29 12 Z" fill="var(--owl-teal-deep)" />

      {/* Eye sockets — large round cream */}
      <circle cx="19" cy="20" r="5.5" fill="var(--owl-cream)" />
      <circle cx="29" cy="20" r="5.5" fill="var(--owl-cream)" />

      {/* Pupils */}
      <circle cx="19" cy="20" r="2.3" fill="var(--owl-ink)" />
      <circle cx="29" cy="20" r="2.3" fill="var(--owl-ink)" />
      {/* Pupil catchlight */}
      <circle cx="19.7" cy="19.2" r="0.7" fill="var(--owl-white)" />
      <circle cx="29.7" cy="19.2" r="0.7" fill="var(--owl-white)" />

      {/* Beak */}
      <path
        d="M22.5 24 L 25.5 24 L 24 27 Z"
        fill="var(--owl-amber)"
        stroke="var(--owl-amber)"
        strokeLinejoin="round"
        strokeWidth="0.5"
      />

      {/* Wing hints */}
      <path
        d="M12 26 C 14 30, 16 32, 18 31"
        stroke="var(--owl-teal-deep)"
        strokeWidth="1.4"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M36 26 C 34 30, 32 32, 30 31"
        stroke="var(--owl-teal-deep)"
        strokeWidth="1.4"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

/* ──────────────────────────────────────────────────────────────────────────────
 * OwlWordmark — "OWL Sing Together" type lockup.
 * Uses Nunito-equivalent letterforms in SVG so it doesn't depend on the runtime
 * font load order (crucial for above-the-fold).
 * ────────────────────────────────────────────────────────────────────────────── */
export function OwlWordmark({
  size = "md",
  className,
  title = "OWL Sing Together",
  decorative,
}: CommonProps) {
  const a11y = decorative
    ? { "aria-hidden": true as const, role: "presentation" as const }
    : { role: "img" as const, "aria-label": title };
  return (
    <svg
      viewBox="0 0 240 56"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(sizes.wordmark[size], className)}
      {...a11y}
    >
      {/* OWL — bold, teal */}
      <text
        x="0"
        y="36"
        fontFamily="var(--font-display), Nunito, system-ui, sans-serif"
        fontSize="34"
        fontWeight="800"
        fill="var(--owl-teal)"
        letterSpacing="-0.5"
      >
        OWL
      </text>
      {/* Sing Together — semibold, ink, smaller */}
      <text
        x="80"
        y="36"
        fontFamily="var(--font-display), Nunito, system-ui, sans-serif"
        fontSize="24"
        fontWeight="700"
        fill="var(--owl-ink)"
        letterSpacing="-0.2"
      >
        Sing Together
      </text>
    </svg>
  );
}

/* ──────────────────────────────────────────────────────────────────────────────
 * OwlLockup — re-exported from `./owl-lockup` (client component w/ cursor magnet).
 *
 * Kept here as a re-export so every existing
 *   import { OwlLockup } from "@/components/brand/owl-logo"
 * keeps working. OwlMark + OwlWordmark stay server-component-safe in this file.
 * ────────────────────────────────────────────────────────────────────────────── */
export { OwlLockup } from "./owl-lockup";
export type { OwlLockupProps } from "./owl-lockup";

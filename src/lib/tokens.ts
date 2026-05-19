/**
 * OWL design tokens — single source of JS-accessible constants for everything
 * that also lives in `tailwind.config.ts` and `src/app/globals.css`.
 *
 * Authoring rule:
 *   - In JSX, prefer Tailwind classes (`bg-owl-cream`, `rounded-owl-card`, etc.).
 *   - Use these constants only when a value must escape Tailwind — inline SVG
 *     fills, structured-data fields, OG image generation, motion configs
 *     consumed by JS (Framer Motion / GSAP).
 *
 * When you update a token here, also update its mirror in `tailwind.config.ts`
 * and `globals.css`. They are kept in sync by convention, not by build.
 *
 * Source of truth: `..\OWL-Obsidian-Brain\09_Design_System\DESIGN_STYLE_GUIDE.md`.
 */

/* ──────────────────────────────────────────────────────────────────────────────
 * 1. Color
 * ────────────────────────────────────────────────────────────────────────────── */
export const owlColors = {
  cream: "#FBF6EC",
  creamDeep: "#F3EBDA",
  teal: "#1A9994",
  tealDeep: "#137070",
  amber: "#F5A623",
  amberSoft: "#F8C975",
  forest: "#2D4A3A",
  ink: "#1C2B4A",
  mist: "#7A8794",
  white: "#FFFFFF",
  rose: "#E89F8E",
  success: "#4C9F70",
  error: "#C84B4B",
} as const;
export type OwlColor = keyof typeof owlColors;

/* ──────────────────────────────────────────────────────────────────────────────
 * 2. Typography
 * ────────────────────────────────────────────────────────────────────────────── */
export const owlFonts = {
  display: "Nunito",
  body: "Nunito",
} as const;

/* ──────────────────────────────────────────────────────────────────────────────
 * 3. Radius (pixels for JS, matches Tailwind `rounded-owl-*` classes)
 * ────────────────────────────────────────────────────────────────────────────── */
export const owlRadius = {
  /** Cards, content tiles. Mirror: `rounded-owl-card` (1rem). */
  card: 16,
  /** Buttons + chips. Mirror: `rounded-owl-btn` (0.75rem). */
  button: 12,
  /** Hero panels. Mirror: `rounded-owl-hero` (1.5rem). */
  hero: 24,
  /** Banner blocks. Mirror: `rounded-owl-banner` (2rem). */
  banner: 32,
} as const;
export type OwlRadius = keyof typeof owlRadius;

/* ──────────────────────────────────────────────────────────────────────────────
 * 4. Spacing — content rhythm and section padding
 *
 * Tailwind's default spacing scale is used everywhere else. These named
 * constants are the OWL-specific composition rules — used by <Section>,
 * <BannerHero>, and other primitives so callers can request "default
 * comfortable" rhythm without memorizing px values.
 * ────────────────────────────────────────────────────────────────────────────── */
export const owlSpacing = {
  /** Content max-width for hubs/archives. */
  containerMax: 1280,
  /** Long-form article max-width (72ch). */
  proseMax: 72, // ch unit when rendered
  /** Vertical rhythm between sections — small / medium / large. */
  sectionPadding: {
    sm: { mobile: 32, desktop: 48 }, // py-8 → py-12
    md: { mobile: 48, desktop: 80 }, // py-12 → py-20
    lg: { mobile: 64, desktop: 128 }, // py-16 → py-32
  },
  /** Card inner padding. */
  cardPadding: { mobile: 16, desktop: 24 },
  /** Gap between cards in a grid/rail. */
  cardGap: { mobile: 16, desktop: 24 },
} as const;

/* ──────────────────────────────────────────────────────────────────────────────
 * 5. Shadow — three-tier depth system
 *
 * Mirror: `tailwind.config.ts → boxShadow.owl-*`. Warm, soft, never cold gray.
 * ────────────────────────────────────────────────────────────────────────────── */
export const owlShadow = {
  /** Tier 0 — flat. Use for default surfaces on cream. */
  none: "none",
  /** Tier 1 — resting. Cards, nav, footer. */
  one: "0 2px 12px -2px rgba(28, 43, 74, 0.06)",
  /** Tier 2 — hover/lifted. Card hover, dropdowns. */
  two: "0 8px 24px -4px rgba(28, 43, 74, 0.12)",
  /** Tier 3 — modal/dialog. Dialogs, large overlays. */
  three: "0 24px 64px -12px rgba(28, 43, 74, 0.20)",
  /** Golden glow — for amber CTA hover only. */
  amberGlow:
    "0 8px 24px -6px rgba(245, 166, 35, 0.35), 0 2px 6px -1px rgba(245, 166, 35, 0.25)",
  /** Inner glass highlight — used by <GlassCard>. */
  glassHighlight: "inset 0 1px 0 0 rgba(255, 255, 255, 0.6)",
} as const;
export type OwlShadow = keyof typeof owlShadow;

/* ──────────────────────────────────────────────────────────────────────────────
 * 6. Blur — capped at 16px (DESIGN_STYLE_GUIDE §12 anti-pattern is glass heavy
 *    enough to obscure text)
 *
 * Mirror: `tailwind.config.ts → backdropBlur.owl-*`.
 * ────────────────────────────────────────────────────────────────────────────── */
export const owlBlur = {
  /** Header glass, subtle panels. */
  soft: 8,
  /** Most glass cards. */
  medium: 12,
  /** Maximum allowed. Anything heavier obscures text — do not exceed. */
  strong: 16,
} as const;
export type OwlBlur = keyof typeof owlBlur;

/* ──────────────────────────────────────────────────────────────────────────────
 * 7. Z-Index — layered composition (the 5 named layers + chrome/overlay)
 *
 * Mirror: `tailwind.config.ts → zIndex.*`.
 *
 *   bg       layer 1  background color
 *   banner   layer 2  rectangular hero banner
 *   ui       layer 3  interactive UI (buttons, chips, cards, rails)
 *   text     layer 4  text/content
 *   ambient  layer 5  ambient accents (particles, notes, leaves)
 *   chrome   sticky site header + persistent footer
 *   overlay  scroll-progress bar, modals, toasts
 * ────────────────────────────────────────────────────────────────────────────── */
export const owlZIndex = {
  bg: 0,
  banner: 10,
  ui: 20,
  text: 30,
  ambient: 40,
  chrome: 50,
  overlay: 60,
} as const;
export type OwlZIndex = keyof typeof owlZIndex;

/* ──────────────────────────────────────────────────────────────────────────────
 * 8. Motion timing — durations + easing curves
 *
 * The same constants are surfaced in `src/lib/motion/timing.ts` for use with
 * Framer Motion / GSAP. They mirror Tailwind's `transitionDuration` extensions.
 * ────────────────────────────────────────────────────────────────────────────── */
export const owlDuration = {
  /** Button color shifts, chip hovers. */
  quick: 150,
  /** Card lifts, focus rings. */
  standard: 200,
  /** Section reveals, banner fades. */
  reveal: 400,
  /** Hero transitions, "feel like a film cut". */
  cinematic: 600,
  /** Ambient loops (drift, sparkle, float). */
  ambient: 4000,
} as const;
export type OwlDuration = keyof typeof owlDuration;

/** Cubic-bezier curves. Strings are CSS-ready; arrays are Framer-ready. */
export const owlEasing = {
  /** OWL signature curve — soft overshoot. Mirror: `ease-owl`. */
  owl: [0.22, 1, 0.36, 1] as const,
  /** Material-style ease-in-out. Mirror: `ease-owl-quick`. */
  quick: [0.4, 0, 0.2, 1] as const,
  /** Standard CSS ease-out. */
  easeOut: [0, 0, 0.2, 1] as const,
  /** Standard CSS ease-in. */
  easeIn: [0.4, 0, 1, 1] as const,
} as const;
export type OwlEasing = keyof typeof owlEasing;

/** CSS-ready strings: `cubic-bezier(a, b, c, d)`. */
export const owlEasingCss = {
  owl: `cubic-bezier(${owlEasing.owl.join(", ")})`,
  quick: `cubic-bezier(${owlEasing.quick.join(", ")})`,
  easeOut: `cubic-bezier(${owlEasing.easeOut.join(", ")})`,
  easeIn: `cubic-bezier(${owlEasing.easeIn.join(", ")})`,
} as const;

/* ──────────────────────────────────────────────────────────────────────────────
 * 9. Brand voice — strings that travel with the design tokens
 * ────────────────────────────────────────────────────────────────────────────── */
export const brand = {
  name: "OWL Sing Together",
  promise: "Every Child Belongs Here.",
  catchphrase: "I'm so glad you're here today.",
  acronym: {
    O: "Open to all children, all backgrounds, all beliefs",
    W: "Wisdom delivered with warmth",
    L: "Learning that lasts a lifetime",
  },
} as const;

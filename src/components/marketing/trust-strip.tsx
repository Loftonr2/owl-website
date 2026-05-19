import { BookOpen, Globe2, GraduationCap, Heart, ShieldCheck } from "lucide-react";

/**
 * Trust strip — 5 pillars from CLAUDE_READ_FIRST.md §11 / DESIGN_STYLE_GUIDE §9.
 *
 * v2 (redesign): bigger, breathier, with icon discs and short descriptors so it
 * does more work as a stand-alone trust block. Sits below the hero on cream
 * canvas. Still no client JS (server component) — micro-interactions are pure
 * Tailwind state utilities.
 */
const PILLARS = [
  {
    icon: BookOpen,
    label: "Inclusive learning",
    blurb: "Every episode features children from many backgrounds.",
  },
  {
    icon: Heart,
    label: "Calm pacing",
    blurb: "Slow tempo, gentle music. Never overstimulating.",
  },
  {
    icon: Globe2,
    label: "Multicultural",
    blurb: "Holiday hubs, bilingual touches, real heritage stories.",
  },
  {
    icon: ShieldCheck,
    label: "Parent-friendly",
    blurb: "No autoplay, no popups, no child-tracking ads.",
  },
  {
    icon: GraduationCap,
    label: "Educator-ready",
    blurb: "Standards-aligned printables and lesson plans.",
  },
] as const;

export function TrustStrip() {
  return (
    <section
      aria-label="What OWL stands for"
      className="relative isolate border-y border-owl-cream-deep/60 bg-owl-cream"
    >
      {/* Soft amber wash behind the row — subtle warmth */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(245,166,35,0.06),transparent_70%)]"
      />
      <ul
        role="list"
        className="mx-auto grid max-w-7xl grid-cols-2 gap-3 px-6 py-10 sm:px-10 md:grid-cols-5 md:gap-4 md:py-12"
      >
        {PILLARS.map(({ icon: Icon, label, blurb }) => (
          <li
            key={label}
            className="group flex flex-col items-center gap-2 rounded-owl-card bg-owl-white/40 p-4 text-center transition-colors duration-200 ease-owl-quick hover:bg-owl-white/80 md:p-5"
          >
            <span
              aria-hidden
              className="flex h-10 w-10 items-center justify-center rounded-full bg-owl-teal/10 text-owl-teal transition-transform duration-200 ease-owl-quick group-hover:scale-110 md:h-12 md:w-12"
            >
              <Icon className="h-5 w-5 md:h-6 md:w-6" aria-hidden />
            </span>
            <span className="font-display text-sm font-semibold text-owl-forest md:text-base">
              {label}
            </span>
            <span className="hidden text-xs leading-snug text-owl-mist md:block">
              {blurb}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

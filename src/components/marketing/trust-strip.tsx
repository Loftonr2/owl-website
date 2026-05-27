import Link from "next/link";
import { BookOpen, Globe2, GraduationCap, Heart, ShieldCheck } from "lucide-react";

/**
 * Trust strip — 5 OWL pillars.
 * v3: linked, colour-coded pastel-gradient cards. Styles in globals.css.
 */

const PILLARS = [
  {
    icon: BookOpen,
    label: "Inclusive learning",
    blurb: "Every episode features children from many backgrounds.",
    href: "/watch",
    cardClass: "owl-pillar-inclusive",
    iconBg: "rgba(11,166,131,0.12)",
    iconColor: "#0ba683",
  },
  {
    icon: Heart,
    label: "Calm pacing",
    blurb: "Slow tempo, gentle music. Never overstimulating.",
    href: "/watch",
    cardClass: "owl-pillar-calm",
    iconBg: "rgba(130,110,220,0.12)",
    iconColor: "#826edc",
  },
  {
    icon: Globe2,
    label: "Multicultural",
    blurb: "Holiday hubs, bilingual touches, real heritage stories.",
    href: "/holidays",
    cardClass: "owl-pillar-multicultural",
    iconBg: "rgba(232,156,58,0.14)",
    iconColor: "#c47d18",
  },
  {
    icon: ShieldCheck,
    label: "Parent-friendly",
    blurb: "No autoplay, no popups, no child-tracking ads.",
    href: "/parent-resources",
    cardClass: "owl-pillar-parent",
    iconBg: "rgba(88,163,101,0.12)",
    iconColor: "#3d7a50",
  },
  {
    icon: GraduationCap,
    label: "Educator-ready",
    blurb: "Standards-aligned printables and lesson plans.",
    href: "/educators",
    cardClass: "owl-pillar-educator",
    iconBg: "rgba(56,186,220,0.13)",
    iconColor: "#1a8fad",
  },
] as const;

export function TrustStrip() {
  return (
    <section
      aria-label="What OWL stands for"
      className="relative isolate border-y border-owl-cream-deep/60 bg-owl-cream py-10 md:py-14"
    >
      <ul
        role="list"
        className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-6 sm:px-10 md:grid-cols-5 md:gap-5"
      >
        {PILLARS.map(({ icon: Icon, label, blurb, href, cardClass, iconBg, iconColor }) => (
          <li key={label}>
            <Link
              href={href}
              aria-label={label + " — " + blurb}
              className={"owl-pillar-card " + cardClass}
            >
              <span
                aria-hidden
                className="owl-pillar-icon flex h-11 w-11 items-center justify-center rounded-full md:h-12 md:w-12"
                style={{ background: iconBg, color: iconColor }}
              >
                <Icon className="h-5 w-5 md:h-6 md:w-6" aria-hidden />
              </span>

              <span className="relative z-10 font-display text-sm font-semibold text-owl-forest md:text-base">
                {label}
              </span>

              <span className="relative z-10 hidden text-xs leading-snug text-owl-mist md:block">
                {blurb}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

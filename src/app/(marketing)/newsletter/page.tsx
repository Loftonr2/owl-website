import Link from "next/link";
import {
  Heart,
  GraduationCap,
  Baby,
  BookOpen,
  Music2,
  CalendarDays,
} from "lucide-react";
import { pageMetadata } from "@/lib/seo/metadata";

import { VideoHeroBanner } from "@/components/marketing/video-hero-banner";
import { Section } from "@/components/ui/section";
import { SectionIntro } from "@/components/ui/section-intro";
import { Button } from "@/components/ui/button";
import { SectionReveal } from "@/components/marketing/section-reveal";
import { NewsletterForm } from "@/components/marketing/newsletter-form";
import { OwlMark } from "@/components/brand/owl-logo";

export const metadata = pageMetadata({
  title: "The OWL Weekly Newsletter",
  description:
    "One short letter from Larissa every Sunday — a video, a printable, a cultural note, a parenting win.",
  path: "/newsletter",
});

/**
 * /newsletter — v3 (Visual-track Phase 4, calm + trust-first motion).
 *
 * Page sections:
 *   1. Warm signup hero (CinematicHero, sequenceSlug="newsletter-welcome", slug="newsletter")
 *      + glass overlay form
 *   2. Segmented signup cards (parents / educators / kids)
 *   3. Benefits row (4 icon tiles — gentle scroll-reveal, not stagger)
 *   4. Sample newsletter cards (text-only previews — no fabricated screenshots)
 *   5. Featured printable + playlist previews (two-up companion modules)
 *   6. Trust + privacy section (band, white, calm)
 *
 * Motion vocabulary: calm + trust-first. <SectionReveal> with longer offsets
 * (20–24px) and SLOW per-section delays. NO StaggerGrid — the brief is "calm
 * and trust-first," not "marketing cascade." Each segment of the page reads
 * as a single beat. Reduced-motion mode renders every section instantly via
 * SectionReveal's existing guard.
 */

// ── Benefits ───────────────────────────────────────────────────────────────
const BENEFITS = [
  {
    icon: Heart,
    title: "One small parenting win",
    body: "A 90-second tip you can use the next time your child has big feelings.",
    bg: "bg-gradient-to-br from-[#fce8e4] via-[#fdf3f1] to-[#fff8ec]",
    border: "border-owl-rose/30",
    iconBg: "bg-owl-rose/15 text-owl-rose",
  },
  {
    icon: Music2,
    title: "One new video + printable",
    body: "Match the song to the page; print on regular paper.",
    bg: "bg-gradient-to-br from-[#e5f8f4] via-[#f0faf7] to-[#fff8ec]",
    border: "border-owl-teal/30",
    iconBg: "bg-owl-teal/15 text-owl-teal",
  },
  {
    icon: CalendarDays,
    title: "One cultural note",
    body: "Two-week heads-up before each holiday hub — never on the day of.",
    bg: "bg-gradient-to-br from-[#fef3d8] via-[#fdf7eb] to-[#fff8ec]",
    border: "border-owl-amber/30",
    iconBg: "bg-owl-amber/20 text-owl-amber",
  },
  {
    icon: BookOpen,
    title: "A note from Larissa",
    body: "Written like a Sunday letter, not a marketing email. Five minutes to read.",
    bg: "bg-gradient-to-br from-[#dff0e6] via-[#eef6f1] to-[#fff8ec]",
    border: "border-owl-forest/25",
    iconBg: "bg-owl-forest/15 text-owl-forest",
  },
];

// ── Segmented signup cards ─────────────────────────────────────────────────
const SEGMENTS = [
  {
    key: "parents",
    icon: Heart,
    eyebrow: "For parents & caregivers",
    title: "The OWL Weekly",
    cadence: "Sundays · 8 AM ET",
    body: "A short video, one free printable, a cultural note, a small parenting win.",
    cta: "Subscribe (parent)",
    segment: "A2" as const,
    accent: "teal" as const,
  },
  {
    key: "educators",
    icon: GraduationCap,
    eyebrow: "For educators",
    title: "The OWL Educator Digest",
    cadence: "Monthly · First Monday",
    body: "Standards crosswalks, classroom-ready printables, and cultural calendar planning.",
    cta: "Subscribe (educator)",
    segment: "A5" as const,
    accent: "forest" as const,
  },
  {
    key: "kids",
    icon: Baby,
    eyebrow: "For kids (with a grown-up)",
    title: "Larissa's Pen-Pal Postcards",
    cadence: "Monthly · First Saturday",
    body: "A short, kid-friendly postcard with a song, a sticker design, and a tiny activity.",
    cta: "Subscribe (kids)",
    segment: "A1" as const,
    accent: "rose" as const,
  },
];

// Each accent maps to a card style (gradient bg + border + eyebrow tint).
const accentStyles = {
  teal: {
    cardGrad: "bg-gradient-to-br from-[#e5f8f4] via-[#f0faf7] to-[#fff8ec]",
    border: "border-owl-teal/40",
    eyebrow: "text-owl-teal",
    iconBg: "bg-owl-teal/15 text-owl-teal",
  },
  forest: {
    cardGrad: "bg-gradient-to-br from-[#dff0e6] via-[#eef6f1] to-[#fff8ec]",
    border: "border-owl-forest/35",
    eyebrow: "text-owl-forest",
    iconBg: "bg-owl-forest/12 text-owl-forest",
  },
  rose: {
    cardGrad: "bg-gradient-to-br from-[#fce8e4] via-[#fdf3f1] to-[#fff8ec]",
    border: "border-owl-rose/40",
    eyebrow: "text-owl-rose",
    iconBg: "bg-owl-rose/20 text-owl-rose",
  },
  amber: {
    cardGrad: "bg-gradient-to-br from-[#fef3d8] via-[#fdf7eb] to-[#fff8ec]",
    border: "border-owl-amber/40",
    eyebrow: "text-owl-amber",
    iconBg: "bg-owl-amber/20 text-owl-amber",
  },
} as const;

// ── Sample newsletter cards ────────────────────────────────────────────────
const SAMPLES = [
  {
    issue: "Issue #4",
    date: "Sun, June 7, 2026",
    headline: "Feelings Are Valid — The Big Emotions Guide Every Parent Needs Right Now",
    snippet:
      "Your toddler's meltdown isn't misbehavior. Here's what's actually happening in their brain — and what to say.",
    href: "/newsletters/issue-04.html",
    accent: "rose" as const,
  },
  {
    issue: "Issue #3",
    date: "Sun, May 29, 2026",
    headline: "Colors of the World — Teaching Colors Through Culture",
    snippet:
      "Red isn't just red — it means luck in China, mourning in South Africa, and celebration in India. Here's the free printable.",
    href: "/newsletters/issue-03.html",
    accent: "amber" as const,
  },
  {
    issue: "Issue #2",
    date: "Sun, May 22, 2026",
    headline: "The ABCs of Raising a Reader — The Phonics Science Every Parent Needs",
    snippet:
      "Why singing the alphabet actually works — and what to do if your child isn't ready yet.",
    href: "/newsletters/issue-02.html",
    accent: "teal" as const,
  },
];

export default function NewsletterPage() {
  return (
    <>
      {/* 1 — Warm signup hero. Cream tone, sparkles ambient, single CTA.
            The hero's overlay slot carries the email form so the visitor
            can subscribe without scrolling. */}
      <VideoHeroBanner
        src="/videos/newsletter-hero.mp4"
        poster="/images/headers/newsletter-hero.png"
        eyebrow="The OWL Weekly"
        heading={
          <>
            A small letter from Larissa,{" "}
            <span className="text-owl-teal">every Sunday.</span>
          </>
        }
        subhead="Five minutes to read. One short video, one printable, one cultural note, one small parenting win. Written like a note to a friend."
        meta={
          <p className="italic">
            &ldquo;I&apos;m so glad you&apos;re here today.&rdquo; — Larissa
          </p>
        }
      />

      {/* 2 — Segmented signup cards (parents / educators / kids).
            Three cards, each carries its own NewsletterForm with the right
            segment slug so the back-end can route to the matching Beehiiv list. */}
      <SectionReveal offset={20}>
        <Section width="wide" pad="lg" bg="cream">
          <SectionIntro
            eyebrow="Choose your track"
            title="One newsletter, three audiences"
            subtitle="Pick the cadence and voice that fits. We never cross-subscribe — you only get what you signed up for."
          />
          <ul role="list" className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {SEGMENTS.map((s) => {
              const styles = accentStyles[s.accent];
              const Icon = s.icon;
              return (
                <li key={s.key}>
                  <div
                    className={`flex h-full flex-col rounded-owl-card border-2 ${styles.border} ${styles.cardGrad} p-6 shadow-owl-1 transition-all duration-300 ease-owl hover:-translate-y-1 hover:shadow-owl-2`}
                  >
                    <span
                      aria-hidden
                      className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-full ${styles.iconBg}`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <p
                      className={`font-display text-xs font-bold uppercase tracking-[0.18em] ${styles.eyebrow}`}
                    >
                      {s.eyebrow}
                    </p>
                    <h3 className="mt-2 font-display text-xl font-bold text-owl-ink">
                      {s.title}
                    </h3>
                    <p className="mt-1 text-xs text-owl-mist">{s.cadence}</p>
                    <p className="mt-3 text-sm leading-relaxed text-owl-ink/80">{s.body}</p>
                    <div className="mt-auto pt-6">
                      <NewsletterForm
                        source="other"
                        segment={s.segment}
                        ctaLabel={s.cta}
                      />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </Section>
      </SectionReveal>

      {/* 3 — Benefits row.
            Calm vocabulary — single <SectionReveal> wrapping the whole row,
            no per-tile stagger. The benefits read together as one thought. */}
      <SectionReveal offset={20}>
        <Section width="wide" pad="lg" bg="white">
          <SectionIntro
            eyebrow="What's inside"
            title="Every issue includes"
            align="center"
          />
          <ul role="list" className="mx-auto mt-6 grid max-w-5xl grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-4">
            {BENEFITS.map(({ icon: Icon, title, body, bg, border, iconBg }) => (
              <li
                key={title}
                className={`rounded-owl-card border ${border} ${bg} p-5 text-center shadow-owl-1 transition-shadow duration-300 ease-owl hover:shadow-owl-2`}
              >
                <span
                  aria-hidden
                  className={`mx-auto mb-4 inline-flex h-11 w-11 items-center justify-center rounded-full ${iconBg}`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="font-display text-sm font-semibold text-owl-ink">{title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-owl-mist">{body}</p>
              </li>
            ))}
          </ul>
        </Section>
      </SectionReveal>

      {/* 4 — Newsletter Previews */}
      <SectionReveal offset={24}>
        <Section width="wide" pad="lg" bg="cream-deep">
          <SectionIntro
            eyebrow="Recent issues"
            title="Newsletter Previews"
            subtitle="A look at the last three Sundays before you commit. Click any preview to read the full issue."
          />
          <ul role="list" className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {SAMPLES.map((s) => {
              const styles = accentStyles[s.accent];
              return (
                <li key={s.issue}>
                  <Link
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group flex h-full flex-col rounded-owl-card border-2 ${styles.border} ${styles.cardGrad} p-6 shadow-owl-1 transition-all duration-300 ease-owl hover:-translate-y-1 hover:shadow-owl-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-owl-teal/60 focus-visible:ring-offset-2 focus-visible:ring-offset-owl-cream-deep`}
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${styles.iconBg}`}>
                        {s.issue}
                      </span>
                      <OwlMark decorative className="h-6 w-6 opacity-80" />
                    </div>
                    <p className="text-xs font-medium text-owl-mist">{s.date}</p>
                    <h3 className="mt-2 font-display text-lg font-bold leading-snug text-owl-ink">
                      {s.headline}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-owl-ink/75">{s.snippet}</p>
                    <p className={`mt-auto pt-4 font-display text-sm font-semibold transition-colors duration-200 ${styles.eyebrow}`}>
                      Read this issue →
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Section>
      </SectionReveal>

    </>
  );
}

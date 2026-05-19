import Link from "next/link";
import {
  Mail,
  Sparkles,
  ShieldCheck,
  Lock,
  EyeOff,
  Heart,
  GraduationCap,
  Baby,
  BookOpen,
  Music2,
  CalendarDays,
} from "lucide-react";
import { pageMetadata } from "@/lib/seo/metadata";

import { CinematicHero } from "@/components/marketing/cinematic-hero";
import { Section } from "@/components/ui/section";
import { SectionIntro } from "@/components/ui/section-intro";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";
import { SectionReveal } from "@/components/marketing/section-reveal";
import { AmbientLayer } from "@/components/marketing/ambient-layer";
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
  },
  {
    icon: Music2,
    title: "One new video + printable",
    body: "Match the song to the page; print on regular paper.",
  },
  {
    icon: CalendarDays,
    title: "One cultural note",
    body: "Two-week heads-up before each holiday hub — never on the day of.",
  },
  {
    icon: BookOpen,
    title: "A note from Larissa",
    body: "Written like a Sunday letter, not a marketing email. Five minutes to read.",
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

// Each accent maps to a card style (border + eyebrow tint).
const accentStyles = {
  teal: {
    border: "border-owl-teal/30",
    eyebrow: "text-owl-teal",
    iconBg: "bg-owl-teal/10 text-owl-teal",
  },
  forest: {
    border: "border-owl-forest/30",
    eyebrow: "text-owl-forest",
    iconBg: "bg-owl-forest/10 text-owl-forest",
  },
  rose: {
    border: "border-owl-rose/40",
    eyebrow: "text-owl-rose",
    iconBg: "bg-owl-rose/20 text-owl-rose",
  },
} as const;

// ── Sample newsletter cards (TEXT-ONLY — never fabricate a screenshot). ─────
// Mocked previews. When real archive issues exist (Beehiiv archive URL),
// swap title/snippet/href for the real ones.
const SAMPLES = [
  {
    issue: "Issue 12",
    date: "Sun, May 12 2026",
    headline: "When your child's feelings are bigger than the room.",
    snippet:
      "A short song about naming feelings, a printable you can fold into a pocket, and a tiny script for the next big-feeling moment.",
    href: "/blog/sample-newsletter-feelings",
  },
  {
    issue: "Issue 11",
    date: "Sun, May 5 2026",
    headline: "Hispanic Heritage starts in two weeks. Here's what's inside.",
    snippet:
      "Bilingual greetings, a recipe card from Larissa's grandmother, and the songs you can drop into circle time. EN/ES throughout.",
    href: "/blog/sample-newsletter-heritage",
  },
  {
    issue: "Issue 10",
    date: "Sun, Apr 28 2026",
    headline: "Slow Sundays — three rituals worth keeping.",
    snippet:
      "Three families share the small Sunday rituals that keep their week feeling like it has edges. Plus a lullaby you can sing on the way home.",
    href: "/blog/sample-newsletter-slow-sundays",
  },
];

export default function NewsletterPage() {
  return (
    <>
      {/* 1 — Warm signup hero. Cream tone, sparkles ambient, single CTA.
            The hero's overlay slot carries the email form so the visitor
            can subscribe without scrolling. */}
      <CinematicHero
        tone="cream"
        slug="newsletter"
        sequenceSlug="newsletter-welcome"
        bannerAspect="wide"
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
        overlay={
          <GlassPanel variant="frost" className="mx-auto max-w-md">
            <div className="mb-2 inline-flex items-center gap-2">
              <Mail className="h-4 w-4 text-owl-teal" aria-hidden />
              <p className="font-display text-xs font-bold uppercase tracking-wide text-owl-teal">
                Subscribe in one line
              </p>
            </div>
            <NewsletterForm
              source="other"
              ctaLabel="Send me Sunday's letter"
              headline=""
              body=""
            />
          </GlassPanel>
        }
        ambient={<AmbientLayer pattern="sparkles" density={3} seed={71} />}
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
                    className={`flex h-full flex-col rounded-owl-card border-2 ${styles.border} bg-owl-white p-6 shadow-owl-1 transition-shadow duration-300 ease-owl hover:shadow-owl-2`}
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
            {BENEFITS.map(({ icon: Icon, title, body }) => (
              <li
                key={title}
                className="rounded-owl-card border border-owl-cream-deep bg-owl-cream p-5 text-center shadow-owl-1"
              >
                <span
                  aria-hidden
                  className="mx-auto mb-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-owl-teal/10 text-owl-teal"
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

      {/* 4 — Sample newsletter cards (text-only previews) */}
      <SectionReveal offset={24}>
        <Section width="wide" pad="lg" bg="cream-deep">
          <SectionIntro
            eyebrow="Recent issues"
            title="Sample newsletter previews"
            subtitle="A look at the last three Sundays before you commit. Click any preview to read the full archive."
          />
          <ul role="list" className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {SAMPLES.map((s) => (
              <li key={s.issue}>
                <Link
                  href={s.href}
                  className="group flex h-full flex-col rounded-owl-card border border-owl-cream-deep bg-owl-white p-6 shadow-owl-1 transition-all duration-300 ease-owl hover:-translate-y-0.5 hover:shadow-owl-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-owl-teal/60 focus-visible:ring-offset-2 focus-visible:ring-offset-owl-cream-deep"
                >
                  {/* Stylized envelope flap — pure SVG, no fabricated screenshot */}
                  <div className="mb-4 flex items-center justify-between">
                    <span className="rounded-full bg-owl-teal/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-owl-teal">
                      {s.issue}
                    </span>
                    <OwlMark decorative className="h-6 w-6 opacity-80" />
                  </div>
                  <p className="text-xs font-medium text-owl-mist">{s.date}</p>
                  <h3 className="mt-2 font-display text-lg font-bold leading-snug text-owl-ink">
                    {s.headline}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-owl-ink/75">{s.snippet}</p>
                  <p className="mt-auto pt-4 font-display text-sm font-semibold text-owl-teal transition-colors duration-200 group-hover:text-owl-teal-deep">
                    Read this issue →
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      </SectionReveal>

      {/* 5 — Featured printable + playlist previews */}
      <SectionReveal offset={20}>
        <Section width="wide" pad="lg" bg="white">
          <SectionIntro
            eyebrow="What comes with subscribing"
            title="Sample assets, free"
            subtitle="Each Sunday email includes one free printable and a song link. Here's what landed in Issue 12."
          />
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Featured printable preview */}
            <div className="relative isolate flex flex-col overflow-hidden rounded-owl-card border border-owl-cream-deep bg-owl-amber-soft/40 p-6 shadow-owl-1 md:p-8">
              <AmbientLayer
                pattern="paper"
                density={3}
                seed={89}
                className="inset-0"
              />
              <div className="relative z-text">
                <Sparkles className="mb-3 h-5 w-5 text-owl-amber" aria-hidden />
                <p className="font-display text-xs font-bold uppercase tracking-[0.18em] text-owl-teal">
                  Featured printable
                </p>
                <h3 className="mt-2 font-display text-2xl font-extrabold text-owl-ink">
                  Feelings face wheel
                </h3>
                <p className="mt-3 max-w-prose text-sm leading-relaxed text-owl-ink/75">
                  A spinnable wheel to name and check in on big feelings. One page, ages 2–5,
                  free with every subscription.
                </p>
                <Button intent="primary" size="md" asChild className="mt-5">
                  <Link href="/printables/feelings-face-wheel">Preview the PDF</Link>
                </Button>
              </div>
            </div>

            {/* Featured playlist preview */}
            <div className="relative isolate flex flex-col overflow-hidden rounded-owl-card border border-owl-cream-deep bg-owl-teal/15 p-6 shadow-owl-1 md:p-8">
              <AmbientLayer
                pattern="notes"
                density={3}
                seed={97}
                className="inset-0"
              />
              <div className="relative z-text">
                <Music2 className="mb-3 h-5 w-5 text-owl-teal" aria-hidden />
                <p className="font-display text-xs font-bold uppercase tracking-[0.18em] text-owl-teal">
                  Featured playlist
                </p>
                <h3 className="mt-2 font-display text-2xl font-extrabold text-owl-ink">
                  Feelings &amp; friends
                </h3>
                <p className="mt-3 max-w-prose text-sm leading-relaxed text-owl-ink/75">
                  Nine songs about naming big feelings — slow tempos, multicultural cast,
                  pre-cleared for classroom playback.
                </p>
                <Button intent="secondary" size="md" asChild className="mt-5">
                  <Link href="/music/feelings">Open the playlist</Link>
                </Button>
              </div>
            </div>
          </div>
        </Section>
      </SectionReveal>

      {/* 6 — Trust + privacy section (calm white band) */}
      <SectionReveal offset={24}>
        <Section width="narrow" pad="lg" bg="white">
          <SectionIntro
            eyebrow="No spam, ever"
            title="What you can expect"
            align="center"
          />
          <ul role="list" className="mx-auto mt-6 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">
            <li className="flex items-start gap-3 rounded-owl-card border border-owl-cream-deep bg-owl-cream p-4">
              <span
                aria-hidden
                className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-owl-success/15 text-owl-success"
              >
                <ShieldCheck className="h-4 w-4" />
              </span>
              <div>
                <p className="font-display text-sm font-semibold text-owl-ink">Double opt-in</p>
                <p className="text-xs text-owl-mist">
                  We confirm your email before we ever send one. No surprise subscriptions.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3 rounded-owl-card border border-owl-cream-deep bg-owl-cream p-4">
              <span
                aria-hidden
                className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-owl-teal/15 text-owl-teal"
              >
                <Lock className="h-4 w-4" />
              </span>
              <div>
                <p className="font-display text-sm font-semibold text-owl-ink">Never sold</p>
                <p className="text-xs text-owl-mist">
                  Your email is never sold, traded, or shared with marketing partners. Period.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3 rounded-owl-card border border-owl-cream-deep bg-owl-cream p-4">
              <span
                aria-hidden
                className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-owl-amber/15 text-owl-amber"
              >
                <EyeOff className="h-4 w-4" />
              </span>
              <div>
                <p className="font-display text-sm font-semibold text-owl-ink">No tracking pixels on child content</p>
                <p className="text-xs text-owl-mist">
                  Printables emailed to you carry zero tracking pixels. Pages for kids stay COPPA-safe.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3 rounded-owl-card border border-owl-cream-deep bg-owl-cream p-4">
              <span
                aria-hidden
                className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-owl-forest/15 text-owl-forest"
              >
                <Mail className="h-4 w-4" />
              </span>
              <div>
                <p className="font-display text-sm font-semibold text-owl-ink">One-click unsubscribe</p>
                <p className="text-xs text-owl-mist">
                  In every single email. Beehiiv delivers, Resend handles confirmations.
                </p>
              </div>
            </li>
          </ul>

          <p className="mx-auto mt-8 max-w-prose text-center text-xs text-owl-mist">
            Read our{" "}
            <Link href="/privacy" className="font-semibold text-owl-teal underline-offset-2 hover:underline">
              privacy policy
            </Link>{" "}
            or{" "}
            <Link href="/contact" className="font-semibold text-owl-teal underline-offset-2 hover:underline">
              email us
            </Link>{" "}
            with any questions. We reply.
          </p>
        </Section>
      </SectionReveal>
    </>
  );
}

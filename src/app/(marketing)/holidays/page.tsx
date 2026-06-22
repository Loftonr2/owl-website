import Link from "next/link";
import { Sparkles, Globe2, Church, Palette, Moon } from "lucide-react";
import { pageMetadata } from "@/lib/seo/metadata";

import { VideoHeroBanner } from "@/components/marketing/video-hero-banner";
import { Section } from "@/components/ui/section";
import { SectionIntro } from "@/components/ui/section-intro";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { GlassPanel } from "@/components/ui/glass-panel";
import { SectionReveal } from "@/components/marketing/section-reveal";
import { StaggerGrid } from "@/components/marketing/stagger-grid";
import { MediaRail } from "@/components/marketing/media-rail";
import { HolidayCard } from "@/components/marketing/holiday-card";
import { PrintableCard } from "@/components/marketing/printable-card";
import { AmbientLayer } from "@/components/marketing/ambient-layer";
import { NewsletterSection } from "@/components/marketing/newsletter-section";
import { OwlMark } from "@/components/brand/owl-logo";

import { SEED_HOLIDAYS } from "@/lib/seed/holidays";
import { SEED_PRINTABLES } from "@/lib/seed/printables";

export const metadata = pageMetadata({
  title: "Holidays — Celebrate Learning All Year",
  description:
    "Eleven cultural celebrations with videos, printables, and family-friendly stories.",
  path: "/holidays",
});

/**
 * /holidays — v3 (Visual-track Phase 4, celebratory-but-controlled motion).
 *
 * Page sections:
 *   1. Celebration hero (CinematicHero, sequenceSlug="holidays-celebration", slug="holidays")
 *   2. Browse-by-month strip (12-month grid keyed to seed holiday data)
 *   3. Featured campaign banner (current/upcoming campaign GlassPanel)
 *   4. Evergreen categories (StaggerGrid — celebration, traditions, voices)
 *   5. Suggested holiday hubs (StaggerGrid 4-up, all 11 hubs)
 *   6. Printable/activity rails (MediaRail)
 *   7. Seasonal signup CTA (forest band)
 *   8. Newsletter band
 *
 * Motion vocabulary: celebratory but controlled. Sparkles ambient throughout.
 * Stagger speeds in the 60–80ms band (not as tight as Educators sales-deck,
 * not as slow as About prose). Holiday tone colors cycle so the page reads
 * as variety + warmth without becoming visual noise.
 */

const CELEBRATION_CATEGORIES = [
  {
    icon: Globe2,
    title: "Heritage Months",
    body: "Black History Month, Hispanic Heritage Month, Asian Pacific Heritage Month, and more — all year long.",
    intent: "teal" as const,
  },
  {
    icon: Sparkles,
    title: "International Festivities",
    body: "Diwali, Lunar New Year, Hanukkah, Kwanzaa — global celebrations that belong in every classroom.",
    intent: "amber" as const,
  },
  {
    icon: Church,
    title: "Religious Holidays",
    body: "Respectful, age-appropriate introductions to the world's major faith celebrations.",
    intent: "rose" as const,
  },
  {
    icon: Palette,
    title: "Cultural Arts",
    body: "Music, dance, food, and craft traditions tied to every holiday hub.",
    intent: "teal" as const,
  },
  {
    icon: Moon,
    title: "Ramadan & Eid",
    body: "A full month of fasting, prayer, and community — plus the joyful Eid al-Fitr celebration.",
    intent: "amber" as const,
  },
];

// Month ordering — start at January so the strip reads chronologically.
const MONTH_ORDER = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function holidaysForMonth(month: string) {
  return SEED_HOLIDAYS.filter((h) =>
    h.month.toLowerCase().includes(month.toLowerCase())
  );
}

export default function HolidaysPage() {
  const culturalPrintables = SEED_PRINTABLES.filter((p) => p.skill === "Cultural").slice(0, 6);

  return (
    <>
      {/* Hero */}
      <VideoHeroBanner
        src="/videos/holidays-hero.mp4"
        poster="/images/headers/holidays-hero.png"
        eyebrow="Holidays"
        heading={
          <>Celebrate Learning{" "}<span className="text-owl-teal">All Year.</span></>
        }
        subhead="Eleven cultural celebrations with videos, printables, and parent-friendly explainers — refreshed annually."
        primaryCta={{ label: "Explore the Hubs", href: "#hubs" }}
        secondaryCta={{ label: "Browse by Month", href: "#by-month" }}
        meta={<p>11 cultural hubs · refreshed each year · always free to read.</p>}
      />

      {/* 2 — Browse-by-month strip */}
      <SectionReveal>
        <Section width="wide" pad="lg" bg="cream" id="by-month">
          <SectionIntro
            eyebrow="Calendar"
            title="Browse by month"
            subtitle="Each month spotlights the celebrations that fall in it — plus the ones whose lunar/lunisolar timing moves around."
          />
          <StaggerGrid
            asList
            ariaLabel="Holidays by month"
            className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
            stagger={0.04}
            offsetY={10}
          >
            {MONTH_ORDER.map((m) => {
              const hubs = holidaysForMonth(m);
              return (
                <div
                  key={m}
                  className="rounded-owl-card border border-owl-cream-deep bg-owl-white p-4 text-center shadow-owl-1 transition-shadow duration-200 ease-owl-quick hover:shadow-owl-2"
                >
                  <p className="font-display text-xs font-bold uppercase tracking-wide text-owl-teal">
                    {m.slice(0, 3)}
                  </p>
                  <p className="mt-2 font-display text-lg font-bold text-owl-ink">{m}</p>
                  <p className="mt-1 text-xs text-owl-mist">
                    {hubs.length === 0
                      ? "Quiet month"
                      : `${hubs.length} ${hubs.length === 1 ? "hub" : "hubs"}`}
                  </p>
                  {hubs.length > 0 && (
                    <div className="mt-3 flex flex-wrap justify-center gap-1">
                      {hubs.slice(0, 3).map((h) => (
                        <Link
                          key={h.slug}
                          href={`/holidays/${h.slug}`}
                          aria-label={`${h.name} hub`}
                          className="rounded-full bg-owl-cream-deep px-2 py-0.5 text-[10px] font-semibold text-owl-forest transition-colors hover:bg-owl-amber/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-owl-teal/50"
                        >
                          {h.emoji}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </StaggerGrid>
        </Section>
      </SectionReveal>

      {/* 3 — Featured campaign banner */}
      <SectionReveal>
        <Section width="wide" pad="lg" bg="white">
          <div className="relative isolate overflow-hidden rounded-owl-hero bg-owl-amber-soft/40 p-8 shadow-owl-1 md:p-12">
            <AmbientLayer
              pattern="sparkles"
              density={4}
              seed={113}
              className="inset-0"
            />
            <div className="relative z-text grid grid-cols-1 items-center gap-8 md:grid-cols-[1.4fr,1fr]">
              <div>
                <Chip intent="amber" className="mb-3">
                  Featured Campaign
                </Chip>
                <h2 className="font-display text-3xl font-extrabold text-owl-ink sm:text-4xl">
                  Hispanic Heritage Month — Sept 15 to Oct 15.
                </h2>
                <p className="mt-4 max-w-prose text-base leading-relaxed text-owl-ink/80">
                  Celebrating the histories, cultures, and contributions of Hispanic and
                  Latino Americans. Songs in Spanish and English, printable activity sheets,
                  and a family-friendly explainer — refreshed annually.
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Button intent="primary" size="lg" asChild>
                    <Link href="/holidays/hispanic-heritage">Explore the Hub</Link>
                  </Button>
                  <Button intent="secondary" size="lg" asChild>
                    <Link href="/watch">Watch a cultural song</Link>
                  </Button>
                </div>
              </div>

              <GlassPanel variant="frost">
                <p className="font-display text-xs font-bold uppercase tracking-wide text-owl-teal">
                  In the hub
                </p>
                <ul className="mt-3 space-y-2 text-sm text-owl-ink">
                  <li>🌎 Family-friendly cultural history</li>
                  <li>🎵 Bilingual sing-along songs</li>
                  <li>🖍️ Printable activity & coloring sheets</li>
                  <li>🌍 Español + English greetings</li>
                </ul>
              </GlassPanel>
            </div>
          </div>
        </Section>
      </SectionReveal>

      {/* 4 — Celebration Categories */}
      <SectionReveal>
        <Section width="wide" pad="lg" bg="cream">
          <SectionIntro
            eyebrow="Browse by type"
            title="Celebration Categories"
            subtitle="Every tradition finds a home here — heritage months, world festivities, and faith-based celebrations."
          />
          <StaggerGrid
            asList
            ariaLabel="Celebration categories"
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5"
            stagger={0.07}
            offsetY={12}
          >
            {CELEBRATION_CATEGORIES.map(({ icon: Icon, title, body, intent }) => (
              <div
                key={title}
                className="h-full rounded-owl-card border border-owl-cream-deep bg-owl-white p-6 shadow-owl-1 transition-shadow duration-300 ease-owl hover:shadow-owl-2"
              >
                <Chip intent={intent} className="mb-3">
                  <Icon className="h-3.5 w-3.5" aria-hidden />
                  Category
                </Chip>
                <h3 className="font-display text-base font-semibold text-owl-ink">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-owl-mist">{body}</p>
              </div>
            ))}
          </StaggerGrid>
        </Section>
      </SectionReveal>

      {/* 5 — Suggested holiday hubs (all 11) */}
      <SectionReveal>
        <Section width="wide" pad="lg" bg="white" id="hubs">
          <SectionIntro
            eyebrow="Every hub"
            title="All eleven OWL holiday hubs"
            subtitle="Each hub: a parent-friendly intro, related songs and printables, and a calendar of when families celebrate."
          />
          <StaggerGrid
            asList
            ariaLabel="All OWL holiday hubs"
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
            stagger={0.05}
            offsetY={12}
          >
            {SEED_HOLIDAYS.map((h) => (
              <HolidayCard
                key={h.slug}
                slug={h.slug}
                name={h.name}
                month={h.month}
                intro={h.intro}
                emoji={h.emoji}
                tone={h.tone}
              />
            ))}
          </StaggerGrid>
        </Section>
      </SectionReveal>

      {/* 6 — Printable/activity rail */}
      <SectionReveal>
        <Section width="wide" pad="lg" bg="cream-deep">
          <SectionIntro
            eyebrow="Activities"
            title="Cultural printables & activities"
            subtitle="Free coloring sheets, lantern templates, family-conversation cards."
          />
          <MediaRail
            ariaLabel="Cultural printables"
            columns={{ md: 2, lg: 3 }}
            className="mt-8"
          >
            {culturalPrintables.map((p) => (
              <PrintableCard key={p.slug} {...p} />
            ))}
          </MediaRail>
        </Section>
      </SectionReveal>

      {/* 7 — Seasonal signup CTA (forest band) */}
      <SectionReveal>
        <Section width="wide" pad="lg" bg="forest">
          <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-[1.3fr,1fr]">
            <div>
              <p className="font-display text-xs font-bold uppercase tracking-[0.22em] text-owl-amber-soft">
                Seasonal signup
              </p>
              <h2 className="mt-3 font-display text-3xl font-extrabold text-owl-cream sm:text-4xl">
                Want a heads-up before each holiday?
              </h2>
              <p className="mt-4 max-w-prose text-base leading-relaxed text-owl-cream/85">
                We send a single, calm email two weeks before each celebration with
                the hub, the songs, the printables, and a few words of context. No
                more, no less.
              </p>
            </div>
            <div className="flex items-center justify-center md:justify-end">
              <OwlMark decorative className="h-16 w-16 opacity-90 drop-shadow-sm" />
              <Button intent="primary" size="lg" asChild className="ml-4">
                <Link href="/newsletter?segment=seasonal">Subscribe for seasonal alerts</Link>
              </Button>
            </div>
          </div>
        </Section>
      </SectionReveal>

      {/* 8 — Newsletter band */}
      <SectionReveal>
        <NewsletterSection />
      </SectionReveal>
    </>
  );
}

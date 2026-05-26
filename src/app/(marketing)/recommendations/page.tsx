import Link from "next/link";
import {
  ShieldCheck,
  Heart,
  Search,
  Sparkles,
  Award,
} from "lucide-react";
import { pageMetadata } from "@/lib/seo/metadata";

import { CinematicHero } from "@/components/marketing/cinematic-hero";
import { Section } from "@/components/ui/section";
import { SectionIntro } from "@/components/ui/section-intro";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { CategoryChip } from "@/components/ui/category-chip";
import { GlassPanel } from "@/components/ui/glass-panel";
import { SectionReveal } from "@/components/marketing/section-reveal";
import { StaggerGrid } from "@/components/marketing/stagger-grid";
import { MediaRail } from "@/components/marketing/media-rail";
import { AmbientLayer } from "@/components/marketing/ambient-layer";
import { ProductCard } from "@/components/marketing/product-card";
import { NewsletterSection } from "@/components/marketing/newsletter-section";

import { SEED_PRODUCTS } from "@/lib/seed/products";

export const metadata = pageMetadata({
  title: "Recommended Products",
  description:
    "Larissa's picks — OWL-made and trusted partners. Toys, books, and tools that actually support learning.",
  path: "/recommendations",
});

/**
 * /recommendations — v3 (Visual-track Phase 5, editorial motion).
 *
 * Page sections:
 *   1. Editorial-style hero (CinematicHero, sequenceSlug="recommendations-bookshelf", slug="recommendations")
 *   2. Search + filter chips
 *   3. Featured recommended products (Larissa's picks rail)
 *   4. Age-based recommendations (4 age-band columns)
 *   5. Comparison snippets table
 *   6. Trust / benefit cards
 *   7. Newsletter / discount CTA
 *
 * Motion vocabulary: editorial / magazine. Gentle stagger (50–60ms), longer
 * read-pause between sections. Stars ambient at low density to keep the
 * "curated picks" mood.
 */

const FILTER_OPTIONS = [
  { value: "all", label: "All picks" },
  { value: "books", label: "Books" },
  { value: "toys", label: "Toys" },
  { value: "subscriptions", label: "Subscriptions" },
  { value: "digital", label: "Digital" },
];

const AGE_BANDS = [
  { range: "0–1", label: "Infants", focus: "Sensory + bonding" },
  { range: "1–3", label: "Toddlers", focus: "Movement + first words" },
  { range: "3–5", label: "Preschool", focus: "Letters + feelings" },
  { range: "5–8", label: "School age", focus: "Literacy + identity" },
];

const COMPARISON_ROWS = [
  {
    pick: "OWL ABC Flash Cards",
    alt: "Generic preschool flashcards",
    cast: "Multicultural · 26 distinct children",
    age: "2–5",
    sourcing: "Print-on-demand",
    standards: "Head Start ELOF aligned",
  },
  {
    pick: "Larissa Plush Set",
    alt: "Single-character plushies",
    cast: "Six ethnic skin-tone variants",
    age: "0–5",
    sourcing: "Print-on-demand",
    standards: "Attachment + pretend play",
  },
  {
    pick: "Feelings Coloring Book",
    alt: "Generic coloring book",
    cast: "Multi-feeling, multi-family",
    age: "2–5",
    sourcing: "KDP-printed",
    standards: "SEL + fine motor",
  },
];

const TRUST_BENEFITS = [
  {
    icon: ShieldCheck,
    title: "Tested in real homes",
    body: "Every OWL product is used in Larissa's family and a small parent panel before it ships.",
  },
  {
    icon: Heart,
    title: "Multicultural by default",
    body: "Not a 'diverse SKU' bolted onto a default product line. The cast is the product.",
  },
  {
    icon: Award,
    title: "Standards-aligned",
    body: "Each product maps to a learning goal — printable shows the framework on the back.",
  },
];

const AFFILIATE_BLOCKS = [
  {
    name: "Little Passports",
    category: "Subscription · World Cultures",
    note: "World-cultures monthly box. Best for ages 3–10.",
    cookie: "45 days",
  },
  {
    name: "KiwiCo",
    category: "STEM / STEAM subscription",
    note: "Project crates by age band. Best for hands-on learners.",
    cookie: "30 days",
  },
  {
    name: "Melissa & Doug",
    category: "Educational toys",
    note: "Wooden classics. Reliable for ages 2–6.",
    cookie: "24 hours",
  },
  {
    name: "LeapFrog",
    category: "Educational tablets",
    note: "Tablet-based phonics + counting. Best for ages 3–6.",
    cookie: "24 hours",
  },
];

export default function RecommendationsPage() {
  const owlPicks = SEED_PRODUCTS.slice(0, 6);

  return (
    <>
      {/* 1 — Editorial hero (cream / sparkles + stars) */}
      <CinematicHero
        tone="cream"
        slug="recommendations"
        sequenceSlug="recommendations-bookshelf"
        bannerAspect="wide"
        eyebrow="Larissa's picks"
        heading={
          <>
            Editorial picks for{" "}
            <span className="text-owl-teal">every shelf, every age.</span>
          </>
        }
        subhead="OWL-made favorites and a few trusted partners. Each pick supports a specific learning goal — no fluff, no algorithm-chasing."
        primaryCta={
          <Button intent="primary" size="lg" asChild>
            <Link href="#picks">
              <Sparkles className="h-4 w-4" aria-hidden />
              See this week's picks
            </Link>
          </Button>
        }
        secondaryCta={
          <Button intent="secondary" size="lg" asChild>
            <Link href="#compare">Compare with alternatives</Link>
          </Button>
        }
        meta={
          <p>Updated every Sunday in the OWL Weekly. Affiliate links disclosed.</p>
        }
        ambient={<AmbientLayer pattern="stars" density={3} seed={131} />}
      />

      {/* 2 — Search + filter chips */}
      <SectionReveal>
        <Section width="wide" pad="md" bg="cream">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <label className="relative block max-w-md flex-1">
              <span className="sr-only">Search recommendations</span>
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-owl-mist"
                aria-hidden
              />
              <input
                type="search"
                placeholder="Search by skill, age, or product type"
                className="h-11 w-full rounded-owl-btn border border-owl-cream-deep bg-owl-white pl-9 pr-4 text-sm text-owl-ink shadow-owl-1 placeholder:text-owl-mist focus:border-owl-teal focus:outline-none focus:ring-2 focus:ring-owl-teal/40"
              />
            </label>

            <div className="flex flex-wrap gap-2">
              {FILTER_OPTIONS.map((f) => (
                <CategoryChip
                  key={f.value}
                  href={`/recommendations?type=${f.value}`}
                  label={f.label}
                  intent="teal"
                />
              ))}
            </div>
          </div>
        </Section>
      </SectionReveal>

      {/* 3 — Featured: Larissa's picks rail */}
      <SectionReveal>
        <Section width="wide" pad="lg" bg="cream" id="picks">
          <SectionIntro
            eyebrow="OWL-made"
            title="Larissa's picks rail"
            subtitle="Made by us, used by us. Every OWL product is designed by Larissa and Rick for the families they serve."
          />
          <MediaRail
            ariaLabel="Larissa's recommended OWL products"
            columns={{ md: 3, lg: 4 }}
            className="mt-8"
            stagger={0.06}
          >
            {owlPicks.map((p) => (
              <ProductCard
                key={p.slug}
                slug={p.slug}
                title={p.title}
                price={p.price}
                ageRange={p.ageRange}
                category={p.category}
                tone={p.tone}
                isComingSoon={p.isComingSoon}
              />
            ))}
          </MediaRail>
        </Section>
      </SectionReveal>

      {/* 4 — Age-based recommendations */}
      <SectionReveal>
        <Section width="wide" pad="lg" bg="white">
          <SectionIntro
            eyebrow="By age"
            title="Pick the band, see the picks"
            subtitle="Each column shows the most-relevant products and the developmental focus they support."
          />
          <StaggerGrid
            asList
            ariaLabel="Age-based recommendations"
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
            stagger={0.06}
            offsetY={12}
          >
            {AGE_BANDS.map((band) => (
              <Link
                key={band.range}
                href={`/recommendations?age=${band.range}`}
                className="group flex h-full flex-col rounded-owl-card border border-owl-cream-deep bg-owl-cream p-6 shadow-owl-1 transition-all duration-300 ease-owl hover:-translate-y-0.5 hover:shadow-owl-2 hover:border-owl-teal/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-owl-teal/60 focus-visible:ring-offset-2 focus-visible:ring-offset-owl-cream"
              >
                <Chip intent="teal" className="self-start">
                  Ages {band.range}
                </Chip>
                <h3 className="mt-3 font-display text-xl font-bold text-owl-ink">
                  {band.label}
                </h3>
                <p className="mt-1 text-sm text-owl-mist">{band.focus}</p>
                <p className="mt-auto pt-6 font-display text-sm font-semibold text-owl-teal transition-colors duration-200 group-hover:text-owl-teal-deep">
                  See picks →
                </p>
              </Link>
            ))}
          </StaggerGrid>
        </Section>
      </SectionReveal>

      {/* 5 — Comparison snippets */}
      <SectionReveal>
        <Section width="wide" pad="lg" bg="cream-deep" id="compare">
          <SectionIntro
            eyebrow="How we're different"
            title="OWL picks vs. shelf alternatives"
            subtitle="Three quick comparisons. No marketing spin — just what's different about each pick."
          />
          <div className="overflow-x-auto">
            <table className="mt-6 w-full min-w-[640px] border-separate border-spacing-y-3 text-sm">
              <thead>
                <tr className="text-left text-xs font-bold uppercase tracking-wide text-owl-mist">
                  <th scope="col" className="px-4 py-2">OWL pick</th>
                  <th scope="col" className="px-4 py-2">Typical alternative</th>
                  <th scope="col" className="px-4 py-2">Cast</th>
                  <th scope="col" className="px-4 py-2">Age</th>
                  <th scope="col" className="px-4 py-2">Standards</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row) => (
                  <tr
                    key={row.pick}
                    className="rounded-owl-card bg-owl-white align-top shadow-owl-1"
                  >
                    <td className="rounded-l-owl-card px-4 py-3 font-display font-semibold text-owl-ink">
                      {row.pick}
                    </td>
                    <td className="px-4 py-3 text-owl-mist">{row.alt}</td>
                    <td className="px-4 py-3 text-owl-ink/80">{row.cast}</td>
                    <td className="px-4 py-3 text-owl-ink/80">{row.age}</td>
                    <td className="rounded-r-owl-card px-4 py-3 text-owl-ink/80">
                      {row.standards}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      </SectionReveal>

      {/* 6 — Trust / benefit cards */}
      <SectionReveal>
        <Section width="wide" pad="lg" bg="white">
          <SectionIntro
            eyebrow="Why these picks"
            title="What every OWL recommendation has in common"
            align="center"
          />
          <StaggerGrid
            asList
            ariaLabel="OWL recommendation trust pillars"
            className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3"
            stagger={0.08}
            offsetY={12}
          >
            {TRUST_BENEFITS.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="h-full rounded-owl-card border border-owl-cream-deep bg-owl-cream p-6 shadow-owl-1 transition-shadow duration-300 ease-owl hover:shadow-owl-2"
              >
                <span
                  aria-hidden
                  className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-owl-teal/10 text-owl-teal"
                >
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="font-display text-base font-semibold text-owl-ink">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-owl-mist">{body}</p>
              </div>
            ))}
          </StaggerGrid>
        </Section>
      </SectionReveal>

      {/* Trusted partners block (preserved from prior /recommendations) */}
      <SectionReveal>
        <Section width="wide" pad="lg" bg="cream">
          <SectionIntro
            eyebrow="Trusted partners"
            title="Outside picks we use ourselves"
            subtitle="Affiliate links — if you buy through them, OWL gets a small commission at no extra cost to you."
          />
          <StaggerGrid
            asList
            ariaLabel="Trusted affiliate partners"
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
            stagger={0.05}
            offsetY={10}
          >
            {AFFILIATE_BLOCKS.map((a) => (
              <div
                key={a.name}
                className="flex h-full flex-col rounded-owl-card border border-owl-cream-deep bg-owl-white p-5 shadow-owl-1"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-owl-mist">
                  {a.category}
                </p>
                <h3 className="mt-1 font-display text-base font-semibold text-owl-ink">{a.name}</h3>
                <p className="mt-2 flex-1 text-sm text-owl-mist">{a.note}</p>
                <p className="mt-3 text-xs text-owl-mist">Cookie window: {a.cookie}</p>
                <Link
                  href="/contact"
                  className="mt-3 font-display text-sm font-semibold text-owl-teal hover:text-owl-teal-deep"
                >
                  Learn more →
                </Link>
              </div>
            ))}
          </StaggerGrid>
          <p className="mt-8 text-xs italic text-owl-mist">
            Affiliate disclosure: OWL Sing Together earns a small commission on qualifying purchases through partner links. We only recommend products we use.
          </p>
        </Section>
      </SectionReveal>

      {/* 7 — Newsletter / discount CTA */}
      <SectionReveal>
        <Section width="wide" pad="lg" bg="forest">
          <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-[1.3fr,1fr]">
            <div>
              <p className="font-display text-xs font-bold uppercase tracking-[0.22em] text-owl-amber-soft">
                Weekly picks + 10% off
              </p>
              <h2 className="mt-3 font-display text-3xl font-extrabold text-owl-cream sm:text-4xl">
                Picks in your inbox. A small thank-you on your first order.
              </h2>
              <p className="mt-4 max-w-prose text-base leading-relaxed text-owl-cream/85">
                Subscribe to the OWL Weekly and we&apos;ll send you Sunday&apos;s pick + a 10% off
                code for the OWL shop on your first order. One email, no spam.
              </p>
            </div>
            <GlassPanel variant="forest" className="text-owl-cream">
              <p className="font-display text-xs font-bold uppercase tracking-wide text-owl-amber-soft">
                What you get
              </p>
              <ul className="mt-3 space-y-1.5 text-sm">
                <li>✓ Sunday pick + the reason behind it</li>
                <li>✓ 10% off your first OWL order</li>
                <li>✓ One-click unsubscribe</li>
              </ul>
              <Button intent="primary" size="lg" asChild className="mt-5 w-full">
                <Link href="/newsletter">Subscribe — get the code</Link>
              </Button>
            </GlassPanel>
          </div>
        </Section>
      </SectionReveal>

      <SectionReveal>
        <NewsletterSection />
      </SectionReveal>
    </>
  );
}

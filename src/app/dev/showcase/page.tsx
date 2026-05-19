import { notFound } from "next/navigation";
import Link from "next/link";
import { Section, SectionHeader } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { ComingSoonRibbon } from "@/components/ui/coming-soon-ribbon";
import { Chip } from "@/components/ui/chip";
import { PlayButton } from "@/components/ui/play-button";
import { OwlMark, OwlWordmark, OwlLockup } from "@/components/brand/owl-logo";
import { VideoPoster } from "@/components/marketing/video-poster";
import { ProductCard } from "@/components/marketing/product-card";
import { DevHintBanner } from "@/components/marketing/dev-hint-banner";
import { HeroFrameSequence } from "@/components/marketing/hero-frame-sequence";
import { AmbientLayer } from "@/components/marketing/ambient-layer";
import { Sparkles, Play } from "lucide-react";

/**
 * /dev/showcase — primitive QA page, NODE_ENV-gated.
 *
 * Renders every primitive in every observable state so we can verify:
 *   - Three-tier video poster resolver (none / youtube CDN / local)
 *   - Dev hint banner mount path
 *   - Hero frame sequence runtime (with the _dev-smoke fixture)
 *   - Glass card variants
 *   - Coming-soon ribbon variants
 *   - All Button intents at all sizes
 *   - Logo variants
 *   - Ambient layer patterns
 *
 * Returns 404 in production (or when NODE_ENV is not "development"). The
 * `notFound()` short-circuits the render and Next.js serves the 404 page.
 *
 * NOTE: This is intentionally a long single file — the value is having every
 * primitive's state visible in one scroll for fast QA. Don't refactor into
 * sub-components.
 */

export const dynamic = "force-dynamic";

export default function DevShowcasePage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <>
      <Section width="wide" pad="lg" bg="cream">
        <SectionHeader
          eyebrow="Dev only — gated to NODE_ENV !== production"
          title="OWL primitive showcase"
          subtitle="Every primitive in every state. If anything looks broken here, it's broken on the real pages too. If anything looks fine here, the asset interface is wired correctly — only commissioned art is missing."
        />
        <nav aria-label="Showcase sections" className="mt-6 flex flex-wrap gap-2">
          {[
            ["Logo", "logo"],
            ["Buttons", "buttons"],
            ["Chips", "chips"],
            ["Glass cards", "glass"],
            ["Coming Soon ribbon", "ribbon"],
            ["Ambient layer", "ambient"],
            ["Video poster resolver", "poster"],
            ["Dev hint banner", "devhint"],
            ["Product card resolver", "product"],
            ["Hero frame sequence", "hero-seq"],
          ].map(([label, anchor]) => (
            <a
              key={anchor}
              href={`#${anchor}`}
              className="rounded-full border border-owl-cream-deep bg-owl-white px-3 py-1 text-xs font-semibold text-owl-forest shadow-owl-1 transition-all duration-200 hover:-translate-y-px hover:border-owl-teal hover:text-owl-teal"
            >
              {label}
            </a>
          ))}
        </nav>
      </Section>

      {/* ── Logo ──────────────────────────────────────────────────────────── */}
      <Section id="logo" width="wide" pad="md" bg="white">
        <SectionHeader eyebrow="1" title="Logo" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <ShowcaseCard label="<OwlMark size='lg' />">
            <OwlMark size="lg" />
          </ShowcaseCard>
          <ShowcaseCard label="<OwlWordmark size='lg' />">
            <OwlWordmark size="lg" />
          </ShowcaseCard>
          <ShowcaseCard label="<OwlLockup size='lg' />">
            <OwlLockup size="lg" />
          </ShowcaseCard>
        </div>
      </Section>

      {/* ── Buttons ──────────────────────────────────────────────────────── */}
      <Section id="buttons" width="wide" pad="md" bg="cream">
        <SectionHeader eyebrow="2" title="Buttons — every intent × every size" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {(["primary", "secondary", "tertiary", "ghost", "inverted", "destructive"] as const).map(
            (intent) => (
              <ShowcaseCard key={intent} label={`intent="${intent}"`}>
                <div className="flex flex-wrap items-center gap-3">
                  <Button intent={intent} size="sm">sm</Button>
                  <Button intent={intent} size="md">md</Button>
                  <Button intent={intent} size="lg">lg</Button>
                  <Button intent={intent} size="xl">xl</Button>
                  <Button intent={intent} disabled>disabled</Button>
                  <Button intent={intent} loading>loading</Button>
                </div>
              </ShowcaseCard>
            )
          )}
        </div>
      </Section>

      {/* ── Chips ────────────────────────────────────────────────────────── */}
      <Section id="chips" width="wide" pad="md" bg="white">
        <SectionHeader eyebrow="3" title="Chips" />
        <ShowcaseCard label="<Chip>">
          <div className="flex flex-wrap gap-2">
            <Chip>default</Chip>
            <Chip intent="teal">teal</Chip>
            <Chip intent="amber">amber</Chip>
            <Chip intent="neutral">neutral</Chip>
          </div>
        </ShowcaseCard>
      </Section>

      {/* ── Glass cards ──────────────────────────────────────────────────── */}
      <Section id="glass" width="wide" pad="md" bg="cream-deep">
        <SectionHeader eyebrow="4" title="Glass cards — capped at 12px blur" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <ShowcaseCard label='variant="frost"'>
            <GlassCard variant="frost" className="w-full">
              <p className="font-display text-sm font-bold uppercase tracking-wide text-owl-teal">
                Free this week
              </p>
              <p className="mt-1 text-owl-ink">ABC Printable Pack</p>
            </GlassCard>
          </ShowcaseCard>
          <ShowcaseCard label='variant="light"'>
            <GlassCard variant="light" className="w-full">
              <p className="font-display text-sm font-bold uppercase tracking-wide">Light glass</p>
              <p className="mt-1">For photographic backgrounds.</p>
            </GlassCard>
          </ShowcaseCard>
          <ShowcaseCard label='variant="forest"' inverted>
            <GlassCard variant="forest" className="w-full">
              <p className="font-display text-sm font-bold uppercase tracking-wide">Forest glass</p>
              <p className="mt-1">Dark tint, white text. Use sparingly.</p>
            </GlassCard>
          </ShowcaseCard>
        </div>
      </Section>

      {/* ── Coming Soon ribbon ───────────────────────────────────────────── */}
      <Section id="ribbon" width="wide" pad="md" bg="white">
        <SectionHeader eyebrow="5" title="Coming Soon ribbon" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <ShowcaseCard label='variant="corner"'>
            <div className="relative aspect-square w-full max-w-xs overflow-hidden rounded-owl-card border border-owl-cream-deep bg-owl-amber-soft/40">
              <ComingSoonRibbon variant="corner" />
            </div>
          </ShowcaseCard>
          <ShowcaseCard label='variant="pill"'>
            <div className="relative aspect-square w-full max-w-xs overflow-hidden rounded-owl-card border border-owl-cream-deep bg-owl-teal/15">
              <ComingSoonRibbon variant="pill" />
            </div>
          </ShowcaseCard>
        </div>
      </Section>

      {/* ── Ambient layer ─────────────────────────────────────────────────── */}
      <Section id="ambient" width="wide" pad="md" bg="cream">
        <SectionHeader eyebrow="6" title="Ambient layer — 5 patterns" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
          {(["notes", "leaves", "sparkles", "stars", "paper"] as const).map((pattern) => (
            <ShowcaseCard key={pattern} label={`pattern="${pattern}"`}>
              <div className="relative h-40 w-full overflow-hidden rounded-owl-card bg-owl-white">
                <AmbientLayer pattern={pattern} density={5} seed={pattern.length * 7} />
              </div>
            </ShowcaseCard>
          ))}
        </div>
      </Section>

      {/* ── Video poster resolver ─────────────────────────────────────────── */}
      <Section id="poster" width="wide" pad="md" bg="white">
        <SectionHeader
          eyebrow="7"
          title="VideoPoster — three-tier resolver"
          subtitle="Same component, three sources: local file → YouTube CDN → tonal placeholder."
        />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <ShowcaseCard label="Tier 3 — tonal placeholder (no posterSrc, no youtubeId)">
            <VideoPoster
              tone="teal"
              duration="8 min"
              title="The ABCs with Larissa"
              insideGroup={false}
            />
            <p className="mt-2 text-xs text-owl-mist">
              Skeleton state. Renders for every seed entry today.
            </p>
          </ShowcaseCard>
          <ShowcaseCard label="Tier 2 — YouTube CDN (youtubeId set)">
            <VideoPoster
              tone="amber"
              duration="3:32"
              title="Demo (dQw…)"
              youtubeId="dQw4w9WgXcQ"
              insideGroup={false}
            />
            <p className="mt-2 text-xs text-owl-mist">
              Image from img.youtube.com — proves the CDN tier wires correctly.
            </p>
          </ShowcaseCard>
          <ShowcaseCard label="Tier 1 — local poster (posterSrc set)">
            <VideoPoster
              tone="rose"
              duration="6 min"
              title="Test"
              posterSrc="/images/hero-frames/_dev-smoke/frame-001.svg"
              insideGroup={false}
            />
            <p className="mt-2 text-xs text-owl-mist">
              Uses a smoke fixture as a stand-in local poster. Run{" "}
              <code className="rounded bg-owl-ink/85 px-1.5 py-0.5 text-[10px] text-owl-cream">
                npm run generate:hero-frame-smoke
              </code>{" "}
              first.
            </p>
          </ShowcaseCard>
        </div>

        <div className="mt-8">
          <ShowcaseCard label="<PlayButton> at all sizes">
            <div className="flex flex-wrap items-center gap-6">
              <PlayButton size="sm" tone="light" />
              <PlayButton size="md" tone="light" />
              <PlayButton size="lg" tone="light" />
              <PlayButton size="md" tone="warm" />
            </div>
          </ShowcaseCard>
        </div>
      </Section>

      {/* ── Dev hint banner ──────────────────────────────────────────────── */}
      <Section id="devhint" width="wide" pad="md" bg="cream-deep">
        <SectionHeader eyebrow="8" title="DevHintBanner — never renders in production" />
        <ShowcaseCard label="<DevHintBanner>">
          <DevHintBanner
            title="Example dev hint."
            body="In production this entire banner tree-shakes away. In dev it surfaces the actionable instruction inline so engineers don't think the page is broken."
            hint='// src/lib/seed/videos.ts\n{ slug: "abcs-with-larissa", ..., youtubeId: "<11-char-id>" }'
          />
        </ShowcaseCard>
      </Section>

      {/* ── Product card resolver ────────────────────────────────────────── */}
      <Section id="product" width="wide" pad="md" bg="white">
        <SectionHeader
          eyebrow="9"
          title="ProductCard — resolver + ribbon"
          subtitle="Tonal placeholder is the floor when products[slug].primary is unset. Coming Soon ribbon shown on every card today."
        />
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
          {SAMPLE_PRODUCTS.map((p) => (
            <ProductCard key={p.slug} {...p} />
          ))}
        </div>
      </Section>

      {/* ── Hero frame sequence ──────────────────────────────────────────── */}
      <Section id="hero-seq" width="wide" pad="md" bg="cream">
        <SectionHeader
          eyebrow="10"
          title="HeroFrameSequence — _dev-smoke slug"
          subtitle="Scrub through 6 dev-fixture frames as you scroll past. Run `npm run generate:hero-frame-smoke` first. In reduced-motion mode, only frame 1 renders."
        />
        <p className="mb-4 text-sm text-owl-mist">
          ↓ Scroll the page; the canvas below scrubs through frames 01 → 06.
        </p>
        <HeroFrameSequence slug="_dev-smoke" scrollDistance="120vh" />
        <div className="mt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-owl-teal px-4 py-2 text-sm font-semibold text-white shadow-owl-1 transition-colors hover:bg-owl-teal-deep"
          >
            <Sparkles className="h-4 w-4" />
            Back to home
            <Play className="h-3 w-3" />
          </Link>
        </div>
      </Section>
    </>
  );
}

/* ── Small helpers (kept local, single-file showcase intentional) ────────── */

function ShowcaseCard({
  label,
  children,
  inverted = false,
}: {
  label: string;
  children: React.ReactNode;
  inverted?: boolean;
}) {
  return (
    <div
      className={
        "relative rounded-owl-card border p-4 " +
        (inverted
          ? "border-owl-forest/30 bg-owl-forest/10"
          : "border-owl-cream-deep bg-owl-white")
      }
    >
      <p className="mb-3 font-mono text-[11px] font-bold uppercase tracking-wider text-owl-mist">
        {label}
      </p>
      {children}
    </div>
  );
}

const SAMPLE_PRODUCTS = [
  {
    slug: "larissa-plush",
    title: "Larissa plush set",
    price: "$29.99",
    ageRange: "0–5",
    category: "Plush",
    tone: "amber" as const,
    isComingSoon: true,
  },
  {
    slug: "abc-flash-cards",
    title: "ABC flash cards",
    price: "$19.99",
    ageRange: "2–5",
    category: "Flashcards",
    tone: "teal" as const,
    isComingSoon: true,
  },
  {
    slug: "feelings-coloring",
    title: "Feelings coloring book",
    price: "$12.99",
    ageRange: "2–5",
    category: "Coloring",
    tone: "rose" as const,
    isComingSoon: true,
  },
  {
    slug: "sticker-reward-chart",
    title: "Sticker reward chart",
    price: "$13.99",
    ageRange: "3–7",
    category: "Stickers",
    tone: "forest" as const,
    isComingSoon: false,
  },
  {
    slug: "homeschool-starter",
    title: "Homeschool starter bundle",
    price: "$34.99",
    ageRange: "2–5",
    category: "Digital",
    tone: "cream" as const,
    isComingSoon: true,
  },
];

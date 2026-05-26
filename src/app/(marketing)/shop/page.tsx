import Link from "next/link";
import {
  ShoppingBag,
  Sparkles,
  Download,
} from "lucide-react";
import { pageMetadata } from "@/lib/seo/metadata";

import { CinematicHero } from "@/components/marketing/cinematic-hero";
import { HeroVideo } from "@/components/marketing/hero-video";
import { Section } from "@/components/ui/section";
import { SectionIntro } from "@/components/ui/section-intro";
import { Button } from "@/components/ui/button";
import { CategoryChip } from "@/components/ui/category-chip";
import { Chip } from "@/components/ui/chip";
import { ProductCard } from "@/components/marketing/product-card";
import { MediaRail } from "@/components/marketing/media-rail";
import { StaggerGrid } from "@/components/marketing/stagger-grid";
import { SectionReveal } from "@/components/marketing/section-reveal";
import { AmbientLayer } from "@/components/marketing/ambient-layer";
import { NewsletterSection } from "@/components/marketing/newsletter-section";

import { StreamingPlatforms } from "@/components/marketing/streaming-platforms";
import { SEED_PRODUCTS, PRODUCT_CATEGORY_OPTIONS } from "@/lib/seed/products";

export const metadata = pageMetadata({
  title: "Shop — OWL Sing Together",
  description:
    "Plush, flashcards, coloring books, digital bundles. Multicultural, classroom-ready, built to grow.",
  path: "/shop",
});

/**
 * /shop — v3 (Visual-track Phase 5, premium retail).
 *
 * Page sections:
 *   1. Premium shopping hero (CinematicHero, sequenceSlug="shop-flatlay", slug="shop")
 *   2. Shop-by-category row (CategoryChips)
 *   3. Featured products (MediaRail)
 *   4. Seasonal bundles (StaggerGrid, 3 curated bundles)
 *   5. Digital downloads / resources (MediaRail, filtered to digital channels)
 *   6. Bestsellers (MediaRail)
 *   7. Newsletter band
 *   + <StickyMiniCart> mounted with demo state (Phase 3 will wire real cart)
 *
 * Coming Soon ribbons: every <ProductCard> renders its ribbon when
 * `isComingSoon: true` (currently true for every seed entry — commerce isn't
 * wired). The ribbon is built into the card; no per-page work to enable it.
 *
 * Motion vocabulary: premium retail — restrained stagger, generous whitespace,
 * cinematic poster moments. Sparkles ambient at low density throughout the hero
 * to lift the editorial feel.
 */

const SEASONAL_BUNDLES = [
  {
    name: "Back-to-school starter",
    eyebrow: "Aug · Sep",
    summary: "Flashcards + emotion tiles + a parent guide. Set up September in one box.",
    skuCount: 3,
    priceFrom: "$54",
    tone: "amber" as const,
  },
  {
    name: "Diwali home bundle",
    eyebrow: "Oct · Nov",
    summary: "Rangoli coloring sheets, lamp craft template, and the Diwali Lights song download.",
    skuCount: 4,
    priceFrom: "$24",
    tone: "rose" as const,
  },
  {
    name: "Winter wind-down",
    eyebrow: "Dec · Jan",
    summary: "Lullaby album + bedtime printable pack + plush. Slow December evenings.",
    skuCount: 3,
    priceFrom: "$62",
    tone: "forest" as const,
  },
];

export default function ShopPage() {
  const featured = SEED_PRODUCTS.filter((p) => p.featured);
  const bestsellers = SEED_PRODUCTS.filter((p) => p.featured).slice(0, 4);
  const digitalDownloads = SEED_PRODUCTS.filter((p) =>
    ["gumroad", "kdp", "tpt"].includes(p.channel)
  );
  const all = SEED_PRODUCTS;

  return (
    <>
      {/* 1 — Premium shopping hero with store video */}
      <CinematicHero
        tone="cream"
        slug="shop"
        bannerAspect="wide"
        bannerSlot={
          <HeroVideo
            src="/videos/store-hero.mp4"
            poster="/images/headers/shop-hero.png"
          />
        }
        eyebrow="Shop OWLsome goods"
        heading={
          <>
            Shop Our{" "}
            <span className="text-owl-teal">OWLsome</span>{" "}
            Sing-Along Goods!
          </>
        }
        subhead="Print-on-demand plush, flashcards, coloring books, and digital bundles. Multicultural, classroom-ready, parent-approved."
        primaryCta={
          <Button intent="primary" size="lg" asChild>
            <Link href="#featured">
              <ShoppingBag className="h-4 w-4" aria-hidden />
              Shop now
            </Link>
          </Button>
        }
        secondaryCta={
          <Button intent="secondary" size="lg" asChild>
            <Link href="/newsletter">
              <Sparkles className="h-4 w-4" aria-hidden />
              Get launch updates
            </Link>
          </Button>
        }
        ambient={<AmbientLayer pattern="sparkles" density={4} seed={167} />}
      />

      {/* 2 — Shop-by-category row */}
      <SectionReveal>
        <Section width="wide" pad="md" bg="cream">
          <div className="flex flex-col items-center gap-3 md:flex-row md:flex-wrap md:justify-center">
            <p className="font-display text-xs font-bold uppercase tracking-[0.18em] text-owl-mist md:mr-3">
              Shop by category
            </p>
            {PRODUCT_CATEGORY_OPTIONS.map((c) => (
              <CategoryChip
                key={c.value}
                href={`/shop?category=${c.value}`}
                label={c.label}
                intent="teal"
              />
            ))}
          </div>
        </Section>
      </SectionReveal>

      {/* 3 — Featured products */}
      <SectionReveal>
        <Section width="wide" pad="lg" bg="cream">
          <SectionIntro
            eyebrow="Featured"
            title="Editor's picks this season"
            subtitle="The seasonal lineup — what we're highlighting right now."
          />
          <MediaRail
            ariaLabel="Featured OWL products"
            columns={{ md: 3, lg: 4 }}
            className="mt-8"
            stagger={0.07}
          >
            {featured.map((p) => (
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

      {/* 4 — Seasonal bundles */}
      <SectionReveal>
        <Section width="wide" pad="lg" bg="white">
          <SectionIntro
            eyebrow="Bundles"
            title="Seasonal bundles"
            subtitle="Curated by season — songs, printables, and physical goods that ship together."
          />
          <StaggerGrid
            asList
            ariaLabel="Seasonal product bundles"
            className="grid grid-cols-1 gap-5 md:grid-cols-3"
            stagger={0.08}
            offsetY={14}
          >
            {SEASONAL_BUNDLES.map((b) => (
              <div
                key={b.name}
                className="relative isolate flex h-full flex-col overflow-hidden rounded-owl-card border border-owl-cream-deep bg-owl-cream p-6 shadow-owl-1 transition-shadow duration-300 ease-owl hover:shadow-owl-2"
              >
                <AmbientLayer pattern="sparkles" density={3} seed={b.name.length * 11} />
                <div className="relative z-text">
                  <Chip intent={b.tone} className="mb-3 self-start">
                    {b.eyebrow}
                  </Chip>
                  <h3 className="font-display text-xl font-bold text-owl-ink">{b.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-owl-mist">{b.summary}</p>
                  <div className="mt-4 flex items-baseline gap-3">
                    <p className="font-display text-2xl font-extrabold text-owl-teal">{b.priceFrom}</p>
                    <p className="text-xs text-owl-mist">/ bundle · {b.skuCount} items</p>
                  </div>
                  <Button intent="secondary" size="md" asChild className="mt-5 self-start">
                    <Link href="/newsletter">Notify when bundle drops</Link>
                  </Button>
                </div>
              </div>
            ))}
          </StaggerGrid>
        </Section>
      </SectionReveal>

      {/* 5 — Digital downloads / resources */}
      <SectionReveal>
        <Section width="wide" pad="lg" bg="cream-deep">
          <SectionIntro
            eyebrow="Instant"
            title="Digital downloads & resources"
            subtitle="Printable bundles + standards crosswalks. Delivered to your inbox the moment commerce is live."
          />
          <MediaRail
            ariaLabel="Digital OWL products"
            columns={{ md: 3, lg: 4 }}
            className="mt-8"
            stagger={0.05}
          >
            {digitalDownloads.map((p) => (
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
          <div className="mt-8 flex justify-center">
            <Button intent="tertiary" size="lg" asChild>
              <Link href="/printables">
                <Download className="h-4 w-4" aria-hidden />
                Browse free printables
              </Link>
            </Button>
          </div>
        </Section>
      </SectionReveal>

      {/* 6 — Bestsellers */}
      <SectionReveal>
        <Section width="wide" pad="lg" bg="cream" id="bestsellers">
          <SectionIntro
            eyebrow="Family favorites"
            title="Bestsellers"
            subtitle="Most-requested SKUs once commerce wakes up."
          />
          <MediaRail
            ariaLabel="OWL bestselling products"
            columns={{ md: 3, lg: 4 }}
            className="mt-8"
            stagger={0.07}
          >
            {bestsellers.map((p) => (
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

      {/* 7 — Full store grid */}
      <SectionReveal>
        <Section width="wide" pad="lg" bg="white" id="all-products">
          <SectionIntro
            eyebrow="The full store"
            title="Browse everything"
            subtitle="Multicultural, classroom-ready, parent-approved."
          />
          <MediaRail
            ariaLabel="All OWL products"
            columns={{ md: 3, lg: 4 }}
            className="mt-8"
            stagger={0.04}
          >
            {all.map((p) => (
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

      {/* Streaming + Download CTA row */}
      <SectionReveal>
        <Section width="wide" pad="lg" bg="cream-deep">
          <SectionIntro
            eyebrow="Listen & download"
            title="Music + free activity sheets"
            subtitle="Stream OWL songs on your favorite platform, or download free activity sheets for every video."
            align="center"
          />
          <div className="mt-6 flex justify-center">
            <StreamingPlatforms
              spotify="https://open.spotify.com/artist/example"
              appleMusic="https://music.apple.com/artist/example"
              youtubeMusic="https://music.youtube.com/channel/example"
              amazonMusic="https://music.amazon.com/artists/example"
            />
          </div>
          <div className="mt-5 flex justify-center">
            <Button intent="tertiary" size="lg" asChild>
              <Link href="/printables">
                <Download className="h-4 w-4" aria-hidden />
                Download free activity sheets
              </Link>
            </Button>
          </div>
        </Section>
      </SectionReveal>

      <SectionReveal>
        <NewsletterSection />
      </SectionReveal>

      {/*
        Sticky mini-cart — UNMOUNTED here pending Phase-3 commerce wake-up.

        Previously this page mounted a dev-only demo cart for visual QA. That
        demo was the lone primitive unique to /shop that the other 4 working
        pages don't render, and isolating it lets us confirm it was the
        cause of /shop not loading. The component itself is still in the
        codebase at `src/components/marketing/sticky-mini-cart.tsx` — wire
        it back in when Stripe + Shopify go live (OWL build plan Phase 3),
        feeding `itemCount` and `total` from a real cart store.

        To re-enable demo visually in dev, restore the import + the
        `process.env.NODE_ENV !== "production" && <StickyMiniCart … />` block.
      */}
    </>
  );
}

import Link from "next/link";
import { Download, Heart, Layers, Palette, Star, Monitor, Music2 } from "lucide-react";
import { pageMetadata } from "@/lib/seo/metadata";

import { VideoHeroBanner } from "@/components/marketing/video-hero-banner";
import { Section } from "@/components/ui/section";
import { SectionIntro } from "@/components/ui/section-intro";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { ProductCard } from "@/components/marketing/product-card";
import { StaggerGrid } from "@/components/marketing/stagger-grid";
import { SectionReveal } from "@/components/marketing/section-reveal";
import { NewsletterSection } from "@/components/marketing/newsletter-section";
import { StreamingPlatforms } from "@/components/marketing/streaming-platforms";
import { SEED_PRODUCTS } from "@/lib/seed/products";

export const metadata = pageMetadata({
  title: "Shop — OWL Sing Together",
  description:
    "Plush, flashcards, coloring books, digital bundles. Multicultural, classroom-ready, built to grow.",
  path: "/shop",
});

/**
 * /shop — v4 (Visual-track Phase 5, premium retail).
 *
 * Sections:
 *   1. Hero
 *   2. Category icon-button navigation (6 colorful cards)
 *   3. Per-category product sections (anchor-linked from nav)
 *   4. Seasonal bundles
 *   5. Streaming + download CTA
 *   6. Newsletter band
 */

const SHOP_CATEGORIES = [
  {
    value: "Plush",
    label: "Plush",
    icon: Heart,
    anchor: "shop-plush",
    cardGrad: "bg-gradient-to-br from-[#fce8e4] via-[#fdf3f1] to-[#fff8ec]",
    bar: "bg-owl-rose",
    iconBg: "bg-owl-rose/15",
    iconColor: "text-owl-rose",
    eyebrow: "text-owl-rose",
    hoverBorder: "hover:border-owl-rose/50",
  },
  {
    value: "Flashcards",
    label: "Flashcards",
    icon: Layers,
    anchor: "shop-flashcards",
    cardGrad: "bg-gradient-to-br from-[#e5f8f4] via-[#f0faf7] to-[#fff8ec]",
    bar: "bg-owl-teal",
    iconBg: "bg-owl-teal/15",
    iconColor: "text-owl-teal",
    eyebrow: "text-owl-teal",
    hoverBorder: "hover:border-owl-teal/50",
  },
  {
    value: "Coloring",
    label: "Coloring",
    icon: Palette,
    anchor: "shop-coloring",
    cardGrad: "bg-gradient-to-br from-[#fef3d8] via-[#fdf7eb] to-[#eefae5]",
    bar: "bg-owl-amber",
    iconBg: "bg-owl-amber/20",
    iconColor: "text-owl-amber",
    eyebrow: "text-owl-amber",
    hoverBorder: "hover:border-owl-amber/50",
  },
  {
    value: "Stickers",
    label: "Stickers",
    icon: Star,
    anchor: "shop-stickers",
    cardGrad: "bg-gradient-to-br from-[#dff0e6] via-[#eef6f1] to-[#fff8ec]",
    bar: "bg-owl-forest",
    iconBg: "bg-owl-forest/15",
    iconColor: "text-owl-forest",
    eyebrow: "text-owl-forest",
    hoverBorder: "hover:border-owl-forest/40",
  },
  {
    value: "Digital",
    label: "Digital",
    icon: Monitor,
    anchor: "shop-digital",
    cardGrad: "bg-gradient-to-br from-[#e6edf5] via-[#f1f5fa] to-[#fff8ec]",
    bar: "bg-owl-mist",
    iconBg: "bg-owl-mist/20",
    iconColor: "text-owl-mist",
    eyebrow: "text-owl-mist",
    hoverBorder: "hover:border-owl-mist/50",
  },
  {
    value: "Music",
    label: "Music",
    icon: Music2,
    anchor: "shop-music",
    cardGrad: "bg-gradient-to-br from-[#fef3d8] via-[#fff0e0] to-[#fff8ec]",
    bar: "bg-owl-amber",
    iconBg: "bg-owl-amber/15",
    iconColor: "text-[#c47d18]",
    eyebrow: "text-[#c47d18]",
    hoverBorder: "hover:border-owl-amber/50",
  },
] as const;

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

/** Pick grid columns that minimize orphaned items in the last row. */
function gridCols(count: number): string {
  if (count === 1) return "grid-cols-1";
  if (count === 2) return "grid-cols-1 sm:grid-cols-2";
  if (count === 3) return "grid-cols-1 sm:grid-cols-3";
  if (count === 5) return "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5";
  if (count % 4 === 0) return "grid-cols-2 md:grid-cols-4";
  if (count % 3 === 0) return "grid-cols-2 md:grid-cols-3";
  // For numbers like 7 (prime), 4-col gives 4+3 — best visual on desktop
  return "grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
}

export default function ShopPage() {
  return (
    <>
      {/* 1 — Hero */}
      <VideoHeroBanner
        src="/videos/shop-hero.mp4"
        poster="/images/headers/shop-hero.png"
        eyebrow="Shop"
        heading={
          <>
            Shop Our{" "}
            <span className="text-owl-teal">OWLsome Sing-Along Goods!</span>
          </>
        }
        subhead="Books, plush toys, flash cards, and classroom bundles — each one designed to make learning feel like play."
        primaryCta={{ label: "Shop Now", href: "#shop-plush" }}
        secondaryCta={{ label: "Free Printables", href: "/printables" }}
      />

      {/* 2 — Category icon-button navigation */}
      <SectionReveal>
        <Section width="wide" pad="lg" bg="cream">
          <SectionIntro
            eyebrow="Shop by category"
            title="Find what you're looking for"
            subtitle="Every OWL product, organized by type. Click a category to jump right there."
            align="center"
          />
          <ul
            role="list"
            aria-label="Shop by category"
            className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6"
          >
            {SHOP_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <li key={cat.value}>
                  <Link
                    href={`#${cat.anchor}`}
                    aria-label={`Browse ${cat.label}`}
                    className={[
                      "group relative flex flex-col items-center overflow-hidden rounded-owl-card",
                      cat.cardGrad,
                      "border border-owl-cream-deep/70 shadow-owl-1",
                      "transition-all duration-300 ease-owl",
                      "hover:-translate-y-1.5 hover:shadow-owl-2",
                      cat.hoverBorder,
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-owl-teal focus-visible:ring-offset-2",
                      "py-6 px-4",
                    ].join(" ")}
                  >
                    {/* Top colour bar */}
                    <span
                      aria-hidden
                      className={"pointer-events-none absolute inset-x-0 top-0 h-2 " + cat.bar}
                    />
                    {/* Icon disc */}
                    <span
                      className={[
                        "mt-2 inline-flex h-14 w-14 items-center justify-center rounded-full",
                        "transition-transform duration-300 ease-owl group-hover:scale-110",
                        cat.iconBg,
                        cat.iconColor,
                      ].join(" ")}
                    >
                      <Icon className="h-7 w-7" aria-hidden />
                    </span>
                    {/* Label */}
                    <p className="mt-3 font-display text-sm font-bold text-owl-ink">
                      {cat.label}
                    </p>
                    <p
                      className={[
                        "mt-0.5 font-display text-xs font-semibold transition-colors duration-200",
                        cat.iconColor,
                      ].join(" ")}
                    >
                      Shop →
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Section>
      </SectionReveal>

      {/* 3 — Per-category product sections */}
      {SHOP_CATEGORIES.map((cat, catIdx) => {
        const products = SEED_PRODUCTS.filter((p) => p.category === cat.value);
        if (products.length === 0) return null;
        const CatIcon = cat.icon;
        const cols = gridCols(products.length);
        const bg = catIdx % 2 === 0 ? ("white" as const) : ("cream" as const);
        const isSolo = products.length === 1;

        return (
          <SectionReveal key={cat.value}>
            <Section width="wide" pad="lg" bg={bg} id={cat.anchor}>
              {/* Section header */}
              <div className="mb-8 flex items-center gap-4">
                <span
                  className={[
                    "inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full",
                    cat.iconBg,
                    cat.iconColor,
                  ].join(" ")}
                >
                  <CatIcon className="h-6 w-6" aria-hidden />
                </span>
                <div>
                  <p
                    className={[
                      "font-display text-xs font-bold uppercase tracking-[0.18em]",
                      cat.eyebrow,
                    ].join(" ")}
                  >
                    Shop
                  </p>
                  <h2 className="font-display text-2xl font-extrabold text-owl-ink sm:text-3xl">
                    {cat.label}
                  </h2>
                </div>
              </div>

              {/* Product grid */}
              <ul
                role="list"
                aria-label={cat.label + " products"}
                className={[
                  "grid gap-6",
                  cols,
                  isSolo ? "max-w-xs" : "",
                ].join(" ")}
              >
                {products.map((p) => (
                  <li key={p.slug}>
                    <ProductCard
                      slug={p.slug}
                      title={p.title}
                      price={p.price}
                      ageRange={p.ageRange}
                      category={p.category}
                      tone={p.tone}
                      isComingSoon={p.isComingSoon}
                    />
                  </li>
                ))}
              </ul>
            </Section>
          </SectionReveal>
        );
      })}

      {/* 4 — Seasonal bundles */}
      <SectionReveal>
        <Section width="wide" pad="lg" bg="cream-deep">
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
                <div className="relative z-text">
                  <Chip intent={b.tone} className="mb-3 self-start">
                    {b.eyebrow}
                  </Chip>
                  <h3 className="font-display text-xl font-bold text-owl-ink">{b.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-owl-mist">{b.summary}</p>
                  <div className="mt-4 flex items-baseline gap-3">
                    <p className="font-display text-2xl font-extrabold text-owl-teal">
                      {b.priceFrom}
                    </p>
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

      {/* 5 — Streaming + Download CTA */}
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
        Previously this page mounted a dev-only demo cart for visual QA. That
        demo was the lone primitive unique to /shop that the other 4 working
        pages don't render, and isolating it lets us confirm it was the
        cause of /shop not loading. The component itself is still in the
        codebase at `src/components/marketing/sticky-mini-cart.tsx` --- wire
        it back in when Stripe + Shopify go live (OWL build plan Phase 3),
        feeding `itemCount` and `total` from a real cart store.

        To re-enable demo visually in dev, restore the import + the
        `process.env.NODE_ENV !== "production" && <StickyMiniCart ... />` block.
      */}
    </>
  );
}

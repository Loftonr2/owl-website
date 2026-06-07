import Link from "next/link";
import {
  Download,
  Heart,
  Layers,
  Palette,
  Star,
  Monitor,
  Music2,
  Shirt,
  HardHat,
  Coffee,
  Home,
  MoreHorizontal,
  ArrowRight,
} from "lucide-react";
import { pageMetadata } from "@/lib/seo/metadata";

import { VideoHeroBanner } from "@/components/marketing/video-hero-banner";
import { Section } from "@/components/ui/section";
import { SectionIntro } from "@/components/ui/section-intro";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { ProductCard } from "@/components/marketing/product-card";
import { SectionReveal } from "@/components/marketing/section-reveal";
import { NewsletterSection } from "@/components/marketing/newsletter-section";
import { StreamingPlatforms } from "@/components/marketing/streaming-platforms";
import { SEED_PRODUCTS } from "@/lib/seed/products";

export const metadata = pageMetadata({
  title: "Shop — OWL Sing Together",
  description:
    "Plush, stickers, apparel, drinkware, flashcards, and more. Multicultural, classroom-ready, built to grow.",
  path: "/shop",
});

/** Convert category name to URL slug */
function categorySlug(cat: string): string {
  return cat.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

/** All shop categories with branding */
const SHOP_CATEGORIES = [
  {
    value: "Apparel",
    label: "Apparel",
    icon: Shirt,
    cardGrad: "bg-gradient-to-br from-[#fce8e4] via-[#fdf3f1] to-[#fff8ec]",
    bar: "bg-owl-rose",
    iconBg: "bg-owl-rose/15",
    iconColor: "text-owl-rose",
    eyebrow: "text-owl-rose",
    hoverBorder: "hover:border-owl-rose/50",
    featuredSlugs: ["owl-t-shirt", "owl-cotton-kids-t-shirt", "owl-infant-bodysuit", "owl-sweatshirt"],
  },
  {
    value: "Headwear",
    label: "Headwear",
    icon: HardHat,
    cardGrad: "bg-gradient-to-br from-[#fef3d8] via-[#fdf7eb] to-[#fff8ec]",
    bar: "bg-owl-amber",
    iconBg: "bg-owl-amber/20",
    iconColor: "text-owl-amber",
    eyebrow: "text-owl-amber",
    hoverBorder: "hover:border-owl-amber/50",
    featuredSlugs: ["owl-flat-bill-cap", "owl-embroidered-beanie"],
  },
  {
    value: "Drinkware",
    label: "Drinkware",
    icon: Coffee,
    cardGrad: "bg-gradient-to-br from-[#e5f8f4] via-[#f0faf7] to-[#fff8ec]",
    bar: "bg-owl-teal",
    iconBg: "bg-owl-teal/15",
    iconColor: "text-owl-teal",
    eyebrow: "text-owl-teal",
    hoverBorder: "hover:border-owl-teal/50",
    featuredSlugs: ["owl-enamel-mug", "owl-wine-tumbler", "owl-insulated-tumbler", "owl-glossy-mug"],
  },
  {
    value: "Home & Accessories",
    label: "Home",
    icon: Home,
    cardGrad: "bg-gradient-to-br from-[#dff0e6] via-[#eef6f1] to-[#fff8ec]",
    bar: "bg-owl-forest",
    iconBg: "bg-owl-forest/15",
    iconColor: "text-owl-forest",
    eyebrow: "text-owl-forest",
    hoverBorder: "hover:border-owl-forest/40",
    featuredSlugs: ["owl-backpack", "owl-water-bottle", "owl-tote-bag", "owl-throw-blanket"],
  },
  {
    value: "Stickers",
    label: "Stickers",
    icon: Star,
    cardGrad: "bg-gradient-to-br from-[#ede9fe] via-[#f3f0ff] to-[#fff8ec]",
    bar: "bg-[#7c3aed]",
    iconBg: "bg-[#7c3aed]/15",
    iconColor: "text-[#7c3aed]",
    eyebrow: "text-[#7c3aed]",
    hoverBorder: "hover:border-[#7c3aed]/40",
    featuredSlugs: ["owl-holographic-stickers", "owl-animal-sticker-set", "owl-holiday-sticker-set", "owl-abcs-sticker-set"],
  },
  {
    value: "Plush",
    label: "Plush",
    icon: Heart,
    cardGrad: "bg-gradient-to-br from-[#fce8e4] via-[#fdf3f1] to-[#fff8ec]",
    bar: "bg-owl-rose",
    iconBg: "bg-owl-rose/15",
    iconColor: "text-owl-rose",
    eyebrow: "text-owl-rose",
    hoverBorder: "hover:border-owl-rose/50",
    featuredSlugs: ["larissa-plush", "plush-bedtime-friends", "plush-ocean-friends", "plush-safari-friends"],
  },
  {
    value: "Flashcards",
    label: "Flashcards",
    icon: Layers,
    cardGrad: "bg-gradient-to-br from-[#e5f8f4] via-[#f0faf7] to-[#fff8ec]",
    bar: "bg-owl-teal",
    iconBg: "bg-owl-teal/15",
    iconColor: "text-owl-teal",
    eyebrow: "text-owl-teal",
    hoverBorder: "hover:border-owl-teal/50",
    featuredSlugs: ["bilingual-word-cards", "abc-flash-cards", "rhyme-time-game", "emotion-tiles"],
  },
  {
    value: "Coloring",
    label: "Coloring",
    icon: Palette,
    cardGrad: "bg-gradient-to-br from-[#fef3d8] via-[#fdf7eb] to-[#eefae5]",
    bar: "bg-owl-amber",
    iconBg: "bg-owl-amber/20",
    iconColor: "text-owl-amber",
    eyebrow: "text-owl-amber",
    hoverBorder: "hover:border-owl-amber/50",
    featuredSlugs: ["feelings-coloring", "numbers-math-coloring", "abc-coloring-book", "abcs-world-coloring"],
  },
  {
    value: "Digital",
    label: "Digital",
    icon: Monitor,
    cardGrad: "bg-gradient-to-br from-[#e6edf5] via-[#f1f5fa] to-[#fff8ec]",
    bar: "bg-[#1d6fb5]",
    iconBg: "bg-[#1d6fb5]/15",
    iconColor: "text-[#1d6fb5]",
    eyebrow: "text-[#1d6fb5]",
    hoverBorder: "hover:border-[#1d6fb5]/40",
    featuredSlugs: ["owl-babies-bundle", "homeschool-starter"],
  },
  {
    value: "Music",
    label: "Music",
    icon: Music2,
    cardGrad: "bg-gradient-to-br from-[#fef3d8] via-[#fff0e0] to-[#fff8ec]",
    bar: "bg-owl-amber",
    iconBg: "bg-owl-amber/15",
    iconColor: "text-[#c47d18]",
    eyebrow: "text-[#c47d18]",
    hoverBorder: "hover:border-owl-amber/50",
    featuredSlugs: ["lullaby-album", "counting-math-album", "abc-adventure-album", "around-world-album"],
  },
  {
    value: "Other",
    label: "Other",
    icon: MoreHorizontal,
    cardGrad: "bg-gradient-to-br from-[#f1f5f9] via-[#f8fafc] to-[#fff8ec]",
    bar: "bg-owl-mist",
    iconBg: "bg-owl-mist/20",
    iconColor: "text-owl-mist",
    eyebrow: "text-owl-mist",
    hoverBorder: "hover:border-owl-mist/50",
    featuredSlugs: [] as string[],
  },
] as const;

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
        subhead="Apparel, stickers, drinkware, flashcards, and more — each one designed to make learning feel like play."
        primaryCta={{ label: "Shop Now", href: "#shop-apparel" }}
        secondaryCta={{ label: "View All Products", href: "/shop/all-products" }}
      />

      {/* 2 — Category icon navigation */}
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
            className="mt-8 grid grid-cols-3 gap-4 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-12"
          >
            {SHOP_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <li key={cat.value}>
                  <Link
                    href={`#shop-${categorySlug(cat.value)}`}
                    aria-label={`Browse ${cat.label}`}
                    className={[
                      "group relative flex flex-col items-center overflow-hidden rounded-owl-card",
                      cat.cardGrad,
                      "border border-owl-cream-deep/70 shadow-owl-1",
                      "transition-all duration-300 ease-owl",
                      "hover:-translate-y-1.5 hover:shadow-owl-2",
                      cat.hoverBorder,
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-owl-teal focus-visible:ring-offset-2",
                      "py-5 px-3",
                    ].join(" ")}
                  >
                    <span aria-hidden className={"pointer-events-none absolute inset-x-0 top-0 h-1.5 " + cat.bar} />
                    <span
                      className={[
                        "mt-1 inline-flex h-12 w-12 items-center justify-center rounded-full",
                        "transition-transform duration-300 ease-owl group-hover:scale-110",
                        cat.iconBg,
                        cat.iconColor,
                      ].join(" ")}
                    >
                      <Icon className="h-6 w-6" aria-hidden />
                    </span>
                    <p className={["mt-2.5 font-display text-xs font-bold text-center", cat.iconColor].join(" ")}>
                      {cat.label}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
          {/* View All link */}
          <div className="mt-6 flex justify-center">
            <Link
              href="/shop/all-products"
              className="flex items-center gap-2 rounded-full border border-owl-teal/40 bg-owl-teal/10 px-6 py-2.5 font-display text-sm font-semibold text-owl-teal transition-all hover:bg-owl-teal/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-owl-teal"
            >
              View All Products
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Section>
      </SectionReveal>

      {/* 3 — Category product sections (4 each + See More) */}
      {SHOP_CATEGORIES.map((cat, catIdx) => {
        // Get featured products for this category, fallback to category filter
        const featured = cat.featuredSlugs.length > 0
          ? cat.featuredSlugs
              .map(slug => SEED_PRODUCTS.find(p => p.slug === slug))
              .filter((p): p is NonNullable<typeof p> => !!p)
          : SEED_PRODUCTS.filter(p => p.category === cat.value).slice(0, 4);

        if (featured.length === 0) return null;

        const totalInCat = SEED_PRODUCTS.filter(p => p.category === cat.value).length;
        const bg = catIdx % 2 === 0 ? ("white" as const) : ("cream" as const);

        return (
          <SectionReveal key={cat.value}>
            <Section width="wide" pad="lg" bg={bg} id={`shop-${categorySlug(cat.value)}`}>
              {/* Section header */}
              <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span
                    className={[
                      "inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full",
                      cat.iconBg,
                      cat.iconColor,
                    ].join(" ")}
                  >
                    <cat.icon className="h-6 w-6" aria-hidden />
                  </span>
                  <div>
                    <p className={["font-display text-xs font-bold uppercase tracking-[0.18em]", cat.eyebrow].join(" ")}>
                      Shop
                    </p>
                    <h2 className="font-display text-2xl font-extrabold text-owl-ink sm:text-3xl">
                      {cat.label}
                    </h2>
                  </div>
                </div>
                {totalInCat > 4 && (
                  <Link
                    href={`/shop/${categorySlug(cat.value)}`}
                    className={[
                      "hidden sm:flex items-center gap-2 rounded-full px-5 py-2 font-display text-sm font-bold transition-all",
                      "border-2 shadow-sm hover:scale-[1.02]",
                      cat.iconColor,
                      cat.hoverBorder.replace("hover:", ""),
                      "bg-transparent hover:bg-white/50",
                    ].join(" ")}
                  >
                    See all {totalInCat}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </div>

              {/* 4-product grid */}
              <ul
                role="list"
                aria-label={cat.label + " products"}
                className="grid grid-cols-2 gap-6 sm:grid-cols-4"
              >
                {featured.map((p) => (
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

              {/* See More button — mobile + when more than 4 */}
              {totalInCat > 4 && (
                <div className="mt-8 flex justify-center sm:justify-end">
                  <Link
                    href={`/shop/${categorySlug(cat.value)}`}
                    className={[
                      "group relative inline-flex items-center gap-2 overflow-hidden rounded-full px-7 py-3",
                      "font-display text-sm font-bold text-white shadow-owl-1",
                      "transition-all duration-300 hover:scale-[1.03] hover:shadow-owl-2",
                      cat.bar,
                    ].join(" ")}
                  >
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-full"
                    />
                    <span className="relative">See More {cat.label}</span>
                    <ArrowRight className="relative h-4 w-4" />
                  </Link>
                </div>
              )}
            </Section>
          </SectionReveal>
        );
      })}

      {/* 4 — Streaming + Download CTA */}
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
    </>
  );
}

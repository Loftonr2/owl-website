import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Section, SectionHeader } from "@/components/ui/section";
import { ProductCard } from "./product-card";
import { MediaRail } from "./media-rail";
import { SEED_PRODUCTS } from "@/lib/seed/products";

/**
 * Shop Bestsellers row — v2 (redesign).
 *
 * Pulls the first 6 featured products from the seed (single source of truth),
 * renders them through the redesigned <ProductCard> with Coming Soon ribbons,
 * inside a <MediaRail> (snap on mobile, 6-col grid on desktop).
 *
 * Phase 5 (data) swaps SEED_PRODUCTS for `product[featured == true]` from Sanity
 * joined with live Shopify pricing.
 */
export function ShopBestsellers() {
  const featured = SEED_PRODUCTS.filter((p) => p.featured).slice(0, 6);

  return (
    <Section width="wide" pad="lg" bg="cream-deep">
      <SectionHeader
        eyebrow="Shop"
        title="Family favorites"
        subtitle="Print-on-demand, multicultural, classroom-ready. Built to grow with your child."
      />
      <MediaRail
        ariaLabel="Bestselling OWL products"
        columns={{ md: 3, lg: 4 }}
        className="mt-8"
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

      <div className="mt-10 text-center">
        <Link
          href="/shop"
          className="group inline-flex items-center gap-1.5 rounded-full px-4 py-2 font-display text-sm font-semibold text-owl-teal transition-all duration-200 ease-owl-quick hover:bg-owl-white hover:text-owl-teal-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-owl-teal focus-visible:ring-offset-2 focus-visible:ring-offset-owl-cream-deep"
        >
          Browse the full shop
          <ArrowRight className="h-4 w-4 transition-transform duration-200 ease-owl-quick group-hover:translate-x-0.5" aria-hidden />
        </Link>
      </div>
    </Section>
  );
}

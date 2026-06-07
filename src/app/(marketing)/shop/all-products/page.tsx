import { Suspense } from "react";
import Link from "next/link";
import { Filter, Search, Package } from "lucide-react";
import { Section } from "@/components/ui/section";
import { SectionIntro } from "@/components/ui/section-intro";
import { ProductCard } from "@/components/marketing/product-card";
import { SectionReveal } from "@/components/marketing/section-reveal";
import { SEED_PRODUCTS, PRODUCT_CATEGORY_OPTIONS } from "@/lib/seed/products";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata({
  title: "All Products — OWL Shop",
  description: "Browse every OWL Sing Together product. Filter by category, status, and source.",
  path: "/shop/all-products",
});

export default function AllProductsPage() {
  const live = SEED_PRODUCTS.filter(p => !p.isComingSoon);
  const coming = SEED_PRODUCTS.filter(p => p.isComingSoon);
  const all = [...live, ...coming];

  const byCategory = PRODUCT_CATEGORY_OPTIONS.map(cat => ({
    cat,
    products: all.filter(p => p.category === cat.value),
  })).filter(({ products }) => products.length > 0);

  const printifyCount = all.filter(p => {
    const s = (p as { productSource?: string }).productSource;
    return s === "printify";
  }).length;

  return (
    <>
      <Section width="wide" pad="lg" bg="cream">
        <div className="mb-2 text-xs text-owl-mist">
          <Link href="/shop" className="hover:text-owl-teal transition-colors">Shop</Link>
          {" / "}
          <span className="font-semibold text-owl-ink">All Products</span>
        </div>

        <SectionIntro
          eyebrow="Master inventory"
          title="All Products"
          subtitle={`${all.length} total — ${live.length} available now, ${coming.length} coming soon`}
        />

        {/* Stats row */}
        <div className="mt-6 flex flex-wrap gap-3">
          {[
            { label: "Available Now", count: live.length, color: "bg-green-100 text-green-800" },
            { label: "Coming Soon", count: coming.length, color: "bg-owl-amber/20 text-owl-amber" },
            { label: "Printify Products", count: printifyCount, color: "bg-blue-100 text-blue-700" },
          ].map(({ label, count, color }) => (
            <span key={label} className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold ${color}`}>
              {count} {label}
            </span>
          ))}
        </div>

        {/* Category filter pills */}
        <div className="mt-6 flex flex-wrap gap-2">
          {byCategory.map(({ cat, products }) => (
            <a
              key={cat.value}
              href={`#allcat-${cat.value.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-owl-cream-deep bg-owl-white px-4 py-1.5 text-xs font-semibold text-owl-ink transition-all hover:border-owl-teal/50 hover:text-owl-teal"
            >
              {cat.label}
              <span className="rounded-full bg-owl-cream-deep px-1.5 py-0.5 text-[10px] font-bold text-owl-mist">
                {products.length}
              </span>
            </a>
          ))}
        </div>
      </Section>

      {/* Per-category sections */}
      {byCategory.map(({ cat, products }, idx) => (
        <SectionReveal key={cat.value}>
          <Section
            width="wide"
            pad="lg"
            bg={idx % 2 === 0 ? "white" : "cream"}
            id={`allcat-${cat.value.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="font-display text-xs font-bold uppercase tracking-[0.18em] text-owl-teal">
                  {cat.label}
                </p>
                <h2 className="mt-1 font-display text-xl font-bold text-owl-ink">
                  {products.length} product{products.length !== 1 ? "s" : ""}
                </h2>
              </div>
              <Link
                href={`/shop/${cat.value.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                className="text-sm font-semibold text-owl-teal hover:underline"
              >
                View category →
              </Link>
            </div>
            <ul
              role="list"
              aria-label={cat.label + " products"}
              className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6"
            >
              {products.map(p => (
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
      ))}
    </>
  );
}

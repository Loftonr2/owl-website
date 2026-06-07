"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Search, SlidersHorizontal } from "lucide-react";
import { ProductCard } from "@/components/marketing/product-card";
import { Section } from "@/components/ui/section";
import { SectionIntro } from "@/components/ui/section-intro";
import { SEED_PRODUCTS, PRODUCT_CATEGORY_OPTIONS } from "@/lib/seed/products";
import { use } from "react";

type SortOption = "featured" | "newest" | "price-asc" | "price-desc" | "available-first";

function parsePrice(price: string): number {
  return parseFloat(price.replace(/[^0-9.]/g, "")) || 0;
}

function categoryLabel(slug: string): string {
  const found = PRODUCT_CATEGORY_OPTIONS.find(
    c => c.value.toLowerCase().replace(/[^a-z0-9]+/g, "-") === slug
  );
  return found?.label ?? slug.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
}

export default function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = use(params);
  const [sort, setSort] = useState<SortOption>("available-first");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const PER_PAGE = 12;

  // Map URL slug back to category value
  const catValue = PRODUCT_CATEGORY_OPTIONS.find(
    c => c.value.toLowerCase().replace(/[^a-z0-9]+/g, "-") === category
  )?.value ?? category;

  const allInCat = useMemo(() => {
    let list = SEED_PRODUCTS.filter(p => p.category === catValue);
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(p => p.title.toLowerCase().includes(q) || p.slug.includes(q));
    }
    list.sort((a, b) => {
      if (sort === "available-first") {
        if (!a.isComingSoon && b.isComingSoon) return -1;
        if (a.isComingSoon && !b.isComingSoon) return 1;
        return 0;
      }
      if (sort === "price-asc") return parsePrice(a.price) - parsePrice(b.price);
      if (sort === "price-desc") return parsePrice(b.price) - parsePrice(a.price);
      return 0;
    });
    return list;
  }, [catValue, query, sort]);

  const totalPages = Math.ceil(allInCat.length / PER_PAGE);
  const pageItems = allInCat.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const label = categoryLabel(category);

  return (
    <Section width="wide" pad="lg" bg="cream">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm text-owl-mist">
        <Link href="/shop" className="hover:text-owl-teal flex items-center gap-1 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />
          Shop
        </Link>
        <span>/</span>
        <span className="font-semibold text-owl-ink">{label}</span>
      </div>

      <SectionIntro
        eyebrow="Category"
        title={label}
        subtitle={`${allInCat.length} product${allInCat.length !== 1 ? "s" : ""} in ${label}`}
      />

      {/* Filters bar */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-owl-mist" aria-hidden />
          <input
            type="search"
            placeholder="Search..."
            value={query}
            onChange={e => { setQuery(e.target.value); setPage(1); }}
            className="w-full rounded-full border border-owl-cream-deep bg-owl-white py-2 pl-9 pr-4 text-sm text-owl-ink placeholder:text-owl-mist focus:border-owl-teal/50 focus:outline-none focus:ring-2 focus:ring-owl-teal/20"
          />
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-owl-mist" aria-hidden />
          <select
            value={sort}
            onChange={e => { setSort(e.target.value as SortOption); setPage(1); }}
            className="rounded-full border border-owl-cream-deep bg-owl-white py-2 pl-3 pr-7 text-sm text-owl-ink focus:outline-none focus:ring-2 focus:ring-owl-teal/20"
          >
            <option value="available-first">Available First</option>
            <option value="featured">Featured</option>
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
        <span className="text-xs text-owl-mist ml-auto">
          Showing {pageItems.length} of {allInCat.length}
        </span>
      </div>

      {/* Product grid */}
      <ul
        role="list"
        aria-label={label + " products"}
        className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4"
      >
        {pageItems.map(p => (
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

      {pageItems.length === 0 && (
        <div className="py-20 text-center text-owl-mist">
          <p className="text-sm font-semibold">No products match your search.</p>
          <button type="button" onClick={() => setQuery("")} className="mt-2 text-xs text-owl-teal underline">
            Clear search
          </button>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-10 flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
            <button
              key={n}
              type="button"
              onClick={() => setPage(n)}
              className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-all ${
                n === page
                  ? "bg-owl-teal text-white shadow-owl-1"
                  : "border border-owl-cream-deep bg-owl-white text-owl-mist hover:border-owl-teal/40 hover:text-owl-teal"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      )}

      {/* Back link */}
      <div className="mt-10 flex justify-center">
        <Link href="/shop" className="flex items-center gap-2 text-sm text-owl-mist hover:text-owl-teal transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to all categories
        </Link>
      </div>
    </Section>
  );
}

"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  Filter,
  Package,
  TrendingUp,
  Clock,
  Archive,
  ExternalLink,
  Edit2,
  Copy,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react";
import { SEED_PRODUCTS, PRODUCT_CATEGORY_OPTIONS } from "@/lib/seed/products";
import type { SeedProduct } from "@/lib/seed/products";

/* ─── Types ──────────────────────────────────────────────────────────────── */
type StatusFilter = "all" | "live" | "coming_soon" | "draft" | "archived";
type SourceFilter = "all" | "printify" | "website_exclusive" | "digital_product";

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function deriveStatus(p: SeedProduct): string {
  if (p.isComingSoon) return "coming_soon";
  return "live";
}

function deriveSource(p: SeedProduct): string {
  if ("productSource" in p && p.productSource) return p.productSource as string;
  if (p.channel === "printify" || p.channel === "printful") return "printify";
  if (p.channel === "gumroad" || p.channel === "kdp") return "digital_product";
  return "website_exclusive";
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  live:         { label: "Live",        color: "bg-green-100 text-green-800" },
  coming_soon:  { label: "Coming Soon", color: "bg-owl-amber/20 text-owl-amber" },
  draft:        { label: "Draft",       color: "bg-gray-100 text-gray-600" },
  archived:     { label: "Archived",    color: "bg-red-50 text-red-600" },
};

const SOURCE_LABELS: Record<string, { label: string; color: string }> = {
  printify:         { label: "Printify",  color: "bg-blue-100 text-blue-700" },
  website_exclusive:{ label: "Exclusive", color: "bg-owl-teal/15 text-owl-teal" },
  digital_product:  { label: "Digital",   color: "bg-purple-100 text-purple-700" },
};

/* ─── Stats card ─────────────────────────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, color }: {
  icon: React.ElementType; label: string; value: number; color: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-owl-cream-deep bg-white p-5 shadow-sm">
      <span className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${color}`}>
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-2xl font-bold text-owl-ink">{value}</p>
        <p className="text-xs text-owl-mist">{label}</p>
      </div>
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────────────────── */
export default function AdminProductsPage() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"title" | "price" | "category" | "status">("title");

  const allProducts = SEED_PRODUCTS as SeedProduct[];

  // Stats
  const stats = useMemo(() => ({
    total:      allProducts.length,
    live:       allProducts.filter(p => !p.isComingSoon).length,
    comingSoon: allProducts.filter(p => p.isComingSoon).length,
    printify:   allProducts.filter(p => deriveSource(p) === "printify").length,
    digital:    allProducts.filter(p => deriveSource(p) === "digital_product").length,
  }), [allProducts]);

  // Filtered + sorted products
  const products = useMemo(() => {
    let list = [...allProducts];

    if (query) {
      const q = query.toLowerCase();
      list = list.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "all") {
      list = list.filter(p => deriveStatus(p) === statusFilter);
    }

    if (sourceFilter !== "all") {
      list = list.filter(p => deriveSource(p) === sourceFilter);
    }

    if (categoryFilter !== "all") {
      list = list.filter(p => p.category === categoryFilter);
    }

    list.sort((a, b) => {
      if (sortBy === "title") return a.title.localeCompare(b.title);
      if (sortBy === "price") return a.price.localeCompare(b.price);
      if (sortBy === "category") return a.category.localeCompare(b.category);
      if (sortBy === "status") return deriveStatus(a).localeCompare(deriveStatus(b));
      return 0;
    });

    return list;
  }, [allProducts, query, statusFilter, sourceFilter, categoryFilter, sortBy]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-owl-ink">Products</h2>
          <p className="mt-1 text-sm text-owl-mist">
            Manage the OWL store — {stats.total} products total
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            className="flex items-center gap-2 rounded-full border border-owl-teal/40 bg-owl-teal/10 px-4 py-2 text-sm font-semibold text-owl-teal transition-all hover:bg-owl-teal/20"
            title="Sync from Printify API (requires PRINTIFY_API_KEY)"
          >
            <ExternalLink className="h-4 w-4" />
            Sync Printify
          </button>
          <button
            type="button"
            className="flex items-center gap-2 rounded-full bg-owl-teal px-5 py-2 text-sm font-bold text-white shadow-sm transition-all hover:bg-owl-teal/80"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <StatCard icon={Package}    label="Total Products" value={stats.total}      color="bg-owl-teal/10 text-owl-teal" />
        <StatCard icon={TrendingUp} label="Live"           value={stats.live}       color="bg-green-100 text-green-700" />
        <StatCard icon={Clock}      label="Coming Soon"    value={stats.comingSoon} color="bg-owl-amber/20 text-owl-amber" />
        <StatCard icon={ExternalLink} label="Printify"     value={stats.printify}   color="bg-blue-100 text-blue-700" />
        <StatCard icon={Archive}    label="Digital"        value={stats.digital}    color="bg-purple-100 text-purple-700" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-owl-cream-deep bg-white p-4">
        {/* Search */}
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-owl-mist" />
          <input
            type="search"
            placeholder="Search products..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full rounded-full border border-owl-cream-deep bg-owl-cream/50 py-2 pl-9 pr-4 text-sm text-owl-ink placeholder:text-owl-mist focus:border-owl-teal/50 focus:outline-none focus:ring-2 focus:ring-owl-teal/20"
          />
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-1.5">
          <Filter className="h-3.5 w-3.5 text-owl-mist" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as StatusFilter)}
            className="rounded-full border border-owl-cream-deep bg-white py-1.5 pl-3 pr-7 text-xs text-owl-ink focus:outline-none focus:ring-2 focus:ring-owl-teal/20"
          >
            <option value="all">All Statuses</option>
            <option value="live">Live</option>
            <option value="coming_soon">Coming Soon</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {/* Source filter */}
        <select
          value={sourceFilter}
          onChange={e => setSourceFilter(e.target.value as SourceFilter)}
          className="rounded-full border border-owl-cream-deep bg-white py-1.5 pl-3 pr-7 text-xs text-owl-ink focus:outline-none focus:ring-2 focus:ring-owl-teal/20"
        >
          <option value="all">All Sources</option>
          <option value="printify">Printify</option>
          <option value="website_exclusive">Website Exclusive</option>
          <option value="digital_product">Digital Product</option>
        </select>

        {/* Category filter */}
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="rounded-full border border-owl-cream-deep bg-white py-1.5 pl-3 pr-7 text-xs text-owl-ink focus:outline-none focus:ring-2 focus:ring-owl-teal/20"
        >
          <option value="all">All Categories</option>
          {PRODUCT_CATEGORY_OPTIONS.map(c => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as typeof sortBy)}
          className="rounded-full border border-owl-cream-deep bg-white py-1.5 pl-3 pr-7 text-xs text-owl-ink focus:outline-none focus:ring-2 focus:ring-owl-teal/20"
        >
          <option value="title">Sort: Name</option>
          <option value="category">Sort: Category</option>
          <option value="price">Sort: Price</option>
          <option value="status">Sort: Status</option>
        </select>

        <span className="ml-auto text-xs text-owl-mist">
          {products.length} of {stats.total} products
        </span>
      </div>

      {/* Product table */}
      <div className="overflow-hidden rounded-xl border border-owl-cream-deep bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-owl-cream-deep bg-owl-cream/50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-owl-mist">Product</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-owl-mist">Category</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-owl-mist">Source</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-owl-mist">Status</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-owl-mist">Price</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-owl-mist">Cost</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-owl-mist">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-owl-cream-deep">
              {products.map(p => {
                const status = deriveStatus(p);
                const source = deriveSource(p);
                const statusStyle = STATUS_LABELS[status] ?? STATUS_LABELS.draft;
                const sourceStyle = SOURCE_LABELS[source] ?? SOURCE_LABELS.website_exclusive;
                const hasCost = "cost" in p && p.cost;

                return (
                  <tr key={p.slug} className="group transition-colors hover:bg-owl-cream/30">
                    {/* Product name + slug */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-9 w-9 shrink-0 rounded-lg flex items-center justify-center text-xs font-bold text-owl-ink/40 ${
                            p.tone === "teal" ? "bg-owl-teal/10" :
                            p.tone === "amber" ? "bg-owl-amber/15" :
                            p.tone === "rose" ? "bg-owl-rose/15" :
                            p.tone === "forest" ? "bg-owl-forest/10" :
                            "bg-owl-cream-deep"
                          }`}
                        >
                          {p.title.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-owl-ink line-clamp-1">{p.title}</p>
                          <p className="text-[11px] text-owl-mist">{p.slug}</p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3.5">
                      <span className="text-xs text-owl-mist">{p.category}</span>
                    </td>

                    {/* Source */}
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${sourceStyle.color}`}>
                        {sourceStyle.label}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusStyle.color}`}>
                        {statusStyle.label}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="px-4 py-3.5 font-mono text-xs font-semibold text-owl-ink">
                      {p.price}
                    </td>

                    {/* Cost */}
                    <td className="px-4 py-3.5 font-mono text-xs text-owl-mist">
                      {hasCost ? (p as SeedProduct & { cost: string }).cost : "—"}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <Link
                          href={`/shop/${p.slug}`}
                          target="_blank"
                          title="View on site"
                          className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-owl-cream-deep text-owl-mist hover:text-owl-ink transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Link>
                        <button
                          type="button"
                          title="Edit product"
                          className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-owl-teal/10 text-owl-mist hover:text-owl-teal transition-colors"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          title="Duplicate product"
                          className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-owl-amber/10 text-owl-mist hover:text-owl-amber transition-colors"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          title={p.isComingSoon ? "Mark as live" : "Mark as coming soon"}
                          className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-owl-forest/10 text-owl-mist hover:text-owl-forest transition-colors"
                        >
                          {p.isComingSoon ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                        <button
                          type="button"
                          title="Archive product"
                          className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-red-50 text-owl-mist hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {products.length === 0 && (
            <div className="py-16 text-center text-owl-mist">
              <Package className="mx-auto mb-3 h-10 w-10 opacity-30" />
              <p className="text-sm font-semibold">No products match your filters</p>
              <button
                type="button"
                onClick={() => { setQuery(""); setStatusFilter("all"); setSourceFilter("all"); setCategoryFilter("all"); }}
                className="mt-2 text-xs text-owl-teal underline"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Credentials notice */}
      <div className="rounded-xl border border-owl-amber/30 bg-owl-amber/10 p-4 text-sm">
        <p className="font-semibold text-owl-amber">Environment variables needed to activate live features</p>
        <ul className="mt-2 space-y-1 text-xs text-owl-ink/70">
          <li>• <code className="font-mono">NEXT_PUBLIC_SUPABASE_URL</code> + <code className="font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> — enable database-backed product editing</li>
          <li>• <code className="font-mono">PRINTIFY_API_KEY</code> — enable &quot;Sync Printify&quot; button</li>
          <li>• <code className="font-mono">NEXT_PUBLIC_PAYPAL_CLIENT_ID</code> — enable PayPal checkout on product pages</li>
        </ul>
        <p className="mt-2 text-xs text-owl-mist">Add these to your <code className="font-mono">.env.local</code> file, then redeploy.</p>
      </div>
    </div>
  );
}

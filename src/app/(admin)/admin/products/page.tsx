"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search, Plus, Filter, Package, TrendingUp, Clock, Archive,
  ExternalLink, Edit2, Eye, AlertTriangle, CheckCircle2, XCircle,
  Zap, ShoppingBag,
} from "lucide-react";
import { SEED_PRODUCTS, PRODUCT_CATEGORY_OPTIONS } from "@/lib/seed/products";
import type { SeedProduct } from "@/lib/seed/products";

type StatusFilter = "all" | "live" | "coming_soon" | "draft" | "archived";
type SourceFilter = "all" | "printify" | "website_exclusive" | "digital_product";
type FulfillmentFilter = "all" | "ready" | "missing_id" | "manual_review";

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

function getPrintifyId(p: SeedProduct): string | null {
  return (p as SeedProduct & { printifyProductId?: string | null }).printifyProductId ?? null;
}

function getPrintifyVariantId(p: SeedProduct): number | null {
  return (p as SeedProduct & { printifyVariantId?: number | null }).printifyVariantId ?? null;
}

function deriveFulfillment(p: SeedProduct): "ready" | "missing_id" | "manual_review" | "digital" {
  const src = deriveSource(p);
  if (src === "digital_product") return "digital";
  if (src !== "printify") return "manual_review";
  const pid = getPrintifyId(p);
  const vid = getPrintifyVariantId(p);
  if (pid && vid) return "ready";
  return "missing_id";
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  live:        { label: "Live",        color: "bg-green-100 text-green-800" },
  coming_soon: { label: "Coming Soon", color: "bg-owl-amber/20 text-owl-amber" },
  draft:       { label: "Draft",       color: "bg-gray-100 text-gray-600" },
  archived:    { label: "Archived",    color: "bg-red-50 text-red-600" },
};

const SOURCE_LABELS: Record<string, { label: string; color: string }> = {
  printify:          { label: "Printify",   color: "bg-blue-100 text-blue-700" },
  website_exclusive: { label: "Exclusive",  color: "bg-owl-teal/15 text-owl-teal" },
  digital_product:   { label: "Digital",    color: "bg-purple-100 text-purple-700" },
};

const FULFILLMENT_BADGES: Record<string, { label: string; color: string; icon: string }> = {
  ready:         { label: "Auto-Fulfillment Ready", color: "bg-green-100 text-green-800", icon: "✅" },
  missing_id:    { label: "Missing Printify ID",    color: "bg-red-100 text-red-700",     icon: "⚠️" },
  manual_review: { label: "Manual Review",           color: "bg-gray-100 text-gray-600",   icon: "👁" },
  digital:       { label: "Digital Delivery",        color: "bg-purple-100 text-purple-700", icon: "📱" },
};

function StatCard({ icon: Icon, label, value, color }: {
  icon: React.ElementType; label: string; value: number; color: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-owl-cream-deep bg-white p-4 shadow-sm">
      <span className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${color}`}>
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-xl font-bold text-owl-ink">{value}</p>
        <p className="text-xs text-owl-mist">{label}</p>
      </div>
    </div>
  );
}

export default function AdminProductsPage() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [fulfillmentFilter, setFulfillmentFilter] = useState<FulfillmentFilter>("all");
  const [sortBy, setSortBy] = useState<"title" | "price" | "category" | "status">("title");

  const allProducts = SEED_PRODUCTS as SeedProduct[];

  const stats = useMemo(() => ({
    total:      allProducts.length,
    live:       allProducts.filter(p => !p.isComingSoon).length,
    comingSoon: allProducts.filter(p => p.isComingSoon).length,
    printify:   allProducts.filter(p => deriveSource(p) === "printify").length,
    ready:      allProducts.filter(p => deriveFulfillment(p) === "ready").length,
    missingId:  allProducts.filter(p => deriveFulfillment(p) === "missing_id").length,
  }), [allProducts]);

  const products = useMemo(() => {
    let list = [...allProducts];

    if (query) {
      const q = query.toLowerCase();
      list = list.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        (getPrintifyId(p) ?? "").includes(q)
      );
    }
    if (statusFilter !== "all") list = list.filter(p => deriveStatus(p) === statusFilter);
    if (sourceFilter !== "all") list = list.filter(p => deriveSource(p) === sourceFilter);
    if (categoryFilter !== "all") list = list.filter(p => p.category === categoryFilter);
    if (fulfillmentFilter !== "all") list = list.filter(p => deriveFulfillment(p) === fulfillmentFilter);

    list.sort((a, b) => {
      if (sortBy === "title") return a.title.localeCompare(b.title);
      if (sortBy === "price") return a.price.localeCompare(b.price);
      if (sortBy === "category") return a.category.localeCompare(b.category);
      if (sortBy === "status") return deriveStatus(a).localeCompare(deriveStatus(b));
      return 0;
    });
    return list;
  }, [allProducts, query, statusFilter, sourceFilter, categoryFilter, fulfillmentFilter, sortBy]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-owl-ink">Products</h2>
          <p className="mt-1 text-sm text-owl-mist">{stats.total} products · {stats.missingId} missing Printify ID</p>
        </div>
        <div className="flex gap-2">
          <a
            href="/api/admin/sync-printify"
            target="_blank"
            className="flex items-center gap-2 rounded-full border border-owl-teal/40 bg-owl-teal/10 px-4 py-2 text-sm font-semibold text-owl-teal transition-all hover:bg-owl-teal/20"
          >
            <ExternalLink className="h-4 w-4" />
            Sync Printify
          </a>
          <button
            type="button"
            className="flex items-center gap-2 rounded-full bg-owl-teal px-5 py-2 text-sm font-bold text-white shadow-sm transition-all hover:bg-owl-teal/80"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </button>
        </div>
      </div>

      {/* Warning banner if products missing IDs */}
      {stats.missingId > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <AlertTriangle className="h-5 w-5 shrink-0 text-red-500 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-700">
              {stats.missingId} Printify product{stats.missingId !== 1 ? "s" : ""} missing Printify Product ID
            </p>
            <p className="mt-1 text-xs text-red-600">
              Orders for these products will be saved but NOT auto-submitted to Printify — manual fulfillment required.
              Find Product IDs in your <a href="https://printify.com/app/store/products" target="_blank" rel="noopener noreferrer" className="underline">Printify Dashboard → Products</a>.
            </p>
            <button
              type="button"
              onClick={() => setFulfillmentFilter("missing_id")}
              className="mt-2 text-xs font-semibold text-red-700 underline hover:no-underline"
            >
              Show only products missing IDs
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
        <StatCard icon={Package}      label="Total"          value={stats.total}      color="bg-owl-teal/10 text-owl-teal" />
        <StatCard icon={TrendingUp}   label="Live"           value={stats.live}       color="bg-green-100 text-green-700" />
        <StatCard icon={Clock}        label="Coming Soon"    value={stats.comingSoon} color="bg-owl-amber/20 text-owl-amber" />
        <StatCard icon={ExternalLink} label="Printify"       value={stats.printify}   color="bg-blue-100 text-blue-700" />
        <StatCard icon={CheckCircle2} label="Auto-Fulfillment Ready" value={stats.ready} color="bg-green-100 text-green-700" />
        <StatCard icon={XCircle}      label="Missing ID"     value={stats.missingId}  color="bg-red-100 text-red-600" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-owl-cream-deep bg-white p-4">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-owl-mist" />
          <input
            type="search"
            placeholder="Search name, slug, Printify ID..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full rounded-full border border-owl-cream-deep bg-owl-cream/50 py-2 pl-9 pr-4 text-sm text-owl-ink placeholder:text-owl-mist focus:border-owl-teal/50 focus:outline-none focus:ring-2 focus:ring-owl-teal/20"
          />
        </div>
        <div className="flex items-center gap-1.5 text-owl-mist">
          <Filter className="h-3.5 w-3.5" />
          <select value={fulfillmentFilter} onChange={e => setFulfillmentFilter(e.target.value as FulfillmentFilter)}
            className="rounded-full border border-owl-cream-deep bg-white py-1.5 pl-3 pr-7 text-xs text-owl-ink focus:outline-none">
            <option value="all">All Fulfillment</option>
            <option value="ready">✅ Auto-Ready</option>
            <option value="missing_id">⚠️ Missing Printify ID</option>
            <option value="manual_review">👁 Manual Review</option>
            <option value="digital">📱 Digital</option>
          </select>
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as StatusFilter)}
          className="rounded-full border border-owl-cream-deep bg-white py-1.5 pl-3 pr-7 text-xs text-owl-ink focus:outline-none">
          <option value="all">All Statuses</option>
          <option value="live">Live</option>
          <option value="coming_soon">Coming Soon</option>
          <option value="draft">Draft</option>
        </select>
        <select value={sourceFilter} onChange={e => setSourceFilter(e.target.value as SourceFilter)}
          className="rounded-full border border-owl-cream-deep bg-white py-1.5 pl-3 pr-7 text-xs text-owl-ink focus:outline-none">
          <option value="all">All Sources</option>
          <option value="printify">Printify</option>
          <option value="website_exclusive">Exclusive</option>
          <option value="digital_product">Digital</option>
        </select>
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
          className="rounded-full border border-owl-cream-deep bg-white py-1.5 pl-3 pr-7 text-xs text-owl-ink focus:outline-none">
          <option value="all">All Categories</option>
          {PRODUCT_CATEGORY_OPTIONS.map(c => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)}
          className="rounded-full border border-owl-cream-deep bg-white py-1.5 pl-3 pr-7 text-xs text-owl-ink focus:outline-none">
          <option value="title">Sort: Name</option>
          <option value="category">Sort: Category</option>
          <option value="price">Sort: Price</option>
          <option value="status">Sort: Status</option>
        </select>
        <span className="ml-auto text-xs text-owl-mist">{products.length} / {stats.total}</span>
      </div>

      {/* Product table */}
      <div className="overflow-hidden rounded-xl border border-owl-cream-deep bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-owl-cream-deep bg-owl-cream/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-owl-mist">Product</th>
                <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-owl-mist">Category</th>
                <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-owl-mist">Source</th>
                <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-owl-mist">Status</th>
                <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-owl-mist">Fulfillment</th>
                <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-owl-mist">Printify ID</th>
                <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-owl-mist">Variant ID</th>
                <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-owl-mist">Price</th>
                <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-owl-mist">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-owl-cream-deep">
              {products.map(p => {
                const status = deriveStatus(p);
                const source = deriveSource(p);
                const fulfillment = deriveFulfillment(p);
                const printifyId = getPrintifyId(p);
                const variantId = getPrintifyVariantId(p);
                const statusStyle = STATUS_LABELS[status] ?? STATUS_LABELS.draft;
                const sourceStyle = SOURCE_LABELS[source] ?? SOURCE_LABELS.website_exclusive;
                const fulfillStyle = FULFILLMENT_BADGES[fulfillment] ?? FULFILLMENT_BADGES.manual_review;

                return (
                  <tr key={p.slug} className="group transition-colors hover:bg-owl-cream/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className={`h-8 w-8 shrink-0 rounded-lg flex items-center justify-center text-xs font-bold text-owl-ink/40 ${
                          p.tone === "teal" ? "bg-owl-teal/10" : p.tone === "amber" ? "bg-owl-amber/15" :
                          p.tone === "rose" ? "bg-owl-rose/15" : p.tone === "forest" ? "bg-owl-forest/10" : "bg-owl-cream-deep"
                        }`}>
                          {p.title.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-owl-ink line-clamp-1 text-xs">{p.title}</p>
                          <p className="text-[10px] text-owl-mist">{p.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-xs text-owl-mist">{p.category}</td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${sourceStyle.color}`}>
                        {sourceStyle.label}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusStyle.color}`}>
                        {statusStyle.label}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${fulfillStyle.color}`}>
                        {fulfillment === "ready" && <CheckCircle2 className="h-3 w-3" />}
                        {fulfillment === "missing_id" && <AlertTriangle className="h-3 w-3" />}
                        {fulfillStyle.label}
                      </span>
                    </td>
                    <td className="px-3 py-3 font-mono text-xs">
                      {printifyId ? (
                        <span className="text-blue-700">{printifyId}</span>
                      ) : (
                        <span className="text-red-400 italic">not set</span>
                      )}
                    </td>
                    <td className="px-3 py-3 font-mono text-xs">
                      {variantId ? (
                        <span className="text-blue-700">{variantId}</span>
                      ) : (
                        <span className="text-red-400 italic">not set</span>
                      )}
                    </td>
                    <td className="px-3 py-3 font-mono text-xs font-semibold text-owl-ink">{p.price}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <Link href={`/shop/${p.slug}`} target="_blank" title="View on site"
                          className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-owl-cream-deep text-owl-mist hover:text-owl-ink">
                          <Eye className="h-3.5 w-3.5" />
                        </Link>
                        <button type="button" title="Edit product"
                          className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-owl-teal/10 text-owl-mist hover:text-owl-teal">
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        {fulfillment === "missing_id" && (
                          <a href="https://printify.com/app/store/products" target="_blank" rel="noopener noreferrer"
                            title="Find Printify Product ID"
                            className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-red-50 text-red-400 hover:text-red-600">
                            <Zap className="h-3.5 w-3.5" />
                          </a>
                        )}
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
              <button type="button"
                onClick={() => { setQuery(""); setStatusFilter("all"); setSourceFilter("all"); setCategoryFilter("all"); setFulfillmentFilter("all"); }}
                className="mt-2 text-xs text-owl-teal underline">Clear all filters</button>
            </div>
          )}
        </div>
      </div>

      {/* Fulfillment setup checklist */}
      <div className="rounded-xl border border-owl-cream-deep bg-white p-5 space-y-4">
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5 text-owl-teal" />
          <h3 className="font-display text-sm font-bold text-owl-ink">Fulfillment Setup Checklist</h3>
        </div>
        <div className="grid gap-2 text-xs">
          {[
            { label: "NEXT_PUBLIC_PAYPAL_CLIENT_ID", set: !!process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID, help: "PayPal Developer Dashboard → My Apps → Client ID" },
            { label: "PAYPAL_WEBHOOK_ID", set: false, help: "PayPal Developer Dashboard → My Apps → Webhooks → Add Webhook → copy ID" },
            { label: "PRINTIFY_API_KEY", set: false, help: "Printify Dashboard → My Account → Connections → API" },
            { label: "PRINTIFY_SHOP_ID", set: false, help: "Printify Dashboard → Stores (numeric ID in URL)" },
          ].map(({ label, help }) => (
            <div key={label} className="flex items-start gap-2 rounded-lg border border-owl-cream-deep p-2.5">
              <XCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
              <div>
                <code className="font-mono text-[11px] font-semibold text-owl-ink">{label}</code>
                <p className="text-owl-mist mt-0.5">{help}</p>
              </div>
            </div>
          ))}
          <div className="flex items-start gap-2 rounded-lg border border-red-100 bg-red-50 p-2.5">
            <AlertTriangle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
            <div>
              <p className="font-semibold text-red-700">Register PayPal Webhook</p>
              <p className="text-red-600 mt-0.5">Go to developer.paypal.com → My Apps → [App] → Webhooks → Add Webhook</p>
              <code className="text-[10px] font-mono text-red-700 mt-1 block">URL: https://owlsingtogether.com/api/webhooks/paypal</code>
              <p className="text-red-600 mt-1">Events: CHECKOUT.ORDER.APPROVED · PAYMENT.CAPTURE.COMPLETED · PAYMENT.CAPTURE.DENIED · PAYMENT.CAPTURE.REFUNDED</p>
            </div>
          </div>
        </div>
      </div>

      {/* Credentials notice */}
      <div className="rounded-xl border border-owl-amber/30 bg-owl-amber/10 p-4 text-sm">
        <p className="font-semibold text-owl-amber">Add {stats.missingId} Printify Product IDs to enable auto-fulfillment</p>
        <p className="mt-1 text-xs text-owl-ink/70">
          Find IDs in <a href="https://printify.com/app/store/products" target="_blank" rel="noopener noreferrer" className="underline text-blue-600">Printify Dashboard → Products</a> → click each product → the numeric ID is in the page URL and at the top of the product detail. Add them to <code className="font-mono">src/lib/seed/products.ts</code> as <code className="font-mono">printifyProductId: &ldquo;12345678&rdquo;</code>.
        </p>
      </div>
    </div>
  );
}

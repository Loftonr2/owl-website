"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Search, Plus, Filter, Package, TrendingUp, Clock,
  ExternalLink, Edit2, Eye, AlertTriangle, CheckCircle2, XCircle,
  Zap, ShoppingBag, Save, X, Loader2,
} from "lucide-react";
import { SEED_PRODUCTS, PRODUCT_CATEGORY_OPTIONS } from "@/lib/seed/products";
import type { SeedProduct } from "@/lib/seed/products";

type StatusFilter = "all" | "live" | "coming_soon" | "draft" | "archived";
type SourceFilter = "all" | "printify" | "website_exclusive" | "digital_product";
type FulfillmentFilter = "all" | "ready" | "missing_id" | "manual_review" | "digital";

interface EditState {
  slug: string;
  printifyProductId: string;
  printifyVariantId: string;
  saving: boolean;
  result: "idle" | "success" | "error";
  message: string;
}

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

function getPrintifyId(p: SeedProduct, overrides: Map<string, EditState>): string | null {
  const ov = overrides.get(p.slug);
  if (ov?.result === "success" && ov.printifyProductId) return ov.printifyProductId;
  return (p as SeedProduct & { printifyProductId?: string | null }).printifyProductId ?? null;
}

function getPrintifyVariantId(p: SeedProduct, overrides: Map<string, EditState>): number | null {
  const ov = overrides.get(p.slug);
  if (ov?.result === "success" && ov.printifyVariantId) return parseInt(ov.printifyVariantId, 10) || null;
  return (p as SeedProduct & { printifyVariantId?: number | null }).printifyVariantId ?? null;
}

function deriveFulfillment(p: SeedProduct, overrides: Map<string, EditState>): "ready" | "missing_id" | "manual_review" | "digital" {
  const src = deriveSource(p);
  if (src === "digital_product") return "digital";
  if (src !== "printify") return "manual_review";
  const pid = getPrintifyId(p, overrides);
  const vid = getPrintifyVariantId(p, overrides);
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
  printify:          { label: "Printify",  color: "bg-blue-100 text-blue-700" },
  website_exclusive: { label: "Exclusive", color: "bg-owl-teal/15 text-owl-teal" },
  digital_product:   { label: "Digital",   color: "bg-purple-100 text-purple-700" },
};

function StatCard({ icon: Icon, label, value, color }: {
  icon: React.ElementType; label: string; value: number; color: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-owl-cream-deep bg-white p-4 shadow-sm">
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
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ printifyProductId: "", printifyVariantId: "" });
  const [editState, setEditState] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [editMessage, setEditMessage] = useState("");
  // Saved overrides so UI reflects saved IDs without full reload
  const [savedOverrides, setSavedOverrides] = useState<Map<string, { pid: string; vid: string }>>(new Map());

  const allProducts = SEED_PRODUCTS as SeedProduct[];

  // Build a temporary override map from savedOverrides for fulfillment status
  const overrideMap = useMemo(() => {
    const m = new Map<string, EditState>();
    savedOverrides.forEach((val, slug) => {
      m.set(slug, { slug, printifyProductId: val.pid, printifyVariantId: val.vid, saving: false, result: "success", message: "" });
    });
    return m;
  }, [savedOverrides]);

  const stats = useMemo(() => ({
    total:      allProducts.length,
    live:       allProducts.filter(p => !p.isComingSoon).length,
    comingSoon: allProducts.filter(p => p.isComingSoon).length,
    printify:   allProducts.filter(p => deriveSource(p) === "printify").length,
    ready:      allProducts.filter(p => deriveFulfillment(p, overrideMap) === "ready").length,
    missingId:  allProducts.filter(p => deriveFulfillment(p, overrideMap) === "missing_id").length,
  }), [allProducts, overrideMap]);

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
    if (statusFilter !== "all") list = list.filter(p => deriveStatus(p) === statusFilter);
    if (sourceFilter !== "all") list = list.filter(p => deriveSource(p) === sourceFilter);
    if (categoryFilter !== "all") list = list.filter(p => p.category === categoryFilter);
    if (fulfillmentFilter !== "all") list = list.filter(p => deriveFulfillment(p, overrideMap) === fulfillmentFilter);
    list.sort((a, b) => {
      if (sortBy === "title") return a.title.localeCompare(b.title);
      if (sortBy === "price") return a.price.localeCompare(b.price);
      if (sortBy === "category") return a.category.localeCompare(b.category);
      if (sortBy === "status") return deriveStatus(a).localeCompare(deriveStatus(b));
      return 0;
    });
    return list;
  }, [allProducts, query, statusFilter, sourceFilter, categoryFilter, fulfillmentFilter, sortBy, overrideMap]);

  const startEdit = useCallback((p: SeedProduct) => {
    const currentPid = getPrintifyId(p, overrideMap) ?? "";
    const currentVid = getPrintifyVariantId(p, overrideMap);
    setEditingSlug(p.slug);
    setEditForm({ printifyProductId: currentPid, printifyVariantId: currentVid ? String(currentVid) : "" });
    setEditState("idle");
    setEditMessage("");
  }, [overrideMap]);

  const cancelEdit = useCallback(() => {
    setEditingSlug(null);
    setEditState("idle");
    setEditMessage("");
  }, []);

  const saveEdit = useCallback(async (slug: string) => {
    setEditState("saving");
    setEditMessage("");
    try {
      const res = await fetch(`/api/admin/products/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          printifyProductId: editForm.printifyProductId.trim() || null,
          printifyVariantId: editForm.printifyVariantId ? parseInt(editForm.printifyVariantId, 10) : null,
        }),
      });
      const data = await res.json() as { success?: boolean; message?: string; error?: string };
      if (res.ok && data.success) {
        setEditState("success");
        setEditMessage(data.message ?? "Saved successfully.");
        setSavedOverrides(prev => {
          const next = new Map(prev);
          next.set(slug, { pid: editForm.printifyProductId.trim(), vid: editForm.printifyVariantId });
          return next;
        });
        // Auto-close after success
        setTimeout(() => { setEditingSlug(null); setEditState("idle"); }, 1800);
      } else {
        setEditState("error");
        setEditMessage(data.error ?? "Save failed. Check that Supabase is connected.");
      }
    } catch (err) {
      setEditState("error");
      setEditMessage("Network error. Check your connection and Supabase credentials.");
      console.error(err);
    }
  }, [editForm]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-owl-ink">Products</h2>
          <p className="mt-1 text-sm text-owl-mist">{stats.total} products · {stats.missingId} missing Printify ID</p>
        </div>
        <div className="flex gap-2">
          <a href="/api/admin/sync-printify" target="_blank"
            className="flex items-center gap-2 rounded-full border border-owl-teal/40 bg-owl-teal/10 px-4 py-2 text-sm font-semibold text-owl-teal transition-all hover:bg-owl-teal/20">
            <ExternalLink className="h-4 w-4" />Sync Printify
          </a>
          <button type="button"
            className="flex items-center gap-2 rounded-full bg-owl-teal px-5 py-2 text-sm font-bold text-white shadow-sm transition-all hover:bg-owl-teal/80">
            <Plus className="h-4 w-4" />Add Product
          </button>
        </div>
      </div>

      {/* Warning banner */}
      {stats.missingId > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <AlertTriangle className="h-5 w-5 shrink-0 text-red-500 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-700">
              {stats.missingId} product{stats.missingId !== 1 ? "s" : ""} missing Printify ID — orders will require manual fulfillment
            </p>
            <p className="mt-1 text-xs text-red-600">
              Click the <strong>✏️ edit icon</strong> on any Printify product row to enter IDs directly. IDs are saved to Supabase and activate auto-fulfillment instantly.
            </p>
            <button type="button" onClick={() => setFulfillmentFilter("missing_id")}
              className="mt-2 text-xs font-semibold text-red-700 underline hover:no-underline">
              Show only missing ID products ({stats.missingId})
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
        <StatCard icon={Package}       label="Total"          value={stats.total}      color="bg-owl-teal/10 text-owl-teal" />
        <StatCard icon={TrendingUp}    label="Live"           value={stats.live}       color="bg-green-100 text-green-700" />
        <StatCard icon={Clock}         label="Coming Soon"    value={stats.comingSoon} color="bg-owl-amber/20 text-owl-amber" />
        <StatCard icon={ExternalLink}  label="Printify"       value={stats.printify}   color="bg-blue-100 text-blue-700" />
        <StatCard icon={CheckCircle2}  label="Auto-Ready"     value={stats.ready}      color="bg-green-100 text-green-700" />
        <StatCard icon={XCircle}       label="Missing ID"     value={stats.missingId}  color="bg-red-100 text-red-600" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-owl-cream-deep bg-white p-3">
        <div className="relative min-w-[180px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-owl-mist" />
          <input type="search" placeholder="Search name, slug..." value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full rounded-full border border-owl-cream-deep bg-owl-cream/50 py-1.5 pl-9 pr-3 text-sm text-owl-ink placeholder:text-owl-mist focus:border-owl-teal/50 focus:outline-none" />
        </div>
        <div className="flex items-center gap-1 text-owl-mist"><Filter className="h-3.5 w-3.5" />
          <select value={fulfillmentFilter} onChange={e => setFulfillmentFilter(e.target.value as FulfillmentFilter)}
            className="rounded-full border border-owl-cream-deep bg-white py-1.5 pl-2 pr-6 text-xs text-owl-ink focus:outline-none">
            <option value="all">All Fulfillment</option>
            <option value="ready">✅ Auto-Ready</option>
            <option value="missing_id">⚠️ Missing ID</option>
            <option value="manual_review">👁 Manual</option>
            <option value="digital">📱 Digital</option>
          </select>
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as StatusFilter)}
          className="rounded-full border border-owl-cream-deep bg-white py-1.5 pl-2 pr-6 text-xs text-owl-ink focus:outline-none">
          <option value="all">All Statuses</option>
          <option value="live">Live</option>
          <option value="coming_soon">Coming Soon</option>
        </select>
        <select value={sourceFilter} onChange={e => setSourceFilter(e.target.value as SourceFilter)}
          className="rounded-full border border-owl-cream-deep bg-white py-1.5 pl-2 pr-6 text-xs text-owl-ink focus:outline-none">
          <option value="all">All Sources</option>
          <option value="printify">Printify</option>
          <option value="website_exclusive">Exclusive</option>
          <option value="digital_product">Digital</option>
        </select>
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
          className="rounded-full border border-owl-cream-deep bg-white py-1.5 pl-2 pr-6 text-xs text-owl-ink focus:outline-none">
          <option value="all">All Categories</option>
          {PRODUCT_CATEGORY_OPTIONS.map(c => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)}
          className="rounded-full border border-owl-cream-deep bg-white py-1.5 pl-2 pr-6 text-xs text-owl-ink focus:outline-none">
          <option value="title">Name</option>
          <option value="category">Category</option>
          <option value="price">Price</option>
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
                <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-owl-mist">Cat.</th>
                <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-owl-mist">Source</th>
                <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-owl-mist">Status</th>
                <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-owl-mist">Fulfillment</th>
                <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-owl-mist">Printify ID</th>
                <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-owl-mist">Variant ID</th>
                <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-owl-mist">Price</th>
                <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-owl-mist">Edit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-owl-cream-deep">
              {products.map(p => {
                const status = deriveStatus(p);
                const source = deriveSource(p);
                const fulfillment = deriveFulfillment(p, overrideMap);
                const printifyId = getPrintifyId(p, overrideMap);
                const variantId = getPrintifyVariantId(p, overrideMap);
                const statusStyle = STATUS_LABELS[status] ?? STATUS_LABELS.draft;
                const sourceStyle = SOURCE_LABELS[source] ?? SOURCE_LABELS.website_exclusive;
                const isEditing = editingSlug === p.slug;
                const isPrintify = source === "printify";

                return (
                  <>
                    <tr key={p.slug} className={`transition-colors ${isEditing ? "bg-blue-50/50" : "hover:bg-owl-cream/30"}`}>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className={`h-7 w-7 shrink-0 rounded-lg flex items-center justify-center text-[10px] font-bold text-owl-ink/40 ${
                            p.tone === "teal" ? "bg-owl-teal/10" : p.tone === "amber" ? "bg-owl-amber/15" :
                            p.tone === "rose" ? "bg-owl-rose/15" : "bg-owl-cream-deep"
                          }`}>{p.title.slice(0, 2).toUpperCase()}</div>
                          <div>
                            <p className="font-semibold text-owl-ink text-xs line-clamp-1">{p.title}</p>
                            <p className="text-[10px] text-owl-mist">{p.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-xs text-owl-mist">{p.category}</td>
                      <td className="px-3 py-2.5">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${sourceStyle.color}`}>
                          {sourceStyle.label}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusStyle.color}`}>
                          {statusStyle.label}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        {fulfillment === "ready" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-800">
                            <CheckCircle2 className="h-3 w-3" />Auto-Ready
                          </span>
                        )}
                        {fulfillment === "missing_id" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                            <AlertTriangle className="h-3 w-3" />Missing ID
                          </span>
                        )}
                        {fulfillment === "manual_review" && (
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600">Manual</span>
                        )}
                        {fulfillment === "digital" && (
                          <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-semibold text-purple-700">Digital</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 font-mono text-xs">
                        {printifyId ? <span className="text-blue-700">{printifyId}</span> : <span className="italic text-red-400">not set</span>}
                      </td>
                      <td className="px-3 py-2.5 font-mono text-xs">
                        {variantId ? <span className="text-blue-700">{variantId}</span> : <span className="italic text-red-400">not set</span>}
                      </td>
                      <td className="px-3 py-2.5 font-mono text-xs font-semibold text-owl-ink">{p.price}</td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1">
                          <Link href={`/shop/${p.slug}`} target="_blank"
                            className="flex h-7 w-7 items-center justify-center rounded-full text-owl-mist hover:bg-owl-cream-deep hover:text-owl-ink">
                            <Eye className="h-3.5 w-3.5" />
                          </Link>
                          {isPrintify && (
                            <button type="button"
                              onClick={() => isEditing ? cancelEdit() : startEdit(p)}
                              className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
                                isEditing
                                  ? "bg-red-50 text-red-500 hover:bg-red-100"
                                  : "text-owl-mist hover:bg-owl-teal/10 hover:text-owl-teal"
                              }`}
                              title={isEditing ? "Cancel edit" : "Edit Printify IDs"}
                            >
                              {isEditing ? <X className="h-3.5 w-3.5" /> : <Edit2 className="h-3.5 w-3.5" />}
                            </button>
                          )}
                          {!isPrintify && fulfillment === "missing_id" && (
                            <a href="https://printify.com/app/store/products" target="_blank" rel="noopener noreferrer"
                              title="Open Printify to find Product ID"
                              className="flex h-7 w-7 items-center justify-center rounded-full text-red-400 hover:bg-red-50 hover:text-red-600">
                              <Zap className="h-3.5 w-3.5" />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* ── Inline edit panel ── */}
                    {isEditing && (
                      <tr key={`${p.slug}-edit`} className="bg-blue-50/60">
                        <td colSpan={9} className="px-4 py-4">
                          <div className="flex flex-wrap items-end gap-4">
                            <div>
                              <label className="block text-[11px] font-bold uppercase tracking-wide text-blue-700 mb-1">
                                Printify Product ID
                              </label>
                              <input
                                type="text"
                                value={editForm.printifyProductId}
                                onChange={e => setEditForm(f => ({ ...f, printifyProductId: e.target.value }))}
                                placeholder="e.g. 12345678"
                                className="w-44 rounded-lg border border-blue-300 bg-white px-3 py-1.5 font-mono text-sm text-owl-ink focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                              />
                              <p className="mt-0.5 text-[10px] text-blue-600">Printify → Products → URL contains ID</p>
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold uppercase tracking-wide text-blue-700 mb-1">
                                Variant ID
                              </label>
                              <input
                                type="number"
                                value={editForm.printifyVariantId}
                                onChange={e => setEditForm(f => ({ ...f, printifyVariantId: e.target.value }))}
                                placeholder="e.g. 45678"
                                className="w-36 rounded-lg border border-blue-300 bg-white px-3 py-1.5 font-mono text-sm text-owl-ink focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                              />
                              <p className="mt-0.5 text-[10px] text-blue-600">Product → Variants tab → ID</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => saveEdit(p.slug)}
                                disabled={editState === "saving"}
                                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white transition-all hover:bg-blue-700 disabled:opacity-60"
                              >
                                {editState === "saving" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                {editState === "saving" ? "Saving..." : "Save to Supabase"}
                              </button>
                              <button type="button" onClick={cancelEdit}
                                className="rounded-lg border border-owl-cream-deep bg-white px-3 py-1.5 text-sm text-owl-mist hover:text-owl-ink">
                                Cancel
                              </button>
                              <a href="https://printify.com/app/store/products" target="_blank" rel="noopener noreferrer"
                                className="text-xs text-blue-600 underline hover:no-underline">
                                Open Printify →
                              </a>
                            </div>
                            {editMessage && (
                              <div className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold ${
                                editState === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-700"
                              }`}>
                                {editState === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                                {editMessage}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
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

      {/* Setup checklist */}
      <div className="rounded-xl border border-owl-cream-deep bg-white p-5">
        <div className="flex items-center gap-2 mb-4">
          <ShoppingBag className="h-5 w-5 text-owl-teal" />
          <h3 className="font-display text-sm font-bold text-owl-ink">Go-Live Checklist</h3>
        </div>
        <div className="space-y-2 text-xs">
          {[
            { label: "NEXT_PUBLIC_PAYPAL_CLIENT_ID", help: "PayPal Developer → My Apps → Client ID" },
            { label: "PAYPAL_CLIENT_SECRET", help: "PayPal Developer → My Apps → Secret" },
            { label: "PAYPAL_WEBHOOK_ID", help: "Register webhook URL first (see STORE_SETUP.md), then copy ID" },
            { label: "PRINTIFY_API_KEY", help: "Printify → My Account → Connections → API" },
            { label: "PRINTIFY_SHOP_ID", help: "Printify → Stores → numeric ID in URL" },
            { label: "NEXT_PUBLIC_SUPABASE_URL", help: "Supabase Dashboard → Settings → API → Project URL" },
            { label: "NEXT_PUBLIC_SUPABASE_ANON_KEY + SUPABASE_SERVICE_ROLE_KEY", help: "Supabase Dashboard → Settings → API" },
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
              <p className="font-semibold text-red-700">Register PayPal webhook (manual step)</p>
              <code className="text-[10px] text-red-700 block mt-0.5">URL: https://owlsingtogether.com/api/webhooks/paypal</code>
              <p className="text-red-600 mt-1">Events: CHECKOUT.ORDER.APPROVED · PAYMENT.CAPTURE.COMPLETED · PAYMENT.CAPTURE.DENIED · PAYMENT.CAPTURE.REFUNDED</p>
            </div>
          </div>
          <div className="flex items-start gap-2 rounded-lg border border-amber-100 bg-amber-50 p-2.5">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-700">Run Supabase migrations</p>
              <p className="text-amber-600 mt-0.5">Paste <code className="font-mono">supabase/migrations/0002_products_extended.sql</code> then <code className="font-mono">0003_add_printify_variant_id.sql</code> into Supabase SQL Editor → Run</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

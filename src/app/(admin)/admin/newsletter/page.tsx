"use client";

/**
 * /admin/newsletter — OWL Weekly newsletter management.
 *
 * Tabs:
 *   Issues         — list of all newsletter campaigns/issues
 *   Editor         — compose/edit a selected issue
 *   Promotions     — coupon campaign manager
 *   Recipients     — subscriber overview
 *   Analytics      — delivery + engagement stats
 */

import { useState, useEffect, useCallback } from "react";
import {
  LayoutList, Pencil, Megaphone, Users, BarChart2,
  Plus, Eye, Send, Copy, Archive, ChevronDown,
  CheckCircle, Clock, AlertCircle, XCircle, RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/cn";

// ── Types ─────────────────────────────────────────────────────────────────────

interface NLCampaign {
  id: string;
  issue_number: number | null;
  title: string;
  archive_slug: string | null;
  status: string;
  publication_date: string | null;
  scheduled_for: string | null;
  recipients_count: number;
  open_count: number;
  click_count: number;
  promo_headline: string | null;
  promo_discount_pct: number | null;
  note_title: string | null;
  note_body: string | null;
  tip_title: string | null;
  tip_body: string | null;
  tip_age_range: string | null;
  tip_takeaway: string | null;
  health_alert_title: string | null;
  health_alert_body: string | null;
  health_alert_url: string | null;
  health_alert_product_name: string | null;
  health_alert_brand: string | null;
  health_alert_recall_date: string | null;
  health_alert_source_name: string | null;
  promo_product_slug: string | null;
  promo_button_label: string | null;
  promo_button_url: string | null;
  promo_subheading: string | null;
  promo_starts_at: string | null;
  promo_expires_at: string | null;
  news_mode: string | null;
  blog_mode: string | null;
}

interface CouponCampaign {
  id: string;
  name: string;
  display_code: string | null;
  discount_value: number;
  discount_type: string;
  starts_at: string;
  expires_at: string;
  status: string;
  eligible_user_count: number;
  redeemed_count: number;
}

interface ContentPost {
  id: string;
  title: string;
  slug: string;
  category: string;
  content_type: string;
}

// ── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; Icon: typeof CheckCircle }> = {
    draft:     { label: "Draft",     color: "bg-gray-100 text-gray-600",   Icon: Pencil },
    scheduled: { label: "Scheduled", color: "bg-blue-50 text-blue-700",    Icon: Clock },
    sending:   { label: "Sending",   color: "bg-amber-50 text-amber-700",  Icon: RefreshCw },
    sent:      { label: "Sent",      color: "bg-green-50 text-green-700",  Icon: CheckCircle },
    published: { label: "Published", color: "bg-owl-teal/10 text-owl-teal",Icon: CheckCircle },
    failed:    { label: "Failed",    color: "bg-red-50 text-red-600",      Icon: AlertCircle },
    canceled:  { label: "Cancelled", color: "bg-red-50 text-red-600",      Icon: XCircle },
    active:    { label: "Active",    color: "bg-green-50 text-green-700",  Icon: CheckCircle },
    ended:     { label: "Ended",     color: "bg-gray-100 text-gray-500",   Icon: Archive },
  };
  const s = map[status] ?? { label: status, color: "bg-gray-100 text-gray-600", Icon: Pencil };
  const Icon = s.Icon;
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold", s.color)}>
      <Icon className="h-3 w-3" aria-hidden />
      {s.label}
    </span>
  );
}

// ── Main page (client) ────────────────────────────────────────────────────────

export default function NewsletterAdminPage() {
  const [tab, setTab] = useState<"issues" | "editor" | "promotions" | "recipients" | "analytics">("issues");
  const [campaigns, setCampaigns] = useState<NLCampaign[]>([]);
  const [coupons, setCoupons] = useState<CouponCampaign[]>([]);
  const [posts, setPosts] = useState<ContentPost[]>([]);
  const [selected, setSelected] = useState<NLCampaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [clRes, ccRes, postsRes] = await Promise.all([
        fetch("/api/admin/newsletter/campaigns"),
        fetch("/api/admin/newsletter/coupon-campaigns"),
        fetch("/api/admin/newsletter/content-posts"),
      ]);
      if (clRes.ok) setCampaigns(await clRes.json());
      if (ccRes.ok) setCoupons(await ccRes.json());
      if (postsRes.ok) setPosts(await postsRes.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  function flash(m: string) { setMsg(m); setTimeout(() => setMsg(""), 3500); }

  async function saveCampaign(patch: Partial<NLCampaign>) {
    if (!selected) return;
    setSaving(true);
    const res = await fetch(`/api/admin/newsletter/campaigns/${selected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (res.ok) {
      const updated: NLCampaign = await res.json();
      setSelected(updated);
      setCampaigns((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      flash("Saved ✓");
    } else {
      flash("Save failed — check console.");
    }
    setSaving(false);
  }

  async function createIssue() {
    const maxIssue = campaigns.reduce((m, c) => Math.max(m, c.issue_number ?? 0), 0);
    const next = maxIssue + 1;
    const res = await fetch("/api/admin/newsletter/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: `OWL Weekly — Issue #${next}`,
        slug: `owl-weekly-issue-${next}`,
        archive_slug: `issue-${next}`,
        issue_number: next,
        status: "draft",
        note_title: "A Note from OWL",
        note_body: "",
        promo_discount_pct: 15,
        promo_button_label: "Shop the Store",
        promo_button_url: "/shop",
        news_mode: "auto",
        blog_mode: "auto",
      }),
    });
    if (res.ok) {
      const created: NLCampaign = await res.json();
      setCampaigns((prev) => [created, ...prev]);
      setSelected(created);
      setTab("editor");
    } else {
      flash("Failed to create issue.");
    }
  }

  const TABS = [
    { id: "issues" as const,     label: "Issues",      Icon: LayoutList },
    { id: "editor" as const,     label: "Editor",      Icon: Pencil },
    { id: "promotions" as const, label: "Promotions",  Icon: Megaphone },
    { id: "recipients" as const, label: "Recipients",  Icon: Users },
    { id: "analytics" as const,  label: "Analytics",   Icon: BarChart2 },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold text-owl-ink">Newsletter</h2>
          <p className="mt-0.5 text-sm text-owl-mist">
            OWL Weekly issues · Promotions · Delivery · Analytics
          </p>
        </div>
        <button
          onClick={() => void createIssue()}
          className="inline-flex items-center gap-2 rounded-owl-btn bg-owl-teal px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-owl-teal-deep"
        >
          <Plus className="h-4 w-4" aria-hidden /> New Issue
        </button>
      </div>

      {/* Flash message */}
      {msg && (
        <p className="rounded-lg bg-owl-teal/10 px-4 py-2 text-sm font-medium text-owl-teal">
          {msg}
        </p>
      )}

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-owl-cream-deep">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              "flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
              tab === id
                ? "border-owl-teal text-owl-teal"
                : "border-transparent text-owl-mist hover:text-owl-ink"
            )}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden />
            {label}
          </button>
        ))}
      </div>

      {/* ── ISSUES TAB ── */}
      {tab === "issues" && (
        <div className="rounded-owl-card border border-owl-cream-deep bg-white">
          {loading ? (
            <div className="p-8 text-center text-sm text-owl-mist">Loading…</div>
          ) : campaigns.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-owl-mist">No issues yet.</p>
              <button onClick={() => void createIssue()} className="mt-3 text-sm font-semibold text-owl-teal hover:underline">
                Create Issue #1
              </button>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-owl-cream-deep text-left text-xs uppercase tracking-wider text-owl-mist">
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Recipients</th>
                  <th className="px-4 py-3">Opens</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.filter(c => c.issue_number !== null).map((c) => (
                  <tr key={c.id} className="border-b border-owl-cream-deep last:border-0 hover:bg-owl-cream/30">
                    <td className="px-4 py-3 font-semibold text-owl-ink">#{c.issue_number}</td>
                    <td className="px-4 py-3 text-owl-ink">{c.title}</td>
                    <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                    <td className="px-4 py-3 text-owl-mist">
                      {c.publication_date
                        ? new Date(c.publication_date + "T12:00:00Z").toLocaleDateString("en-US", { month:"short",day:"numeric",year:"numeric" })
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-owl-mist">{c.recipients_count || "—"}</td>
                    <td className="px-4 py-3 text-owl-mist">
                      {c.open_count && c.recipients_count
                        ? `${Math.round((c.open_count / c.recipients_count) * 100)}%`
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { setSelected(c); setTab("editor"); }}
                          className="rounded px-2 py-1 text-xs font-medium text-owl-teal hover:bg-owl-teal/10"
                        >
                          <Pencil className="h-3.5 w-3.5 inline mr-1" aria-hidden />Edit
                        </button>
                        {c.archive_slug && (
                          <a
                            href={`/newsletter/${c.archive_slug}`}
                            target="_blank"
                            rel="noopener"
                            className="rounded px-2 py-1 text-xs font-medium text-owl-mist hover:bg-owl-cream"
                          >
                            <Eye className="h-3.5 w-3.5 inline mr-1" aria-hidden />Preview
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── EDITOR TAB ── */}
      {tab === "editor" && (
        <div className="space-y-5">
          {/* Issue selector */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={selected?.id ?? ""}
                onChange={(e) => {
                  const found = campaigns.find((c) => c.id === e.target.value);
                  setSelected(found ?? null);
                }}
                className="appearance-none rounded-owl-btn border border-owl-cream-deep bg-white py-2 pl-3 pr-8 text-sm font-medium text-owl-ink focus:outline-none focus:ring-2 focus:ring-owl-teal/40"
              >
                <option value="">— Select an issue —</option>
                {campaigns.filter(c => c.issue_number !== null).map((c) => (
                  <option key={c.id} value={c.id}>
                    Issue #{c.issue_number}: {c.title}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-owl-mist" aria-hidden />
            </div>
            {selected && (
              <>
                <StatusBadge status={selected.status} />
                {selected.archive_slug && (
                  <a
                    href={`/newsletter/${selected.archive_slug}`}
                    target="_blank"
                    rel="noopener"
                    className="flex items-center gap-1 text-sm font-medium text-owl-teal hover:underline"
                  >
                    <Eye className="h-3.5 w-3.5" /> Preview
                  </a>
                )}
              </>
            )}
          </div>

          {!selected ? (
            <div className="rounded-owl-card border border-owl-cream-deep bg-white p-8 text-center text-sm text-owl-mist">
              Select or create an issue to edit.
            </div>
          ) : (
            <EditorPanel
              campaign={selected}
              posts={posts}
              saving={saving}
              onSave={saveCampaign}
            />
          )}
        </div>
      )}

      {/* ── PROMOTIONS TAB ── */}
      {tab === "promotions" && (
        <PromotionsPanel
          coupons={coupons}
          campaigns={campaigns}
          onRefresh={load}
          flash={flash}
        />
      )}

      {/* ── RECIPIENTS TAB ── */}
      {tab === "recipients" && (
        <div className="rounded-owl-card border border-owl-cream-deep bg-white p-6">
          <p className="font-semibold text-owl-ink">Subscriber overview</p>
          <p className="mt-2 text-sm text-owl-mist">
            Subscribers are managed in Beehiiv and synced via the newsletter_subscribers table.
            Consent records, suppression lists, and unsubscribes are respected automatically during delivery.
          </p>
          <RecipientsPanel />
        </div>
      )}

      {/* ── ANALYTICS TAB ── */}
      {tab === "analytics" && (
        <AnalyticsPanel campaigns={campaigns} coupons={coupons} />
      )}
    </div>
  );
}

// ── Editor Panel ──────────────────────────────────────────────────────────────

function EditorPanel({
  campaign, posts, saving, onSave,
}: {
  campaign: NLCampaign;
  posts: ContentPost[];
  saving: boolean;
  onSave: (patch: Partial<NLCampaign>) => Promise<void>;
}) {
  const [draft, setDraft] = useState<Partial<NLCampaign>>({});
  const field = <K extends keyof NLCampaign>(k: K) =>
    (draft[k] !== undefined ? draft[k] : campaign[k]) as string;

  function set<K extends keyof NLCampaign>(k: K, v: NLCampaign[K]) {
    setDraft((d) => ({ ...d, [k]: v }));
  }

  async function save() {
    await onSave(draft);
    setDraft({});
  }

  const newsOptions = posts.filter((p) => p.content_type === "news");
  const blogOptions = posts.filter((p) => p.content_type === "blog");

  return (
    <div className="space-y-5">
      {/* ── Header meta ── */}
      <Panel title="Issue header">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Issue number">
            <input type="number" value={campaign.issue_number ?? ""} disabled
              className="input-base bg-gray-50 text-gray-400 cursor-not-allowed" />
          </Field>
          <Field label="Status">
            <select
              value={field("status")}
              onChange={(e) => set("status", e.target.value)}
              className="input-base"
            >
              {["draft","scheduled","published","sent","canceled"].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="Publication date">
            <input type="date" value={field("publication_date") ?? ""}
              onChange={(e) => set("publication_date", e.target.value)} className="input-base" />
          </Field>
          <Field label="Scheduled send (UTC)" className="sm:col-span-2">
            <input type="datetime-local" value={(draft.scheduled_for ?? campaign.scheduled_for ?? "").replace("Z","").replace(/\.\d+$/,"")}
              onChange={(e) => set("scheduled_for", e.target.value ? e.target.value + ":00Z" : null)}
              className="input-base" />
          </Field>
        </div>
      </Panel>

      {/* ── Note from OWL ── */}
      <Panel title="A Note from OWL">
        <div className="space-y-3">
          <Field label="Section title">
            <input type="text" value={field("note_title") ?? ""}
              onChange={(e) => set("note_title", e.target.value)} className="input-base" />
          </Field>
          <Field label="Message body">
            <textarea rows={4} value={field("note_body") ?? ""}
              onChange={(e) => set("note_body", e.target.value)}
              className="input-base resize-none" placeholder="Write your weekly note here…" />
          </Field>
        </div>
      </Panel>

      {/* ── Store promotion ── */}
      <Panel title="Weekly Store Promotion">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Promo headline">
            <input type="text" value={field("promo_headline") ?? ""}
              onChange={(e) => set("promo_headline", e.target.value)} className="input-base"
              placeholder="This Week's Store Perk" />
          </Field>
          <Field label="Discount %">
            <input type="number" min={0} max={100} value={campaign.promo_discount_pct ?? 15}
              onChange={(e) => set("promo_discount_pct", parseInt(e.target.value))}
              className="input-base" />
          </Field>
          <Field label="Featured product slug">
            <input type="text" value={field("promo_product_slug") ?? ""}
              onChange={(e) => set("promo_product_slug", e.target.value)} className="input-base"
              placeholder="owl-sweatshirt" />
          </Field>
          <Field label="Promo subheading">
            <input type="text" value={field("promo_subheading") ?? ""}
              onChange={(e) => set("promo_subheading", e.target.value)} className="input-base"
              placeholder="Exclusively for OWL Weekly subscribers" />
          </Field>
          <Field label="Button label">
            <input type="text" value={field("promo_button_label") ?? ""}
              onChange={(e) => set("promo_button_label", e.target.value)} className="input-base" />
          </Field>
          <Field label="Button URL">
            <input type="text" value={field("promo_button_url") ?? ""}
              onChange={(e) => set("promo_button_url", e.target.value)} className="input-base" />
          </Field>
          <Field label="Promo starts">
            <input type="datetime-local"
              value={(draft.promo_starts_at ?? campaign.promo_starts_at ?? "").replace("Z","").replace(/\.\d+$/,"")}
              onChange={(e) => set("promo_starts_at", e.target.value ? e.target.value + ":00Z" : null)}
              className="input-base" />
          </Field>
          <Field label="Promo expires">
            <input type="datetime-local"
              value={(draft.promo_expires_at ?? campaign.promo_expires_at ?? "").replace("Z","").replace(/\.\d+$/,"")}
              onChange={(e) => set("promo_expires_at", e.target.value ? e.target.value + ":00Z" : null)}
              className="input-base" />
          </Field>
        </div>
      </Panel>

      {/* ── Parenting tip ── */}
      <Panel title="Parenting Tip (optional)">
        <div className="space-y-3">
          <Field label="Tip title">
            <input type="text" value={field("tip_title") ?? ""}
              onChange={(e) => set("tip_title", e.target.value)} className="input-base"
              placeholder="Create Calm with Daily Routines" />
          </Field>
          <Field label="Tip body">
            <textarea rows={3} value={field("tip_body") ?? ""}
              onChange={(e) => set("tip_body", e.target.value)} className="input-base resize-none" />
          </Field>
          <Field label="Age range badge">
            <input type="text" value={field("tip_age_range") ?? ""}
              onChange={(e) => set("tip_age_range", e.target.value)} className="input-base"
              placeholder="Infant – 12" />
          </Field>
          <Field label="OWL takeaway (shown at bottom of tip block)">
            <input type="text" value={field("tip_takeaway") ?? ""}
              onChange={(e) => set("tip_takeaway", e.target.value)} className="input-base"
              placeholder="Connection, consistency, and age-appropriate support help children grow with confidence." />
          </Field>
        </div>
      </Panel>

      {/* ── Health alert ── */}
      <Panel title="Children's Health Alert (optional)">
        <div className="space-y-3">
          <Field label="Alert title">
            <input type="text" value={field("health_alert_title") ?? ""}
              onChange={(e) => set("health_alert_title", e.target.value)} className="input-base"
              placeholder="Food Recall Alert" />
          </Field>
          <Field label="Alert body">
            <textarea rows={2} value={field("health_alert_body") ?? ""}
              onChange={(e) => set("health_alert_body", e.target.value)} className="input-base resize-none" />
          </Field>
          <Field label="Read Alert URL">
            <input type="text" value={field("health_alert_url") ?? ""}
              onChange={(e) => set("health_alert_url", e.target.value)} className="input-base"
              placeholder="https://www.fda.gov/recalls" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Product name">
              <input type="text" value={field("health_alert_product_name") ?? ""}
                onChange={(e) => set("health_alert_product_name", e.target.value)} className="input-base"
                placeholder="e.g. Organic Apple Pouches" />
            </Field>
            <Field label="Brand">
              <input type="text" value={field("health_alert_brand") ?? ""}
                onChange={(e) => set("health_alert_brand", e.target.value)} className="input-base"
                placeholder="e.g. Happy Baby" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Recall date">
              <input type="date" value={field("health_alert_recall_date") ?? ""}
                onChange={(e) => set("health_alert_recall_date", e.target.value)} className="input-base" />
            </Field>
            <Field label="Source agency">
              <input type="text" value={field("health_alert_source_name") ?? ""}
                onChange={(e) => set("health_alert_source_name", e.target.value)} className="input-base"
                placeholder="e.g. USDA FSIS, CPSC, FDA" />
            </Field>
          </div>
        </div>
      </Panel>

      {/* ── Content selection ── */}
      <Panel title="News &amp; Blog Content">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-owl-mist">News selection mode</label>
            <div className="flex gap-3">
              {["auto","manual"].map((m) => (
                <label key={m} className="flex cursor-pointer items-center gap-2 text-sm">
                  <input type="radio" name="news_mode" value={m}
                    checked={(draft.news_mode ?? campaign.news_mode ?? "auto") === m}
                    onChange={() => set("news_mode", m)}
                    className="accent-owl-teal" />
                  {m === "auto" ? "Auto (latest 3)" : "Manual picks"}
                </label>
              ))}
            </div>
            {(draft.news_mode ?? campaign.news_mode) === "manual" && (
              <p className="mt-2 text-xs text-owl-mist">
                Pick articles in Supabase → newsletter_issue_news, or use the auto picker above.
              </p>
            )}
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-owl-mist">Blog selection mode</label>
            <div className="flex gap-3">
              {["auto","manual"].map((m) => (
                <label key={m} className="flex cursor-pointer items-center gap-2 text-sm">
                  <input type="radio" name="blog_mode" value={m}
                    checked={(draft.blog_mode ?? campaign.blog_mode ?? "auto") === m}
                    onChange={() => set("blog_mode", m)}
                    className="accent-owl-teal" />
                  {m === "auto" ? "Auto (latest 3)" : "Manual picks"}
                </label>
              ))}
            </div>
          </div>
        </div>
        {newsOptions.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-semibold text-owl-mist mb-2">Available news articles ({newsOptions.length})</p>
            <div className="max-h-32 overflow-y-auto rounded-lg border border-owl-cream-deep bg-gray-50 p-2 text-xs text-owl-ink space-y-1">
              {newsOptions.slice(0,10).map((p) => (
                <div key={p.id} className="flex items-center gap-2">
                  <span className="rounded bg-owl-teal/10 px-1.5 py-0.5 text-[9px] font-bold text-owl-teal uppercase">{p.category}</span>
                  <span className="truncate">{p.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Panel>

      {/* ── Save / publish ── */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => void save()}
          disabled={saving || Object.keys(draft).length === 0}
          className="inline-flex items-center gap-2 rounded-owl-btn bg-owl-teal px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-owl-teal-deep disabled:opacity-50"
        >
          {saving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : null}
          Save changes
        </button>
        <button
          onClick={() => void onSave({ status: "published" })}
          className="inline-flex items-center gap-2 rounded-owl-btn bg-owl-forest px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-owl-forest/90"
        >
          <CheckCircle className="h-3.5 w-3.5" /> Publish
        </button>
        <button
          onClick={() => void onSave({ status: "scheduled" })}
          className="inline-flex items-center gap-2 rounded-owl-btn border border-owl-teal/40 px-5 py-2.5 text-sm font-semibold text-owl-teal transition-colors hover:bg-owl-teal/5"
        >
          <Clock className="h-3.5 w-3.5" /> Schedule
        </button>
        <TestSendButton campaignId={campaign.id} />
      </div>
    </div>
  );
}

// ── Test send ─────────────────────────────────────────────────────────────────

function TestSendButton({ campaignId }: { campaignId: string }) {
  const [email, setEmail] = useState("");
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState("");

  async function send() {
    setSending(true);
    const res = await fetch("/api/admin/newsletter/test-send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ campaignId, to: email }),
    });
    setResult(res.ok ? "Test sent ✓" : "Send failed — check logs");
    setSending(false);
    setTimeout(() => { setResult(""); setOpen(false); }, 3000);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-owl-btn border border-owl-cream-deep px-4 py-2.5 text-sm font-semibold text-owl-ink transition-colors hover:bg-owl-cream"
      >
        <Send className="h-3.5 w-3.5" /> Test email
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-owl-card bg-white p-6 shadow-owl-2">
            <p className="font-semibold text-owl-ink mb-3">Send test email</p>
            <input type="email" placeholder="Recipient email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-base w-full mb-3" />
            {result && <p className="mb-3 text-sm font-medium text-owl-teal">{result}</p>}
            <div className="flex gap-2">
              <button onClick={() => void send()} disabled={!email || sending}
                className="flex-1 rounded-owl-btn bg-owl-teal py-2 text-sm font-semibold text-white disabled:opacity-50">
                {sending ? "Sending…" : "Send"}
              </button>
              <button onClick={() => setOpen(false)}
                className="flex-1 rounded-owl-btn border border-owl-cream-deep py-2 text-sm font-semibold text-owl-ink">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Promotions Panel ──────────────────────────────────────────────────────────

function PromotionsPanel({
  coupons, campaigns, onRefresh, flash,
}: {
  coupons: CouponCampaign[];
  campaigns: NLCampaign[];
  onRefresh: () => void;
  flash: (m: string) => void;
}) {
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    name: "", display_code: "OWLWEEKLY15", discount_value: 15,
    newsletter_campaign_id: "", starts_at: "", expires_at: "",
    applies_to: "order",
  });

  async function create() {
    setCreating(true);
    const res = await fetch("/api/admin/newsletter/coupon-campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      flash("Coupon campaign created ✓");
      onRefresh();
    } else {
      flash("Failed to create coupon campaign.");
    }
    setCreating(false);
  }

  async function endCampaign(id: string) {
    const res = await fetch(`/api/admin/newsletter/coupon-campaigns/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "ended" }),
    });
    if (res.ok) { flash("Campaign ended ✓"); onRefresh(); }
  }

  return (
    <div className="space-y-5">
      {/* Existing campaigns */}
      <div className="rounded-owl-card border border-owl-cream-deep bg-white">
        <div className="border-b border-owl-cream-deep px-5 py-3 font-semibold text-owl-ink">
          Coupon Campaigns
        </div>
        {coupons.length === 0 ? (
          <p className="p-5 text-sm text-owl-mist">No coupon campaigns yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-owl-cream-deep text-left text-xs uppercase tracking-wider text-owl-mist">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Discount</th>
                <th className="px-4 py-3">Expires</th>
                <th className="px-4 py-3">Redeemed</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.id} className="border-b border-owl-cream-deep last:border-0">
                  <td className="px-4 py-3 font-medium text-owl-ink">{c.name}</td>
                  <td className="px-4 py-3">
                    <code className="rounded bg-owl-cream px-1.5 py-0.5 text-xs">{c.display_code ?? "—"}</code>
                  </td>
                  <td className="px-4 py-3 text-owl-ink">{c.discount_value}%</td>
                  <td className="px-4 py-3 text-owl-mist">
                    {new Date(c.expires_at).toLocaleDateString("en-US",{month:"short",day:"numeric"})}
                  </td>
                  <td className="px-4 py-3 text-owl-mist">{c.redeemed_count}/{c.eligible_user_count || "—"}</td>
                  <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                  <td className="px-4 py-3">
                    {c.status === "active" && (
                      <button onClick={() => void endCampaign(c.id)}
                        className="text-xs text-red-500 hover:underline">
                        End early
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create new campaign */}
      <Panel title="Create New Coupon Campaign">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Campaign name">
            <input type="text" value={form.name}
              onChange={(e) => setForm(f => ({...f, name: e.target.value}))}
              className="input-base" placeholder="OWL Weekly Issue #1 — 15% Off" />
          </Field>
          <Field label="Display code (cosmetic)">
            <input type="text" value={form.display_code}
              onChange={(e) => setForm(f => ({...f, display_code: e.target.value}))}
              className="input-base" />
          </Field>
          <Field label="Discount %">
            <input type="number" min={1} max={100} value={form.discount_value}
              onChange={(e) => setForm(f => ({...f, discount_value: parseInt(e.target.value)}))}
              className="input-base" />
          </Field>
          <Field label="Linked newsletter issue">
            <select value={form.newsletter_campaign_id}
              onChange={(e) => setForm(f => ({...f, newsletter_campaign_id: e.target.value}))}
              className="input-base">
              <option value="">— None —</option>
              {campaigns.filter(c => c.issue_number).map((c) => (
                <option key={c.id} value={c.id}>Issue #{c.issue_number}: {c.title}</option>
              ))}
            </select>
          </Field>
          <Field label="Starts at (UTC)">
            <input type="datetime-local" value={form.starts_at}
              onChange={(e) => setForm(f => ({...f, starts_at: e.target.value + ":00Z"}))}
              className="input-base" />
          </Field>
          <Field label="Expires at (UTC)">
            <input type="datetime-local" value={form.expires_at}
              onChange={(e) => setForm(f => ({...f, expires_at: e.target.value + ":00Z"}))}
              className="input-base" />
          </Field>
        </div>
        <button
          onClick={() => void create()}
          disabled={creating || !form.name || !form.starts_at || !form.expires_at}
          className="mt-4 inline-flex items-center gap-2 rounded-owl-btn bg-owl-teal px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {creating ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
          Create Campaign
        </button>
      </Panel>
    </div>
  );
}

// ── Recipients Panel ──────────────────────────────────────────────────────────

function RecipientsPanel() {
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    fetch("/api/admin/newsletter/subscribers")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => d?.count !== undefined ? setCount(d.count) : null)
      .catch(() => null);
  }, []);
  return (
    <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
      <div className="rounded-owl-card border border-owl-cream-deep p-4">
        <p className="text-xs font-medium uppercase tracking-wider text-owl-mist">Active subscribers</p>
        <p className="mt-2 font-display text-2xl font-semibold text-owl-ink">
          {count !== null ? count.toLocaleString() : "—"}
        </p>
      </div>
    </div>
  );
}

// ── Analytics Panel ───────────────────────────────────────────────────────────

function AnalyticsPanel({ campaigns, coupons }: { campaigns: NLCampaign[]; coupons: CouponCampaign[] }) {
  const sentCampaigns = campaigns.filter((c) => c.status === "sent");
  const totalSent = sentCampaigns.reduce((s, c) => s + (c.recipients_count || 0), 0);
  const totalOpens = sentCampaigns.reduce((s, c) => s + (c.open_count || 0), 0);
  const totalClicks = sentCampaigns.reduce((s, c) => s + (c.click_count || 0), 0);
  const totalRedeemed = coupons.reduce((s, c) => s + (c.redeemed_count || 0), 0);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Issues sent", value: sentCampaigns.length },
          { label: "Total recipients", value: totalSent.toLocaleString() },
          { label: "Total opens", value: totalOpens.toLocaleString() },
          { label: "Coupon redemptions", value: totalRedeemed.toLocaleString() },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-owl-card border border-owl-cream-deep bg-white p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-owl-mist">{label}</p>
            <p className="mt-2 font-display text-2xl font-semibold text-owl-ink">{value}</p>
          </div>
        ))}
      </div>
      <div className="rounded-owl-card border border-owl-cream-deep bg-white p-6">
        <p className="font-semibold text-owl-ink mb-3">Per-issue delivery</p>
        {sentCampaigns.length === 0 ? (
          <p className="text-sm text-owl-mist">No sent campaigns yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-owl-cream-deep text-left text-xs text-owl-mist">
                <th className="py-2 pr-4">Issue</th>
                <th className="py-2 pr-4">Sent</th>
                <th className="py-2 pr-4">Opens</th>
                <th className="py-2 pr-4">Clicks</th>
              </tr>
            </thead>
            <tbody>
              {sentCampaigns.map((c) => (
                <tr key={c.id} className="border-b border-owl-cream-deep last:border-0">
                  <td className="py-2 pr-4 font-medium text-owl-ink">#{c.issue_number}</td>
                  <td className="py-2 pr-4 text-owl-mist">{c.recipients_count || 0}</td>
                  <td className="py-2 pr-4 text-owl-mist">
                    {c.open_count && c.recipients_count
                      ? `${c.open_count} (${Math.round(c.open_count/c.recipients_count*100)}%)`
                      : "0"}
                  </td>
                  <td className="py-2 pr-4 text-owl-mist">
                    {c.click_count && c.recipients_count
                      ? `${c.click_count} (${Math.round(c.click_count/c.recipients_count*100)}%)`
                      : "0"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ── Shared micro-components ───────────────────────────────────────────────────

function Panel({ title, children, className }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-owl-card border border-owl-cream-deep bg-white p-5", className)}>
      {title && <p className="mb-4 font-semibold text-owl-ink">{title}</p>}
      {children}
    </section>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <label className="text-xs font-semibold text-owl-mist">{label}</label>
      {children}
    </div>
  );
}

// Inject input base styles via a style tag (Tailwind only)
// The `input-base` class below is defined as a Tailwind @apply utility in globals.css.
// If not available, it falls back to inline classes. We append the class list directly:
;(function patchInputBase() {
  if (typeof document === "undefined") return;
  if (document.getElementById("owl-input-base-style")) return;
  const s = document.createElement("style");
  s.id = "owl-input-base-style";
  s.textContent = `.input-base{display:block;width:100%;border-radius:0.5rem;border:1px solid #e5e7eb;padding:0.5rem 0.75rem;font-size:0.875rem;color:#1a1a2e;background:#fff;transition:border-color 0.15s;outline:none}.input-base:focus{border-color:#0da89f;box-shadow:0 0 0 2px rgba(13,168,159,0.2)}.input-base:disabled{background:#f9fafb}`;
  document.head.appendChild(s);
})();

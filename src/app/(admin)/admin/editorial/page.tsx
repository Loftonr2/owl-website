"use client";

import { useEffect, useState, useCallback } from "react";
import {
  CalendarDays, AlertTriangle, CheckCircle2, Clock, ImageOff,
  Search, RefreshCw, ChevronLeft, ChevronRight, Filter,
  Target, FileText, Newspaper, X, Pencil, CheckCheck,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type WorkflowStatus =
  | "topic_identified" | "researching" | "draft" | "editing"
  | "awaiting_approval" | "approved" | "scheduled" | "published"
  | "needs_updating" | "archived";

interface CalendarItem {
  id: string;
  content_type: "news" | "blog";
  title: string;
  slug: string;
  category: string;
  author: string | null;
  workflow_status: WorkflowStatus;
  status: string;
  publish_date: string | null;
  target_pub_time: string | null;
  draft_deadline: string | null;
  approval_deadline: string | null;
  featured_image: string | null;
  primary_keyword: string | null;
  editorial_priority: number;
  newsletter_eligible: boolean;
  reviewer_name: string | null;
  reviewer_approved_at: string | null;
  seo_title: string | null;
  seo_description: string | null;
  publish_failed_at: string | null;
  publish_failure_reason: string | null;
}

interface EditorialAlert {
  id: number;
  alert_type: string;
  severity: "error" | "warning" | "info";
  title: string;
  body: string;
  related_date: string | null;
  related_post: string | null;
  created_at: string;
}

interface PublishingTarget {
  week_start?: string;
  news_per_week?: number;
  blogs_per_week?: number;
}

interface EditorialData {
  items: CalendarItem[];
  alerts: EditorialAlert[];
  target: PublishingTarget;
  stats: { published_this_week: number; awaiting_approval: number };
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_META: Record<WorkflowStatus, { label: string; color: string; dot: string }> = {
  topic_identified: { label: "Topic",     color: "bg-slate-100 text-slate-700",   dot: "bg-slate-400" },
  researching:      { label: "Research",  color: "bg-blue-100 text-blue-700",     dot: "bg-blue-500" },
  draft:            { label: "Draft",     color: "bg-amber-100 text-amber-700",   dot: "bg-amber-500" },
  editing:          { label: "Editing",   color: "bg-orange-100 text-orange-700", dot: "bg-orange-500" },
  awaiting_approval:{ label: "Approval",  color: "bg-purple-100 text-purple-700", dot: "bg-purple-500" },
  approved:         { label: "Approved",  color: "bg-teal-100 text-teal-700",     dot: "bg-teal-500" },
  scheduled:        { label: "Scheduled", color: "bg-sky-100 text-sky-700",       dot: "bg-sky-500" },
  published:        { label: "Published", color: "bg-green-100 text-green-700",   dot: "bg-green-500" },
  needs_updating:   { label: "Needs Update",color:"bg-red-100 text-red-700",      dot: "bg-red-500" },
  archived:         { label: "Archived",  color: "bg-gray-100 text-gray-500",     dot: "bg-gray-400" },
};

const WORKFLOW_TRANSITIONS: Record<WorkflowStatus, WorkflowStatus[]> = {
  topic_identified:  ["researching","archived"],
  researching:       ["draft","topic_identified"],
  draft:             ["editing","researching"],
  editing:           ["awaiting_approval","draft"],
  awaiting_approval: ["approved","editing"],
  approved:          ["scheduled","editing"],
  scheduled:         ["published","approved"],
  published:         ["needs_updating","archived"],
  needs_updating:    ["draft","archived"],
  archived:          [],
};

const QUEUE_TABS = [
  { id: "calendar",          label: "Calendar" },
  { id: "topics",            label: "Topics" },
  { id: "drafts",            label: "Drafts" },
  { id: "awaiting_approval", label: "Awaiting Approval" },
  { id: "approved",          label: "Approved & Unscheduled" },
  { id: "scheduled",         label: "Scheduled" },
  { id: "failed",            label: "Failed" },
] as const;

type TabId = typeof QUEUE_TABS[number]["id"];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtDate(d: string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function isoDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function seoComplete(item: CalendarItem): boolean {
  return !!(item.seo_title && item.seo_description && item.primary_keyword);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: WorkflowStatus }) {
  const m = STATUS_META[status];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${m.color}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  );
}

function AlertBanner({
  alert,
  onDismiss,
}: {
  alert: EditorialAlert;
  onDismiss: (id: number) => void;
}) {
  const colors = {
    error:   "bg-red-50 border-red-200 text-red-800",
    warning: "bg-amber-50 border-amber-200 text-amber-800",
    info:    "bg-sky-50 border-sky-200 text-sky-800",
  };
  const icons = {
    error:   <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />,
    warning: <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />,
    info:    <CheckCircle2 className="h-4 w-4 text-sky-500 shrink-0" />,
  };
  return (
    <div className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm ${colors[alert.severity]}`}>
      {icons[alert.severity]}
      <div className="flex-1 min-w-0">
        <p className="font-semibold">{alert.title}</p>
        <p className="mt-0.5 opacity-80">{alert.body}</p>
      </div>
      <button
        onClick={() => onDismiss(alert.id)}
        className="rounded p-0.5 opacity-60 hover:opacity-100"
        aria-label="Dismiss alert"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function EditDrawer({
  item,
  onClose,
  onSave,
}: {
  item: CalendarItem | null;
  onClose: () => void;
  onSave: (id: string, patch: Partial<CalendarItem>) => void;
}) {
  const [patch, setPatch] = useState<Partial<CalendarItem>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (item) setPatch({});
  }, [item]);

  if (!item) return null;

  const merged = { ...item, ...patch };

  async function save() {
    if (!item || Object.keys(patch).length === 0) return;
    setSaving(true);
    await onSave(item.id, patch);
    setSaving(false);
  }

  const nextStatuses = WORKFLOW_TRANSITIONS[item.workflow_status] ?? [];

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <aside className="w-full max-w-md overflow-y-auto bg-white shadow-xl flex flex-col">
        <div className="flex items-center justify-between border-b border-owl-cream-deep px-5 py-4">
          <h2 className="font-display text-base font-semibold text-owl-ink truncate">{item.title}</h2>
          <button onClick={onClose} className="rounded p-1 text-owl-mist hover:text-owl-ink">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-5 px-5 py-5">
          {/* Current status */}
          <div>
            <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-owl-mist">Status</p>
            <StatusBadge status={merged.workflow_status} />
          </div>

          {/* Move to next status */}
          {nextStatuses.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-owl-mist">Move to</p>
              <div className="flex flex-wrap gap-2">
                {nextStatuses.map((s) => (
                  <button
                    key={s}
                    onClick={() => setPatch((p) => ({ ...p, workflow_status: s }))}
                    className={`rounded-owl-btn px-3 py-1.5 text-xs font-medium transition-colors border ${
                      patch.workflow_status === s
                        ? "border-owl-teal bg-owl-teal/10 text-owl-teal-deep"
                        : "border-owl-cream-deep bg-white text-owl-ink hover:border-owl-teal"
                    }`}
                  >
                    {STATUS_META[s].label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Publish date */}
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-owl-mist">
              Publish Date
            </label>
            <input
              type="date"
              value={merged.publish_date?.split("T")[0] ?? ""}
              onChange={(e) => setPatch((p) => ({ ...p, publish_date: e.target.value }))}
              className="w-full rounded-owl-btn border border-owl-cream-deep bg-owl-cream px-3 py-2 text-sm text-owl-ink focus:border-owl-teal focus:outline-none"
            />
          </div>

          {/* Reviewer name (shows when approving) */}
          {(merged.workflow_status === "awaiting_approval" || patch.workflow_status === "approved") && (
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-owl-mist">
                Reviewer Name
              </label>
              <input
                type="text"
                value={(patch.reviewer_name as string | undefined) ?? item.reviewer_name ?? ""}
                onChange={(e) => setPatch((p) => ({ ...p, reviewer_name: e.target.value }))}
                placeholder="Your name"
                className="w-full rounded-owl-btn border border-owl-cream-deep bg-owl-cream px-3 py-2 text-sm text-owl-ink focus:border-owl-teal focus:outline-none"
              />
            </div>
          )}

          {/* SEO status */}
          <div className="rounded-owl-btn border border-owl-cream-deep bg-owl-cream p-3 space-y-1 text-sm">
            <p className="font-medium text-owl-ink">SEO Checklist</p>
            {[
              ["Primary keyword", !!merged.primary_keyword],
              ["SEO title", !!merged.seo_title],
              ["SEO description", !!merged.seo_description],
              ["Featured image", !!merged.featured_image],
            ].map(([label, ok]) => (
              <div key={label as string} className="flex items-center gap-2 text-xs">
                {ok ? (
                  <CheckCheck className="h-3.5 w-3.5 text-green-500" />
                ) : (
                  <X className="h-3.5 w-3.5 text-red-400" />
                )}
                <span className={ok ? "text-owl-ink/70" : "text-red-600"}>{label as string}</span>
              </div>
            ))}
          </div>

          {/* Newsletter eligible toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-owl-ink">Newsletter eligible</span>
            <button
              onClick={() => setPatch((p) => ({ ...p, newsletter_eligible: !merged.newsletter_eligible }))}
              className={`relative inline-flex h-5 w-9 rounded-full transition-colors ${
                merged.newsletter_eligible ? "bg-owl-teal" : "bg-owl-cream-deep"
              }`}
              aria-checked={merged.newsletter_eligible}
              role="switch"
            >
              <span
                className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                  merged.newsletter_eligible ? "translate-x-4" : ""
                }`}
              />
            </button>
          </div>
        </div>

        <div className="border-t border-owl-cream-deep px-5 py-4 flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-owl-btn border border-owl-cream-deep py-2 text-sm font-medium text-owl-ink hover:bg-owl-cream transition-colors">
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving || Object.keys(patch).length === 0}
            className="flex-1 rounded-owl-btn bg-owl-teal py-2 text-sm font-semibold text-white hover:bg-owl-teal-deep transition-colors disabled:opacity-40"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </aside>
    </div>
  );
}

// ─── Calendar Grid ────────────────────────────────────────────────────────────

function CalendarGrid({
  items,
  weekStart,
  onEdit,
}: {
  items: CalendarItem[];
  weekStart: Date;
  onEdit: (item: CalendarItem) => void;
}) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const today = isoDate(new Date());

  return (
    <div className="grid grid-cols-7 gap-px bg-owl-cream-deep rounded-owl-btn overflow-hidden">
      {/* Headers */}
      {days.map((d) => {
        const ds = isoDate(d);
        const isToday = ds === today;
        return (
          <div
            key={ds}
            className={`px-2 py-1.5 text-center text-xs font-medium ${
              isToday ? "bg-owl-teal/10 text-owl-teal-deep" : "bg-white text-owl-mist"
            }`}
          >
            <p className="uppercase tracking-wider">{d.toLocaleDateString("en-US", { weekday: "short" })}</p>
            <p className={`text-base font-bold ${isToday ? "text-owl-teal" : "text-owl-ink"}`}>
              {d.getDate()}
            </p>
          </div>
        );
      })}

      {/* Day cells */}
      {days.map((d) => {
        const ds = isoDate(d);
        const dayItems = items.filter((it) => it.publish_date?.startsWith(ds));
        const isEmpty = dayItems.length === 0;
        const isPast = ds < today;

        return (
          <div
            key={`cell-${ds}`}
            className={`min-h-28 p-1.5 space-y-1 ${
              isEmpty && !isPast
                ? "bg-red-50/60"
                : isEmpty
                ? "bg-gray-50/60"
                : "bg-white"
            }`}
          >
            {isEmpty && !isPast && (
              <div className="flex items-center justify-center h-full">
                <span className="text-xs text-red-400 font-medium">No content</span>
              </div>
            )}
            {dayItems.map((it) => {
              const m = STATUS_META[it.workflow_status];
              return (
                <button
                  key={it.id}
                  onClick={() => onEdit(it)}
                  className="w-full text-left rounded-md border border-owl-cream-deep bg-white px-2 py-1.5 hover:border-owl-teal hover:shadow-sm transition-all group"
                >
                  <div className="flex items-center gap-1 mb-0.5">
                    <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${m.dot}`} />
                    <span className="text-[10px] font-medium uppercase tracking-wider text-owl-mist">
                      {it.content_type}
                    </span>
                    {!it.featured_image && (
                      <ImageOff className="h-3 w-3 text-orange-400 ml-auto" aria-label="Missing image" />
                    )}
                    {!seoComplete(it) && (
                      <Search className="h-3 w-3 text-orange-400" aria-label="SEO incomplete" />
                    )}
                  </div>
                  <p className="text-xs text-owl-ink font-medium leading-tight line-clamp-2 group-hover:text-owl-teal-deep">
                    {it.title}
                  </p>
                </button>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

// ─── Queue Table ──────────────────────────────────────────────────────────────

function QueueTable({
  items,
  onEdit,
}: {
  items: CalendarItem[];
  onEdit: (item: CalendarItem) => void;
}) {
  if (items.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-owl-mist">No items in this queue.</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-owl-cream-deep">
            {["Title", "Type", "Status", "Publish Date", "Image", "SEO", "Priority", ""].map((h) => (
              <th key={h} className="px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-owl-mist whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr key={it.id} className="border-b border-owl-cream-deep/60 hover:bg-owl-cream/40 transition-colors">
              <td className="px-3 py-2.5 text-owl-ink font-medium max-w-xs truncate">{it.title}</td>
              <td className="px-3 py-2.5 text-owl-mist capitalize">{it.content_type}</td>
              <td className="px-3 py-2.5"><StatusBadge status={it.workflow_status} /></td>
              <td className="px-3 py-2.5 text-owl-mist whitespace-nowrap">{fmtDate(it.publish_date)}</td>
              <td className="px-3 py-2.5">
                {it.featured_image ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <ImageOff className="h-4 w-4 text-orange-400" />
                )}
              </td>
              <td className="px-3 py-2.5">
                {seoComplete(it) ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <Search className="h-4 w-4 text-orange-400" />
                )}
              </td>
              <td className="px-3 py-2.5 text-owl-mist text-center">{it.editorial_priority}</td>
              <td className="px-3 py-2.5">
                <button
                  onClick={() => onEdit(it)}
                  className="rounded-owl-btn px-2.5 py-1 text-xs font-medium text-owl-teal border border-owl-teal/40 hover:bg-owl-teal/10 transition-colors inline-flex items-center gap-1"
                >
                  <Pencil className="h-3 w-3" />
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function EditorialPage() {
  const [data, setData] = useState<EditorialData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>("calendar");
  const [weekStart, setWeekStart] = useState<Date>(() => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay() + 1); // Monday
    return d;
  });
  const [editItem, setEditItem] = useState<CalendarItem | null>(null);
  const [typeFilter, setTypeFilter] = useState<"all" | "news" | "blog">("all");
  const [generating, setGenerating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const from = isoDate(addDays(weekStart, -7));
      const res = await fetch(`/api/admin/editorial?from=${from}&days=44`);
      if (!res.ok) throw new Error("Failed");
      const json = await res.json() as EditorialData;
      setData(json);
    } catch {
      // keep stale data
    } finally {
      setLoading(false);
    }
  }, [weekStart]);

  useEffect(() => { void load(); }, [load]);

  const allItems = data?.items ?? [];
  const filtered = typeFilter === "all" ? allItems : allItems.filter((i) => i.content_type === typeFilter);

  // Week items for calendar
  const weekEnd = addDays(weekStart, 6);
  const weekItems = filtered.filter((it) => {
    if (!it.publish_date) return false;
    const d = it.publish_date.split("T")[0];
    return d >= isoDate(weekStart) && d <= isoDate(weekEnd);
  });

  // Queue items by tab
  const queueItems: Record<TabId, CalendarItem[]> = {
    calendar: weekItems,
    topics: filtered.filter((i) => ["topic_identified", "researching"].includes(i.workflow_status)),
    drafts: filtered.filter((i) => ["draft", "editing"].includes(i.workflow_status)),
    awaiting_approval: filtered.filter((i) => i.workflow_status === "awaiting_approval"),
    approved: filtered.filter((i) => i.workflow_status === "approved" && !i.publish_date),
    scheduled: filtered.filter((i) => ["approved", "scheduled"].includes(i.workflow_status) && !!i.publish_date),
    failed: filtered.filter((i) => !!i.publish_failed_at),
  };

  async function handleSave(id: string, patch: Partial<CalendarItem>) {
    const res = await fetch(`/api/admin/editorial/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (res.ok) {
      setEditItem(null);
      void load();
    }
  }

  async function dismissAlert(alertId: number) {
    await fetch("/api/admin/editorial/alerts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "dismiss", alertId }),
    });
    setData((d) => d ? { ...d, alerts: d.alerts.filter((a) => a.id !== alertId) } : d);
  }

  async function generateAlerts() {
    setGenerating(true);
    await fetch("/api/admin/editorial/alerts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "generate" }),
    });
    await load();
    setGenerating(false);
  }

  const target = data?.target;
  const stats = data?.stats;

  // Compute target progress for this week
  const newsPublished = weekItems.filter((i) => i.workflow_status === "published" && i.content_type === "news").length;
  const blogsPublished = weekItems.filter((i) => i.workflow_status === "published" && i.content_type === "blog").length;
  const newsTarget = target?.news_per_week ?? 3;
  const blogsTarget = target?.blogs_per_week ?? 2;

  return (
    <div className="space-y-6 p-6 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-owl-ink">Editorial Calendar</h1>
          <p className="mt-0.5 text-sm text-owl-mist">Plan, schedule, and approve daily content</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
            className="rounded-owl-btn border border-owl-cream-deep bg-white px-3 py-2 text-sm text-owl-ink focus:border-owl-teal focus:outline-none"
          >
            <option value="all">All types</option>
            <option value="news">News</option>
            <option value="blog">Blog</option>
          </select>
          <button
            onClick={generateAlerts}
            disabled={generating}
            className="flex items-center gap-2 rounded-owl-btn border border-owl-cream-deep bg-white px-3 py-2 text-sm font-medium text-owl-ink hover:bg-owl-cream transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${generating ? "animate-spin" : ""}`} />
            Refresh alerts
          </button>
        </div>
      </div>

      {/* Alerts */}
      {(data?.alerts ?? []).length > 0 && (
        <div className="space-y-2">
          {data!.alerts.map((a) => (
            <AlertBanner key={a.id} alert={a} onDismiss={dismissAlert} />
          ))}
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          {
            icon: <Newspaper className="h-5 w-5 text-owl-teal" />,
            label: "News this week",
            value: `${newsPublished} / ${newsTarget}`,
            ok: newsPublished >= newsTarget,
          },
          {
            icon: <FileText className="h-5 w-5 text-owl-teal" />,
            label: "Blogs this week",
            value: `${blogsPublished} / ${blogsTarget}`,
            ok: blogsPublished >= blogsTarget,
          },
          {
            icon: <Clock className="h-5 w-5 text-purple-500" />,
            label: "Awaiting approval",
            value: stats?.awaiting_approval ?? 0,
            ok: (stats?.awaiting_approval ?? 0) === 0,
          },
          {
            icon: <Target className="h-5 w-5 text-green-500" />,
            label: "Published this week",
            value: stats?.published_this_week ?? 0,
            ok: true,
          },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-owl-btn border border-owl-cream-deep bg-white p-4 flex items-center gap-3"
          >
            <div className="shrink-0">{s.icon}</div>
            <div className="min-w-0">
              <p className="text-xs text-owl-mist truncate">{s.label}</p>
              <p className={`text-lg font-bold ${s.ok ? "text-owl-ink" : "text-red-600"}`}>
                {s.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b border-owl-cream-deep">
        <div className="flex gap-1 overflow-x-auto pb-px">
          {QUEUE_TABS.map((tab) => {
            const count = tab.id === "calendar" ? undefined : queueItems[tab.id].length;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-t-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "border-b-2 border-owl-teal text-owl-teal-deep bg-owl-teal/5"
                    : "text-owl-mist hover:text-owl-ink"
                }`}
              >
                <CalendarDays className="h-4 w-4" />
                {tab.label}
                {count !== undefined && count > 0 && (
                  <span className="rounded-full bg-owl-teal/20 px-1.5 py-0.5 text-[10px] font-semibold text-owl-teal-deep">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Calendar view */}
      {activeTab === "calendar" && (
        <div className="space-y-4">
          {/* Week navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setWeekStart((d) => addDays(d, -7))}
              className="rounded-owl-btn border border-owl-cream-deep px-3 py-1.5 hover:bg-owl-cream transition-colors"
            >
              <ChevronLeft className="h-4 w-4 text-owl-ink" />
            </button>
            <p className="text-sm font-medium text-owl-ink">
              {weekStart.toLocaleDateString("en-US", { month: "long", day: "numeric" })} –{" "}
              {weekEnd.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>
            <button
              onClick={() => setWeekStart((d) => addDays(d, 7))}
              className="rounded-owl-btn border border-owl-cream-deep px-3 py-1.5 hover:bg-owl-cream transition-colors"
            >
              <ChevronRight className="h-4 w-4 text-owl-ink" />
            </button>
          </div>

          {loading ? (
            <div className="h-40 flex items-center justify-center">
              <RefreshCw className="h-5 w-5 animate-spin text-owl-teal" />
            </div>
          ) : (
            <CalendarGrid items={weekItems} weekStart={weekStart} onEdit={setEditItem} />
          )}
        </div>
      )}

      {/* Queue views */}
      {activeTab !== "calendar" && (
        loading ? (
          <div className="h-40 flex items-center justify-center">
            <RefreshCw className="h-5 w-5 animate-spin text-owl-teal" />
          </div>
        ) : (
          <div className="rounded-owl-btn border border-owl-cream-deep bg-white overflow-hidden">
            <QueueTable items={queueItems[activeTab]} onEdit={setEditItem} />
          </div>
        )
      )}

      {/* Edit drawer */}
      <EditDrawer item={editItem} onClose={() => setEditItem(null)} onSave={handleSave} />
    </div>
  );
}

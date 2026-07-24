"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  CalendarDays, AlertTriangle, CheckCircle2, Clock, ImageOff,
  Search, RefreshCw, ChevronLeft, ChevronRight, Filter,
  Target, FileText, Newspaper, X, Pencil, CheckCheck,
  Mail, ExternalLink, Eye, List, LayoutGrid,
} from "lucide-react";
import type { EditorialPreview } from "@/app/api/admin/editorial/preview/route";

// ─── Types ────────────────────────────────────────────────────────────────────

type WorkflowStatus =
  | "topic_identified" | "researching" | "draft" | "editing"
  | "awaiting_approval" | "approved" | "scheduled" | "published"
  | "needs_updating" | "archived"
  // Newsletter-specific statuses
  | "sending" | "sent" | "failed" | "canceled";

type ContentType = "news" | "blog" | "newsletter";
type ViewMode = "week" | "month" | "list" | "today";

interface CalendarItem {
  id: string;
  content_type: ContentType;
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
  // newsletter extras
  issue_number?: number | null;
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

const STATUS_META: Record<string, { label: string; color: string; dot: string }> = {
  topic_identified:  { label: "Topic",        color: "bg-slate-100 text-slate-700",   dot: "bg-slate-400" },
  researching:       { label: "Research",     color: "bg-blue-100 text-blue-700",     dot: "bg-blue-500" },
  draft:             { label: "Draft",        color: "bg-amber-100 text-amber-700",   dot: "bg-amber-500" },
  editing:           { label: "Editing",      color: "bg-orange-100 text-orange-700", dot: "bg-orange-500" },
  awaiting_approval: { label: "Approval",     color: "bg-purple-100 text-purple-700", dot: "bg-purple-500" },
  approved:          { label: "Approved",     color: "bg-teal-100 text-teal-700",     dot: "bg-teal-500" },
  scheduled:         { label: "Scheduled",    color: "bg-sky-100 text-sky-700",       dot: "bg-sky-500" },
  published:         { label: "Published",    color: "bg-green-100 text-green-700",   dot: "bg-green-500" },
  needs_updating:    { label: "Needs Update", color: "bg-red-100 text-red-700",       dot: "bg-red-500" },
  archived:          { label: "Archived",     color: "bg-gray-100 text-gray-500",     dot: "bg-gray-400" },
  // Newsletter-only
  sending:           { label: "Sending",      color: "bg-indigo-100 text-indigo-700", dot: "bg-indigo-500" },
  sent:              { label: "Sent",         color: "bg-green-100 text-green-700",   dot: "bg-green-500" },
  failed:            { label: "Failed",       color: "bg-red-100 text-red-700",       dot: "bg-red-500" },
  canceled:          { label: "Canceled",     color: "bg-gray-100 text-gray-500",     dot: "bg-gray-400" },
};

const WORKFLOW_TRANSITIONS: Partial<Record<WorkflowStatus, WorkflowStatus[]>> = {
  topic_identified:  ["researching", "archived"],
  researching:       ["draft", "topic_identified"],
  draft:             ["editing", "researching"],
  editing:           ["awaiting_approval", "draft"],
  awaiting_approval: ["approved", "editing"],
  approved:          ["scheduled", "editing"],
  scheduled:         ["published", "approved"],
  published:         ["needs_updating", "archived"],
  needs_updating:    ["draft", "archived"],
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

const TYPE_ICON: Record<ContentType, React.ReactNode> = {
  news:       <Newspaper className="h-3 w-3" />,
  blog:       <FileText  className="h-3 w-3" />,
  newsletter: <Mail      className="h-3 w-3" />,
};

const TYPE_COLOR: Record<ContentType, string> = {
  news:       "text-blue-600",
  blog:       "text-owl-teal-deep",
  newsletter: "text-purple-600",
};

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
  if (item.content_type === "newsletter") return true;
  return !!(item.seo_title && item.seo_description && item.primary_keyword);
}

function statusMeta(status: string) {
  return STATUS_META[status] ?? { label: status, color: "bg-gray-100 text-gray-600", dot: "bg-gray-400" };
}

// ─── StatusBadge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const m = statusMeta(status);
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${m.color}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  );
}

// ─── AlertBanner ─────────────────────────────────────────────────────────────

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

// ─── PreviewDrawer ────────────────────────────────────────────────────────────

function PreviewDrawer({
  item,
  onClose,
  onEdit,
}: {
  item: CalendarItem | null;
  onClose: () => void;
  onEdit: (item: CalendarItem) => void;
}) {
  const [preview, setPreview] = useState<EditorialPreview | null>(null);
  const [loading, setLoading] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!item) { setPreview(null); return; }
    setLoading(true);
    fetch(`/api/admin/editorial/preview?id=${item.id}&type=${item.content_type}`)
      .then((r) => r.ok ? r.json() : null)
      .then((d: EditorialPreview | null) => setPreview(d))
      .catch(() => setPreview(null))
      .finally(() => setLoading(false));
  }, [item]);

  // Focus the close button on open
  useEffect(() => {
    if (item) { setTimeout(() => closeRef.current?.focus(), 50); }
  }, [item]);

  // Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Focus trap
  useEffect(() => {
    if (!item) return;
    const el = drawerRef.current;
    if (!el) return;
    const focusable = el.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];
    const trap = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    };
    el.addEventListener("keydown", trap);
    return () => el.removeEventListener("keydown", trap);
  }, [item, preview]);

  if (!item) return null;

  const isNewsletter = item.content_type === "newsletter";

  return (
    <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true" aria-label={`Preview: ${item.title}`}>
      <div className="flex-1 bg-black/40" onClick={onClose} aria-hidden="true" />
      <aside
        ref={drawerRef}
        className="w-full max-w-lg overflow-y-auto bg-white shadow-xl flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-owl-cream-deep px-5 py-4">
          <div className="flex items-center gap-2 min-w-0">
            <span className={`shrink-0 ${TYPE_COLOR[item.content_type]}`}>
              {TYPE_ICON[item.content_type]}
            </span>
            <h2 className="font-display text-sm font-semibold text-owl-ink truncate">{item.title}</h2>
          </div>
          <button
            ref={closeRef}
            onClick={onClose}
            className="ml-2 shrink-0 rounded p-1 text-owl-mist hover:text-owl-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-owl-teal"
            aria-label="Close preview"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 px-5 py-3 border-b border-owl-cream-deep bg-owl-cream/40 flex-wrap">
          {/* Edit — only for news/blog (newsletter has CRM record link) */}
          {!isNewsletter && (
            <button
              onClick={() => { onClose(); onEdit(item); }}
              className="inline-flex items-center gap-1.5 rounded-owl-btn border border-owl-teal/40 px-3 py-1.5 text-xs font-medium text-owl-teal hover:bg-owl-teal/10 transition-colors focus-visible:ring-2 focus-visible:ring-owl-teal focus:outline-none"
            >
              <Pencil className="h-3 w-3" />
              Edit
            </button>
          )}
          {/* Open CRM record */}
          {isNewsletter && (
            <a
              href="/admin/newsletter"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-owl-btn border border-purple-200 px-3 py-1.5 text-xs font-medium text-purple-700 hover:bg-purple-50 transition-colors focus-visible:ring-2 focus-visible:ring-purple-400 focus:outline-none"
            >
              <ExternalLink className="h-3 w-3" />
              Open CRM record
            </a>
          )}
          {/* Open public URL */}
          {preview?.publicUrl && (
            <a
              href={preview.publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-owl-btn border border-owl-cream-deep px-3 py-1.5 text-xs font-medium text-owl-ink hover:bg-owl-cream transition-colors focus-visible:ring-2 focus-visible:ring-owl-teal focus:outline-none"
            >
              <ExternalLink className="h-3 w-3" />
              Public page
            </a>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 px-5 py-5 space-y-5">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-5 w-5 animate-spin text-owl-teal" />
            </div>
          )}

          {!loading && preview && (
            <>
              {/* Status + date */}
              <div className="flex items-center gap-3 flex-wrap">
                <StatusBadge status={preview.status} />
                {preview.scheduledAt && (
                  <span className="text-xs text-owl-mist">
                    <span className="font-medium text-owl-ink">{fmtDate(preview.scheduledAt)}</span>
                  </span>
                )}
                {preview.category && (
                  <span className="rounded-full bg-owl-cream-deep px-2 py-0.5 text-xs text-owl-mist capitalize">
                    {preview.category}
                  </span>
                )}
              </div>

              {/* Featured image */}
              {preview.featuredImageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={preview.featuredImageUrl}
                  alt={preview.title}
                  className="w-full h-40 object-cover rounded-owl-btn"
                />
              )}

              {/* Author / reviewer */}
              {(preview.author ?? preview.reviewer) && (
                <div className="flex gap-4 text-sm">
                  {preview.author && (
                    <div>
                      <p className="text-xs text-owl-mist uppercase tracking-wider font-medium">Author</p>
                      <p className="text-owl-ink">{preview.author}</p>
                    </div>
                  )}
                  {preview.reviewer && (
                    <div>
                      <p className="text-xs text-owl-mist uppercase tracking-wider font-medium">Reviewer</p>
                      <p className="text-owl-ink">{preview.reviewer}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Summary / body (news + blog) */}
              {(preview.summary ?? preview.body) && !isNewsletter && (
                <div>
                  <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-owl-mist">
                    {preview.summary ? "Summary" : "Body preview"}
                  </p>
                  <p className="text-sm text-owl-ink/80 leading-relaxed line-clamp-6">
                    {preview.summary ?? preview.body}
                  </p>
                </div>
              )}

              {/* SEO (news + blog) */}
              {!isNewsletter && preview.seo && (
                <div className="rounded-owl-btn border border-owl-cream-deep bg-owl-cream p-3 space-y-1.5">
                  <p className="text-xs font-medium text-owl-ink">SEO</p>
                  {[
                    ["Primary keyword",  preview.seo.primaryKeyword],
                    ["SEO title",        preview.seo.title],
                    ["SEO description",  preview.seo.description],
                  ].map(([label, val]) => (
                    <div key={label as string} className="flex items-start gap-2 text-xs">
                      {val ? (
                        <CheckCheck className="h-3.5 w-3.5 text-green-500 mt-0.5 shrink-0" />
                      ) : (
                        <X className="h-3.5 w-3.5 text-red-400 mt-0.5 shrink-0" />
                      )}
                      <span className={val ? "text-owl-ink/70" : "text-red-600"}>
                        {label as string}
                        {val && <span className="text-owl-mist ml-1 truncate">— {val as string}</span>}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Newsletter layout preview */}
              {isNewsletter && preview.newsletter && (
                <div className="space-y-3">
                  {/* Note from OWL */}
                  {(preview.newsletter.noteTitle ?? preview.newsletter.noteBody) && (
                    <div className="rounded-owl-btn border border-amber-200 bg-amber-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-amber-700 mb-1">
                        {preview.newsletter.noteTitle ?? "A Note from OWL"}
                      </p>
                      <p className="text-sm text-amber-900/80 line-clamp-4">
                        {preview.newsletter.noteBody}
                      </p>
                    </div>
                  )}

                  {/* Parenting tip */}
                  {(preview.newsletter.parentingTipTitle ?? preview.newsletter.parentingTipBody) && (
                    <div className="rounded-owl-btn border border-teal-200 bg-teal-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-owl-teal mb-0.5">
                        Parenting Tip of the Week
                      </p>
                      {preview.newsletter.parentingTipAgeRange && (
                        <span className="inline-block text-[10px] font-medium bg-teal-100 text-owl-teal rounded-full px-2 py-0.5 mb-1">
                          {preview.newsletter.parentingTipAgeRange}
                        </span>
                      )}
                      {preview.newsletter.parentingTipTitle && (
                        <p className="text-sm font-semibold text-owl-teal-deep mb-1">
                          {preview.newsletter.parentingTipTitle}
                        </p>
                      )}
                      <p className="text-sm text-teal-900/80 line-clamp-3">
                        {preview.newsletter.parentingTipBody}
                      </p>
                      {preview.newsletter.parentingTipTakeaway && (
                        <p className="mt-2 text-xs font-semibold italic text-amber-700 border-t border-teal-200 pt-2">
                          OWL takeaway: {preview.newsletter.parentingTipTakeaway}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Health alert */}
                  {preview.newsletter.healthAlertTitle && (
                    <div className="rounded-owl-btn border border-red-200 bg-red-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-red-600 mb-1">
                        Health Alert
                      </p>
                      <p className="text-sm font-semibold text-red-800 mb-1">
                        {preview.newsletter.healthAlertTitle}
                      </p>
                      {preview.newsletter.healthAlertBody && (
                        <p className="text-sm text-red-700/80 line-clamp-3">
                          {preview.newsletter.healthAlertBody}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Newsletter eligible badge (news/blog) */}
              {!isNewsletter && (
                <div className="flex items-center gap-2 text-sm">
                  <span className={`h-2 w-2 rounded-full ${preview.newsletterEligible ? "bg-owl-teal" : "bg-owl-cream-deep"}`} />
                  <span className="text-owl-mist">
                    {preview.newsletterEligible ? "Newsletter eligible" : "Not newsletter eligible"}
                  </span>
                </div>
              )}
            </>
          )}

          {!loading && !preview && (
            <p className="text-sm text-owl-mist py-8 text-center">Could not load preview.</p>
          )}
        </div>
      </aside>
    </div>
  );
}

// ─── EditDrawer ───────────────────────────────────────────────────────────────

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

  if (!item || item.content_type === "newsletter") return null;

  const merged = { ...item, ...patch };
  const ws = merged.workflow_status as WorkflowStatus;

  async function save() {
    if (!item || Object.keys(patch).length === 0) return;
    setSaving(true);
    await onSave(item.id, patch);
    setSaving(false);
  }

  const nextStatuses = WORKFLOW_TRANSITIONS[ws] ?? [];

  return (
    <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true">
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
                    {statusMeta(s).label}
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

          {/* Reviewer name */}
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
              ["SEO title",       !!merged.seo_title],
              ["SEO description", !!merged.seo_description],
              ["Featured image",  !!merged.featured_image],
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

// ─── Calendar Grid (weekly) ───────────────────────────────────────────────────

function CalendarGrid({
  items,
  weekStart,
  onPreview,
}: {
  items: CalendarItem[];
  weekStart: Date;
  onPreview: (item: CalendarItem) => void;
}) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const today = isoDate(new Date());

  return (
    <div className="grid grid-cols-7 gap-px bg-owl-cream-deep rounded-owl-btn overflow-hidden">
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

      {days.map((d) => {
        const ds = isoDate(d);
        const dayItems = items.filter((it) => it.publish_date?.startsWith(ds));
        const isEmpty = dayItems.length === 0;
        const isPast = ds < today;

        return (
          <div
            key={`cell-${ds}`}
            className={`min-h-28 p-1.5 space-y-1 ${
              isEmpty && !isPast ? "bg-red-50/60" : isEmpty ? "bg-gray-50/60" : "bg-white"
            }`}
          >
            {isEmpty && !isPast && (
              <div className="flex items-center justify-center h-full">
                <span className="text-xs text-red-400 font-medium">No content</span>
              </div>
            )}
            {dayItems.map((it) => {
              const m = statusMeta(it.workflow_status);
              const isNL = it.content_type === "newsletter";
              return (
                <button
                  key={it.id}
                  onClick={() => onPreview(it)}
                  className={`w-full text-left rounded-md border px-2 py-1.5 hover:shadow-sm transition-all group ${
                    isNL
                      ? "border-purple-200 bg-purple-50 hover:border-purple-400"
                      : "border-owl-cream-deep bg-white hover:border-owl-teal"
                  }`}
                >
                  <div className="flex items-center gap-1 mb-0.5">
                    <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${m.dot}`} />
                    <span className={`text-[10px] font-medium uppercase tracking-wider ${
                      isNL ? "text-purple-500" : "text-owl-mist"
                    }`}>
                      {it.content_type}
                    </span>
                    {!it.featured_image && !isNL && (
                      <ImageOff className="h-3 w-3 text-orange-400 ml-auto" aria-label="Missing image" />
                    )}
                    {!seoComplete(it) && !isNL && (
                      <Search className="h-3 w-3 text-orange-400" aria-label="SEO incomplete" />
                    )}
                  </div>
                  <p className={`text-xs font-medium leading-tight line-clamp-2 ${
                    isNL
                      ? "text-purple-700 group-hover:text-purple-900"
                      : "text-owl-ink group-hover:text-owl-teal-deep"
                  }`}>
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

// ─── Month Grid (30-day) ──────────────────────────────────────────────────────

function MonthGrid({
  items,
  monthStart,
  onPreview,
}: {
  items: CalendarItem[];
  monthStart: Date;
  onPreview: (item: CalendarItem) => void;
}) {
  const today = isoDate(new Date());
  // Start from Monday of the week containing monthStart
  const firstDay = new Date(monthStart);
  const dow = firstDay.getDay();
  firstDay.setDate(firstDay.getDate() - (dow === 0 ? 6 : dow - 1));

  // 5 weeks = 35 cells
  const cells = Array.from({ length: 35 }, (_, i) => addDays(firstDay, i));
  const monthEnd = addDays(monthStart, 29);

  return (
    <div className="space-y-1">
      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 gap-px">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div key={d} className="py-1.5 text-center text-xs font-medium text-owl-mist uppercase tracking-wider">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-px bg-owl-cream-deep rounded-owl-btn overflow-hidden">
        {cells.map((d) => {
          const ds = isoDate(d);
          const inRange = ds >= isoDate(monthStart) && ds <= isoDate(monthEnd);
          const isToday = ds === today;
          const dayItems = items.filter((it) => it.publish_date?.startsWith(ds));

          return (
            <div
              key={ds}
              className={`min-h-20 p-1 ${
                isToday
                  ? "bg-owl-teal/5"
                  : inRange
                  ? "bg-white"
                  : "bg-gray-50/40"
              }`}
            >
              <p className={`text-xs font-bold mb-0.5 ${
                isToday ? "text-owl-teal" : inRange ? "text-owl-ink" : "text-owl-mist/40"
              }`}>
                {d.getDate()}
              </p>
              {dayItems.slice(0, 3).map((it) => {
                const m = statusMeta(it.workflow_status);
                const isNL = it.content_type === "newsletter";
                return (
                  <button
                    key={it.id}
                    onClick={() => onPreview(it)}
                    title={it.title}
                    className={`w-full text-left rounded px-1 py-0.5 mb-0.5 text-[10px] font-medium truncate transition-colors ${
                      isNL
                        ? "bg-purple-100 text-purple-700 hover:bg-purple-200"
                        : `${m.color} hover:opacity-80`
                    }`}
                  >
                    {it.title}
                  </button>
                );
              })}
              {dayItems.length > 3 && (
                <p className="text-[9px] text-owl-mist">+{dayItems.length - 3} more</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Today View ───────────────────────────────────────────────────────────────

function TodayView({
  items,
  onPreview,
  onEdit,
}: {
  items: CalendarItem[];
  onPreview: (item: CalendarItem) => void;
  onEdit: (item: CalendarItem) => void;
}) {
  const today = isoDate(new Date());
  const todayItems = items.filter((it) => it.publish_date?.startsWith(today));

  if (todayItems.length === 0) {
    return (
      <div className="rounded-owl-btn border border-owl-cream-deep bg-white p-8 text-center">
        <CalendarDays className="h-8 w-8 text-owl-cream-deep mx-auto mb-2" />
        <p className="text-sm text-owl-mist">Nothing scheduled for today.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {todayItems.map((it) => (
        <div
          key={it.id}
          className="rounded-owl-btn border border-owl-cream-deep bg-white p-4 flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className={TYPE_COLOR[it.content_type]}>{TYPE_ICON[it.content_type]}</span>
            <div className="min-w-0">
              <p className="font-medium text-sm text-owl-ink truncate">{it.title}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <StatusBadge status={it.workflow_status} />
                {it.category && <span className="text-xs text-owl-mist">{it.category}</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onPreview(it)}
              className="inline-flex items-center gap-1 rounded-owl-btn px-2.5 py-1 text-xs font-medium text-owl-teal border border-owl-teal/40 hover:bg-owl-teal/10 transition-colors"
            >
              <Eye className="h-3 w-3" />
              Preview
            </button>
            {it.content_type !== "newsletter" && (
              <button
                onClick={() => onEdit(it)}
                className="inline-flex items-center gap-1 rounded-owl-btn px-2.5 py-1 text-xs font-medium text-owl-ink border border-owl-cream-deep hover:bg-owl-cream transition-colors"
              >
                <Pencil className="h-3 w-3" />
                Edit
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Queue Table ──────────────────────────────────────────────────────────────

function QueueTable({
  items,
  onPreview,
  onEdit,
}: {
  items: CalendarItem[];
  onPreview: (item: CalendarItem) => void;
  onEdit: (item: CalendarItem) => void;
}) {
  if (items.length === 0) {
    return <p className="py-10 text-center text-sm text-owl-mist">No items in this queue.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-owl-cream-deep">
            {["Title", "Type", "Status", "Publish Date", "Image", "SEO", "Priority", ""].map((h) => (
              <th
                key={h}
                className="px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-owl-mist whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr key={it.id} className="border-b border-owl-cream-deep/60 hover:bg-owl-cream/40 transition-colors">
              <td className="px-3 py-2.5 text-owl-ink font-medium max-w-xs truncate">{it.title}</td>
              <td className="px-3 py-2.5">
                <span className={`inline-flex items-center gap-1 text-xs font-medium capitalize ${TYPE_COLOR[it.content_type]}`}>
                  {TYPE_ICON[it.content_type]}
                  {it.content_type}
                </span>
              </td>
              <td className="px-3 py-2.5"><StatusBadge status={it.workflow_status} /></td>
              <td className="px-3 py-2.5 text-owl-mist whitespace-nowrap">{fmtDate(it.publish_date)}</td>
              <td className="px-3 py-2.5">
                {it.content_type === "newsletter" ? (
                  <span className="text-owl-mist text-xs">—</span>
                ) : it.featured_image ? (
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
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onPreview(it)}
                    className="rounded-owl-btn px-2.5 py-1 text-xs font-medium text-owl-teal border border-owl-teal/40 hover:bg-owl-teal/10 transition-colors inline-flex items-center gap-1"
                  >
                    <Eye className="h-3 w-3" />
                    Preview
                  </button>
                  {it.content_type !== "newsletter" && (
                    <button
                      onClick={() => onEdit(it)}
                      className="rounded-owl-btn px-2.5 py-1 text-xs font-medium text-owl-mist border border-owl-cream-deep hover:bg-owl-cream transition-colors inline-flex items-center gap-1"
                    >
                      <Pencil className="h-3 w-3" />
                      Edit
                    </button>
                  )}
                </div>
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
  const [viewMode, setViewMode] = useState<ViewMode>("week");

  const [weekStart, setWeekStart] = useState<Date>(() => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay() + 1); // Monday
    return d;
  });
  const [monthStart, setMonthStart] = useState<Date>(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });

  const [previewItem, setPreviewItem] = useState<CalendarItem | null>(null);
  const [editItem, setEditItem]       = useState<CalendarItem | null>(null);

  // Filters
  const [typeFilter, setTypeFilter]         = useState<"all" | ContentType>("all");
  const [statusFilter, setStatusFilter]     = useState<string>("all");
  const [nlEligFilter, setNlEligFilter]     = useState<"all" | "yes" | "no">("all");
  const [searchQuery, setSearchQuery]       = useState("");
  const [generating, setGenerating]         = useState(false);

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

  // Build filtered item list
  const allItems = data?.items ?? [];
  const filtered = allItems.filter((i) => {
    if (typeFilter !== "all" && i.content_type !== typeFilter) return false;
    if (statusFilter !== "all" && i.workflow_status !== statusFilter) return false;
    if (nlEligFilter === "yes" && !i.newsletter_eligible) return false;
    if (nlEligFilter === "no"  && i.newsletter_eligible)  return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!i.title.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const weekEnd = addDays(weekStart, 6);
  const weekItems = filtered.filter((it) => {
    if (!it.publish_date) return false;
    const d = it.publish_date.split("T")[0];
    return d >= isoDate(weekStart) && d <= isoDate(weekEnd);
  });

  // Unique statuses for the status filter dropdown
  const allStatuses = [...new Set(allItems.map((i) => i.workflow_status))].sort();

  // Queue items by tab
  const queueItems: Record<TabId, CalendarItem[]> = {
    calendar:          weekItems,
    topics:            filtered.filter((i) => ["topic_identified", "researching"].includes(i.workflow_status)),
    drafts:            filtered.filter((i) => ["draft", "editing"].includes(i.workflow_status)),
    awaiting_approval: filtered.filter((i) => i.workflow_status === "awaiting_approval"),
    approved:          filtered.filter((i) => i.workflow_status === "approved" && !i.publish_date),
    scheduled:         filtered.filter((i) => ["approved", "scheduled"].includes(i.workflow_status) && !!i.publish_date),
    failed:            filtered.filter((i) => !!i.publish_failed_at || i.workflow_status === "failed"),
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
  const stats  = data?.stats;

  const newsPublished   = weekItems.filter((i) => i.workflow_status === "published" && i.content_type === "news").length;
  const blogsPublished  = weekItems.filter((i) => i.workflow_status === "published" && i.content_type === "blog").length;
  const newsTarget      = target?.news_per_week ?? 3;
  const blogsTarget     = target?.blogs_per_week ?? 2;

  return (
    <div className="space-y-6 p-6 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-owl-ink">Editorial Calendar</h1>
          <p className="mt-0.5 text-sm text-owl-mist">Plan, schedule, and approve daily content</p>
        </div>
        <div className="flex items-center gap-2">
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
          { icon: <Newspaper className="h-5 w-5 text-owl-teal" />, label: "News this week",      value: `${newsPublished} / ${newsTarget}`,          ok: newsPublished >= newsTarget },
          { icon: <FileText  className="h-5 w-5 text-owl-teal" />, label: "Blogs this week",     value: `${blogsPublished} / ${blogsTarget}`,         ok: blogsPublished >= blogsTarget },
          { icon: <Clock     className="h-5 w-5 text-purple-500" />, label: "Awaiting approval", value: stats?.awaiting_approval ?? 0,                ok: (stats?.awaiting_approval ?? 0) === 0 },
          { icon: <Target    className="h-5 w-5 text-green-500" />, label: "Published this week", value: stats?.published_this_week ?? 0,             ok: true },
        ].map((s) => (
          <div key={s.label} className="rounded-owl-btn border border-owl-cream-deep bg-white p-4 flex items-center gap-3">
            <div className="shrink-0">{s.icon}</div>
            <div className="min-w-0">
              <p className="text-xs text-owl-mist truncate">{s.label}</p>
              <p className={`text-lg font-bold ${s.ok ? "text-owl-ink" : "text-red-600"}`}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-owl-mist" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search titles…"
            className="rounded-owl-btn border border-owl-cream-deep bg-white pl-8 pr-3 py-2 text-sm text-owl-ink focus:border-owl-teal focus:outline-none w-48"
            aria-label="Search content titles"
          />
        </div>

        {/* Type filter */}
        <div className="flex items-center gap-1">
          <Filter className="h-3.5 w-3.5 text-owl-mist" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
            className="rounded-owl-btn border border-owl-cream-deep bg-white px-3 py-2 text-sm text-owl-ink focus:border-owl-teal focus:outline-none"
            aria-label="Filter by type"
          >
            <option value="all">All types</option>
            <option value="news">News</option>
            <option value="blog">Blog</option>
            <option value="newsletter">Newsletter</option>
          </select>
        </div>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-owl-btn border border-owl-cream-deep bg-white px-3 py-2 text-sm text-owl-ink focus:border-owl-teal focus:outline-none"
          aria-label="Filter by status"
        >
          <option value="all">All statuses</option>
          {allStatuses.map((s) => (
            <option key={s} value={s}>{statusMeta(s).label}</option>
          ))}
        </select>

        {/* Newsletter eligible filter */}
        <select
          value={nlEligFilter}
          onChange={(e) => setNlEligFilter(e.target.value as typeof nlEligFilter)}
          className="rounded-owl-btn border border-owl-cream-deep bg-white px-3 py-2 text-sm text-owl-ink focus:border-owl-teal focus:outline-none"
          aria-label="Filter by newsletter eligibility"
        >
          <option value="all">NL eligible: all</option>
          <option value="yes">NL eligible: yes</option>
          <option value="no">NL eligible: no</option>
        </select>

        {/* Clear filters */}
        {(typeFilter !== "all" || statusFilter !== "all" || nlEligFilter !== "all" || searchQuery) && (
          <button
            onClick={() => { setTypeFilter("all"); setStatusFilter("all"); setNlEligFilter("all"); setSearchQuery(""); }}
            className="text-xs text-owl-mist hover:text-owl-ink underline"
          >
            Clear filters
          </button>
        )}
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

      {/* Calendar tab: view-mode switcher + content */}
      {activeTab === "calendar" && (
        <div className="space-y-4">
          {/* View mode + navigation */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            {/* View mode buttons */}
            <div className="flex items-center gap-1 rounded-owl-btn border border-owl-cream-deep bg-white p-0.5" role="group" aria-label="Calendar view">
              {(
                [
                  { id: "today", label: "Today",   icon: <Target className="h-3.5 w-3.5" /> },
                  { id: "week",  label: "Week",    icon: <CalendarDays className="h-3.5 w-3.5" /> },
                  { id: "month", label: "30-Day",  icon: <LayoutGrid className="h-3.5 w-3.5" /> },
                  { id: "list",  label: "List",    icon: <List className="h-3.5 w-3.5" /> },
                ] as { id: ViewMode; label: string; icon: React.ReactNode }[]
              ).map(({ id, label, icon }) => (
                <button
                  key={id}
                  onClick={() => setViewMode(id)}
                  aria-pressed={viewMode === id}
                  className={`inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-colors ${
                    viewMode === id
                      ? "bg-owl-teal text-white"
                      : "text-owl-mist hover:text-owl-ink"
                  }`}
                >
                  {icon}
                  {label}
                </button>
              ))}
            </div>

            {/* Navigation (week/month only) */}
            {viewMode === "week" && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setWeekStart((d) => addDays(d, -7))}
                  className="rounded-owl-btn border border-owl-cream-deep px-2 py-1.5 hover:bg-owl-cream transition-colors"
                  aria-label="Previous week"
                >
                  <ChevronLeft className="h-4 w-4 text-owl-ink" />
                </button>
                <p className="text-sm font-medium text-owl-ink whitespace-nowrap">
                  {weekStart.toLocaleDateString("en-US", { month: "long", day: "numeric" })} –{" "}
                  {weekEnd.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </p>
                <button
                  onClick={() => setWeekStart((d) => addDays(d, 7))}
                  className="rounded-owl-btn border border-owl-cream-deep px-2 py-1.5 hover:bg-owl-cream transition-colors"
                  aria-label="Next week"
                >
                  <ChevronRight className="h-4 w-4 text-owl-ink" />
                </button>
              </div>
            )}

            {viewMode === "month" && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMonthStart((d) => { const n = new Date(d); n.setDate(n.getDate() - 30); return n; })}
                  className="rounded-owl-btn border border-owl-cream-deep px-2 py-1.5 hover:bg-owl-cream transition-colors"
                  aria-label="Previous 30 days"
                >
                  <ChevronLeft className="h-4 w-4 text-owl-ink" />
                </button>
                <p className="text-sm font-medium text-owl-ink whitespace-nowrap">
                  {monthStart.toLocaleDateString("en-US", { month: "long", day: "numeric" })} –{" "}
                  {addDays(monthStart, 29).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </p>
                <button
                  onClick={() => setMonthStart((d) => { const n = new Date(d); n.setDate(n.getDate() + 30); return n; })}
                  className="rounded-owl-btn border border-owl-cream-deep px-2 py-1.5 hover:bg-owl-cream transition-colors"
                  aria-label="Next 30 days"
                >
                  <ChevronRight className="h-4 w-4 text-owl-ink" />
                </button>
              </div>
            )}
          </div>

          {loading ? (
            <div className="h-40 flex items-center justify-center">
              <RefreshCw className="h-5 w-5 animate-spin text-owl-teal" />
            </div>
          ) : (
            <>
              {viewMode === "week" && (
                <CalendarGrid items={weekItems} weekStart={weekStart} onPreview={setPreviewItem} />
              )}
              {viewMode === "month" && (
                <MonthGrid items={filtered} monthStart={monthStart} onPreview={setPreviewItem} />
              )}
              {viewMode === "today" && (
                <TodayView items={filtered} onPreview={setPreviewItem} onEdit={setEditItem} />
              )}
              {viewMode === "list" && (
                <div className="rounded-owl-btn border border-owl-cream-deep bg-white overflow-hidden">
                  <QueueTable
                    items={[...filtered].sort((a, b) =>
                      (a.publish_date ?? "").localeCompare(b.publish_date ?? "")
                    )}
                    onPreview={setPreviewItem}
                    onEdit={setEditItem}
                  />
                </div>
              )}
            </>
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
            <QueueTable
              items={queueItems[activeTab]}
              onPreview={setPreviewItem}
              onEdit={setEditItem}
            />
          </div>
        )
      )}

      {/* Drawers — only one open at a time */}
      <PreviewDrawer
        item={previewItem}
        onClose={() => setPreviewItem(null)}
        onEdit={(it) => { setPreviewItem(null); setEditItem(it); }}
      />
      <EditDrawer
        item={editItem}
        onClose={() => setEditItem(null)}
        onSave={handleSave}
      />
    </div>
  );
}

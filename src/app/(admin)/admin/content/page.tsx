"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import {
  FileText, Newspaper, Filter, Search, CalendarDays, CheckCircle2,
  Clock, FileEdit, Eye, EyeOff, Save, X, Loader2, AlertTriangle,
  ChevronDown, ChevronUp, RefreshCw, Tag, Mail,
} from "lucide-react";

type ContentType = "blog" | "news";
type PostStatus = "draft" | "scheduled" | "published";
type WorkflowStatus =
  | "topic_identified" | "researching" | "draft" | "editing"
  | "awaiting_approval" | "approved" | "scheduled" | "published"
  | "needs_updating" | "archived";

const WORKFLOW_META: Record<WorkflowStatus, { label: string; color: string }> = {
  topic_identified:  { label: "Topic",        color: "bg-slate-100 text-slate-700" },
  researching:       { label: "Research",     color: "bg-blue-100 text-blue-700" },
  draft:             { label: "Draft",        color: "bg-amber-100 text-amber-700" },
  editing:           { label: "Editing",      color: "bg-orange-100 text-orange-700" },
  awaiting_approval: { label: "Approval",     color: "bg-purple-100 text-purple-700" },
  approved:          { label: "Approved",     color: "bg-teal-100 text-teal-700" },
  scheduled:         { label: "Scheduled",    color: "bg-sky-100 text-sky-700" },
  published:         { label: "Published",    color: "bg-green-100 text-green-700" },
  needs_updating:    { label: "Needs Update", color: "bg-red-100 text-red-700" },
  archived:          { label: "Archived",     color: "bg-gray-100 text-gray-500" },
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

interface ContentPost {
  id: string;
  content_type: ContentType;
  title: string;
  slug: string;
  category: string;
  excerpt: string | null;
  body: string | null;
  publish_date: string | null;
  status: PostStatus;
  workflow_status: WorkflowStatus;
  author: string;
  seo_title: string | null;
  seo_description: string | null;
  primary_keyword: string | null;
  secondary_keywords: string[] | null;
  og_title: string | null;
  og_description: string | null;
  featured_image: string | null;
  newsletter_eligible: boolean;
  editorial_priority: number;
  alert_sent: boolean;
  created_at: string;
  updated_at: string;
}

interface EditState {
  id: string;
  field: "date" | "text" | "seo";
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  body: string;
  author: string;
  publish_date: string;
  seo_title: string;
  seo_description: string;
  og_title: string;
  og_description: string;
  primary_keyword: string;
  secondary_keywords: string;
  featured_image: string;
  workflow_status: WorkflowStatus;
  newsletter_eligible: boolean;
  editorial_priority: number;
}

const STATUS_COLORS: Record<PostStatus, string> = {
  published: "bg-green-100 text-green-800",
  scheduled: "bg-owl-amber/20 text-owl-amber",
  draft: "bg-gray-100 text-gray-600",
};
const TYPE_COLORS: Record<ContentType, string> = {
  blog: "bg-owl-teal/15 text-owl-teal",
  news: "bg-purple-100 text-purple-700",
};

function StatCard({ icon: Icon, label, value, color }: {
  icon: React.ElementType; label: string; value: number | string; color: string;
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

export default function AdminContentPage() {
  const [posts, setPosts] = useState<ContentPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [typeFilter, setTypeFilter] = useState<"all" | ContentType>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | PostStatus>("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [query, setQuery] = useState("");

  // Editing
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editState, setEditState] = useState<EditState | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<"idle" | "success" | "error">("idle");
  const [saveMessage, setSaveMessage] = useState("");

  // Expand body
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/content");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setPosts(data.posts ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load posts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(posts.map((p) => p.category))).sort();
    return cats;
  }, [posts]);

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      if (typeFilter !== "all" && p.content_type !== typeFilter) return false;
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (categoryFilter !== "all" && p.category !== categoryFilter) return false;
      if (query) {
        const q = query.toLowerCase();
        if (!p.title.toLowerCase().includes(q) && !p.slug.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [posts, typeFilter, statusFilter, categoryFilter, query]);

  // Queue stats
  const blogScheduled = posts.filter((p) => p.content_type === "blog" && p.status === "scheduled").length;
  const newsScheduled = posts.filter((p) => p.content_type === "news" && p.status === "scheduled").length;
  const blogPublished = posts.filter((p) => p.content_type === "blog" && p.status === "published").length;
  const newsPublished = posts.filter((p) => p.content_type === "news" && p.status === "published").length;

  const nextScheduledDate = useMemo(() => {
    const upcoming = posts
      .filter((p) => p.status === "scheduled" && p.publish_date)
      .sort((a, b) => new Date(a.publish_date!).getTime() - new Date(b.publish_date!).getTime());
    if (!upcoming.length) return null;
    return new Date(upcoming[0].publish_date!).toLocaleDateString("en-US", { dateStyle: "medium" });
  }, [posts]);

  function startEdit(post: ContentPost) {
    setEditingId(post.id);
    setEditState({
      id: post.id,
      field: "text",
      title: post.title,
      slug: post.slug,
      category: post.category,
      excerpt: post.excerpt ?? "",
      body: post.body ?? "",
      author: post.author,
      publish_date: post.publish_date ? post.publish_date.slice(0, 10) : "",
      seo_title: post.seo_title ?? "",
      seo_description: post.seo_description ?? "",
      og_title: post.og_title ?? "",
      og_description: post.og_description ?? "",
      primary_keyword: post.primary_keyword ?? "",
      secondary_keywords: (post.secondary_keywords ?? []).join(", "),
      featured_image: post.featured_image ?? "",
      workflow_status: post.workflow_status,
      newsletter_eligible: post.newsletter_eligible,
      editorial_priority: post.editorial_priority,
    });
    setSaveResult("idle");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditState(null);
    setSaveResult("idle");
  }

  async function saveEdit() {
    if (!editState) return;
    setSaving(true);
    setSaveResult("idle");
    try {
      const res = await fetch(`/api/admin/content/${editState.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editState.title,
          slug: editState.slug,
          category: editState.category,
          excerpt: editState.excerpt,
          body: editState.body,
          author: editState.author,
          publish_date: editState.publish_date || null,
          seo_title: editState.seo_title,
          seo_description: editState.seo_description,
          og_title: editState.og_title,
          og_description: editState.og_description,
          primary_keyword: editState.primary_keyword || null,
          secondary_keywords: editState.secondary_keywords
            ? editState.secondary_keywords.split(",").map((s) => s.trim()).filter(Boolean)
            : [],
          featured_image: editState.featured_image || null,
          workflow_status: editState.workflow_status,
          newsletter_eligible: editState.newsletter_eligible,
          editorial_priority: editState.editorial_priority,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      setSaveResult("success");
      setSaveMessage("Saved");
      setPosts((prev) =>
        prev.map((p) =>
          p.id === editState.id
            ? { ...p, ...data.post }
            : p
        )
      );
      setTimeout(cancelEdit, 1000);
    } catch (e) {
      setSaveResult("error");
      setSaveMessage(e instanceof Error ? e.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(post: ContentPost) {
    const newStatus: PostStatus = post.status === "published" ? "draft" : "published";
    try {
      const res = await fetch(`/api/admin/content/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Update failed");
      setPosts((prev) =>
        prev.map((p) => (p.id === post.id ? { ...p, status: newStatus } : p))
      );
    } catch {
      alert("Failed to update status");
    }
  }

  async function updateDate(id: string, date: string) {
    try {
      const res = await fetch(`/api/admin/content/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publish_date: date || null }),
      });
      if (!res.ok) throw new Error("Update failed");
      setPosts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, publish_date: date || null } : p))
      );
    } catch {
      alert("Failed to update date");
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold text-owl-ink">
            Content Management
          </h2>
          <p className="mt-1 text-sm text-owl-mist">
            Manage blog posts and news articles — filter, edit, schedule, and publish.
          </p>
        </div>
        <button
          onClick={fetchPosts}
          className="flex items-center gap-2 rounded-lg border border-owl-cream-deep bg-white px-3 py-2 text-sm text-owl-ink hover:bg-owl-cream"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={CheckCircle2} label="Blogs published" value={blogPublished} color="bg-green-100 text-green-700" />
        <StatCard icon={Clock}        label="Blogs scheduled" value={blogScheduled} color={blogScheduled <= 3 ? "bg-red-100 text-red-600" : "bg-owl-amber/20 text-owl-amber"} />
        <StatCard icon={CheckCircle2} label="News published"  value={newsPublished} color="bg-green-100 text-green-700" />
        <StatCard icon={Clock}        label="News scheduled"  value={newsScheduled} color={newsScheduled <= 3 && newsScheduled > 0 ? "bg-red-100 text-red-600" : "bg-purple-100 text-purple-700"} />
      </div>

      {/* Low queue warning */}
      {(blogScheduled <= 3 && blogScheduled > 0) && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span>
            <strong>Blog queue low:</strong> Only {blogScheduled} post{blogScheduled !== 1 ? "s" : ""} remain scheduled. Add more content soon — an alert email will be sent automatically.
          </span>
        </div>
      )}
      {(newsScheduled <= 3 && newsScheduled > 0) && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span>
            <strong>News queue low:</strong> Only {newsScheduled} article{newsScheduled !== 1 ? "s" : ""} remain scheduled. An alert email will be sent automatically.
          </span>
        </div>
      )}

      {nextScheduledDate && (
        <p className="text-xs text-owl-mist">
          Next scheduled release: <strong>{nextScheduledDate}</strong>
        </p>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-owl-cream-deep bg-white p-4">
        <Filter className="h-4 w-4 shrink-0 text-owl-mist" />

        {/* Search */}
        <div className="relative flex-1 min-w-[160px]">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-owl-mist" />
          <input
            type="search"
            placeholder="Search title or slugΓÇª"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border border-owl-cream-deep py-1.5 pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-owl-teal/40"
          />
        </div>

        {/* Type */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as "all" | ContentType)}
          className="rounded-lg border border-owl-cream-deep px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-owl-teal/40"
        >
          <option value="all">All types</option>
          <option value="blog">Blog</option>
          <option value="news">News</option>
        </select>

        {/* Status */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "all" | PostStatus)}
          className="rounded-lg border border-owl-cream-deep px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-owl-teal/40"
        >
          <option value="all">All statuses</option>
          <option value="published">Published</option>
          <option value="scheduled">Scheduled</option>
          <option value="draft">Draft</option>
        </select>

        {/* Category */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-lg border border-owl-cream-deep px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-owl-teal/40"
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <span className="ml-auto text-xs text-owl-mist">{filtered.length} post{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Table */}
      {loading && (
        <div className="flex items-center justify-center py-12 text-owl-mist">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Loading contentΓÇª
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}
      {!loading && !error && (
        <div className="space-y-3">
          {filtered.length === 0 && (
            <p className="py-8 text-center text-sm text-owl-mist">No posts match your filters.</p>
          )}
          {filtered.map((post) => {
            const isEditing = editingId === post.id;
            const isExpanded = expandedId === post.id;

            return (
              <div
                key={post.id}
                className={`rounded-xl border bg-white shadow-sm transition-all ${isEditing ? "border-owl-teal ring-2 ring-owl-teal/20" : "border-owl-cream-deep"}`}
              >
                {/* Row header */}
                <div className="flex flex-wrap items-start gap-3 p-4">
                  {/* Badges */}
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${TYPE_COLORS[post.content_type]}`}>
                    {post.content_type === "blog" ? <FileText className="mr-1 inline h-3 w-3" /> : <Newspaper className="mr-1 inline h-3 w-3" />}
                    {post.content_type}
                  </span>
                  {post.workflow_status && WORKFLOW_META[post.workflow_status] && (
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${WORKFLOW_META[post.workflow_status].color}`}>
                      {WORKFLOW_META[post.workflow_status].label}
                    </span>
                  )}
                  {post.newsletter_eligible && (
                    <span className="rounded-full bg-owl-teal/15 px-2 py-0.5 text-xs font-medium text-owl-teal-deep flex items-center gap-0.5">
                      <Mail className="h-2.5 w-2.5" />
                      NL
                    </span>
                  )}

                  {/* Title + slug */}
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-semibold text-owl-ink text-sm">{post.title}</p>
                    <p className="text-xs text-owl-mist">/{post.content_type === "blog" ? "blog" : "news"}/{post.slug}</p>
                  </div>

                  {/* Date */}
                  <div className="flex items-center gap-1.5 text-xs text-owl-mist">
                    <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                    {isEditing ? (
                      <input
                        type="date"
                        value={editState?.publish_date ?? ""}
                        onChange={(e) => setEditState((s) => s ? { ...s, publish_date: e.target.value } : s)}
                        className="rounded border border-owl-cream-deep px-1.5 py-0.5 text-xs"
                      />
                    ) : (
                      <input
                        type="date"
                        defaultValue={post.publish_date ? post.publish_date.slice(0, 10) : ""}
                        onBlur={(e) => {
                          if (e.target.value !== (post.publish_date?.slice(0, 10) ?? "")) {
                            updateDate(post.id, e.target.value);
                          }
                        }}
                        className="rounded border border-owl-cream-deep px-1.5 py-0.5 text-xs"
                      />
                    )}
                  </div>

                  {/* Category */}
                  <span className="rounded-full bg-owl-cream px-2 py-0.5 text-xs text-owl-mist">
                    {post.category}
                  </span>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    {/* Publish/Unpublish toggle */}
                    <button
                      onClick={() => toggleStatus(post)}
                      title={post.status === "published" ? "Unpublish" : "Publish now"}
                      className={`rounded-lg p-1.5 text-sm transition-colors ${
                        post.status === "published"
                          ? "text-green-600 hover:bg-green-50"
                          : "text-owl-mist hover:bg-owl-cream"
                      }`}
                    >
                      {post.status === "published" ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>

                    {/* Edit */}
                    {!isEditing && (
                      <button
                        onClick={() => startEdit(post)}
                        title="Edit"
                        className="rounded-lg p-1.5 text-owl-mist transition-colors hover:bg-owl-cream hover:text-owl-ink"
                      >
                        <FileEdit className="h-4 w-4" />
                      </button>
                    )}

                    {/* Expand body */}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : post.id)}
                      title={isExpanded ? "Collapse" : "Expand body"}
                      className="rounded-lg p-1.5 text-owl-mist transition-colors hover:bg-owl-cream hover:text-owl-ink"
                    >
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Edit form */}
                {isEditing && editState && (
                  <div className="border-t border-owl-cream-deep p-4 space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-semibold text-owl-mist mb-1">Title</label>
                        <input
                          type="text"
                          value={editState.title}
                          onChange={(e) => setEditState((s) => s ? { ...s, title: e.target.value } : s)}
                          className="w-full rounded-lg border border-owl-cream-deep px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-owl-teal/40"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-owl-mist mb-1">Slug</label>
                        <input
                          type="text"
                          value={editState.slug}
                          onChange={(e) => setEditState((s) => s ? { ...s, slug: e.target.value } : s)}
                          className="w-full rounded-lg border border-owl-cream-deep px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-owl-teal/40"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-owl-mist mb-1">
                          Category
                          <span className="ml-1 font-normal text-owl-mist/60">(blog or news)</span>
                        </label>
                        <input
                          type="text"
                          list="category-options"
                          value={editState.category}
                          onChange={(e) => setEditState((s) => s ? { ...s, category: e.target.value } : s)}
                          className="w-full rounded-lg border border-owl-cream-deep px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-owl-teal/40"
                          placeholder="e.g. homeschooling"
                        />
                        <datalist id="category-options">
                          <optgroup label="Blog">
                            <option value="homeschooling">Homeschooling</option>
                            <option value="parenting-tips">Parenting Tips</option>
                            <option value="child-development">Child Development</option>
                            <option value="music-and-learning">Music &amp; Learning</option>
                            <option value="activities">Activities</option>
                            <option value="safety-wellness">Safety &amp; Wellness</option>
                          </optgroup>
                          <optgroup label="News">
                            <option value="announcements">Announcements</option>
                            <option value="events">Events</option>
                            <option value="resources">Resources</option>
                            <option value="community">Community</option>
                            <option value="press">Press</option>
                          </optgroup>
                        </datalist>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-owl-mist mb-1">Author</label>
                        <input
                          type="text"
                          value={editState.author}
                          onChange={(e) => setEditState((s) => s ? { ...s, author: e.target.value } : s)}
                          className="w-full rounded-lg border border-owl-cream-deep px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-owl-teal/40"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-owl-mist mb-1">Excerpt</label>
                      <textarea
                        rows={2}
                        value={editState.excerpt}
                        onChange={(e) => setEditState((s) => s ? { ...s, excerpt: e.target.value } : s)}
                        className="w-full rounded-lg border border-owl-cream-deep px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-owl-teal/40"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-owl-mist mb-1">Body</label>
                      <textarea
                        rows={8}
                        value={editState.body}
                        onChange={(e) => setEditState((s) => s ? { ...s, body: e.target.value } : s)}
                        className="w-full rounded-lg border border-owl-cream-deep px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-owl-teal/40"
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-semibold text-owl-mist mb-1">SEO Title</label>
                        <input
                          type="text"
                          value={editState.seo_title}
                          onChange={(e) => setEditState((s) => s ? { ...s, seo_title: e.target.value } : s)}
                          className="w-full rounded-lg border border-owl-cream-deep px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-owl-teal/40"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-owl-mist mb-1">SEO Description</label>
                        <input
                          type="text"
                          value={editState.seo_description}
                          onChange={(e) => setEditState((s) => s ? { ...s, seo_description: e.target.value } : s)}
                          className="w-full rounded-lg border border-owl-cream-deep px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-owl-teal/40"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-owl-mist mb-1">
                        Featured Image URL
                        <span className="ml-1 font-normal text-owl-mist/60">(optional — full URL or /images/... path)</span>
                      </label>
                      <input
                        type="url"
                        value={editState.featured_image}
                        onChange={(e) => setEditState((s) => s ? { ...s, featured_image: e.target.value } : s)}
                        placeholder="https://... or /images/headers/blog-hero.png"
                        className="w-full rounded-lg border border-owl-cream-deep px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-owl-teal/40"
                      />
                      {editState.featured_image && (
                        <div className="mt-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={editState.featured_image}
                            alt="Featured image preview"
                            className="h-20 w-32 rounded-lg object-cover shadow-sm border border-owl-cream-deep"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Workflow status transition */}
                    <div>
                      <label className="block text-xs font-semibold text-owl-mist mb-1">Workflow Status</label>
                      <div className="flex flex-wrap gap-2">
                        {(WORKFLOW_TRANSITIONS[editState.workflow_status] ?? []).map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setEditState((st) => st ? { ...st, workflow_status: s } : st)}
                            className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                              editState.workflow_status === s
                                ? "border-owl-teal bg-owl-teal/10 text-owl-teal-deep"
                                : "border-owl-cream-deep bg-white text-owl-ink hover:border-owl-teal"
                            }`}
                          >
                            {WORKFLOW_META[s]?.label ?? s}
                          </button>
                        ))}
                        {(WORKFLOW_TRANSITIONS[editState.workflow_status] ?? []).length === 0 && (
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${WORKFLOW_META[editState.workflow_status]?.color ?? ""}`}>
                            {WORKFLOW_META[editState.workflow_status]?.label ?? editState.workflow_status}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* SEO extended */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-semibold text-owl-mist mb-1 flex items-center gap-1">
                          <Tag className="h-3 w-3" /> Primary Keyword
                        </label>
                        <input
                          type="text"
                          value={editState.primary_keyword}
                          onChange={(e) => setEditState((s) => s ? { ...s, primary_keyword: e.target.value } : s)}
                          placeholder="e.g. children's music education"
                          className="w-full rounded-lg border border-owl-cream-deep px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-owl-teal/40"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-owl-mist mb-1">Secondary Keywords <span className="font-normal">(comma-separated)</span></label>
                        <input
                          type="text"
                          value={editState.secondary_keywords}
                          onChange={(e) => setEditState((s) => s ? { ...s, secondary_keywords: e.target.value } : s)}
                          placeholder="keyword one, keyword two"
                          className="w-full rounded-lg border border-owl-cream-deep px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-owl-teal/40"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-owl-mist mb-1">OG Title</label>
                        <input
                          type="text"
                          value={editState.og_title}
                          onChange={(e) => setEditState((s) => s ? { ...s, og_title: e.target.value } : s)}
                          className="w-full rounded-lg border border-owl-cream-deep px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-owl-teal/40"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-owl-mist mb-1">OG Description</label>
                        <input
                          type="text"
                          value={editState.og_description}
                          onChange={(e) => setEditState((s) => s ? { ...s, og_description: e.target.value } : s)}
                          className="w-full rounded-lg border border-owl-cream-deep px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-owl-teal/40"
                        />
                      </div>
                    </div>

                    {/* Newsletter eligible + editorial priority */}
                    <div className="flex flex-wrap items-center gap-6">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-owl-ink">Newsletter eligible</span>
                        <button
                          type="button"
                          onClick={() => setEditState((s) => s ? { ...s, newsletter_eligible: !s.newsletter_eligible } : s)}
                          className={`relative inline-flex h-5 w-9 rounded-full transition-colors ${editState.newsletter_eligible ? "bg-owl-teal" : "bg-owl-cream-deep"}`}
                          role="switch"
                          aria-checked={editState.newsletter_eligible}
                        >
                          <span className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${editState.newsletter_eligible ? "translate-x-4" : ""}`} />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-owl-ink">Editorial priority</label>
                        <input
                          type="number"
                          min={1}
                          max={10}
                          value={editState.editorial_priority}
                          onChange={(e) => setEditState((s) => s ? { ...s, editorial_priority: Number(e.target.value) } : s)}
                          className="w-16 rounded-lg border border-owl-cream-deep px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-owl-teal/40"
                        />
                        <span className="text-xs text-owl-mist">/ 10</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={saveEdit}
                        disabled={saving}
                        className="flex items-center gap-2 rounded-lg bg-owl-teal px-4 py-2 text-sm font-semibold text-white hover:bg-owl-teal-deep disabled:opacity-60"
                      >
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        {saving ? "SavingΓÇª" : "Save changes"}
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="flex items-center gap-2 rounded-lg border border-owl-cream-deep px-4 py-2 text-sm text-owl-mist hover:bg-owl-cream"
                      >
                        <X className="h-4 w-4" />
                        Cancel
                      </button>
                      {saveResult === "success" && (
                        <span className="flex items-center gap-1 text-xs text-green-600">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          {saveMessage}
                        </span>
                      )}
                      {saveResult === "error" && (
                        <span className="text-xs text-red-600">{saveMessage}</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Expanded body preview */}
                {isExpanded && !isEditing && (
                  <div className="border-t border-owl-cream-deep p-4">
                    <p className="text-xs font-semibold text-owl-mist mb-2">Body preview</p>
                    <div className="max-h-48 overflow-y-auto rounded-lg bg-owl-cream p-3 text-xs leading-relaxed text-owl-ink/80 whitespace-pre-wrap">
                      {post.body ?? "(empty)"}
                    </div>
                    {post.seo_title && (
                      <p className="mt-2 text-xs text-owl-mist">
                        <strong>SEO title:</strong> {post.seo_title}
                      </p>
                    )}
                    {post.seo_description && (
                      <p className="text-xs text-owl-mist">
                        <strong>SEO desc:</strong> {post.seo_description}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

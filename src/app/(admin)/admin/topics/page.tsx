"use client";

import { useEffect, useState } from "react";
import {
  Lightbulb, Wifi, WifiOff, RefreshCw, TrendingUp, TrendingDown, Minus,
  CheckCircle2, AlertTriangle, X, ChevronDown, ChevronUp, ExternalLink,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SeoDataSource {
  source_key: string;
  display_name: string;
  source_type: string;
  status: "not_connected" | "connected" | "error" | "rate_limited";
  last_synced_at: string | null;
  error_message: string | null;
  connect_url: string | null;
  notes: string | null;
}

interface TopicRecommendation {
  id: string;
  topic_title: string;
  topic_slug: string | null;
  content_type: "news" | "blog";
  category: string;
  trend_direction: "rising" | "stable" | "declining" | null;
  relative_search_interest: number | null;
  monthly_search_volume: number | null;
  owl_relevance_score: number;
  content_gap_score: number;
  recommendation_score: number;
  recommendation_reason: string | null;
  cannibalization_risk: "none" | "low" | "medium" | "high";
  cannibalizes_slug: string | null;
  status: "pending" | "reviewing" | "accepted" | "rejected" | "assigned" | "archived";
  created_at: string;
}

interface TopicsData {
  sources: SeoDataSource[];
  recommendations: TopicRecommendation[];
  stats: {
    total_pending: number;
    connected_sources: number;
    total_sources: number;
  };
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CANNIBAL_COLORS: Record<string, string> = {
  none:   "text-green-600",
  low:    "text-amber-500",
  medium: "text-orange-500",
  high:   "text-red-600",
};

const TOPIC_STATUS_COLORS: Record<string, string> = {
  pending:   "bg-slate-100 text-slate-700",
  reviewing: "bg-blue-100 text-blue-700",
  accepted:  "bg-teal-100 text-teal-700",
  rejected:  "bg-red-100 text-red-700",
  assigned:  "bg-green-100 text-green-700",
  archived:  "bg-gray-100 text-gray-500",
};

const SOURCE_TYPE_LABELS: Record<string, string> = {
  search_analytics: "Search Analytics",
  web_analytics:    "Web Analytics",
  keyword_research: "Keyword Research",
  trend_data:       "Trend Data",
  competitor_intel: "Competitor Intel",
  user_behavior:    "User Behavior",
  first_party:      "First Party",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtVol(n: number | null): string {
  if (n === null) return "—";
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

function ScoreBar({ value, max = 100, color = "bg-owl-teal" }: { value: number; max?: number; color?: string }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-20 rounded-full bg-owl-cream-deep overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-owl-mist tabular-nums">{value}</span>
    </div>
  );
}

function TrendIcon({ dir }: { dir: string | null }) {
  if (dir === "rising")   return <TrendingUp className="h-4 w-4 text-green-500" />;
  if (dir === "declining") return <TrendingDown className="h-4 w-4 text-red-400" />;
  return <Minus className="h-4 w-4 text-owl-mist" />;
}

// ─── Source Card ─────────────────────────────────────────────────────────────

function SourceCard({ source }: { source: SeoDataSource }) {
  const isConnected = source.status === "connected";
  const isError = source.status === "error" || source.status === "rate_limited";

  return (
    <div className={`rounded-owl-btn border p-4 space-y-2 ${
      isConnected
        ? "border-green-200 bg-green-50/40"
        : isError
        ? "border-red-200 bg-red-50/40"
        : "border-owl-cream-deep bg-white"
    }`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-medium text-owl-ink text-sm leading-tight">{source.display_name}</p>
          <p className="text-[11px] text-owl-mist mt-0.5">
            {SOURCE_TYPE_LABELS[source.source_type] ?? source.source_type}
          </p>
        </div>
        {isConnected ? (
          <Wifi className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
        ) : isError ? (
          <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
        ) : (
          <WifiOff className="h-4 w-4 text-owl-mist shrink-0 mt-0.5" />
        )}
      </div>

      <div className="text-xs">
        {isConnected ? (
          <span className="text-green-700 font-medium">
            Connected · Last synced {source.last_synced_at
              ? new Date(source.last_synced_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })
              : "never"
            }
          </span>
        ) : isError ? (
          <span className="text-red-600">{source.error_message ?? "Connection error"}</span>
        ) : (
          <span className="text-owl-mist">Not connected · Data unavailable</span>
        )}
      </div>

      {source.notes && (
        <p className="text-[11px] text-owl-mist/70 italic">{source.notes}</p>
      )}

      {!isConnected && source.connect_url && (
        <a
          href={source.connect_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-medium text-owl-teal hover:text-owl-teal-deep transition-colors"
        >
          Connect <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </div>
  );
}

// ─── Topic Row ────────────────────────────────────────────────────────────────

function TopicRow({
  topic,
  onStatusChange,
}: {
  topic: TopicRecommendation;
  onStatusChange: (id: string, status: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr className="border-b border-owl-cream-deep/60 hover:bg-owl-cream/30 transition-colors">
        <td className="px-3 py-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setExpanded((v) => !v)}
              className="rounded p-0.5 text-owl-mist hover:text-owl-ink transition-colors"
            >
              {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
            <span className="text-sm font-medium text-owl-ink">{topic.topic_title}</span>
          </div>
        </td>
        <td className="px-3 py-3 text-xs text-owl-mist capitalize">{topic.content_type}</td>
        <td className="px-3 py-3 text-xs text-owl-mist">{topic.category}</td>
        <td className="px-3 py-3"><TrendIcon dir={topic.trend_direction} /></td>
        <td className="px-3 py-3 text-xs text-owl-mist tabular-nums">{fmtVol(topic.monthly_search_volume)}</td>
        <td className="px-3 py-3"><ScoreBar value={topic.owl_relevance_score} color="bg-owl-teal" /></td>
        <td className="px-3 py-3"><ScoreBar value={topic.recommendation_score} color="bg-purple-400" /></td>
        <td className="px-3 py-3">
          <span className={`text-xs font-medium ${CANNIBAL_COLORS[topic.cannibalization_risk]}`}>
            {topic.cannibalization_risk === "none" ? "None" : topic.cannibalization_risk}
          </span>
        </td>
        <td className="px-3 py-3">
          <select
            value={topic.status}
            onChange={(e) => onStatusChange(topic.id, e.target.value)}
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium border-0 cursor-pointer focus:ring-1 focus:ring-owl-teal focus:outline-none ${TOPIC_STATUS_COLORS[topic.status] ?? ""}`}
          >
            {["pending","reviewing","accepted","rejected","assigned","archived"].map((s) => (
              <option key={s} value={s} className="bg-white text-owl-ink font-normal">{s}</option>
            ))}
          </select>
        </td>
      </tr>
      {expanded && (
        <tr className="border-b border-owl-cream-deep/60 bg-owl-cream/20">
          <td colSpan={9} className="px-8 py-3">
            <div className="space-y-1.5 text-sm">
              {topic.recommendation_reason && (
                <p className="text-owl-ink/80">
                  <span className="font-medium text-owl-ink">Reason:</span> {topic.recommendation_reason}
                </p>
              )}
              {topic.monthly_search_volume === null && (
                <p className="text-amber-600 text-xs">
                  ⚠ Search volume unavailable — no keyword data source connected.
                </p>
              )}
              {topic.cannibalization_risk !== "none" && topic.cannibalizes_slug && (
                <p className="text-orange-600 text-xs">
                  Cannibalization risk with: <code className="bg-orange-50 px-1 rounded">{topic.cannibalizes_slug}</code>
                </p>
              )}
              {topic.relative_search_interest !== null && (
                <p className="text-owl-mist text-xs">
                  Relative interest: {topic.relative_search_interest}/100
                  {topic.monthly_search_volume === null && " (estimated from internal signals)"}
                </p>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TopicsPage() {
  const [data, setData] = useState<TopicsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"recommendations" | "sources">("recommendations");
  const [statusFilter, setStatusFilter] = useState("pending");

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/topics");
      if (!res.ok) throw new Error("Failed");
      setData(await res.json() as TopicsData);
    } catch {
      // keep stale
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  async function handleStatusChange(id: string, status: string) {
    await fetch(`/api/admin/topics/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    void load();
  }

  const sources = data?.sources ?? [];
  const connectedCount = sources.filter((s) => s.status === "connected").length;
  const allRecs = data?.recommendations ?? [];
  const recs = statusFilter === "all" ? allRecs : allRecs.filter((r) => r.status === statusFilter);

  return (
    <div className="space-y-6 p-6 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-owl-ink">Topic Intelligence</h1>
          <p className="mt-0.5 text-sm text-owl-mist">
            Content recommendations and SEO data source status
          </p>
        </div>
        <button
          onClick={() => void load()}
          className="flex items-center gap-2 rounded-owl-btn border border-owl-cream-deep bg-white px-3 py-2 text-sm font-medium text-owl-ink hover:bg-owl-cream transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Source connection status banner */}
      {!loading && connectedCount === 0 && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <WifiOff className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">No SEO data sources connected</p>
            <p className="mt-0.5 opacity-80">
              All {sources.length} sources show "Not connected." Search volumes, trend data, and ranking
              metrics are unavailable. Connect at least Google Search Console for first-party signals.
            </p>
          </div>
        </div>
      )}
      {!loading && connectedCount > 0 && connectedCount < sources.length && (
        <div className="flex items-center gap-3 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
          <CheckCircle2 className="h-4 w-4 text-sky-500 shrink-0" />
          <p>
            <span className="font-semibold">{connectedCount} of {sources.length}</span> data sources connected.
            Some metrics may be unavailable or estimated from internal signals.
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-owl-cream-deep">
        {(["recommendations", "sources"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors rounded-t-lg ${
              activeTab === tab
                ? "border-b-2 border-owl-teal text-owl-teal-deep bg-owl-teal/5"
                : "text-owl-mist hover:text-owl-ink"
            }`}
          >
            {tab === "recommendations" ? <Lightbulb className="h-4 w-4" /> : <Wifi className="h-4 w-4" />}
            {tab === "recommendations" ? "Recommendations" : `Data Sources (${connectedCount}/${sources.length})`}
          </button>
        ))}
      </div>

      {/* Recommendations tab */}
      {activeTab === "recommendations" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-sm text-owl-mist">Filter by status:</span>
            {["all", "pending", "reviewing", "accepted", "rejected", "assigned"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  statusFilter === s
                    ? "bg-owl-teal text-white"
                    : "bg-owl-cream text-owl-mist hover:text-owl-ink"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="h-40 flex items-center justify-center">
              <RefreshCw className="h-5 w-5 animate-spin text-owl-teal" />
            </div>
          ) : recs.length === 0 ? (
            <div className="rounded-owl-btn border border-owl-cream-deep bg-white p-8 text-center">
              <Lightbulb className="h-8 w-8 text-owl-mist mx-auto mb-2" />
              <p className="text-sm text-owl-mist">No topic recommendations in this status.</p>
            </div>
          ) : (
            <div className="rounded-owl-btn border border-owl-cream-deep bg-white overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-owl-cream-deep">
                    {[
                      "Topic", "Type", "Category", "Trend",
                      "Volume", "OWL Relevance", "Score", "Cannibalization", "Status"
                    ].map((h) => (
                      <th key={h} className="px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-owl-mist whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recs.map((r) => (
                    <TopicRow key={r.id} topic={r} onStatusChange={handleStatusChange} />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {connectedCount === 0 && recs.length > 0 && (
            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-owl-btn px-4 py-2">
              ⚠ Search volumes shown as "—" because no keyword data source is connected. Connect Google Search Console
              or a keyword tool to see volume estimates.
            </p>
          )}
        </div>
      )}

      {/* Sources tab */}
      {activeTab === "sources" && (
        <div className="space-y-4">
          <p className="text-sm text-owl-mist/80">
            These sources provide search data, trend signals, and analytics to power topic recommendations.
            All start as "Not connected" — data is only shown when a source is verified and syncing.
          </p>
          {loading ? (
            <div className="h-40 flex items-center justify-center">
              <RefreshCw className="h-5 w-5 animate-spin text-owl-teal" />
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {sources.map((s) => (
                <SourceCard key={s.source_key} source={s} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

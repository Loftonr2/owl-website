import { NextRequest, NextResponse } from "next/server";
import { supabaseServiceRole } from "@/lib/clients/supabase-server";

export const dynamic = "force-dynamic";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CandidatePost {
  id: string;
  content_type: string;
  title: string;
  slug: string;
  category: string;
  author: string | null;
  featured_image: string | null;
  publish_date: string | null;
  editorial_priority: number;
  primary_keyword: string | null;
  newsletter_promoted_count: number;
  last_newsletter_date: string | null;
  reading_time_mins: number | null;
  seo_title: string | null;
  seo_description: string | null;
}

interface SeoSourceRow {
  source_key: string;
  status: string;
}

// ─── Mode ─────────────────────────────────────────────────────────────────────

type SelectionMode =
  | "manual"
  | "newest"
  | "highest_organic_demand"
  | "highest_search_impressions"
  | "highest_search_clicks"
  | "highest_website_engagement"
  | "highest_newsletter_click_potential"
  | "fastest_growing"
  | "editorial_recommendation"
  | "balanced_automatic";

/**
 * GET /api/admin/newsletter/recommend?mode=balanced_automatic&count=6
 *
 * Returns ranked newsletter-eligible published posts using the specified mode.
 * When a data source is not connected, metric fields are null.
 * Never fabricates metrics.
 */
export async function GET(req: NextRequest) {
  try {
    const sb = supabaseServiceRole();
    const { searchParams } = new URL(req.url);
    const mode = (searchParams.get("mode") ?? "balanced_automatic") as SelectionMode;
    const count = Math.min(parseInt(searchParams.get("count") ?? "6"), 20);

    // Check which sources are connected
    const { data: rawSources } = await sb
      .from("seo_data_sources")
      .select("source_key, status")
      .in("source_key", ["google_search_console", "google_analytics", "newsletter_clicks", "internal_search"]);

    const sources = (rawSources ?? []) as unknown as SeoSourceRow[];
    const connectedKeys = new Set(
      sources.filter((s) => s.status === "connected").map((s) => s.source_key)
    );

    // Fetch candidates
    const { data: rawCandidates, error } = await sb
      .from("content_posts")
      .select(
        "id, content_type, title, slug, category, author, featured_image," +
        "publish_date, editorial_priority, primary_keyword, newsletter_promoted_count," +
        "last_newsletter_date, reading_time_mins, seo_title, seo_description"
      )
      .eq("workflow_status", "published")
      .eq("newsletter_eligible", true)
      .not("featured_image", "is", null)
      .order("publish_date", { ascending: false })
      .limit(50);

    if (error) throw error;

    const candidates = (rawCandidates ?? []) as unknown as CandidatePost[];

    const noSourcesWarning = connectedKeys.size === 0
      ? "No data sources connected — using editorial priority only."
      : null;

    // Score each post based on mode
    function scorePost(post: CandidatePost): { score: number; reason: string } {
      const pri = post.editorial_priority ?? 5;

      const unavailable = (source: string): { score: number; reason: string } => ({
        score: pri,
        reason: `Unavailable — ${source} not connected. Falling back to editorial priority.`,
      });

      switch (mode) {
        case "newest": {
          const ts = post.publish_date ? new Date(post.publish_date).getTime() / 1000 : 0;
          return { score: ts, reason: "Newest first" };
        }

        case "editorial_recommendation":
          return { score: pri, reason: "Editorial priority" };

        case "highest_organic_demand":
        case "highest_search_impressions":
        case "highest_search_clicks":
          if (!connectedKeys.has("google_search_console"))
            return unavailable("Google Search Console");
          return { score: pri, reason: "Search Console connected — performance data pending sync." };

        case "highest_website_engagement":
          if (!connectedKeys.has("google_analytics"))
            return unavailable("Google Analytics");
          return { score: pri, reason: "Analytics connected — engagement data pending sync." };

        case "highest_newsletter_click_potential":
          if (!connectedKeys.has("newsletter_clicks"))
            return unavailable("Newsletter click tracking");
          return { score: pri, reason: "Newsletter tracking connected — click data pending sync." };

        case "fastest_growing":
          if (connectedKeys.size === 0)
            return unavailable("data sources");
          return {
            score: pri,
            reason: "Insufficient data — need 2+ performance snapshots to compute growth rate.",
          };

        case "balanced_automatic":
        default: {
          const now = Date.now();
          const ageMs = post.publish_date ? now - new Date(post.publish_date).getTime() : 9999999999;
          const ageDays = ageMs / 86400000;
          const recencyScore = Math.max(0, 100 - ageDays * 2);
          const priorityScore = (pri / 10) * 100;
          const daysSincePromo = post.last_newsletter_date
            ? (now - new Date(post.last_newsletter_date).getTime()) / 86400000
            : 999;
          const freshnessBonus = daysSincePromo > 60 ? 20 : daysSincePromo > 30 ? 10 : 0;
          const score = recencyScore * 0.4 + priorityScore * 0.4 + freshnessBonus * 0.2;
          const suffix = noSourcesWarning ? " (No external data sources — first-party only.)" : "";
          return {
            score,
            reason: "Balanced: recency 40% + editorial priority 40% + freshness 20%." + suffix,
          };
        }
      }
    }

    const ranked = candidates
      .map((post) => {
        const { score, reason } = scorePost(post);
        return {
          ...post,
          score: Math.round(score * 10) / 10,
          selection_reason: reason,
          metrics: {
            search_impressions: null as number | null,
            search_clicks: null as number | null,
            page_views: null as number | null,
            newsletter_click_rate: null as number | null,
          },
          data_source_warning: noSourcesWarning,
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, count);

    return NextResponse.json({
      mode,
      count: ranked.length,
      connected_sources: [...connectedKeys],
      posts: ranked,
    });
  } catch (err) {
    console.error("[/api/admin/newsletter/recommend GET]", err);
    return NextResponse.json({ error: "Failed to generate recommendations" }, { status: 500 });
  }
}

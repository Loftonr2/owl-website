import { NextRequest, NextResponse } from "next/server";
import { supabaseServiceRole } from "@/lib/clients/supabase-server";

export const dynamic = "force-dynamic";

// DB column shapes (actual names from migration 0016)
interface DbSourceRow {
  slug: string;
  name: string;
  category: string;
  status: string;
  last_synced_at: string | null;
  last_error: string | null;
  notes: string | null;
}

interface DbTopicRow {
  id: string;
  title: string;
  recommended_type: string;
  audience_category: string;
  trend_direction: string | null;
  relative_search_interest: number | null;
  monthly_search_volume: number | null;
  owl_relevance_score: number | null;
  content_gap_score: number | null;
  recommendation_score: number | null;
  recommendation_reason: string | null;
  cannibalization_risk: string | null;
  existing_coverage_slug: string | null;
  status: string;
  created_at: string;
}

/**
 * Map DB rows to the shape the frontend expects.
 * The frontend interfaces use legacy names from before the migration was
 * finalised — we map here rather than rewriting 430 lines of UI.
 */
function mapSource(row: DbSourceRow) {
  return {
    source_key:    row.slug,
    display_name:  row.name,
    source_type:   row.category,
    status:        row.status,
    last_synced_at: row.last_synced_at,
    error_message: row.last_error,
    connect_url:   null as string | null,
    notes:         row.notes,
  };
}

function mapTopic(row: DbTopicRow) {
  return {
    id:                       row.id,
    topic_title:              row.title,
    topic_slug:               null as string | null,
    content_type:             row.recommended_type,
    category:                 row.audience_category,
    trend_direction:          row.trend_direction,
    relative_search_interest: row.relative_search_interest,
    monthly_search_volume:    row.monthly_search_volume,
    owl_relevance_score:      row.owl_relevance_score ?? 0,
    content_gap_score:        row.content_gap_score ?? 0,
    recommendation_score:     row.recommendation_score ?? 0,
    recommendation_reason:    row.recommendation_reason,
    cannibalization_risk:     row.cannibalization_risk ?? "none",
    cannibalizes_slug:        row.existing_coverage_slug,
    status:                   row.status,
    created_at:               row.created_at,
  };
}

/**
 * GET /api/admin/topics
 * Returns topic recommendations + SEO data source status + stats
 */
export async function GET(_req: NextRequest) {
  try {
    const sb = supabaseServiceRole();

    const [recsResult, sourcesResult] = await Promise.all([
      sb
        .from("topic_recommendations")
        .select(
          "id, title, recommended_type, audience_category, " +
          "trend_direction, relative_search_interest, monthly_search_volume, " +
          "owl_relevance_score, content_gap_score, recommendation_score, " +
          "recommendation_reason, cannibalization_risk, existing_coverage_slug, " +
          "status, created_at"
        )
        .neq("status", "archived")
        .order("recommendation_score", { ascending: false })
        .limit(100),
      sb
        .from("seo_data_sources")
        .select("slug, name, category, status, last_synced_at, last_error, notes")
        .order("category")
        .order("name"),
    ]);

    if (recsResult.error) throw recsResult.error;
    if (sourcesResult.error) throw sourcesResult.error;

    const dbSources = (sourcesResult.data ?? []) as unknown as DbSourceRow[];
    const dbRecs    = (recsResult.data    ?? []) as unknown as DbTopicRow[];

    const sources = dbSources.map(mapSource);
    const recs    = dbRecs.map(mapTopic);

    return NextResponse.json({
      recommendations: recs,
      sources,
      stats: {
        total_pending:     recs.filter((r) => r.status === "pending").length,
        connected_sources: sources.filter((s) => s.status === "connected").length,
        total_sources:     sources.length,
      },
    });
  } catch (err) {
    console.error("[/api/admin/topics GET]", err);
    return NextResponse.json({ error: "Failed to fetch topic data" }, { status: 500 });
  }
}

/**
 * POST /api/admin/topics — create a new topic recommendation (manually)
 * Accepts frontend field names and maps to DB column names.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Record<string, unknown>;
    const sb = supabaseServiceRole();

    if (!body.topic_title) {
      return NextResponse.json({ error: "Missing required field: topic_title" }, { status: 400 });
    }

    const { data, error } = await sb
      .from("topic_recommendations")
      .insert({
        title:                body.topic_title,
        recommended_type:     (body.content_type as string) ?? "news_article",
        audience_category:    (body.category as string) ?? "parenting",
        owl_relevance_score:  body.owl_relevance_score ?? null,
        content_gap_score:    body.content_gap_score ?? null,
        recommendation_score: body.recommendation_score ?? null,
        status: "pending",
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error("[/api/admin/topics POST]", err);
    return NextResponse.json({ error: "Failed to create topic" }, { status: 500 });
  }
}

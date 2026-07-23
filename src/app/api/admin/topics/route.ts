import { NextRequest, NextResponse } from "next/server";
import { supabaseServiceRole } from "@/lib/clients/supabase-server";

export const dynamic = "force-dynamic";

interface SeoSourceRow {
  source_key: string;
  display_name: string;
  source_type: string;
  status: string;
  last_synced_at: string | null;
  error_message: string | null;
  connect_url: string | null;
  notes: string | null;
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
        .select([
          "id, topic_title, topic_slug, content_type, category,",
          "trend_direction, relative_search_interest, monthly_search_volume,",
          "owl_relevance_score, content_gap_score, recommendation_score,",
          "recommendation_reason, cannibalization_risk, cannibalizes_slug,",
          "status, created_at",
        ].join(" "))
        .neq("status", "archived")
        .order("recommendation_score", { ascending: false })
        .limit(100),
      sb
        .from("seo_data_sources")
        .select("source_key, display_name, source_type, status, last_synced_at, error_message, connect_url, notes")
        .order("source_type")
        .order("display_name"),
    ]);

    if (recsResult.error) throw recsResult.error;

    interface TopicRow { status: string; [k: string]: unknown }
    const sources = (sourcesResult.data ?? []) as unknown as SeoSourceRow[];
    const recs = (recsResult.data ?? []) as unknown as TopicRow[];
    const connectedSources = sources.filter((s) => s.status === "connected").length;
    const totalPending = recs.filter((r) => r.status === "pending").length;

    return NextResponse.json({
      recommendations: recs,
      sources,
      stats: {
        total_pending: totalPending,
        connected_sources: connectedSources,
        total_sources: sources.length,
      },
    });
  } catch (err) {
    console.error("[/api/admin/topics GET]", err);
    return NextResponse.json({ error: "Failed to fetch topic data" }, { status: 500 });
  }
}

/**
 * POST /api/admin/topics — create a new topic recommendation (manually)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Record<string, unknown>;
    const sb = supabaseServiceRole();

    const required = ["topic_title", "content_type", "category"];
    for (const f of required) {
      if (!body[f]) return NextResponse.json({ error: `Missing required field: ${f}` }, { status: 400 });
    }

    const { data, error } = await sb
      .from("topic_recommendations")
      .insert({
        topic_title: body.topic_title,
        content_type: body.content_type,
        category: body.category,
        owl_relevance_score: body.owl_relevance_score ?? 50,
        content_gap_score: body.content_gap_score ?? 50,
        recommendation_score: body.recommendation_score ?? 50,
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

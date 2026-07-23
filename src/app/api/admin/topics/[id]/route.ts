import { NextRequest, NextResponse } from "next/server";
import { supabaseServiceRole } from "@/lib/clients/supabase-server";

export const dynamic = "force-dynamic";

// Actual DB column names from migration 0016
const ALLOWED = [
  "title", "recommended_type", "audience_category",
  "trend_direction", "owl_relevance_score", "content_gap_score",
  "recommendation_score", "recommendation_reason",
  "cannibalization_risk", "existing_coverage_slug",
  "status", "linked_content_post_id",
] as const;

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json() as Record<string, unknown>;
    const sb = supabaseServiceRole();

    const patch: Record<string, unknown> = {};
    for (const key of ALLOWED) {
      if (Object.prototype.hasOwnProperty.call(body, key)) patch[key] = body[key];
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: "No updatable fields." }, { status: 400 });
    }

    const { data, error } = await sb
      .from("topic_recommendations")
      .update(patch)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    console.error("[/api/admin/topics/[id] PATCH]", err);
    return NextResponse.json({ error: "Failed to update topic" }, { status: 500 });
  }
}

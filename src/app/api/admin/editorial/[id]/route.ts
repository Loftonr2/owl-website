import { NextRequest, NextResponse } from "next/server";
import { supabaseServiceRole } from "@/lib/clients/supabase-server";

export const dynamic = "force-dynamic";

const WORKFLOW_STATUSES = [
  "topic_identified", "researching", "draft", "editing",
  "awaiting_approval", "approved", "scheduled", "published",
  "needs_updating", "archived",
] as const;

const ALLOWED_FIELDS = [
  "title", "slug", "category", "excerpt", "body", "author",
  "publish_date", "target_pub_time", "draft_deadline", "approval_deadline",
  "workflow_status", "status", "featured_image",
  "primary_keyword", "secondary_keywords", "search_intent",
  "seo_title", "seo_description", "canonical_url",
  "og_title", "og_description", "og_image", "structured_data_type",
  "newsletter_eligible", "editorial_priority",
  "reviewer_name", "reviewer_approved_at",
  "sources", "related_slugs", "content_tags",
  "age_range", "reading_time_mins", "requires_medical_review",
  "assigned_author_id", "assigned_editor_id",
] as const;

/**
 * PATCH /api/admin/editorial/[id]
 * Update any editorial field on a content_post. Syncs workflow_status to
 * status automatically where the values overlap.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json() as Record<string, unknown>;
    const sb = supabaseServiceRole();

    const patch: Record<string, unknown> = {};
    for (const key of ALLOWED_FIELDS) {
      if (Object.prototype.hasOwnProperty.call(body, key)) {
        patch[key] = body[key];
      }
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: "No updatable fields provided." }, { status: 400 });
    }

    // Auto-sync: when workflow_status changes to published/scheduled/draft,
    // keep the old status column in sync for backward compat.
    if (patch.workflow_status) {
      const ws = patch.workflow_status as string;
      if (ws === "published") patch.status = "published";
      else if (ws === "scheduled" || ws === "approved") patch.status = "scheduled";
      else if (["draft","editing","researching","topic_identified","awaiting_approval"].includes(ws)) patch.status = "draft";
    }

    // When approving, require a reviewer name
    if (patch.workflow_status === "approved" && !patch.reviewer_name) {
      patch.reviewer_approved_at = new Date().toISOString();
    }

    const { data, error } = await sb
      .from("content_posts")
      .update(patch)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(data);
  } catch (err) {
    console.error("[/api/admin/editorial/[id] PATCH]", err);
    return NextResponse.json({ error: "Failed to update content post" }, { status: 500 });
  }
}

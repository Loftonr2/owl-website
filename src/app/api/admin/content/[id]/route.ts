/**
 * PATCH /api/admin/content/[id]
 * Updates a content_post by id (admin only, service role).
 * Accepts: title, slug, category, excerpt, body, author,
 *          publish_date, status, seo_title, seo_description, featured_image
 */

import { NextRequest, NextResponse } from "next/server";
import { adminUpdatePost, adminGetAllPosts } from "@/lib/content-posts";

export const dynamic = "force-dynamic";

type Params = { id: string };

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<Params> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing post id" }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Allowlist updatable fields
  const allowed = [
    "title",
    "slug",
    "category",
    "excerpt",
    "body",
    "author",
    "publish_date",
    "status",
    "workflow_status",
    "seo_title",
    "seo_description",
    "og_title",
    "og_description",
    "primary_keyword",
    "secondary_keywords",
    "featured_image",
    "newsletter_eligible",
    "editorial_priority",
    "assigned_author_id",
    "assigned_editor_id",
    "reviewer_name",
    "reviewer_approved_at",
    "sources",
    "related_slugs",
    "content_tags",
    "age_range",
    "reading_time_mins",
    "requires_medical_review",
  ];
  const fields: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) {
      fields[key] = body[key];
    }
  }

  if (Object.keys(fields).length === 0) {
    return NextResponse.json({ error: "No updatable fields provided" }, { status: 400 });
  }

  // Validate status value if provided
  if (fields.status && !["draft", "scheduled", "published"].includes(fields.status as string)) {
    return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
  }

  const result = await adminUpdatePost(id, fields as Parameters<typeof adminUpdatePost>[1]);

  if (!result.success) {
    return NextResponse.json({ error: result.error ?? "Update failed" }, { status: 500 });
  }

  // Return the updated post so the CRM can patch its local state
  const posts = await adminGetAllPosts();
  const updated = posts.find((p) => p.id === id) ?? null;

  return NextResponse.json({ success: true, post: updated });
}

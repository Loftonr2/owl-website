import { NextRequest, NextResponse } from "next/server";
import { supabaseServiceRole } from "@/lib/clients/supabase-server";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/editorial/preview?id=<uuid>&type=news|blog|newsletter
 *
 * Returns a normalized EditorialPreview shape for any content type.
 * Used by the in-CRM preview drawer — no page navigation required.
 */

export type EditorialPreview = {
  id: string;
  type: "news" | "blog" | "newsletter";
  title: string;
  status: string;
  category?: string | null;
  featuredImageUrl?: string | null;
  summary?: string | null;
  body?: string | null;
  author?: string | null;
  reviewer?: string | null;
  scheduledAt?: string | null;
  publishedAt?: string | null;
  publicUrl?: string | null;
  newsletterEligible?: boolean;
  seo?: {
    primaryKeyword?: string | null;
    title?: string | null;
    description?: string | null;
    canonicalUrl?: string | null;
  };
  newsletter?: {
    issueNumber?: number | null;
    noteTitle?: string | null;
    noteBody?: string | null;
    parentingTipTitle?: string | null;
    parentingTipBody?: string | null;
    parentingTipAgeRange?: string | null;
    parentingTipTakeaway?: string | null;
    healthAlertTitle?: string | null;
    healthAlertBody?: string | null;
    archiveSlug?: string | null;
    crmUrl?: string | null;
  };
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const type = searchParams.get("type") as "news" | "blog" | "newsletter" | null;

  if (!id || !type || !["news", "blog", "newsletter"].includes(type)) {
    return NextResponse.json(
      { error: "id and type (news|blog|newsletter) are required" },
      { status: 400 }
    );
  }

  const sb = supabaseServiceRole();

  // ── News / Blog ────────────────────────────────────────────────────────────
  if (type === "news" || type === "blog") {
    const { data, error } = await sb
      .from("content_posts")
      .select(
        "id, content_type, title, workflow_status, category, featured_image, " +
        "excerpt, body, author, reviewer_name, publish_date, publish_verified_at, " +
        "slug, newsletter_eligible, primary_keyword, seo_title, seo_description, canonical_url"
      )
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const d = data as unknown as Record<string, unknown>;
    const contentType = (d.content_type as string) === "blog" ? "blog" : "news";
    const slug = d.slug as string | null;
    const preview: EditorialPreview = {
      id: d.id as string,
      type: contentType as "news" | "blog",
      title: d.title as string,
      status: d.workflow_status as string,
      category: d.category as string | null,
      featuredImageUrl: d.featured_image as string | null,
      summary: d.excerpt as string | null,
      body: (d.body as string | null)?.slice(0, 600) ?? null,
      author: d.author as string | null,
      reviewer: d.reviewer_name as string | null,
      scheduledAt: d.publish_date as string | null,
      publishedAt: d.publish_verified_at as string | null,
      publicUrl: slug
        ? contentType === "news"
          ? `/news/${slug}`
          : `/blog/${slug}`
        : null,
      newsletterEligible: d.newsletter_eligible as boolean,
      seo: {
        primaryKeyword: d.primary_keyword as string | null,
        title: d.seo_title as string | null,
        description: d.seo_description as string | null,
        canonicalUrl: d.canonical_url as string | null,
      },
    };

    return NextResponse.json(preview);
  }

  // ── Newsletter ─────────────────────────────────────────────────────────────
  const { data, error } = await sb
    .from("newsletter_campaigns")
    .select(
      "id, issue_number, title, status, publication_date, scheduled_send_at, " +
      "note_title, note_body, tip_title, tip_body, tip_age_range, tip_takeaway, " +
      "health_alert_title, health_alert_body, archive_slug"
    )
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const d = data as unknown as Record<string, unknown>;
  const archiveSlug = d.archive_slug as string | null;
  const preview: EditorialPreview = {
    id: d.id as string,
    type: "newsletter",
    title: d.title as string,
    status: d.status as string,
    scheduledAt:
      (d.publication_date as string | null) ??
      (d.scheduled_send_at as string | null),
    publicUrl: archiveSlug ? `/newsletter/${archiveSlug}` : null,
    newsletter: {
      issueNumber: d.issue_number as number | null,
      noteTitle: d.note_title as string | null,
      noteBody: d.note_body as string | null,
      parentingTipTitle: d.tip_title as string | null,
      parentingTipBody: d.tip_body as string | null,
      parentingTipAgeRange: d.tip_age_range as string | null,
      parentingTipTakeaway: d.tip_takeaway as string | null,
      healthAlertTitle: d.health_alert_title as string | null,
      healthAlertBody: d.health_alert_body as string | null,
      archiveSlug,
      crmUrl: `/admin/newsletter`,
    },
  };

  return NextResponse.json(preview);
}

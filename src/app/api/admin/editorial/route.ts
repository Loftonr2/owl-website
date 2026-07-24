import { NextRequest, NextResponse } from "next/server";
import { supabaseServiceRole } from "@/lib/clients/supabase-server";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/editorial
 * Returns editorial calendar items (content_posts + newsletter_campaigns),
 * alerts, publishing targets for the current week, and quick stats.
 *
 * Newsletter campaigns are normalized to the same CalendarItem shape as
 * content_posts so the frontend can render them in a unified calendar.
 */
export async function GET(req: NextRequest) {
  try {
    const sb = supabaseServiceRole();
    const { searchParams } = new URL(req.url);
    const fromDate = searchParams.get("from") ?? new Date().toISOString().split("T")[0];
    const days = Math.min(parseInt(searchParams.get("days") ?? "37"), 60);

    const rangeFrom = new Date(new Date(fromDate).getTime() - 7 * 86400000).toISOString();
    const rangeTo   = new Date(new Date(fromDate).getTime() + days * 86400000).toISOString();

    // ── 1. Content posts (news + blog) ─────────────────────────────────────
    const { data: calItems, error: calErr } = await sb
      .from("content_posts")
      .select([
        "id, content_type, title, slug, category, author, workflow_status, status,",
        "publish_date, target_pub_time, draft_deadline, approval_deadline,",
        "featured_image, primary_keyword, editorial_priority, newsletter_eligible,",
        "reviewer_name, reviewer_approved_at, publish_verified_at, publish_failed_at,",
        "publish_failure_reason, seo_title, seo_description, created_at, updated_at",
      ].join(" "))
      .gte("publish_date", rangeFrom)
      .lte("publish_date", rangeTo)
      .neq("workflow_status", "archived")
      .order("publish_date", { ascending: true })
      .order("editorial_priority", { ascending: false });

    if (calErr) throw calErr;

    // ── 2. Newsletter campaigns ────────────────────────────────────────────
    const { data: newsletters } = await sb
      .from("newsletter_campaigns")
      .select(
        "id, issue_number, title, status, publication_date, scheduled_send_at, archive_slug"
      )
      .gte("publication_date", rangeFrom.split("T")[0])
      .lte("publication_date", rangeTo.split("T")[0])
      .not("publication_date", "is", null)
      .neq("status", "canceled")
      .order("publication_date", { ascending: true });

    // Normalize newsletter campaigns → CalendarItem shape
    type NLRow = {
      id: string;
      issue_number: number | null;
      title: string;
      status: string;
      publication_date: string | null;
      scheduled_send_at: string | null;
      archive_slug: string | null;
    };

    const nlItems = ((newsletters ?? []) as NLRow[]).map((nl) => ({
      id: nl.id,
      content_type: "newsletter" as const,
      title: nl.issue_number
        ? `OWL Weekly #${nl.issue_number}: ${nl.title}`
        : nl.title,
      slug: nl.archive_slug ?? nl.id,
      category: "Newsletter",
      author: null,
      workflow_status: nl.status,  // draft/scheduled/sent/published etc.
      status: nl.status,
      publish_date: nl.publication_date
        ? `${nl.publication_date}T09:00:00.000Z`
        : nl.scheduled_send_at,
      target_pub_time: null,
      draft_deadline: null,
      approval_deadline: null,
      featured_image: null,
      primary_keyword: null,
      editorial_priority: 10,       // newsletters always shown prominently
      newsletter_eligible: true,
      reviewer_name: null,
      reviewer_approved_at: null,
      publish_verified_at: nl.status === "sent" || nl.status === "published"
        ? nl.scheduled_send_at
        : null,
      publish_failed_at: nl.status === "failed" ? new Date().toISOString() : null,
      publish_failure_reason: null,
      seo_title: null,
      seo_description: null,
      created_at: null,
      updated_at: null,
      // newsletter-only extras
      issue_number: nl.issue_number,
    }));

    // Merge and sort all items by publish_date ascending
    type MergedItem = { publish_date: string | null };
    const allItems = ([...(calItems ?? []), ...nlItems] as MergedItem[]).sort((a, b) => {
      const da = a.publish_date ?? "";
      const db = b.publish_date ?? "";
      return da < db ? -1 : da > db ? 1 : 0;
    });

    // ── 3. Alerts ──────────────────────────────────────────────────────────
    const { data: alerts } = await sb
      .from("editorial_alerts")
      .select("id, alert_type, severity, title, body, related_date, related_post, created_at")
      .is("dismissed_at", null)
      .order("severity", { ascending: true })
      .order("created_at", { ascending: false })
      .limit(20);

    // ── 4. Publishing targets ──────────────────────────────────────────────
    const weekStart = new Date(fromDate);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Monday
    const weekStartStr = weekStart.toISOString().split("T")[0];
    const weekEndStr   = new Date(weekStart.getTime() + 7 * 86400000).toISOString().split("T")[0];

    const { data: target } = await sb
      .from("editorial_publishing_targets")
      .select("*")
      .eq("week_start", weekStartStr)
      .maybeSingle();

    // ── 5. Stats ───────────────────────────────────────────────────────────
    const { count: publishedThisWeek } = await sb
      .from("content_posts")
      .select("id", { count: "exact", head: true })
      .eq("workflow_status", "published")
      .gte("publish_date", weekStartStr)
      .lt("publish_date", weekEndStr);

    const { count: awaitingApproval } = await sb
      .from("content_posts")
      .select("id", { count: "exact", head: true })
      .eq("workflow_status", "awaiting_approval");

    return NextResponse.json({
      items: allItems,
      alerts: alerts ?? [],
      target: target ?? { news_per_week: 3, blogs_per_week: 2 },
      stats: {
        published_this_week: publishedThisWeek ?? 0,
        awaiting_approval: awaitingApproval ?? 0,
      },
    });
  } catch (err) {
    console.error("[/api/admin/editorial GET]", err);
    return NextResponse.json({ error: "Failed to fetch editorial data" }, { status: 500 });
  }
}

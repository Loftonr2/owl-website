import "server-only";
import type { JobFn, ServiceClient } from "@/lib/cron/runner";
import { isValidEditorialImage } from "@/lib/content-images";

/**
 * publish-scheduled-content
 * ─────────────────────────
 * Publishes approved / scheduled news articles and blog posts.
 *
 * Schedule: vercel.json fires this once daily at 12:00 UTC.
 *   - EST (UTC-5): 7:00 AM ET  ← exact target
 *   - EDT (UTC-4): 8:00 AM ET  ← acceptable DST offset (within business hours)
 *
 * No ET-hour guard is needed because the Vercel Hobby plan allows only one
 * cron invocation per path per day. The job runs once and publishes everything
 * whose publish_date ≤ NOW().
 *
 * Idempotency: after publishing, it writes a row to content_publish_events
 * (post_id + local_date_et unique index). A re-triggered "Run Now" on the same
 * calendar day skips already-processed posts silently.
 *
 * Eligibility rules:
 *  - status = 'scheduled' AND workflow_status = 'scheduled'
 *  - publish_date ≤ NOW()     (due or overdue)
 *  - content_type IN ('news', 'blog')
 *  - NOT already in content_publish_events for today's ET date
 */

/** Current America/New_York date as "YYYY-MM-DD" string. */
function etDateString(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
}

type PostRow = {
  id: string;
  title: string;
  slug: string;
  content_type: string;
  publish_date: string;
  featured_image: string | null;
};

export const publishScheduledContent: JobFn = async (db: ServiceClient) => {
  const localDate = etDateString();

  // ── Find eligible posts ────────────────────────────────────────────────────
  const nowIso = new Date().toISOString();

  const { data: due, error: fetchErr } = await db
    .from("content_posts")
    .select("id, title, slug, content_type, publish_date, featured_image")
    .in("status", ["scheduled"])
    .eq("workflow_status", "scheduled")
    .in("content_type", ["news", "blog"])
    .lte("publish_date", nowIso)
    .order("publish_date", { ascending: true });

  if (fetchErr) {
    return {
      status: "skipped",
      summary: `Failed to fetch scheduled posts: ${fetchErr.message}`,
    };
  }

  if (!due || due.length === 0) {
    return {
      status: "success",
      summary: "No scheduled content is due for publishing today.",
      detail: { etDate: localDate, published: 0, skipped: 0 },
    };
  }

  // ── Idempotency: filter out posts already processed today ─────────────────
  const postIds = (due as PostRow[]).map((p) => p.id);

  const { data: alreadyDone } = await db
    .from("content_publish_events")
    .select("post_id")
    .in("post_id", postIds)
    .eq("local_date_et", localDate);

  const alreadyDoneIds = new Set(
    ((alreadyDone ?? []) as Array<{ post_id: string }>).map((r) => r.post_id)
  );

  const toPublish = (due as PostRow[]).filter((p) => !alreadyDoneIds.has(p.id));
  const skipped   = (due as PostRow[]).length - toPublish.length;

  if (toPublish.length === 0) {
    return {
      status: "success",
      summary: `All ${skipped} due post(s) already published today (idempotency).`,
      detail: { etDate: localDate, published: 0, skipped },
    };
  }

  // ── Publish ────────────────────────────────────────────────────────────────
  let published = 0;
  let failed = 0;
  let blockedNoImage = 0;
  const errors: string[] = [];

  for (const post of toPublish) {
    // ── Image guard: reject articles without a valid topic-specific image ──
    const imgCheck = isValidEditorialImage(
      post.featured_image,
      post.content_type as "blog" | "news",
      post.slug,
    );

    if (!imgCheck.valid) {
      // Keep in scheduled state — do not publish without a valid image.
      // Write a warning to the publish events table so the CRM shows the reason.
      await db.from("content_publish_events").insert({
        post_id: post.id,
        local_date_et: localDate,
        status: "blocked_no_image",
        error: `Image guard: ${imgCheck.reason}. Add a valid featured_image to publish.`,
      }).maybeSingle();
      blockedNoImage++;
      errors.push(`[${post.slug}] Blocked — image guard: ${imgCheck.reason}`);
      continue;
    }

    // Transactional: update status first, then record event.
    const { error: updateErr } = await db
      .from("content_posts")
      .update({
        status: "published",
        workflow_status: "published",
        updated_at: nowIso,
      })
      .eq("id", post.id)
      .eq("status", "scheduled")        // guard: only update if still scheduled
      .eq("workflow_status", "scheduled");

    if (updateErr) {
      errors.push(`[${post.id}] ${updateErr.message}`);
      await db.from("content_publish_events").insert({
        post_id: post.id,
        local_date_et: localDate,
        status: "failed",
        error: updateErr.message,
      }).maybeSingle();
      failed++;
      continue;
    }

    // Record successful publish event (idempotency row)
    await db.from("content_publish_events").insert({
      post_id: post.id,
      local_date_et: localDate,
      status: "published",
    }).maybeSingle();

    published++;
  }

  const summary = [
    `Published ${published} post(s) at 12:00 UTC / ~7 AM ET (${localDate}).`,
    skipped        ? `${skipped} already processed.`        : "",
    blockedNoImage ? `${blockedNoImage} BLOCKED (no valid image — kept in scheduled state).` : "",
    failed         ? `${failed} FAILED — see errors.`        : "",
  ].filter(Boolean).join(" ");

  return {
    status: failed === toPublish.length && toPublish.length > 0 ? "skipped" : "success",
    summary,
    detail: {
      etDate: localDate,
      published,
      skipped,
      blockedNoImage,
      failed,
      ...(errors.length ? { errors } : {}),
    },
  };
};

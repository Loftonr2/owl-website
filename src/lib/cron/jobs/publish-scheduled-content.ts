import "server-only";
import type { JobFn, ServiceClient } from "@/lib/cron/runner";

/**
 * publish-scheduled-content
 * ─────────────────────────
 * Publishes approved / scheduled news articles and blog posts at 7:00 AM
 * America/New_York every day. The Vercel cron fires hourly; this job checks
 * the local ET hour and exits early if it's not the publish window.
 *
 * Idempotency: after publishing, it writes a row to content_publish_events
 * (post_id + local_date_et unique index). A second run on the same calendar day
 * skips already-processed posts silently.
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

/** Current hour (0-23) in America/New_York. */
function etHour(): number {
  return parseInt(
    new Date().toLocaleString("en-US", { hour: "numeric", hour12: false, timeZone: "America/New_York" }),
    10
  );
}

type PostRow = {
  id: string;
  title: string;
  content_type: string;
  publish_date: string;
};

export const publishScheduledContent: JobFn = async (db: ServiceClient) => {
  const hour = etHour();
  const localDate = etDateString();

  // ── Time-window guard ──────────────────────────────────────────────────────
  // Run only during the 7:00–7:59 AM ET window.
  // The hourly cron fires at the top of each hour; we proceed only for hour 7.
  // This prevents redundant DB writes at other hours while still being DST-safe.
  if (hour !== 7) {
    return {
      status: "skipped",
      summary: `ET hour is ${hour}, not 7. Waiting for publish window.`,
      detail: { etHour: hour, etDate: localDate },
    };
  }

  // ── Find eligible posts ────────────────────────────────────────────────────
  const nowIso = new Date().toISOString();

  const { data: due, error: fetchErr } = await db
    .from("content_posts")
    .select("id, title, content_type, publish_date")
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
  const errors: string[] = [];

  for (const post of toPublish) {
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
    `Published ${published} post(s) at 7 AM ET (${localDate}).`,
    skipped   ? `${skipped} already processed.`  : "",
    failed    ? `${failed} FAILED — see errors.` : "",
  ].filter(Boolean).join(" ");

  return {
    status: failed === toPublish.length && toPublish.length > 0 ? "skipped" : "success",
    summary,
    detail: {
      etDate: localDate,
      published,
      skipped,
      failed,
      ...(errors.length ? { errors } : {}),
    },
  };
};

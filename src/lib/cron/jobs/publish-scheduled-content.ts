import "server-only";
import type { JobFn, ServiceClient } from "@/lib/cron/runner";
import { resend, EMAIL_FROM } from "@/lib/clients/resend";

/**
 * publish-scheduled-content
 * ─────────────────────────
 * Publishes approved / scheduled news articles and blog posts.
 *
 * Schedule: vercel.json fires this once daily at 12:00 UTC.
 *   - EST (UTC-5): 7:00 AM ET  ← exact target
 *   - EDT (UTC-4): 8:00 AM ET  ← acceptable DST offset (within business hours)
 *
 * Publishing eligibility is based on editorial workflow only:
 *   status = 'scheduled' AND workflow_status = 'scheduled' AND publish_date ≤ NOW()
 *
 * Image display is handled by resolveContentCardImage() in the frontend renderer.
 * A missing featured_image in the DB is NOT a reason to block publishing — the
 * frontend resolver will fall back to the slug map / category mascot image.
 *
 * Idempotency: after processing, writes a row to content_publish_events
 * (post_id + local_date_et unique index). A re-triggered "Run Now" on the same
 * calendar day skips already-processed posts silently.
 *
 * After each run (if anything was published or failed), sends a daily publishing
 * report email to REPORT_RECIPIENT_EMAILS (env var) or rickoflv@gmail.com.
 */

/** Current America/New_York date as "YYYY-MM-DD" string. */
function etDateString(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
}

/** Resolve admin email recipients from env var or hardcoded fallback.
 *  Accepts both comma-separated strings and JSON arrays. */
function resolveRecipients(): string[] {
  const env = process.env.REPORT_RECIPIENT_EMAILS;
  if (env) {
    // Try JSON array first: ["a@b.com","c@d.com"]
    try {
      const parsed = JSON.parse(env);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed as string[];
    } catch {
      // Not JSON — fall through
    }
    // Handle comma-separated string: "a@b.com,c@d.com"
    const split = env.split(",").map((s) => s.trim()).filter(Boolean);
    if (split.length > 0) return split;
  }
  return ["rickoflv" + "@gmail.com"];
}

type PostRow = {type PostRow = {
  id: string;
  title: string;
  slug: string;
  content_type: string;
  publish_date: string;
  featured_image: string | null;
  category?: string | null;
};

type PublishedRecord = {
  title: string;
  slug: string;
  content_type: string;
  category?: string | null;
};

type FailedRecord = {
  slug: string;
  error: string;
};

export const publishScheduledContent: JobFn = async (db: ServiceClient) => {
  const localDate = etDateString();
  const nowIso = new Date().toISOString();

  // ── Find eligible posts ────────────────────────────────────────────────────
  const { data: due, error: fetchErr } = await db
    .from("content_posts")
    .select("id, title, slug, content_type, publish_date, featured_image, category")
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
  const publishedRecords: PublishedRecord[] = [];
  const failedRecords: FailedRecord[] = [];
  const errors: string[] = [];

  for (const post of toPublish) {
    // Publishing eligibility is editorial-only (workflow_status = 'scheduled').
    // Image quality is a display concern handled by resolveContentCardImage() in
    // the frontend. A null featured_image triggers the tier-2 slug map / tier-3
    // category mascot fallback — it does NOT block publishing.

    const { error: updateErr } = await db
      .from("content_posts")
      .update({
        status: "published",
        workflow_status: "published",
        updated_at: nowIso,
      })
      .eq("id", post.id)
      .eq("status", "scheduled")          // guard: only update if still scheduled
      .eq("workflow_status", "scheduled");

    if (updateErr) {
      errors.push(`[${post.slug}] ${updateErr.message}`);
      await db.from("content_publish_events").insert({
        post_id: post.id,
        local_date_et: localDate,
        status: "failed",
        error: updateErr.message,
      }).maybeSingle();
      failedRecords.push({ slug: post.slug, error: updateErr.message });
      failed++;
      continue;
    }

    // Record successful publish event (idempotency row).
    // If no DB featured_image exists, note it as a warning — the frontend
    // resolver will handle display gracefully.
    await db.from("content_publish_events").insert({
      post_id: post.id,
      local_date_et: localDate,
      status: "published",
      ...(post.featured_image
        ? {}
        : { error: "No DB featured_image — frontend resolver will display fallback image" }),
    }).maybeSingle();

    publishedRecords.push({
      title: post.title,
      slug: post.slug,
      content_type: post.content_type,
      category: post.category,
    });
    published++;
  }

  // ── Count remaining scheduled queue ───────────────────────────────────────
  const { count: remainingCount } = await db
    .from("content_posts")
    .select("id", { count: "exact", head: true })
    .eq("status", "scheduled")
    .eq("workflow_status", "scheduled")
    .in("content_type", ["news", "blog"]);

  const remainingScheduled = remainingCount ?? 0;

  const summary = [
    `Published ${published} post(s) at 12:00 UTC / ~7 AM ET (${localDate}).`,
    skipped ? `${skipped} already processed.` : "",
    failed  ? `${failed} FAILED — see errors.` : "",
  ].filter(Boolean).join(" ");

  // ── Send daily publishing report email ────────────────────────────────────
  if (published > 0 || failed > 0) {
    try {
      const recipients = resolveRecipients();
      const dateLabel = new Date().toLocaleDateString("en-US", {
        timeZone: "America/New_York",
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      const publishedRows = publishedRecords
        .map((r) => {
          const url = `https://www.owlsingtogether.com/${r.content_type}/${r.slug}`;
          return `<tr>
            <td style="padding:8px 10px;border-bottom:1px solid #eee">${r.title}</td>
            <td style="padding:8px 10px;border-bottom:1px solid #eee;text-transform:capitalize">${r.content_type}</td>
            <td style="padding:8px 10px;border-bottom:1px solid #eee">${r.category ?? "—"}</td>
            <td style="padding:8px 10px;border-bottom:1px solid #eee">
              <a href="${url}" style="color:#2563eb;text-decoration:none">View →</a>
            </td>
          </tr>`;
        })
        .join("\n");

      const failedRows = failedRecords
        .map(
          (r) => `<tr>
            <td style="padding:8px 10px;border-bottom:1px solid #fee2e2;color:#dc2626;font-family:monospace">${r.slug}</td>
            <td style="padding:8px 10px;border-bottom:1px solid #fee2e2;color:#dc2626">${r.error}</td>
          </tr>`
        )
        .join("\n");

      const statBlock = (value: number, label: string, bg: string, color: string) =>
        `<td style="width:25%;padding:16px;background:${bg};border-radius:8px;text-align:center">
          <div style="font-size:36px;font-weight:bold;color:${color}">${value}</div>
          <div style="font-size:12px;color:${color};margin-top:4px">${label}</div>
        </td>`;

      const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:Georgia,serif;max-width:680px;margin:0 auto;padding:32px 24px;color:#1a1a1a;background:#fff">

  <div style="border-bottom:3px solid #2dd4bf;padding-bottom:20px;margin-bottom:28px">
    <h1 style="font-size:24px;margin:0 0 4px;color:#134e4a">🦉 OWL Daily Publishing Report</h1>
    <p style="margin:0;color:#6b7280;font-size:14px">${dateLabel} · Automated by publish-scheduled-content</p>
  </div>

  <table style="width:100%;border-spacing:12px;border-collapse:separate;margin-bottom:32px">
    <tr>
      ${statBlock(published, "Published", "#f0fdf4", "#15803d")}
      ${statBlock(skipped, "Already Done", "#fef9c3", "#a16207")}
      ${statBlock(failed, "Failed", failed > 0 ? "#fef2f2" : "#f8fafc", failed > 0 ? "#dc2626" : "#94a3b8")}
      ${statBlock(remainingScheduled, "In Queue", "#eff6ff", "#1d4ed8")}
    </tr>
  </table>

  ${
    published > 0
      ? `<h2 style="font-size:16px;color:#134e4a;margin:0 0 10px">✅ Published Today</h2>
  <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:28px">
    <thead>
      <tr style="background:#f1f5f9">
        <th style="padding:8px 10px;text-align:left;font-weight:600;color:#374151">Title</th>
        <th style="padding:8px 10px;text-align:left;font-weight:600;color:#374151">Type</th>
        <th style="padding:8px 10px;text-align:left;font-weight:600;color:#374151">Category</th>
        <th style="padding:8px 10px;text-align:left;font-weight:600;color:#374151">Link</th>
      </tr>
    </thead>
    <tbody>${publishedRows}</tbody>
  </table>`
      : ""
  }

  ${
    failed > 0
      ? `<h2 style="font-size:16px;color:#dc2626;margin:0 0 10px">❌ Failed to Publish</h2>
  <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:28px">
    <thead>
      <tr style="background:#fef2f2">
        <th style="padding:8px 10px;text-align:left;font-weight:600;color:#991b1b">Slug</th>
        <th style="padding:8px 10px;text-align:left;font-weight:600;color:#991b1b">Error</th>
      </tr>
    </thead>
    <tbody>${failedRows}</tbody>
  </table>`
      : ""
  }

  <div style="margin-top:8px;padding-top:20px;border-top:1px solid #e5e7eb">
    <a href="https://www.owlsingtogether.com/admin/content"
       style="display:inline-block;background:#134e4a;color:#fff;text-decoration:none;
              padding:12px 22px;border-radius:6px;font-size:14px;font-weight:600;font-family:sans-serif">
      Manage Content in Admin →
    </a>
  </div>

  <p style="margin-top:24px;font-size:12px;color:#9ca3af;line-height:1.6">
    This report is sent automatically after each daily publish run.<br>
    To change recipients, update <code>REPORT_RECIPIENT_EMAILS</code> in Vercel environment variables.
  </p>

</body>
</html>`;

      await resend().emails.send({
        from: EMAIL_FROM.store,
        to: recipients,
        subject: `OWL Publishing Report — ${published} published, ${remainingScheduled} in queue (${localDate})`,
        html,
      });
    } catch (emailErr) {
      // Email failure must not fail the publish job — record it in errors only.
      errors.push(
        `[email-report] Failed to send: ${emailErr instanceof Error ? emailErr.message : String(emailErr)}`
      );
    }
  }

  return {
    status: failed === toPublish.length && toPublish.length > 0 ? "skipped" : "success",
    summary,
    detail: {
      etDate: localDate,
      published,
      skipped,
      failed,
      remainingScheduled,
      ...(errors.length ? { errors } : {}),
    },
  };
};

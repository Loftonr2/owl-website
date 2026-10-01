import "server-only";
import type { JobFn, ServiceClient } from "@/lib/cron/runner";
import { resend, EMAIL_FROM } from "@/lib/clients/resend";
import { resolveAdminRecipients } from "@/lib/email/admin-recipients";

/**
 * publish-scheduled-content
 * âââââââââââââââââââââââââ
 * Publishes approved / scheduled news articles and blog posts.
 *
 * Schedule: vercel.json fires this twice daily to cover both DST states:
 *   "0 16 * * *" â 9:00 AM PDT (UTC-7) â active MarâNov
 *   "0 17 * * *" â 9:00 AM PST (UTC-8) â active NovâMar
 *
 * A Pacific-time hour guard (ptHour() >= 9) is applied on every invocation so
 * that the 16:00 UTC run is a no-op in PST (fires at 8 AM PT) and only the
 * 17:00 UTC run processes content during winter time.
 *
 * Publishing eligibility (all must be true):
 *   status            = 'scheduled'
 *   workflow_status   = 'scheduled'
 *   publish_date      â¤ NOW()
 *   featured_image    IS NOT NULL   (image must be uploaded before publish)
 *   body              IS NOT NULL   (body must be set before publish)
 *
 * Records missing a featured_image or body are silently left in 'scheduled'
 * state and will publish once those fields are populated and the cron re-runs.
 *
 * Idempotency: after processing, writes a row to content_publish_events
 * (post_id + local_date_pt unique index). A re-triggered "Run Now" on the same
 * Pacific calendar day skips already-processed posts silently.
 *
 * After each run (if anything was published or failed), sends a daily
 * publishing report email to REPORT_RECIPIENT_EMAILS (env var) or to
 * rickoflv@gmail.com and larissapola777@gmail.com.
 */

/** Current America/Los_Angeles date as "YYYY-MM-DD" string. */
function ptDateString(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" });
}

/** Current America/Los_Angeles hour (0â23). */
function ptHour(): number {
  return parseInt(
    new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles", hour: "numeric", hour12: false }),
    10
  );
}

// resolveAdminRecipients() imported from @/lib/email/admin-recipients
// Returns both rickoflv@gmail.com and larissapola777@gmail.com (or REPORT_RECIPIENT_EMAILS env var)

type PostRow = {
  id: string;
  title: string;
  slug: string;
  content_type: string;
  publish_date: string;
  featured_image: string | null;
  body: string | null;
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
  const localDate = ptDateString();
  const nowIso = new Date().toISOString();

  // ââ Pacific-time hour guard ââââââââââââââââââââââââââââââââââââââââââââââââ
  // The 16:00 UTC cron fires at 8 AM PT in PST (UTC-8). Skip early so only the
  // 17:00 UTC run processes content in winter. Both runs proceed in PDT (UTC-7).
  const currentPtHour = ptHour();
  if (currentPtHour < 9) {
    return {
      status: "success",
      summary: `Too early â current Pacific time is ${currentPtHour}:xx AM (< 9:00 AM PT). Skipping until next cron window.`,
      detail: { ptDate: localDate, ptHour: currentPtHour, published: 0, skipped: 0 },
    };
  }

  // ââ Find eligible posts ââââââââââââââââââââââââââââââââââââââââââââââââââââ
  // Only records with BOTH featured_image and body populated are eligible.
  // Records missing either field stay in 'scheduled' state until populated.
  const { data: due, error: fetchErr } = await db
    .from("content_posts")
    .select("id, title, slug, content_type, publish_date, featured_image, body, category")
    .in("status", ["scheduled"])
    .eq("workflow_status", "scheduled")
    .in("content_type", ["news", "blog"])
    .lte("publish_date", nowIso)
    .not("featured_image", "is", null)
    .not("body", "is", null)
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
      detail: { ptDate: localDate, published: 0, skipped: 0 },
    };
  }

  // ââ Idempotency: filter out posts already processed today âââââââââââââââââ
  const postIds = (due as PostRow[]).map((p) => p.id);

  const { data: alreadyDone } = await db
    .from("content_publish_events")
    .select("post_id")
    .in("post_id", postIds)
    .eq("local_date_et", localDate);   // column stores PT date; "et" suffix is legacy name

  const alreadyDoneIds = new Set(
    ((alreadyDone ?? []) as Array<{ post_id: string }>).map((r) => r.post_id)
  );

  let toPublish = (due as PostRow[]).filter((p) => !alreadyDoneIds.has(p.id));
  const skipped   = (due as PostRow[]).length - toPublish.length;

  // ââ Per-content-type catch-up ââââââââââââââââââââââââââââââââââââââââââââââ
  // News and Blog must each publish independently every day. If today's due
  // queue has no post of a given content_type, pull the single earliest
  // still-scheduled, image-complete post of that type forward.
  // This never touches records with missing body or featured_image.
  const pulledForward: PostRow[] = [];
  for (const contentType of ["news", "blog"] as const) {
    const hasDueToday = toPublish.some((p) => p.content_type === contentType);
    if (hasDueToday) continue;

    const { data: nextUp } = await db
      .from("content_posts")
      .select("id, title, slug, content_type, publish_date, featured_image, body, category")
      .eq("content_type", contentType)
      .eq("status", "scheduled")
      .eq("workflow_status", "scheduled")
      .not("featured_image", "is", null)
      .not("body", "is", null)
      .order("publish_date", { ascending: true })
      .limit(1);

    const candidate = (nextUp as PostRow[] | null)?.[0];
    if (candidate) {
      pulledForward.push(candidate);
    }
  }
  if (pulledForward.length > 0) {
    toPublish = [...toPublish, ...pulledForward];
  }

  if (toPublish.length === 0) {
    return {
      status: "success",
      summary: `All ${skipped} due post(s) already published today (idempotency).`,
      detail: { ptDate: localDate, published: 0, skipped },
    };
  }

  // ââ Publish ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
  let published = 0;
  let failed = 0;
  const publishedRecords: PublishedRecord[] = [];
  const failedRecords: FailedRecord[] = [];
  const errors: string[] = [];

  const pulledForwardIds = new Set(pulledForward.map((p) => p.id));

  for (const post of toPublish) {
    // Double-check image + body guard at publish time (defense-in-depth).
    if (!post.featured_image || !post.body) {
      const reason = !post.featured_image ? "missing featured_image" : "missing body";
      errors.push(`[${post.slug}] Skipped at publish time: ${reason}`);
      await db.from("content_publish_events").insert({
        post_id: post.id,
        local_date_et: localDate,
        status: "failed",
        error: `Blocked at publish time: ${reason}`,
      }).maybeSingle();
      failedRecords.push({ slug: post.slug, error: `Blocked: ${reason}` });
      failed++;
      continue;
    }

    const { error: updateErr } = await db
      .from("content_posts")
      .update({
        status: "published",
        workflow_status: "published",
        updated_at: nowIso,
        ...(pulledForwardIds.has(post.id) ? { publish_date: nowIso } : {}),
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
    await db.from("content_publish_events").insert({
      post_id: post.id,
      local_date_et: localDate,
      status: "published",
    }).maybeSingle();

    publishedRecords.push({
      title: post.title,
      slug: post.slug,
      content_type: post.content_type,
      category: post.category,
    });
    published++;
  }

  // ââ Count remaining scheduled queue âââââââââââââââââââââââââââââââââââââââ
  const { count: remainingCount } = await db
    .from("content_posts")
    .select("id", { count: "exact", head: true })
    .eq("status", "scheduled")
    .eq("workflow_status", "scheduled")
    .in("content_type", ["news", "blog"]);

  const remainingScheduled = remainingCount ?? 0;

  const summary = [
    `Published ${published} post(s) at 9:00 AM PT (${localDate}).`,
    skipped ? `${skipped} already processed.` : "",
    failed  ? `${failed} FAILED â see errors.` : "",
  ].filter(Boolean).join(" ");

  // ââ Send daily publishing report email ââââââââââââââââââââââââââââââââââââ
  if (published > 0 || failed > 0) {
    try {
      const recipients = resolveAdminRecipients();
      const dateLabel = new Date().toLocaleDateString("en-US", {
        timeZone: "America/Los_Angeles",
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
            <td style="padding:8px 10px;border-bottom:1px solid #eee">${r.category ?? "â"}</td>
            <td style="padding:8px 10px;border-bottom:1px solid #eee">
              <a href="${url}" style="color:#2563eb;text-decoration:none">View â</a>
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
    <h1 style="font-size:24px;margin:0 0 4px;color:#134e4a">ð¦ OWL Daily Publishing Report</h1>
    <p style="margin:0;color:#6b7280;font-size:14px">${dateLabel} Â· 9:00 AM PT Â· Automated by publish-scheduled-content</p>
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
      ? `<h2 style="font-size:16px;color:#134e4a;margin:0 0 10px">â Published Today</h2>
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
      ? `<h2 style="font-size:16px;color:#dc2626;margin:0 0 10px">â Failed to Publish</h2>
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
      Manage Content in Admin â
    </a>
  </div>

  <p style="margin-top:24px;font-size:12px;color:#9ca3af;line-height:1.6">
    This report is sent automatically after each daily publish run (9:00 AM PT).<br>
    To change recipients, update <code>REPORT_RECIPIENT_EMAILS</code> in Vercel environment variables.
  </p>

</body>
</html>`;

      await resend().emails.send({
        from: EMAIL_FROM.store,
        to: recipients,
        subject: `OWL Publishing Report â ${published} published, ${remainingScheduled} in queue (${localDate} PT)`,
        html,
      });
    } catch (emailErr) {
      // Email failure must not fail the publish job â record it in errors only.
      errors.push(
        `[email-report] Failed to send: ${emailErr instanceof Error ? emailErr.message : String(emailErr)}`
      );
    }
  }

  return {
    status: failed === toPublish.length && toPublish.length > 0 ? "skipped" : "success",
    summary,
    detail: {
      ptDate: localDate,
      ptHour: currentPtHour,
      published,
      skipped,
      failed,
      remainingScheduled,
      ...(errors.length ? { errors } : {}),
    },
  };
};

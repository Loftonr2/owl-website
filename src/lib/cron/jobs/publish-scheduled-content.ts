import "server-only";
import type { JobFn, ServiceClient } from "@/lib/cron/runner";
import { resend, EMAIL_FROM } from "@/lib/clients/resend";
import { resolveAdminRecipients } from "@/lib/email/admin-recipients";

/**
 * publish-scheduled-content
 * ─────────────────────────
 * Publishes approved / scheduled news articles and blog posts.
 *
 * Schedule: vercel.json fires this twice daily to cover both DST states:
 *   "0 16 * * *" → 9:00 AM PDT (UTC-7) — active Mar–Nov
 *   "0 17 * * *" → 9:00 AM PST (UTC-8) — active Nov–Mar
 *
 * A Pacific-time hour guard (ptHour() >= 9) is applied on every invocation so
 * that the 16:00 UTC run is a no-op in PST (fires at 8 AM PT) and only the
 * 17:00 UTC run processes content during winter time.
 *
 * Publishing eligibility (all must be true):
 *   status            = 'scheduled'
 *   workflow_status   = 'scheduled'
 *   publish_date      ≤ NOW()
 *   featured_image    IS NOT NULL
 *   body              IS NOT NULL
 */

function ptDateString(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" });
}

function ptHour(): number {
  return parseInt(
    new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles", hour: "numeric", hour12: false }),
    10
  );
}

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

  const currentPtHour = ptHour();
  if (currentPtHour < 9) {
    return {
      status: "success",
      summary: `Too early — current Pacific time is ${currentPtHour}:xx AM (< 9:00 AM PT). Skipping.`,
      detail: { ptDate: localDate, ptHour: currentPtHour, published: 0, skipped: 0 },
    };
  }

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
    return { status: "skipped", summary: `Failed to fetch scheduled posts: ${fetchErr.message}` };
  }

  if (!due || due.length === 0) {
    return { status: "success", summary: "No scheduled content is due for publishing today.", detail: { ptDate: localDate, published: 0, skipped: 0 } };
  }

  const postIds = (due as PostRow[]).map((p) => p.id);
  const { data: alreadyDone } = await db
    .from("content_publish_events")
    .select("post_id")
    .in("post_id", postIds)
    .eq("local_date_et", localDate);

  const alreadyDoneIds = new Set(((alreadyDone ?? []) as Array<{ post_id: string }>).map((r) => r.post_id));
  let toPublish = (due as PostRow[]).filter((p) => !alreadyDoneIds.has(p.id));
  const skipped = (due as PostRow[]).length - toPublish.length;

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
    if (candidate) pulledForward.push(candidate);
  }
  if (pulledForward.length > 0) toPublish = [...toPublish, ...pulledForward];

  if (toPublish.length === 0) {
    return { status: "success", summary: `All ${skipped} due post(s) already published today.`, detail: { ptDate: localDate, published: 0, skipped } };
  }

  let published = 0, failed = 0;
  const publishedRecords: PublishedRecord[] = [];
  const failedRecords: FailedRecord[] = [];
  const errors: string[] = [];
  const pulledForwardIds = new Set(pulledForward.map((p) => p.id));

  for (const post of toPublish) {
    if (!post.featured_image || !post.body) {
      const reason = !post.featured_image ? "missing featured_image" : "missing body";
      errors.push(`[${post.slug}] Skipped: ${reason}`);
      await db.from("content_publish_events").insert({ post_id: post.id, local_date_et: localDate, status: "failed", error: `Blocked: ${reason}` }).maybeSingle();
      failedRecords.push({ slug: post.slug, error: `Blocked: ${reason}` });
      failed++;
      continue;
    }

    const { error: updateErr } = await db
      .from("content_posts")
      .update({ status: "published", workflow_status: "published", updated_at: nowIso, ...(pulledForwardIds.has(post.id) ? { publish_date: nowIso } : {}) })
      .eq("id", post.id)
      .eq("status", "scheduled")
      .eq("workflow_status", "scheduled");

    if (updateErr) {
      errors.push(`[${post.slug}] ${updateErr.message}`);
      await db.from("content_publish_events").insert({ post_id: post.id, local_date_et: localDate, status: "failed", error: updateErr.message }).maybeSingle();
      failedRecords.push({ slug: post.slug, error: updateErr.message });
      failed++;
      continue;
    }

    await db.from("content_publish_events").insert({ post_id: post.id, local_date_et: localDate, status: "published" }).maybeSingle();
    publishedRecords.push({ title: post.title, slug: post.slug, content_type: post.content_type, category: post.category });
    published++;
  }

  const { count: remainingCount } = await db
    .from("content_posts")
    .select("id", { count: "exact", head: true })
    .eq("status", "scheduled")
    .eq("workflow_status", "scheduled")
    .in("content_type", ["news", "blog"]);

  const remainingScheduled = remainingCount ?? 0;
  const summary = [`Published ${published} post(s) at 9:00 AM PT (${localDate}).`, skipped ? `${skipped} already processed.` : "", failed ? `${failed} FAILED.` : ""].filter(Boolean).join(" ");

  if (published > 0 || failed > 0) {
    try {
      const recipients = resolveAdminRecipients();
      const dateLabel = new Date().toLocaleDateString("en-US", { timeZone: "America/Los_Angeles", weekday: "long", year: "numeric", month: "long", day: "numeric" });
      const publishedRows = publishedRecords.map((r) => {
        const url = `https://www.owlsingtogether.com/${r.content_type}/${r.slug}`;
        return `<tr><td style="padding:8px 10px;border-bottom:1px solid #eee">${r.title}</td><td style="padding:8px 10px;border-bottom:1px solid #eee">${r.content_type}</td><td style="padding:8px 10px;border-bottom:1px solid #eee"><a href="${url}">View →</a></td></tr>`;
      }).join("\n");
      const failedRows = failedRecords.map((r) => `<tr><td style="color:#dc2626">${r.slug}</td><td style="color:#dc2626">${r.error}</td></tr>`).join("\n");
      await resend().emails.send({
        from: EMAIL_FROM.store,
        to: recipients,
        subject: `OWL Publishing Report — ${published} published, ${remainingScheduled} in queue (${localDate} PT)`,
        html: `<!DOCTYPE html><html><body style="font-family:Georgia,serif;max-width:680px;margin:0 auto;padding:32px 24px"><h1>🦉 OWL Daily Publishing Report</h1><p>${dateLabel} · 9:00 AM PT</p><p><strong>${published}</strong> published · <strong>${skipped}</strong> already done · <strong>${failed}</strong> failed · <strong>${remainingScheduled}</strong> in queue</p>${published > 0 ? `<h2>Published</h2><table>${publishedRows}</table>` : ""}${failed > 0 ? `<h2>Failed</h2><table>${failedRows}</table>` : ""}<p><a href="https://www.owlsingtogether.com/admin/content">Manage Content →</a></p></body></html>`,
      });
    } catch (emailErr) {
      errors.push(`[email-report] Failed: ${emailErr instanceof Error ? emailErr.message : String(emailErr)}`);
    }
  }

  return {
    status: failed === toPublish.length && toPublish.length > 0 ? "skipped" : "success",
    summary,
    detail: { ptDate: localDate, ptHour: currentPtHour, published, skipped, failed, remainingScheduled, ...(errors.length ? { errors } : {}) },
  };
};

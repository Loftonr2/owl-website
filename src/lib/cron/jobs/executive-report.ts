import "server-only";
import type { JobFn, ServiceClient } from "@/lib/cron/runner";
import { sendEmail } from "@/lib/email/resend";

type Metrics = Record<string, unknown>;
type Json = Record<string, unknown>;

function money(cents: unknown): string {
  const n = typeof cents === "number" ? cents : Number(cents ?? 0);
  return (n / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function fmtDate(iso: unknown): string {
  if (!iso || typeof iso !== "string") return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

async function resolveRecipients(db: ServiceClient): Promise<string[]> {
  const fromEnv = (process.env.REPORT_RECIPIENT_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (fromEnv.length) return fromEnv;

  const { data } = await db
    .from("app_settings")
    .select("value")
    .eq("key", "report_recipients")
    .maybeSingle();
  const value = (data as { value?: unknown } | null)?.value;
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
}

function row(label: string, value: string): string {
  return `<tr><td style="padding:6px 12px;color:#5b6b6a">${label}</td><td style="padding:6px 12px;font-weight:600;color:#1f2d2c">${value}</td></tr>`;
}

function section(title: string, bodyHtml: string): string {
  if (!bodyHtml) return "";
  return `<div style="margin-top:22px">
    <h2 style="font-size:15px;color:#0e7c7b;margin:0 0 8px;border-bottom:1px solid #ece5d8;padding-bottom:6px">${title}</h2>
    ${bodyHtml}
  </div>`;
}

function bulletList(items: string[]): string {
  if (!items.length) return `<p style="color:#9aa7a6;margin:4px 0">Nothing to report this period.</p>`;
  return `<ul style="margin:0;padding-left:18px;color:#3a4847;line-height:1.6">${items
    .map((i) => `<li>${i}</li>`)
    .join("")}</ul>`;
}

const CATEGORY_LABEL: Record<string, string> = {
  feature: "Added",
  fix: "Fixed",
  content: "Content",
  design: "Design",
  security: "Security",
  automation: "Automation",
  store: "Store",
  other: "Update",
};

function websiteChangesBullets(changes: Json[]): string[] {
  return changes.map((c) => {
    const cat = typeof c.category === "string" ? c.category : "other";
    const label = CATEGORY_LABEL[cat] ?? "Update";
    return `<strong>${label}:</strong> ${String(c.summary ?? "")}`;
  });
}

function publishedContentBullets(pc: Json): { published: string[]; upcoming: string[] } {
  const blog = Array.isArray(pc.blog) ? (pc.blog as Json[]) : [];
  const news = Array.isArray(pc.news) ? (pc.news as Json[]) : [];
  const published = [
    ...blog.map((p) => `Blog — “${p.title}” (${fmtDate(p.published_at)})`),
    ...news.map((p) => `News — “${p.title}” (${fmtDate(p.published_at)})`),
  ];
  const upcoming: string[] = [];
  const nextBlog = pc.next_blog as Json | null;
  const nextNews = pc.next_news as Json | null;
  if (nextBlog?.title) upcoming.push(`Next Blog — “${nextBlog.title}” (${fmtDate(nextBlog.publish_date)})`);
  if (nextNews?.title) upcoming.push(`Next News — “${nextNews.title}” (${fmtDate(nextNews.publish_date)})`);
  return { published, upcoming };
}

function automationHealthBullets(items: Json[]): { bullets: string[]; failing: Json[] } {
  const failing = items.filter((i) => Number(i.failures_this_period ?? 0) > 0);
  const bullets = items.map((i) => {
    const runs = Number(i.runs_this_period ?? 0);
    const fails = Number(i.failures_this_period ?? 0);
    const status = fails > 0 ? `${fails} failure(s)` : runs > 0 ? "healthy" : "no runs this period";
    return `${i.job_key} — ${status}`;
  });
  return { bullets, failing };
}

function storeSummaryBullets(s: Json): string[] {
  return [
    `New orders: ${s.new_orders ?? 0}`,
    `Fulfilled: ${s.fulfilled ?? 0}`,
    `Unfulfilled: ${s.unfulfilled ?? 0}`,
    `Failed: ${s.failed ?? 0}`,
  ];
}

function buildTitle(start: string, end: string): string {
  return `OWL Weekly Report · ${start} → ${end}`;
}

function buildExecutiveSummary(
  m: Metrics,
  changesCount: number,
  publishedCount: number,
  automationFailures: number
): string {
  const parts = [
    `${changesCount} website change${changesCount === 1 ? "" : "s"} shipped`,
    `${publishedCount} piece${publishedCount === 1 ? "" : "s"} of content published`,
    `${Number(m.new_subscribers ?? 0)} new subscriber${Number(m.new_subscribers ?? 0) === 1 ? "" : "s"}`,
    `${money(m.store_revenue_cents)} in store revenue`,
  ];
  const tail =
    automationFailures > 0
      ? ` ${automationFailures} automation job${automationFailures === 1 ? "" : "s"} had a failure this period — see Items Requiring Attention.`
      : " All automations ran cleanly this period.";
  return `This week: ${parts.join(", ")}.${tail}`;
}

function renderHtml(args: {
  title: string;
  execSummary: string;
  m: Metrics;
  start: string;
  end: string;
  websiteChanges: string[];
  publishedBullets: string[];
  upcomingBullets: string[];
  automationBullets: string[];
  storeBullets: string[];
  attentionItems: string[];
}): string {
  const { title, execSummary, m, start, end, websiteChanges, publishedBullets, upcomingBullets, automationBullets, storeBullets, attentionItems } =
    args;
  const topCoupons = Array.isArray(m.top_coupons) ? (m.top_coupons as Json[]) : [];
  const topProducts = Array.isArray(m.top_products) ? (m.top_products as Json[]) : [];
  const topPosts = Array.isArray(m.top_blog_posts) ? (m.top_blog_posts as Json[]) : [];

  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:640px;margin:0 auto;background:#fdfbf6;border:1px solid #ece5d8;border-radius:12px;padding:24px">
    <h1 style="font-size:20px;color:#0e7c7b;margin:0 0 4px">${title}</h1>
    <p style="color:#5b6b6a;margin:0 0 16px">${start} → ${end}</p>
    <p style="color:#1f2d2c;background:#fff;border:1px solid #ece5d8;border-radius:8px;padding:12px 14px;margin:0 0 4px">${execSummary}</p>

    ${section("Website Changes &amp; Additions This Week", bulletList(websiteChanges))}
    ${section("Content Published", bulletList(publishedBullets))}
    ${section("Upcoming Content", bulletList(upcomingBullets))}

    ${section(
      "Website Activity",
      `<table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid #ece5d8;border-radius:8px">
        ${row("Total subscribers", String(m.total_subscribers ?? 0))}
        ${row("New subscribers", String(m.new_subscribers ?? 0))}
        ${row("Unsubscribes", String(m.unsubscribes ?? 0))}
        ${row("Newsletter open rate", `${m.open_rate ?? 0}%`)}
        ${row("Newsletter click rate", `${m.click_rate ?? 0}%`)}
        ${row("Store revenue", money(m.store_revenue_cents))}
        ${row("Affiliate revenue", money(m.affiliate_revenue_cents))}
      </table>
      ${topPosts.length ? `<p style="margin:12px 0 4px;font-weight:600;color:#1f2d2c">Recently published blog posts</p>${bulletList(topPosts.map((p) => `${p.title} (${fmtDate(p.publish_date)})`))}` : ""}
      ${topProducts.length ? `<p style="margin:12px 0 4px;font-weight:600;color:#1f2d2c">Top products</p>${bulletList(topProducts.map((p) => `${p.title} — ${money(p.revenue_cents)}`))}` : ""}
      ${topCoupons.length ? `<p style="margin:12px 0 4px;font-weight:600;color:#1f2d2c">Top coupons</p>${bulletList(topCoupons.map((c) => `${c.code} — ${c.redemptions} redemption(s)`))}` : ""}`
    )}

    ${section("Automation Health", bulletList(automationBullets))}
    ${section("Store / Fulfillment", bulletList(storeBullets))}
    ${section("Items Requiring Attention", bulletList(attentionItems))}

    <p style="color:#9aa7a6;font-size:12px;margin-top:20px">Generated automatically by the OWL Command Center. This report is also archived in the CRM under Weekly Reports.</p>
  </div>`;
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<li[^>]*>/gi, "\n- ")
    .replace(/<\/(p|div|tr|h1|h2)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Generate the canonical weekly report object for [start, end], save it to
 * executive_reports (the weekly-report archive), and return everything needed
 * to email it. Used by BOTH the real weekly cron job and the admin test-send
 * route, so the archived record and the emailed report are always identical —
 * there is exactly one report object per period, not a separate copy for email.
 */
export async function generateAndSaveReport(
  db: ServiceClient,
  opts: { start: Date; end: Date }
): Promise<{
  reportId: string | undefined;
  title: string;
  html: string;
  text: string;
  recipients: string[];
  m: Metrics;
}> {
  const pStart = opts.start.toISOString().slice(0, 10);
  const pEnd = opts.end.toISOString().slice(0, 10);

  const { data: metrics, error } = await db.rpc("generate_executive_report", {
    p_start: pStart,
    p_end: pEnd,
  });
  if (error) throw new Error(`generate_executive_report failed: ${error.message}`);
  const m = (metrics ?? {}) as Metrics;

  const { data: errs } = await db
    .from("cron_job_logs")
    .select("job_key, error, started_at")
    .eq("status", "failed")
    .gte("started_at", opts.start.toISOString())
    .order("started_at", { ascending: false })
    .limit(10);
  const errorRows = (errs ?? []) as { job_key: string; error: string | null }[];

  const websiteChanges = Array.isArray(m.website_changes) ? (m.website_changes as Json[]) : [];
  const changesBullets = websiteChangesBullets(websiteChanges);

  const publishedContent = (m.published_content ?? {}) as Json;
  const { published: publishedBullets, upcoming: upcomingBullets } = publishedContentBullets(publishedContent);

  const automationHealth = Array.isArray(m.automation_health) ? (m.automation_health as Json[]) : [];
  const { bullets: automationBullets, failing: failingJobs } = automationHealthBullets(automationHealth);

  const storeSummary = (m.store_summary ?? {}) as Json;
  const storeBullets = storeSummaryBullets(storeSummary);

  const attentionItems: string[] = [
    ...failingJobs.map((j) => `${j.job_key} failed ${j.failures_this_period} time(s) this period — check cron_job_logs`),
    ...errorRows.map((e) => `${e.job_key}: ${e.error ?? "unknown error"}`),
  ];

  const title = buildTitle(pStart, pEnd);
  const execSummary = buildExecutiveSummary(m, changesBullets.length, publishedBullets.length, failingJobs.length);
  const html = renderHtml({
    title,
    execSummary,
    m,
    start: pStart,
    end: pEnd,
    websiteChanges: changesBullets,
    publishedBullets,
    upcomingBullets,
    automationBullets,
    storeBullets,
    attentionItems,
  });
  const text = stripHtml(html);

  const recipients = await resolveRecipients(db);

  const { data: reportRow } = await db
    .from("executive_reports")
    .insert({
      period_start: pStart,
      period_end: pEnd,
      metrics: m,
      html,
      plain_text: text,
      title,
      executive_summary: execSummary,
      changes_json: websiteChanges,
      published_content_json: publishedContent,
      automation_health_json: automationHealth,
      store_summary_json: storeSummary,
      attention_items_json: attentionItems,
      status: "generated",
      delivery_status: "pending",
      recipients,
    })
    .select("id")
    .single();
  const reportId = (reportRow as { id?: string } | null)?.id;

  return { reportId, title, html, text, recipients, m };
}

/**
 * Weekly cron entry point — generates the report for the trailing 7 days,
 * saves it, and emails the configured recipient list.
 */
export const executiveReport: JobFn = async (db) => {
  const end = new Date();
  const start = new Date(end.getTime() - 7 * 24 * 3600 * 1000);
  const { reportId, title, html, text, recipients } = await generateAndSaveReport(db, { start, end });

  let emailed = 0;
  if (recipients.length > 0 && process.env.RESEND_API_KEY) {
    try {
      const { id } = await sendEmail({
        to: recipients,
        subject: title,
        html,
        text,
        from: process.env.RESEND_FROM_EMAIL ? undefined : "OWL Reports <hello@owlsingtogether.com>",
      });
      emailed = recipients.length;
      if (reportId) {
        await db
          .from("executive_reports")
          .update({
            status: "sent",
            delivery_status: "sent",
            email_message_id: id,
            sent_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", reportId);
      }
    } catch (e) {
      if (reportId) {
        await db
          .from("executive_reports")
          .update({ delivery_status: "failed", updated_at: new Date().toISOString() })
          .eq("id", reportId);
      }
      throw e;
    }
  }

  return {
    status: "success",
    summary: `Executive report generated; emailed ${emailed} recipient(s).`,
    detail: { reportId, recipients: recipients.length, emailed },
  };
};

/**
 * Admin-triggered controlled test send. Generates (and archives) the SAME
 * canonical report a real weekly run would produce, but emails it only to
 * `testRecipient` — never the real recipient list — and marks the archived
 * row's delivery_status as "test_sent" so it's clearly distinguishable from
 * a real weekly send in the CRM archive.
 */
export async function sendTestExecutiveReport(
  db: ServiceClient,
  testRecipient: string
): Promise<{ reportId: string | undefined; messageId: string; sentTo: string; title: string }> {
  const end = new Date();
  const start = new Date(end.getTime() - 7 * 24 * 3600 * 1000);
  const { reportId, title, html, text } = await generateAndSaveReport(db, { start, end });

  const { id } = await sendEmail({
    to: testRecipient,
    subject: `[TEST] ${title}`,
    html,
    text,
  });

  if (reportId) {
    await db
      .from("executive_reports")
      .update({
        delivery_status: "test_sent",
        email_message_id: id,
        sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        recipients: [testRecipient],
      })
      .eq("id", reportId);
  }

  return { reportId, messageId: id, sentTo: testRecipient, title };
}

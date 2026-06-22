import "server-only";
import type { JobFn, ServiceClient } from "@/lib/cron/runner";
import { resend, EMAIL_FROM } from "@/lib/clients/resend";

type Metrics = Record<string, unknown>;

function money(cents: unknown): string {
  const n = typeof cents === "number" ? cents : Number(cents ?? 0);
  return (n / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });
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

function list(title: string, items: string[]): string {
  if (!items.length) return "";
  return `<p style="margin:16px 0 4px;font-weight:600;color:#1f2d2c">${title}</p><ul style="margin:0;padding-left:18px;color:#3a4847">${items
    .map((i) => `<li>${i}</li>`)
    .join("")}</ul>`;
}

function renderHtml(m: Metrics, errors: { job_key: string; error: string | null }[], start: string, end: string): string {
  const topCoupons = Array.isArray(m.top_coupons) ? (m.top_coupons as Array<Record<string, unknown>>) : [];
  const topProducts = Array.isArray(m.top_products) ? (m.top_products as Array<Record<string, unknown>>) : [];
  const topPosts = Array.isArray(m.top_blog_posts) ? (m.top_blog_posts as Array<Record<string, unknown>>) : [];

  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:640px;margin:0 auto;background:#fdfbf6;border:1px solid #ece5d8;border-radius:12px;padding:24px">
    <h1 style="font-size:20px;color:#0e7c7b;margin:0 0 4px">OWL Weekly Executive Report</h1>
    <p style="color:#5b6b6a;margin:0 0 16px">${start} → ${end}</p>
    <table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid #ece5d8;border-radius:8px">
      ${row("Total subscribers", String(m.total_subscribers ?? 0))}
      ${row("New subscribers", String(m.new_subscribers ?? 0))}
      ${row("Unsubscribes", String(m.unsubscribes ?? 0))}
      ${row("Open rate", `${m.open_rate ?? 0}%`)}
      ${row("Click rate", `${m.click_rate ?? 0}%`)}
      ${row("Store revenue", money(m.store_revenue_cents))}
      ${row("Affiliate revenue", money(m.affiliate_revenue_cents))}
    </table>
    ${list(
      "Top coupons",
      topCoupons.map((c) => `${c.code} — ${c.redemptions} redemption(s)`)
    )}
    ${list(
      "Top products",
      topProducts.map((p) => `${p.title} — ${money(p.revenue_cents)}`)
    )}
    ${list(
      "Top blog posts",
      topPosts.map((p) => `${p.title} (${p.view_count ?? 0} views)`)
    )}
    ${list(
      "Errors in the prior week",
      errors.map((e) => `${e.job_key}: ${e.error ?? "unknown error"}`)
    )}
    <p style="color:#9aa7a6;font-size:12px;margin-top:20px">Generated automatically by the OWL Command Center.</p>
  </div>`;
}

/**
 * Generate the weekly executive report via the generate_executive_report() SQL
 * function, store it, and email it to REPORT_RECIPIENT_EMAILS (falling back to
 * the app_settings.report_recipients list). Never hardcodes recipient emails.
 */
export const executiveReport: JobFn = async (db) => {
  const end = new Date();
  const start = new Date(end.getTime() - 7 * 24 * 3600 * 1000);
  const pStart = start.toISOString().slice(0, 10);
  const pEnd = end.toISOString().slice(0, 10);

  const { data: metrics, error } = await db.rpc("generate_executive_report", {
    p_start: pStart,
    p_end: pEnd,
  });
  if (error) throw new Error(`generate_executive_report failed: ${error.message}`);

  const { data: errs } = await db
    .from("cron_job_logs")
    .select("job_key, error, started_at")
    .eq("status", "failed")
    .gte("started_at", start.toISOString())
    .order("started_at", { ascending: false })
    .limit(10);

  const m = (metrics ?? {}) as Metrics;
  const errorRows = (errs ?? []) as { job_key: string; error: string | null }[];
  const html = renderHtml(m, errorRows, pStart, pEnd);

  const recipients = await resolveRecipients(db);

  const { data: reportRow } = await db
    .from("executive_reports")
    .insert({
      period_start: pStart,
      period_end: pEnd,
      metrics: m,
      html,
      status: "generated",
      recipients,
    })
    .select("id")
    .single();
  const reportId = (reportRow as { id?: string } | null)?.id;

  let emailed = 0;
  if (recipients.length > 0 && process.env.RESEND_API_KEY) {
    const from = process.env.RESEND_FROM_EMAIL
      ? `OWL Reports <${process.env.RESEND_FROM_EMAIL}>`
      : EMAIL_FROM.hello;
    const res = await resend().emails.send({
      from,
      to: recipients,
      subject: `OWL Weekly Report · ${pStart} → ${pEnd}`,
      html,
    });
    if (!res.error) {
      emailed = recipients.length;
      if (reportId) {
        await db
          .from("executive_reports")
          .update({ status: "sent", sent_at: new Date().toISOString() })
          .eq("id", reportId);
      }
    }
  }

  return {
    status: "success",
    summary: `Executive report ${pStart}→${pEnd} generated; emailed ${emailed} recipient(s).`,
    detail: { reportId, recipients: recipients.length, emailed },
  };
};

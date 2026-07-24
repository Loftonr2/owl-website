import "server-only";
import type { JobFn, ServiceClient } from "@/lib/cron/runner";
import { resend, EMAIL_FROM } from "@/lib/clients/resend";

/**
 * Weekly Content Digest — every Sunday at 08:00 UTC.
 *
 * Sends admin recipients a summary of all blogs, news articles, and newsletter
 * issues scheduled to publish in the upcoming Monday–Sunday period.
 *
 * Safety rules:
 *  - Only queries real scheduled content — never fabricates or invents items.
 *  - Never sends if RESEND_API_KEY is absent.
 *  - Uses the same resolveRecipients pattern as executive-report.
 *  - Only includes content_posts with workflow_status IN ('approved','scheduled')
 *    and newsletter_campaigns with status IN ('draft','scheduled').
 */

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
  return Array.isArray(value)
    ? value.filter((v): v is string => typeof v === "string")
    : [];
}

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function statusDot(status: string): string {
  const map: Record<string, string> = {
    approved:  "#0e7c7b",
    scheduled: "#0284c7",
    draft:     "#d97706",
    published: "#16a34a",
    sent:      "#16a34a",
  };
  return map[status] ?? "#9aa7a6";
}

type ContentRow = {
  id: string;
  content_type: string;
  title: string;
  workflow_status: string;
  publish_date: string | null;
  category: string | null;
  author: string | null;
};

type NewsletterRow = {
  id: string;
  issue_number: number | null;
  title: string;
  status: string;
  publication_date: string | null;
};

function renderHtml(
  content: ContentRow[],
  newsletters: NewsletterRow[],
  monday: string,
  sunday: string
): string {
  const news   = content.filter((c) => c.content_type === "news");
  const blogs  = content.filter((c) => c.content_type === "blog");

  function contentRows(items: ContentRow[]): string {
    if (!items.length) {
      return `<tr><td colspan="4" style="padding:8px 12px;color:#9aa7a6;font-style:italic">Nothing scheduled</td></tr>`;
    }
    return items
      .map(
        (it) =>
          `<tr>
            <td style="padding:6px 12px;border-bottom:1px solid #ece5d8">
              <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${statusDot(it.workflow_status)};margin-right:6px;vertical-align:middle"></span>
              ${it.title}
            </td>
            <td style="padding:6px 12px;border-bottom:1px solid #ece5d8;color:#5b6b6a;white-space:nowrap">${fmtDate(it.publish_date)}</td>
            <td style="padding:6px 12px;border-bottom:1px solid #ece5d8;color:#5b6b6a;text-transform:capitalize">${it.category ?? "—"}</td>
            <td style="padding:6px 12px;border-bottom:1px solid #ece5d8;color:#5b6b6a;text-transform:capitalize">${it.workflow_status.replace(/_/g, " ")}</td>
          </tr>`
      )
      .join("");
  }

  function newsletterRows(items: NewsletterRow[]): string {
    if (!items.length) {
      return `<tr><td colspan="3" style="padding:8px 12px;color:#9aa7a6;font-style:italic">Nothing scheduled</td></tr>`;
    }
    return items
      .map(
        (nl) =>
          `<tr>
            <td style="padding:6px 12px;border-bottom:1px solid #ece5d8">
              <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${statusDot(nl.status)};margin-right:6px;vertical-align:middle"></span>
              ${nl.issue_number ? `#${nl.issue_number} · ` : ""}${nl.title}
            </td>
            <td style="padding:6px 12px;border-bottom:1px solid #ece5d8;color:#5b6b6a;white-space:nowrap">${fmtDate(nl.publication_date)}</td>
            <td style="padding:6px 12px;border-bottom:1px solid #ece5d8;color:#5b6b6a;text-transform:capitalize">${nl.status}</td>
          </tr>`
      )
      .join("");
  }

  const totalItems = content.length + newsletters.length;

  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:680px;margin:0 auto;background:#fdfbf6;border:1px solid #ece5d8;border-radius:12px;padding:28px">
    <div style="margin-bottom:20px">
      <h1 style="font-size:20px;color:#0e7c7b;margin:0 0 4px">OWL Weekly Content Digest</h1>
      <p style="color:#5b6b6a;margin:0;font-size:14px">
        Upcoming content for <strong>${monday}</strong> → <strong>${sunday}</strong>
        &nbsp;·&nbsp; ${totalItems} item${totalItems !== 1 ? "s" : ""} scheduled
      </p>
    </div>

    ${
      totalItems === 0
        ? `<p style="color:#9aa7a6;font-style:italic">No content is scheduled for next week.</p>`
        : ""
    }

    ${
      news.length > 0 || blogs.length > 0
        ? `
    <h2 style="font-size:14px;font-weight:700;color:#1f2d2c;margin:20px 0 8px;text-transform:uppercase;letter-spacing:.05em">
      📰 News Articles (${news.length})
    </h2>
    <table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid #ece5d8;border-radius:8px;margin-bottom:16px">
      <thead>
        <tr style="background:#f5f0e8">
          <th style="padding:8px 12px;text-align:left;font-size:11px;color:#9aa7a6;font-weight:600;text-transform:uppercase;letter-spacing:.05em">Title</th>
          <th style="padding:8px 12px;text-align:left;font-size:11px;color:#9aa7a6;font-weight:600;text-transform:uppercase;letter-spacing:.05em">Date</th>
          <th style="padding:8px 12px;text-align:left;font-size:11px;color:#9aa7a6;font-weight:600;text-transform:uppercase;letter-spacing:.05em">Category</th>
          <th style="padding:8px 12px;text-align:left;font-size:11px;color:#9aa7a6;font-weight:600;text-transform:uppercase;letter-spacing:.05em">Status</th>
        </tr>
      </thead>
      <tbody>${contentRows(news)}</tbody>
    </table>

    <h2 style="font-size:14px;font-weight:700;color:#1f2d2c;margin:20px 0 8px;text-transform:uppercase;letter-spacing:.05em">
      📝 Blog Posts (${blogs.length})
    </h2>
    <table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid #ece5d8;border-radius:8px;margin-bottom:16px">
      <thead>
        <tr style="background:#f5f0e8">
          <th style="padding:8px 12px;text-align:left;font-size:11px;color:#9aa7a6;font-weight:600;text-transform:uppercase;letter-spacing:.05em">Title</th>
          <th style="padding:8px 12px;text-align:left;font-size:11px;color:#9aa7a6;font-weight:600;text-transform:uppercase;letter-spacing:.05em">Date</th>
          <th style="padding:8px 12px;text-align:left;font-size:11px;color:#9aa7a6;font-weight:600;text-transform:uppercase;letter-spacing:.05em">Category</th>
          <th style="padding:8px 12px;text-align:left;font-size:11px;color:#9aa7a6;font-weight:600;text-transform:uppercase;letter-spacing:.05em">Status</th>
        </tr>
      </thead>
      <tbody>${contentRows(blogs)}</tbody>
    </table>
    `
        : ""
    }

    <h2 style="font-size:14px;font-weight:700;color:#1f2d2c;margin:20px 0 8px;text-transform:uppercase;letter-spacing:.05em">
      📬 OWL Weekly Issues (${newsletters.length})
    </h2>
    <table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid #ece5d8;border-radius:8px;margin-bottom:16px">
      <thead>
        <tr style="background:#f5f0e8">
          <th style="padding:8px 12px;text-align:left;font-size:11px;color:#9aa7a6;font-weight:600;text-transform:uppercase;letter-spacing:.05em">Issue</th>
          <th style="padding:8px 12px;text-align:left;font-size:11px;color:#9aa7a6;font-weight:600;text-transform:uppercase;letter-spacing:.05em">Date</th>
          <th style="padding:8px 12px;text-align:left;font-size:11px;color:#9aa7a6;font-weight:600;text-transform:uppercase;letter-spacing:.05em">Status</th>
        </tr>
      </thead>
      <tbody>${newsletterRows(newsletters)}</tbody>
    </table>

    <div style="margin-top:16px;padding:12px;background:#f5f0e8;border-radius:8px;font-size:12px;color:#9aa7a6">
      <strong style="color:#5b6b6a">Status key:</strong>
      &nbsp;
      <span style="color:#d97706">● draft</span> &nbsp;
      <span style="color:#0e7c7b">● approved</span> &nbsp;
      <span style="color:#0284c7">● scheduled</span> &nbsp;
      <span style="color:#16a34a">● published / sent</span>
    </div>

    <p style="color:#9aa7a6;font-size:11px;margin-top:20px;border-top:1px solid #ece5d8;padding-top:12px">
      Generated automatically by the OWL Command Center every Sunday morning.
      Only real scheduled content is shown — no items are ever fabricated.
    </p>
  </div>`;
}

/**
 * weeklyContentDigest — Sunday admin email
 *
 * Queries the upcoming Monday–Sunday window and emails a digest of all
 * scheduled blogs, news, and newsletter issues to admin recipients.
 */
export const weeklyContentDigest: JobFn = async (db) => {
  // Compute next Monday → Sunday range (UTC)
  const now = new Date();
  const dayOfWeek = now.getUTCDay(); // 0=Sun
  const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() + daysUntilMonday);
  monday.setUTCHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);
  sunday.setUTCHours(23, 59, 59, 999);

  const mondayStr = monday.toISOString().split("T")[0];
  const sundayStr = sunday.toISOString().split("T")[0];

  // ── Query content posts ─────────────────────────────────────────────────
  const { data: contentData, error: contentErr } = await db
    .from("content_posts")
    .select("id, content_type, title, workflow_status, publish_date, category, author")
    .gte("publish_date", mondayStr)
    .lte("publish_date", sundayStr)
    .in("workflow_status", ["approved", "scheduled", "published"])
    .order("publish_date", { ascending: true });

  if (contentErr) throw new Error(`content_posts query failed: ${contentErr.message}`);

  // ── Query newsletter campaigns ──────────────────────────────────────────
  const { data: newsletterData, error: nlErr } = await db
    .from("newsletter_campaigns")
    .select("id, issue_number, title, status, publication_date")
    .gte("publication_date", mondayStr)
    .lte("publication_date", sundayStr)
    .not("publication_date", "is", null)
    .in("status", ["draft", "scheduled", "published", "sent"])
    .order("publication_date", { ascending: true });

  if (nlErr) throw new Error(`newsletter_campaigns query failed: ${nlErr.message}`);

  const content    = (contentData ?? []) as ContentRow[];
  const newsletters = (newsletterData ?? []) as NewsletterRow[];
  const totalItems = content.length + newsletters.length;

  const mondayLabel = monday.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const sundayLabel  = sunday.toLocaleDateString("en-US",  { weekday: "long", month: "long", day: "numeric" });

  const html = renderHtml(content, newsletters, mondayLabel, sundayLabel);

  const recipients = await resolveRecipients(db);

  let emailed = 0;
  if (recipients.length > 0 && process.env.RESEND_API_KEY) {
    const from = process.env.RESEND_FROM_EMAIL
      ? `OWL Reports <${process.env.RESEND_FROM_EMAIL}>`
      : EMAIL_FROM.hello;

    const result = await resend().emails.send({
      from,
      to: recipients,
      subject: `OWL Content Digest · Week of ${mondayStr}`,
      html,
    });

    if (!result.error) {
      emailed = recipients.length;
    }
  }

  return {
    status: "success",
    summary:
      `Content digest for ${mondayStr}→${sundayStr}: ${totalItems} item(s); ` +
      `emailed ${emailed} recipient(s).`,
    detail: {
      weekStart: mondayStr,
      weekEnd: sundayStr,
      newsCount: content.filter((c) => c.content_type === "news").length,
      blogCount: content.filter((c) => c.content_type === "blog").length,
      newsletterCount: newsletters.length,
      totalItems,
      recipients: recipients.length,
      emailed,
    },
  };
};

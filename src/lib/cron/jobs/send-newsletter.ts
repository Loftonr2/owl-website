import "server-only";
import type { JobFn } from "@/lib/cron/runner";
import { resend, EMAIL_FROM } from "@/lib/clients/resend";
import { resolveAdminRecipients } from "@/lib/email/admin-recipients";

/**
 * Find the next scheduled newsletter that is due, send it via Resend to active
 * subscribers, record per-recipient + summary logs, and mark it sent.
 *
 * Idempotent: only a campaign in 'scheduled' status is claimed (â 'sending' â
 * 'sent'). A second run finds nothing to claim and skips. Missing data (no
 * campaign, no subject/body, no subscribers, no API key) degrades to a clean
 * "skipped"/zero result rather than throwing.
 */
export const sendNewsletter: JobFn = async (db) => {
  const nowIso = new Date().toISOString();

  const { data: campaign } = await db
    .from("newsletter_campaigns")
    .select("id, title, subject, html_body, from_name, from_email, status, scheduled_for")
    .eq("status", "scheduled")
    .lte("scheduled_for", nowIso)
    .order("scheduled_for", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!campaign) {
    return { status: "skipped", summary: "No scheduled newsletter is due to send." };
  }

  if (!campaign.subject || !campaign.html_body) {
    await db.from("newsletter_send_logs").insert({
      campaign_id: campaign.id,
      skipped: true,
      reason: "Missing subject or HTML body.",
      finished_at: nowIso,
    });
    return {
      status: "skipped",
      summary: `Campaign "${campaign.title}" is missing a subject or body.`,
      detail: { campaignId: campaign.id },
    };
  }

  // Claim atomically: scheduled â sending. If 0 rows updated, someone else has it.
  const { data: claimed } = await db
    .from("newsletter_campaigns")
    .update({ status: "sending" })
    .eq("id", campaign.id)
    .eq("status", "scheduled")
    .select("id")
    .maybeSingle();

  if (!claimed) {
    return { status: "skipped", summary: "Campaign already claimed by another run." };
  }

  const { data: subs } = await db
    .from("newsletter_subscribers")
    .select("email")
    .eq("status", "active");
  const recipients = (subs ?? [])
    .map((s: { email: string | null }) => s.email)
    .filter((e: string | null): e is string => Boolean(e));

  const { data: sendLog } = await db
    .from("newsletter_send_logs")
    .insert({ campaign_id: campaign.id, recipients: recipients.length })
    .select("id")
    .single();
  const sendLogId = (sendLog as { id?: string } | null)?.id;

  const fromName = campaign.from_name ?? "OWL Sing Together";
  const fromEmail = process.env.RESEND_FROM_EMAIL
    ? `${fromName} <${process.env.RESEND_FROM_EMAIL}>`
    : campaign.from_email
      ? `${fromName} <${campaign.from_email}>`
      : EMAIL_FROM.hello;

  let sent = 0;
  let failed = 0;

  if (recipients.length > 0 && process.env.RESEND_API_KEY) {
    const client = resend();
    const chunkSize = 100; // Resend batch limit
    for (let i = 0; i < recipients.length; i += chunkSize) {
      const chunk = recipients.slice(i, i + chunkSize);
      try {
        const payload = chunk.map((to) => ({
          from: fromEmail,
          to,
          subject: campaign.subject as string,
          html: campaign.html_body as string,
        }));
        const res = await client.batch.send(payload);
        if (res.error) {
          failed += chunk.length;
        } else {
          sent += chunk.length;
          await db.from("newsletter_recipients").upsert(
            chunk.map((email) => ({
              campaign_id: campaign.id,
              email,
              status: "sent",
              sent_at: new Date().toISOString(),
            })),
            { onConflict: "campaign_id,email", ignoreDuplicates: true }
          );
        }
      } catch {
        failed += chunk.length;
      }
    }
  }

  const finishedAt = new Date().toISOString();
  await db
    .from("newsletter_campaigns")
    .update({
      status: "sent",
      sent_at: finishedAt,
      recipients_count: recipients.length,
      sent_count: sent,
    })
    .eq("id", campaign.id);

  if (sendLogId) {
    await db
      .from("newsletter_send_logs")
      .update({ sent, failed, finished_at: finishedAt })
      .eq("id", sendLogId);
  }

  // ââ Send admin summary to both required recipients âââââââââââââââââââââââââ
  if (process.env.RESEND_API_KEY) {
    try {
      const adminTo = resolveAdminRecipients();
      const dateLabel = new Date().toLocaleDateString("en-US", {
        timeZone: "America/Los_Angeles",
        weekday: "long", year: "numeric", month: "long", day: "numeric",
      });
      const adminHtml = `<!DOCTYPE html><html><body style="font-family:Georgia,serif;max-width:640px;margin:0 auto;padding:32px 24px;color:#1a1a1a">
  <h1 style="font-size:22px;color:#134e4a;margin:0 0 8px">ð¦ OWL Newsletter â Admin Summary</h1>
  <p style="color:#6b7280;font-size:13px;margin:0 0 24px">${dateLabel}</p>
  <table style="width:100%;border-collapse:collapse;font-size:14px">
    <tr><td style="padding:8px 0;color:#6b7280">Campaign</td><td style="padding:8px 0;font-weight:600">${campaign.title}</td></tr>
    <tr><td style="padding:8px 0;color:#6b7280">Subject</td><td style="padding:8px 0">${campaign.subject}</td></tr>
    <tr><td style="padding:8px 0;color:#6b7280">Subscribers targeted</td><td style="padding:8px 0">${recipients.length}</td></tr>
    <tr><td style="padding:8px 0;color:#6b7280">Sent successfully</td><td style="padding:8px 0;color:${sent > 0 ? '#15803d' : '#dc2626'};font-weight:600">${sent}</td></tr>
    <tr><td style="padding:8px 0;color:#6b7280">Failed</td><td style="padding:8px 0;color:${failed > 0 ? '#dc2626' : '#6b7280'}">${failed}</td></tr>
    <tr><td style="padding:8px 0;color:#6b7280">Send log ID</td><td style="padding:8px 0;font-family:monospace;font-size:12px">${sendLogId ?? 'â'}</td></tr>
  </table>
  <p style="margin-top:24px;font-size:12px;color:#9ca3af">Automated by send-newsletter cron job Â· Sunday ${dateLabel}</p>
</body></html>`;
      await resend().emails.send({
        from: EMAIL_FROM.store,
        to: adminTo,
        subject: `OWL Newsletter Sent â "${campaign.title}" (${sent}/${recipients.length} delivered)`,
        html: adminHtml,
      });
    } catch {
      // Admin copy failure must not affect the job result
    }
  }

  return {
    status: "success",
    summary: `Sent "${campaign.title}" to ${sent}/${recipients.length} subscribers (${failed} failed).`,
    detail: { campaignId: campaign.id, recipients: recipients.length, sent, failed },
  };
};

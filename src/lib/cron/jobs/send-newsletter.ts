import "server-only";
import type { JobFn } from "@/lib/cron/runner";
import { resend, EMAIL_FROM } from "@/lib/clients/resend";
import { resolveAdminRecipients } from "@/lib/email/admin-recipients";

/**
 * Find the next scheduled newsletter that is due, send it via Resend to active
 * subscribers, record per-recipient + summary logs, and mark it sent.
 *
 * Idempotent: only a campaign in 'scheduled' status is claimed.
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
    await db.from("newsletter_send_logs").insert({ campaign_id: campaign.id, skipped: true, reason: "Missing subject or HTML body.", finished_at: nowIso });
    return { status: "skipped", summary: `Campaign "${campaign.title}" is missing a subject or body.`, detail: { campaignId: campaign.id } };
  }

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

  const { data: subs } = await db.from("newsletter_subscribers").select("email").eq("status", "active");
  const recipients = (subs ?? []).map((s: { email: string | null }) => s.email).filter((e: string | null): e is string => Boolean(e));

  const { data: sendLog } = await db.from("newsletter_send_logs").insert({ campaign_id: campaign.id, recipients: recipients.length }).select("id").single();
  const sendLogId = (sendLog as { id?: string } | null)?.id;

  const fromName = campaign.from_name ?? "OWL Sing Together";
  const fromEmail = process.env.RESEND_FROM_EMAIL
    ? `${fromName} <${process.env.RESEND_FROM_EMAIL}>`
    : campaign.from_email ? `${fromName} <${campaign.from_email}>` : EMAIL_FROM.hello;

  let sent = 0;
  let failed = 0;

  if (recipients.length > 0 && process.env.RESEND_API_KEY) {
    const client = resend();
    const chunkSize = 100;
    for (let i = 0; i < recipients.length; i += chunkSize) {
      const chunk = recipients.slice(i, i + chunkSize);
      try {
        const payload = chunk.map((to) => ({ from: fromEmail, to, subject: campaign.subject as string, html: campaign.html_body as string }));
        const res = await client.batch.send(payload);
        if (res.error) {
          failed += chunk.length;
        } else {
          sent += chunk.length;
          await db.from("newsletter_recipients").upsert(chunk.map((email) => ({ campaign_id: campaign.id, email, status: "sent", sent_at: new Date().toISOString() })), { onConflict: "campaign_id,email", ignoreDuplicates: true });
        }
      } catch { failed += chunk.length; }
    }
  }

  const finishedAt = new Date().toISOString();
  await db.from("newsletter_campaigns").update({ status: "sent", sent_at: finishedAt, recipients_count: recipients.length, sent_count: sent }).eq("id", campaign.id);
  if (sendLogId) await db.from("newsletter_send_logs").update({ sent, failed, finished_at: finishedAt }).eq("id", sendLogId);

  // ── Send admin summary to both required recipients ─────────────────────────
  if (process.env.RESEND_API_KEY) {
    try {
      const adminTo = resolveAdminRecipients();
      const dateLabel = new Date().toLocaleDateString("en-US", { timeZone: "America/Los_Angeles", weekday: "long", year: "numeric", month: "long", day: "numeric" });
      await resend().emails.send({
        from: EMAIL_FROM.store,
        to: adminTo,
        subject: `OWL Newsletter Sent — "${campaign.title}" (${sent}/${recipients.length} delivered)`,
        html: `<!DOCTYPE html><html><body style="font-family:Georgia,serif;max-width:640px;margin:0 auto;padding:32px 24px"><h1 style="color:#134e4a">🦉 OWL Newsletter — Admin Summary</h1><p style="color:#6b7280">${dateLabel}</p><table><tr><td>Campaign</td><td><strong>${campaign.title}</strong></td></tr><tr><td>Sent</td><td><strong style="color:${sent > 0 ? '#15803d' : '#dc2626'}">${sent}</strong></td></tr><tr><td>Failed</td><td>${failed}</td></tr><tr><td>Total</td><td>${recipients.length}</td></tr></table></body></html>`,
      });
    } catch { /* Admin copy failure must not affect the job result */ }
  }

  return {
    status: "success",
    summary: `Sent "${campaign.title}" to ${sent}/${recipients.length} subscribers (${failed} failed).`,
    detail: { campaignId: campaign.id, recipients: recipients.length, sent, failed },
  };
};

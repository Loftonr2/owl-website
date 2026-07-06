/**
 * POST /api/cron/publish-scheduled
 *
 * Daily cron handler (registered in vercel.json):
 *  1. Publishes all scheduled posts whose publish_date Γëñ now
 *  2. Checks remaining queue counts per content_type
 *  3. Sends a low-queue alert email via Resend if queue Γëñ 3 and alert not yet sent
 *
 * Vercel calls this via its cron system -- no user auth needed, but we verify
 * CRON_SECRET to prevent spoofed calls.
 */

import { NextRequest, NextResponse } from "next/server";
import {
  publishDuePosts,
  getScheduledQueueCounts,
  isAlertAlreadySent,
  setAlertSent,
} from "@/lib/content-posts";
import { resend, EMAIL_FROM } from "@/lib/clients/resend";

export const dynamic = "force-dynamic";

const LOW_QUEUE_THRESHOLD = 3;

export async function POST(req: NextRequest) {
  // Verify the Vercel cron secret (set CRON_SECRET in Vercel env vars)
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const log: string[] = [];

  try {
    // Step 1: Publish due posts
    const published = await publishDuePosts();
    log.push(`Published ${published} post(s).`);

    // Step 2: Check queue counts
    const counts = await getScheduledQueueCounts();
    log.push(`Queue -- blog: ${counts.blog}, news: ${counts.news}`);

    // Step 3: Low-queue alerts
    const alerts: string[] = [];

    for (const type of ["blog", "news"] as const) {
      const count = counts[type];
      if (count <= LOW_QUEUE_THRESHOLD && count > 0) {
        const alreadySent = await isAlertAlreadySent(type);
        if (!alreadySent) {
          try {
            const r = resend();
            await r.emails.send({
              from: EMAIL_FROM.hello,
              to: ["rickoflv@gmail.com"],
              subject: `[WARN] OWL ${type === "blog" ? "Blog" : "News"} queue is low -- ${count} post${count !== 1 ? "s" : ""} remaining`,
              html: `
                <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
                  <h2 style="color:#2d5c4e">OWL Content Queue Alert</h2>
                  <p>Your <strong>${type === "blog" ? "blog" : "news article"} queue</strong> is running low.</p>
                  <table style="border-collapse:collapse;width:100%;margin:16px 0">
                    <tr>
                      <td style="padding:8px 12px;background:#f5f0e8;border-radius:4px;font-weight:bold">
                        ${count} ${type} post${count !== 1 ? "s" : ""} remaining
                      </td>
                    </tr>
                  </table>
                  <p>To add more content, visit your <a href="https://owlsingtogether.com/admin/content" style="color:#2d5c4e">Content CRM</a>.</p>
                  <p style="color:#999;font-size:12px">This alert fires once per low-queue event and won't repeat until new posts are added.</p>
                </div>
              `,
            });
            await setAlertSent(type, true);
            alerts.push(`${type} alert sent.`);
          } catch (emailErr) {
            log.push(`Failed to send ${type} alert: ${String(emailErr)}`);
          }
        } else {
          log.push(`${type} alert already sent -- skipping.`);
        }
      } else if (count === 0) {
        log.push(`${type} queue empty -- no alert (user should already know).`);
      } else {
        // Queue healthy -- reset alert_sent so next low-queue event fires again
        await setAlertSent(type, false);
        log.push(`${type} queue healthy (${count}), alert_sent reset.`);
      }
    }

    if (alerts.length) log.push(...alerts);

    return NextResponse.json({
      ok: true,
      published,
      queue: counts,
      log,
    });
  } catch (err) {
    console.error("[cron/publish-scheduled]", err);
    return NextResponse.json(
      { ok: false, error: String(err), log },
      { status: 500 }
    );
  }
}

// Allow GET for manual testing in the browser (no auth check)
export async function GET() {
  return NextResponse.json({
    hint: "POST to this endpoint to trigger publish-scheduled cron manually.",
  });
}

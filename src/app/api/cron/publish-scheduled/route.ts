/**
 * GET /api/cron/publish-scheduled
 *
 * Daily content publisher — vercel.json fires this once daily at 12:00 UTC
 * ("0 12 * * *"), which lands at ~7-8 AM America/New_York depending on DST.
 * The job (publish-scheduled-content) publishes every News/Blog post whose
 * publish_date has passed, plus a per-content-type catch-up (see that file)
 * that pulls the next scheduled post of any type forward if none is due —
 * so News and Blog each reliably publish once per run, independently.
 *
 * Uses makeCronRoute so every run is logged to cron_job_logs and the
 * Automations CRM panel shows last_run_at / last_status automatically.
 *
 * Authorization: Vercel sends  Authorization: Bearer <CRON_SECRET>
 * on all cron invocations. Unauthenticated requests → 401.
 */

import { makeCronRoute } from "@/lib/cron/route";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const handler = makeCronRoute("publish-scheduled-content");
export const GET  = handler;
export const POST = handler;

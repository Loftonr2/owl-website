/**
 * GET /api/cron/publish-scheduled
 *
 * Daily content publisher — vercel.json fires this hourly (0 * * * *).
 * The job itself (publish-scheduled-content) checks whether the current local
 * hour in America/New_York is 7 and exits early at all other hours.
 * This makes the publish time DST-safe without a fixed UTC offset.
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

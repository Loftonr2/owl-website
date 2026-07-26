import "server-only";
import type { JobFn } from "@/lib/cron/runner";
import { sendNewsletter } from "./send-newsletter";
import { executiveReport } from "./executive-report";
import { refreshCoupons } from "./refresh-coupons";
import { syncAffiliates } from "./sync-affiliates";
import { updateCrmMetrics } from "./update-crm-metrics";
import { weeklyContentDigest } from "./weekly-content-digest";
import { publishScheduledContent } from "./publish-scheduled-content";

/**
 * Canonical cron job registry. Keys match the route segments under
 * /api/cron/<key> and the `key` column in scheduled_jobs. Used by both the cron
 * routes and the admin "Run Now" action so the two can never drift.
 */
export const CRON_JOBS: Record<string, { label: string; fn: JobFn }> = {
  "publish-scheduled-content": { label: "Daily content publisher (7 AM ET)", fn: publishScheduledContent },
  "send-newsletter":           { label: "Send weekly newsletter",             fn: sendNewsletter },
  "executive-report":          { label: "Weekly executive report",            fn: executiveReport },
  "refresh-coupons":           { label: "Refresh affiliate coupons",          fn: refreshCoupons },
  "sync-affiliates":           { label: "Sync affiliate performance",         fn: syncAffiliates },
  "update-crm-metrics":        { label: "Update CRM metrics",                fn: updateCrmMetrics },
  "weekly-content-digest":     { label: "Weekly content digest (Sunday)",     fn: weeklyContentDigest },
};

export type CronJobKey = keyof typeof CRON_JOBS;

export {
  publishScheduledContent,
  sendNewsletter,
  executiveReport,
  refreshCoupons,
  syncAffiliates,
  updateCrmMetrics,
  weeklyContentDigest,
};

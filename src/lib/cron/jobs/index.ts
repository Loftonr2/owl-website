import "server-only";
import type { JobFn } from "@/lib/cron/runner";
import { sendNewsletter } from "./send-newsletter";
import { executiveReport } from "./executive-report";
import { refreshCoupons } from "./refresh-coupons";
import { syncAffiliates } from "./sync-affiliates";
import { updateCrmMetrics } from "./update-crm-metrics";

/**
 * Canonical cron job registry. Keys match the route segments under
 * /api/cron/<key> and the `key` column in scheduled_jobs. Used by both the cron
 * routes and the admin "Run Now" action so the two can never drift.
 */
export const CRON_JOBS: Record<string, { label: string; fn: JobFn }> = {
  "send-newsletter": { label: "Send weekly newsletter", fn: sendNewsletter },
  "executive-report": { label: "Weekly executive report", fn: executiveReport },
  "refresh-coupons": { label: "Refresh affiliate coupons", fn: refreshCoupons },
  "sync-affiliates": { label: "Sync affiliate performance", fn: syncAffiliates },
  "update-crm-metrics": { label: "Update CRM metrics", fn: updateCrmMetrics },
};

export type CronJobKey = keyof typeof CRON_JOBS;

export { sendNewsletter, executiveReport, refreshCoupons, syncAffiliates, updateCrmMetrics };

import "server-only";
import type { JobFn, ServiceClient } from "@/lib/cron/runner";

/* eslint-disable @typescript-eslint/no-explicit-any */
async function countHead(
  db: ServiceClient,
  table: string,
  filter?: (q: any) => any
): Promise<number> {
  let q: any = db.from(table).select("*", { count: "exact", head: true });
  if (filter) q = filter(q);
  const { count } = await q;
  return (count as number | null) ?? 0;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/**
 * Recalculate CRM totals (subscribers, customers, teachers, leads, affiliates,
 * downloads), reconcile engagement scores, compute the average, and upsert a
 * dated snapshot row for dashboard charts. Idempotent: one snapshot per day
 * (upsert on snapshot_date).
 */
export const updateCrmMetrics: JobFn = async (db) => {
  const today = new Date().toISOString().slice(0, 10);
  const weekAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();

  // Reconcile per-contact engagement scores from the event log.
  await db.rpc("recompute_engagement_scores");

  const [subscribers, activeSubs, newSubs, unsubs, customers, teachers, leads, affiliates, downloads] =
    await Promise.all([
      countHead(db, "newsletter_subscribers"),
      countHead(db, "newsletter_subscribers", (q) => q.eq("status", "active")),
      countHead(db, "newsletter_subscribers", (q) => q.gte("subscribed_at", weekAgo)),
      countHead(db, "newsletter_subscribers", (q) => q.gte("unsubscribed_at", weekAgo)),
      countHead(db, "profiles", (q) => q.eq("role", "customer")),
      countHead(db, "profiles", (q) => q.eq("role", "teacher")),
      countHead(db, "crm_contacts", (q) => q.eq("lifecycle_stage", "lead")),
      countHead(db, "profiles", (q) => q.eq("role", "affiliate")),
      countHead(db, "downloads"),
    ]);

  const { data: engRows } = await db.from("crm_contacts").select("engagement_score");
  const scores = (engRows ?? []) as { engagement_score: number | null }[];
  const avgEngagement =
    scores.length > 0
      ? scores.reduce((s, r) => s + (r.engagement_score ?? 0), 0) / scores.length
      : 0;

  const snapshot = {
    snapshot_date: today,
    subscribers,
    active_subscribers: activeSubs,
    new_subscribers_7d: newSubs,
    unsubscribes_7d: unsubs,
    customers,
    teachers,
    leads,
    affiliates,
    avg_engagement: Number(avgEngagement.toFixed(2)),
    downloads_total: downloads,
    captured_at: new Date().toISOString(),
  };

  await db.from("crm_metric_snapshots").upsert(snapshot, { onConflict: "snapshot_date" });

  return {
    status: "success",
    summary: `CRM snapshot ${today}: ${activeSubs} active subscribers, ${customers} customers, ${teachers} teachers, ${leads} leads.`,
    detail: snapshot,
  };
};

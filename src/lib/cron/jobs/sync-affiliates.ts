import "server-only";
import type { JobFn } from "@/lib/cron/runner";
import { getAffiliateAdapter, type AdapterCredential } from "@/lib/affiliates/adapters";

/**
 * For every non-disabled network with credentials, pull click/conversion/
 * commission data via its adapter for the past 7 days and store
 * affiliate_revenue records (deduped by external_order_id). Networks without
 * credentials are skipped cleanly.
 */
export const syncAffiliates: JobFn = async (db) => {
  const end = new Date();
  const start = new Date(end.getTime() - 7 * 24 * 3600 * 1000);
  const pStart = start.toISOString().slice(0, 10);
  const pEnd = end.toISOString().slice(0, 10);

  const { data: networks } = await db
    .from("affiliate_networks")
    .select("id, slug, status")
    .neq("status", "disabled");
  const { data: creds } = await db
    .from("affiliate_credentials")
    .select("network_id, secret_ref, secret_value, meta");

  let inserted = 0;
  let skippedNetworks = 0;
  let syncedNetworks = 0;
  let totalCommissionCents = 0;

  for (const net of networks ?? []) {
    const netCreds: AdapterCredential[] = (creds ?? [])
      .filter((c: { network_id: string }) => c.network_id === net.id)
      .map((c: { secret_ref: string | null; secret_value: string | null; meta: Record<string, unknown> | null }) => ({
        secret_ref: c.secret_ref,
        secret_value: c.secret_value,
        meta: c.meta ?? {},
      }));

    const adapter = getAffiliateAdapter(net.slug, netCreds);
    if (!adapter.hasCredentials()) {
      skippedNetworks += 1;
      continue;
    }

    try {
      const perf = await adapter.fetchPerformance(pStart, pEnd);
      syncedNetworks += 1;

      for (const p of perf) {
        if (p.external_order_id) {
          const { data: existing } = await db
            .from("affiliate_revenue")
            .select("id")
            .eq("network_id", net.id)
            .eq("external_order_id", p.external_order_id)
            .maybeSingle();
          if (existing) continue;
        }
        await db.from("affiliate_revenue").insert({
          network_id: net.id,
          external_order_id: p.external_order_id ?? null,
          clicks: p.clicks ?? 0,
          conversions: p.conversions ?? 0,
          sale_amount_cents: p.sale_amount_cents ?? 0,
          commission_cents: p.commission_cents ?? 0,
          currency: p.currency ?? "USD",
          status: p.status ?? "pending",
          period_start: p.period_start ?? pStart,
          period_end: p.period_end ?? pEnd,
          raw: p.raw ?? {},
        });
        inserted += 1;
        totalCommissionCents += p.commission_cents ?? 0;
      }
    } catch {
      // Per-network failures shouldn't abort the whole sync.
    }
  }

  return {
    status: "success",
    summary: `Affiliate sync ${pStart}→${pEnd}: ${inserted} record(s) from ${syncedNetworks} network(s); ${skippedNetworks} skipped (no credentials).`,
    detail: { inserted, syncedNetworks, skippedNetworks, totalCommissionCents, periodStart: pStart, periodEnd: pEnd },
  };
};

import "server-only";
import type { JobFn } from "@/lib/cron/runner";
import {
  getAffiliateAdapter,
  type AdapterCredential,
  type CouponDraft,
} from "@/lib/affiliates/adapters";

function mapCoupon(d: CouponDraft) {
  return {
    title: d.title ?? null,
    description: d.description ?? null,
    discount_type: d.discount_type ?? null,
    discount_value: d.discount_value ?? null,
    affiliate_url: d.affiliate_url ?? null,
    landing_url: d.landing_url ?? null,
    starts_at: d.starts_at ?? null,
    expires_at: d.expires_at ?? null,
  };
}

/**
 * Expire stale active coupons, then for every non-disabled network with
 * credentials, harvest fresh coupons via its adapter and upsert them (dedup by
 * network + code). Networks without credentials are skipped cleanly. With no
 * real adapters configured this simply expires stale coupons and logs skips.
 */
export const refreshCoupons: JobFn = async (db) => {
  const nowIso = new Date().toISOString();

  const { data: expired } = await db
    .from("coupons")
    .update({ status: "expired" })
    .lt("expires_at", nowIso)
    .eq("status", "active")
    .select("id");
  const expiredCount = (expired ?? []).length;

  const { data: networks } = await db
    .from("affiliate_networks")
    .select("id, slug, name, status")
    .neq("status", "disabled");
  const { data: creds } = await db
    .from("affiliate_credentials")
    .select("network_id, secret_ref, secret_value, meta");

  let newCount = 0;
  let updatedCount = 0;
  let scanned = 0;
  let skippedNetworks = 0;

  for (const net of networks ?? []) {
    const netCreds: AdapterCredential[] = (creds ?? [])
      .filter((c: { network_id: string }) => c.network_id === net.id)
      .map((c: { secret_ref: string | null; secret_value: string | null; meta: Record<string, unknown> | null }) => ({
        secret_ref: c.secret_ref,
        secret_value: c.secret_value,
        meta: c.meta ?? {},
      }));

    const adapter = getAffiliateAdapter(net.slug, netCreds);

    const { data: run } = await db
      .from("coupon_harvest_runs")
      .insert({ network_id: net.id, status: "running" })
      .select("id")
      .single();
    const runId = (run as { id?: string } | null)?.id;

    try {
      if (!adapter.hasCredentials()) {
        skippedNetworks += 1;
        if (runId) {
          await db
            .from("coupon_harvest_runs")
            .update({ status: "success", finished_at: new Date().toISOString(), log: "No credentials configured; skipped." })
            .eq("id", runId);
        }
        continue;
      }

      const drafts = await adapter.fetchCoupons();
      scanned += drafts.length;
      let netNew = 0;
      let netUpdated = 0;

      for (const d of drafts) {
        if (!d.code) continue;
        try {
          const { data: existing } = await db
            .from("coupons")
            .select("id")
            .eq("network_id", net.id)
            .ilike("code", d.code)
            .maybeSingle();

          if (existing) {
            await db
              .from("coupons")
              .update({ ...mapCoupon(d), source: "harvested", last_verified_at: nowIso, status: "active" })
              .eq("id", (existing as { id: string }).id);
            netUpdated += 1;
          } else {
            await db.from("coupons").insert({
              ...mapCoupon(d),
              code: d.code,
              scope: "affiliate",
              network_id: net.id,
              source: "harvested",
              last_verified_at: nowIso,
              status: "active",
            });
            netNew += 1;
          }
        } catch {
          // Skip a single bad coupon without failing the whole network.
        }
      }

      newCount += netNew;
      updatedCount += netUpdated;

      if (runId) {
        await db
          .from("coupon_harvest_runs")
          .update({
            status: "success",
            finished_at: new Date().toISOString(),
            found_count: drafts.length,
            new_count: netNew,
            updated_count: netUpdated,
            expired_count: expiredCount,
          })
          .eq("id", runId);
      }
    } catch (e) {
      if (runId) {
        await db
          .from("coupon_harvest_runs")
          .update({ status: "failed", finished_at: new Date().toISOString(), error: (e as Error).message.slice(0, 1000) })
          .eq("id", runId);
      }
    }
  }

  return {
    status: "success",
    summary: `Coupons refreshed: ${newCount} new, ${updatedCount} updated, ${expiredCount} expired; ${skippedNetworks} network(s) skipped (no credentials).`,
    detail: { newCount, updatedCount, expiredCount, scanned, skippedNetworks },
  };
};

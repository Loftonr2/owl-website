import { pageMetadata } from "@/lib/seo/metadata";
import { requireRole } from "@/lib/auth/roles";
import { supabaseServer } from "@/lib/clients/supabase-server";
import { SectionHeader, StatCard, Panel, Roadmap } from "@/components/admin/section";

export const metadata = pageMetadata({ title: "Sales", path: "/admin/sales", noIndex: true });
export const dynamic = "force-dynamic";

function dollars(cents: number) {
  return (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export default async function SalesPage() {
  await requireRole("support");
  const supabase = await supabaseServer();
  const head = { count: "exact" as const, head: true };

  const [orders, store, affiliate] = await Promise.allSettled([
    supabase.from("orders").select("*", head),
    supabase.from("orders").select("total_cents").in("status", ["paid", "fulfilled"]),
    supabase.from("affiliate_revenue").select("commission_cents"),
  ]);

  const orderCount =
    orders.status === "fulfilled" ? (orders.value.count ?? 0) : 0;
  const storeCents =
    store.status === "fulfilled"
      ? (store.value.data ?? []).reduce(
          (s: number, r: { total_cents: number | null }) => s + (r.total_cents ?? 0),
          0
        )
      : 0;
  const affiliateCents =
    affiliate.status === "fulfilled"
      ? (affiliate.value.data ?? []).reduce(
          (s: number, r: { commission_cents: number | null }) => s + (r.commission_cents ?? 0),
          0
        )
      : 0;

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Sales"
        description="Store sales, affiliate commissions, and combined revenue. Top products and top coupons roll up from normalized order items."
      />
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Orders" value={orderCount.toLocaleString()} />
        <StatCard label="Store revenue" value={dollars(storeCents)} hint="paid + fulfilled" />
        <StatCard label="Affiliate revenue" value={dollars(affiliateCents)} hint="commissions" />
        <StatCard label="Combined" value={dollars(storeCents + affiliateCents)} />
      </section>
      <Panel title="Build status">
        <Roadmap
          items={[
            { label: "order_items normalized for product-level reporting", done: true },
            { label: "Coupon attribution on orders + redemptions", done: true },
            { label: "Revenue rollup views (store / affiliate / combined daily)", done: true },
            { label: "Charts + date-range filter UI" },
            { label: "Top products / top coupons leaderboards" },
          ]}
        />
      </Panel>
    </div>
  );
}

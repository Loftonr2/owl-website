import { pageMetadata } from "@/lib/seo/metadata";
import { requireRole } from "@/lib/auth/roles";
import { supabaseServer } from "@/lib/clients/supabase-server";
import { SectionHeader, StatCard, Panel, Roadmap } from "@/components/admin/section";

export const metadata = pageMetadata({ title: "Affiliate Center", path: "/admin/affiliate", noIndex: true });
export const dynamic = "force-dynamic";

export default async function AffiliatePage() {
  await requireRole("editor");
  const supabase = await supabaseServer();
  const head = { count: "exact" as const, head: true };
  const [networks, products, coupons, revenue] = await Promise.allSettled([
    supabase.from("affiliate_networks").select("*", head),
    supabase.from("affiliate_products").select("*", head),
    supabase.from("coupons").select("*", head).eq("scope", "affiliate"),
    supabase.from("affiliate_revenue").select("*", head),
  ]);
  const n = (r: PromiseSettledResult<{ count: number | null }>) =>
    (r.status === "fulfilled" ? r.value.count ?? 0 : 0).toLocaleString();

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Affiliate Center"
        description="Partners, products, coupons, and commission/revenue history across all integrated networks. API credentials live in an owner-only vault."
      />
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Networks" value={n(networks)} hint="12 seeded" />
        <StatCard label="Products" value={n(products)} />
        <StatCard label="Affiliate coupons" value={n(coupons)} />
        <StatCard label="Revenue records" value={n(revenue)} />
      </section>
      <Panel title="Build status">
        <Roadmap
          items={[
            { label: "Networks, partners, products, clicks, revenue tables", done: true },
            { label: "Amazon, ShareASale, CJ, Rakuten, Bookshop, Lovevery, Learning Resources, Lakeshore, KiwiCo, Little Passports, Green Kid Crafts, Highlights seeded", done: true },
            { label: "Admin-only credential vault (affiliate_credentials)", done: true },
            { label: "Coupon engine + harvest-run log", done: true },
            { label: "Per-network API sync adapters (products + revenue)" },
            { label: "Tracking-link redirect route + click attribution" },
          ]}
        />
      </Panel>
    </div>
  );
}

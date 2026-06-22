import { pageMetadata } from "@/lib/seo/metadata";
import { requireRole } from "@/lib/auth/roles";
import { supabaseServer } from "@/lib/clients/supabase-server";
import { SectionHeader, StatCard, Panel, Roadmap } from "@/components/admin/section";

export const metadata = pageMetadata({ title: "Newsletter", path: "/admin/newsletter", noIndex: true });
export const dynamic = "force-dynamic";

export default async function NewsletterPage() {
  await requireRole("editor");
  const supabase = await supabaseServer();
  const head = { count: "exact" as const, head: true };
  const [campaigns, scheduled, assets] = await Promise.allSettled([
    supabase.from("newsletter_campaigns").select("*", head),
    supabase.from("newsletter_campaigns").select("*", head).eq("status", "scheduled"),
    supabase.from("newsletter_assets").select("*", head),
  ]);
  const n = (r: PromiseSettledResult<{ count: number | null }>) =>
    (r.status === "fulfilled" ? r.value.count ?? 0 : 0).toLocaleString();

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Newsletter"
        description="Schedule weekly broadcasts, manage Week-NN asset folders, and track opens, clicks, and coupon usage."
      />
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Campaigns" value={n(campaigns)} />
        <StatCard label="Scheduled" value={n(scheduled)} />
        <StatCard label="Assets" value={n(assets)} />
        <StatCard label="Send time" value="Fri 9:00 AM" hint="America/New_York" />
      </section>
      <Panel title="Build status">
        <Roadmap
          items={[
            { label: "Campaigns + weekly asset folders (newsletter-assets bucket)", done: true },
            { label: "Open / click / coupon-usage event tracking + rollups", done: true },
            { label: "Active-coupon feed (v_active_coupons) for the builder", done: true },
            { label: "Friday 9:00 AM scheduled send registered", done: true },
            { label: "Block-based compose UI + asset uploader" },
            { label: "Resend broadcast send + webhook ingestion route" },
            { label: "A/B subject testing + segment targeting UI" },
          ]}
        />
      </Panel>
    </div>
  );
}

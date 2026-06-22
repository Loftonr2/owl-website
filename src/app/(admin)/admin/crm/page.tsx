import { pageMetadata } from "@/lib/seo/metadata";
import { requireRole } from "@/lib/auth/roles";
import { supabaseServer } from "@/lib/clients/supabase-server";
import { SectionHeader, StatCard, Panel, Roadmap } from "@/components/admin/section";

export const metadata = pageMetadata({ title: "CRM", path: "/admin/crm", noIndex: true });
export const dynamic = "force-dynamic";

export default async function CrmPage() {
  await requireRole("support");
  const supabase = await supabaseServer();
  const head = { count: "exact" as const, head: true };
  const [contacts, tags, segments, referrals] = await Promise.allSettled([
    supabase.from("crm_contacts").select("*", head),
    supabase.from("crm_tags").select("*", head),
    supabase.from("crm_segments").select("*", head),
    supabase.from("crm_referrals").select("*", head),
  ]);
  const n = (r: PromiseSettledResult<{ count: number | null }>) =>
    (r.status === "fulfilled" ? r.value.count ?? 0 : 0).toLocaleString();

  return (
    <div className="space-y-8">
      <SectionHeader
        title="CRM"
        description="Unified contacts across subscribers, customers, educators, affiliates, and leads — with tags, segments, engagement scoring, and referral tracking."
      />
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Contacts" value={n(contacts)} />
        <StatCard label="Tags" value={n(tags)} />
        <StatCard label="Segments" value={n(segments)} />
        <StatCard label="Referrals" value={n(referrals)} />
      </section>
      <Panel title="Build status">
        <Roadmap
          items={[
            { label: "crm_contacts unified people table + RLS", done: true },
            { label: "Tags, segments (static + dynamic), engagement events", done: true },
            { label: "Engagement score auto-recompute trigger", done: true },
            { label: "Referral tracking table", done: true },
            { label: "Contact list UI with filter/segment builder" },
            { label: "Beehiiv + Shopify + Stripe sync into contacts" },
            { label: "Purchase + download history join views on contact detail" },
          ]}
        />
      </Panel>
    </div>
  );
}

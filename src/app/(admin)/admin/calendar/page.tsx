import { pageMetadata } from "@/lib/seo/metadata";
import { requireRole } from "@/lib/auth/roles";
import { supabaseServer } from "@/lib/clients/supabase-server";
import { SectionHeader, StatCard, Panel, Roadmap } from "@/components/admin/section";

export const metadata = pageMetadata({ title: "Calendar", path: "/admin/calendar", noIndex: true });
export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  await requireRole("editor");
  const supabase = await supabaseServer();
  const head = { count: "exact" as const, head: true };
  const [events, upcoming] = await Promise.allSettled([
    supabase.from("calendar_events").select("*", head),
    supabase.from("calendar_events").select("*", head).gte("start_at", new Date().toISOString()),
  ]);
  const n = (r: PromiseSettledResult<{ count: number | null }>) =>
    (r.status === "fulfilled" ? r.value.count ?? 0 : 0).toLocaleString();

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Calendar"
        description="A single content calendar across blogs, newsletters, videos, promotions, holidays, and affiliate campaigns."
      />
      <section className="grid grid-cols-2 gap-4">
        <StatCard label="Total events" value={n(events)} />
        <StatCard label="Upcoming" value={n(upcoming)} />
      </section>
      <Panel title="Build status">
        <Roadmap
          items={[
            { label: "calendar_events table (typed + ref-linked) + RLS", done: true },
            { label: "Month / week calendar grid UI" },
            { label: "Auto-sync scheduled blog posts + newsletter sends onto calendar" },
            { label: "Holiday + affiliate-campaign seeding" },
          ]}
        />
      </Panel>
    </div>
  );
}

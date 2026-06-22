import { pageMetadata } from "@/lib/seo/metadata";
import { requireRole } from "@/lib/auth/roles";
import { supabaseServer } from "@/lib/clients/supabase-server";
import { SectionHeader, StatCard, Panel, Roadmap } from "@/components/admin/section";

export const metadata = pageMetadata({ title: "Downloads", path: "/admin/downloads", noIndex: true });
export const dynamic = "force-dynamic";

export default async function DownloadsPage() {
  await requireRole("support");
  const supabase = await supabaseServer();
  const head = { count: "exact" as const, head: true };
  const [all, curriculum, leadMagnets] = await Promise.allSettled([
    supabase.from("downloads").select("*", head),
    supabase.from("downloads").select("*", head).eq("resource_type", "curriculum_pdf"),
    supabase.from("lead_magnets").select("*", head),
  ]);
  const n = (r: PromiseSettledResult<{ count: number | null }>) =>
    (r.status === "fulfilled" ? r.value.count ?? 0 : 0).toLocaleString();

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Downloads"
        description="Curriculum PDF, printable, and lead-magnet download history — each event linked to a CRM contact when known."
      />
      <section className="grid grid-cols-3 gap-4">
        <StatCard label="Total downloads" value={n(all)} />
        <StatCard label="Curriculum PDFs" value={n(curriculum)} />
        <StatCard label="Lead magnets" value={n(leadMagnets)} />
      </section>
      <Panel title="Build status">
        <Roadmap
          items={[
            { label: "downloads + lead_magnets tables with counters", done: true },
            { label: "Contact-linked download history for CRM", done: true },
            { label: "Gated-download route (signed R2/Supabase URLs) logging events" },
            { label: "Download analytics by resource + age band" },
          ]}
        />
      </Panel>
    </div>
  );
}

import { pageMetadata } from "@/lib/seo/metadata";
import { requireRole } from "@/lib/auth/roles";
import { supabaseServer } from "@/lib/clients/supabase-server";
import { SectionHeader, StatCard, Panel, Roadmap } from "@/components/admin/section";

export const metadata = pageMetadata({ title: "Blog", path: "/admin/blog", noIndex: true });
export const dynamic = "force-dynamic";

export default async function BlogPage() {
  await requireRole("editor");
  const supabase = await supabaseServer();
  const head = { count: "exact" as const, head: true };
  const [drafts, scheduled, published] = await Promise.allSettled([
    supabase.from("blog_posts").select("*", head).eq("status", "draft"),
    supabase.from("blog_posts").select("*", head).eq("status", "scheduled"),
    supabase.from("blog_posts").select("*", head).eq("status", "published"),
  ]);
  const n = (r: PromiseSettledResult<{ count: number | null }>) =>
    (r.status === "fulfilled" ? r.value.count ?? 0 : 0).toLocaleString();

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Blog"
        description="CMS-style management with draft, scheduled, and published states. Posts link to newsletters, affiliate products, OWL products, and lead magnets."
      />
      <section className="grid grid-cols-3 gap-4">
        <StatCard label="Draft" value={n(drafts)} />
        <StatCard label="Scheduled" value={n(scheduled)} />
        <StatCard label="Published" value={n(published)} />
      </section>
      <Panel title="Build status">
        <Roadmap
          items={[
            { label: "blog_posts status workflow (draft/scheduled/published/archived)", done: true },
            { label: "Relationship graph: newsletter, affiliate, OWL product, lead magnet", done: true },
            { label: "Sanity mirror for fast admin joins", done: true },
            { label: "List + editor UI (Portable Text) with SEO panel" },
            { label: "Schedule → auto-publish via Sanity webhook → revalidate" },
          ]}
        />
      </Panel>
    </div>
  );
}

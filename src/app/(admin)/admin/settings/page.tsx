import { pageMetadata } from "@/lib/seo/metadata";
import { requireRole } from "@/lib/auth/roles";
import { supabaseServer } from "@/lib/clients/supabase-server";
import { SectionHeader, StatCard, Panel, Roadmap } from "@/components/admin/section";

export const metadata = pageMetadata({ title: "Settings", path: "/admin/settings", noIndex: true });
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  await requireRole("admin");
  const supabase = await supabaseServer();
  const head = { count: "exact" as const, head: true };
  const [staff, jobs, flags] = await Promise.allSettled([
    supabase.from("profiles").select("*", head).in("role", ["support", "editor", "admin", "owner"]),
    supabase.from("scheduled_jobs").select("*", head),
    supabase.from("feature_flags").select("*", head),
  ]);
  const n = (r: PromiseSettledResult<{ count: number | null }>) =>
    (r.status === "fulfilled" ? r.value.count ?? 0 : 0).toLocaleString();

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Settings"
        description="Role-based user management, scheduled jobs, integrations, and feature flags. Admin + owner only."
      />
      <section className="grid grid-cols-3 gap-4">
        <StatCard label="Staff users" value={n(staff)} />
        <StatCard label="Scheduled jobs" value={n(jobs)} />
        <StatCard label="Feature flags" value={n(flags)} />
      </section>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Roles">
          <p className="text-sm text-owl-mist">
            Owner · Administrator · Editor · Support — enforced in Postgres RLS via
            <code> app_has_min_role()</code>. Every admin mutation is written to
            <code> audit_log</code>.
          </p>
        </Panel>
        <Panel title="Build status">
          <Roadmap
            items={[
              { label: "RBAC (4 staff roles) + audit logging", done: true },
              { label: "app_settings + feature_flags + scheduled_jobs", done: true },
              { label: "User invite + role assignment UI" },
              { label: "Integration-key status panel (read-only)" },
            ]}
          />
        </Panel>
      </div>
    </div>
  );
}

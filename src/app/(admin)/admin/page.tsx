import { pageMetadata } from "@/lib/seo/metadata";
import { getDashboardStats } from "@/lib/admin/stats";
import { SectionHeader, StatCard, Panel, Roadmap } from "@/components/admin/section";

export const metadata = pageMetadata({
  title: "Admin Dashboard",
  path: "/admin",
  noIndex: true,
});

export const dynamic = "force-dynamic";

/**
 * Command Center home — live KPI tiles backed by the new schema, plus the
 * activity-feed roadmap. Numbers read through RLS as the signed-in staff user.
 */
export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Dashboard"
        description="A single cockpit across CRM, newsletter, blog, affiliate, sales, downloads, and analytics."
      />

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="CRM contacts" value={stats.contacts.toLocaleString()} />
        <StatCard label="Active subscribers" value={stats.subscribers.toLocaleString()} />
        <StatCard label="Newsletter campaigns" value={stats.campaigns.toLocaleString()} />
        <StatCard label="Active coupons" value={stats.activeCoupons.toLocaleString()} />
        <StatCard label="Affiliate partners" value={stats.partners.toLocaleString()} />
        <StatCard label="Orders" value={stats.orders.toLocaleString()} />
        <StatCard label="Downloads" value={stats.downloads.toLocaleString()} />
        <StatCard label="Published posts" value={stats.publishedPosts.toLocaleString()} />
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="This week in OWL">
          <p className="text-sm text-owl-mist">
            Recent publishes, scheduled sends, new orders, and automation runs will
            stream here from the <code>automation_runs</code> and event tables.
          </p>
          <div className="mt-4">
            <Roadmap
              items={[
                { label: "Schema + RLS for all 10 sections", done: true },
                { label: "Role-based admin shell + audit logging", done: true },
                { label: "Live KPI tiles", done: true },
                { label: "Activity feed from automation_runs + events" },
                { label: "GA4 + Resend + YouTube metric sync into analytics_daily" },
              ]}
            />
          </div>
        </Panel>

        <Panel title="Scheduled automations">
          <Roadmap
            items={[
              { label: "Friday 9:00 AM ET — send scheduled newsletter", done: true },
              { label: "Monday 7:00 AM ET — executive report to Larissa + Rick", done: true },
              { label: "Nightly 3:00 AM ET — affiliate coupon harvest", done: true },
            ]}
          />
          <p className="mt-4 text-xs text-owl-mist">
            Registered in <code>scheduled_jobs</code>. Wire to Vercel Cron or n8n —
            see the deployment guide.
          </p>
        </Panel>
      </div>
    </div>
  );
}

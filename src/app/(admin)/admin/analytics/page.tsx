import { pageMetadata } from "@/lib/seo/metadata";
import { requireRole } from "@/lib/auth/roles";
import { SectionHeader, Panel, Roadmap } from "@/components/admin/section";

export const metadata = pageMetadata({ title: "Analytics", path: "/admin/analytics", noIndex: true });
export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  await requireRole("support");

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Analytics"
        description="Traffic, subscribers, store + affiliate revenue, downloads, teacher accounts, and top content — aggregated daily into analytics_daily."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Widgets (planned)">
          <Roadmap
            items={[
              { label: "Traffic (GA4)" },
              { label: "Subscriber growth (Resend / Beehiiv)" },
              { label: "Store revenue" },
              { label: "Affiliate revenue" },
              { label: "Downloads" },
              { label: "Teacher / educator accounts" },
              { label: "Top content" },
            ]}
          />
        </Panel>
        <Panel title="Build status">
          <Roadmap
            items={[
              { label: "analytics_daily generic metric store + RLS", done: true },
              { label: "Revenue rollup views available", done: true },
              { label: "GA4 + Resend + YouTube daily sync jobs" },
              { label: "Dashboard widgets with sparklines" },
            ]}
          />
        </Panel>
      </div>
    </div>
  );
}

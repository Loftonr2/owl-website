import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata({
  title: "Admin Dashboard",
  path: "/admin",
  noIndex: true,
});

/**
 * Admin dashboard root. Currently a stub.
 * Phase 2 wires the KPI tiles + this-week feed described in
 * ADMIN_CRM_REQUIREMENTS.md §2.
 */
export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <header>
        <h2 className="font-display text-2xl font-semibold text-owl-ink">
          Dashboard
        </h2>
        <p className="mt-1 text-sm text-owl-mist">
          Phase 1 scaffold. KPI tiles + activity feed land in Phase 2.
        </p>
      </header>

      <section
        className="rounded-owl-card border border-owl-cream-deep bg-white p-6 text-sm text-owl-mist"
        aria-label="Coming soon"
      >
        <p className="font-semibold text-owl-ink">Coming in Phase 2</p>
        <ul className="mt-3 list-inside list-disc space-y-1">
          <li>Newsletter subscribers + 7-day delta (Beehiiv API)</li>
          <li>Newsletter open rate (last 4 sends)</li>
          <li>YouTube subscribers + 7-day delta</li>
          <li>Etsy + Shopify revenue (rolling 30 days)</li>
          <li>Printable downloads (last 7 days)</li>
          <li>Top blog post (last 7 days)</li>
          <li>Active educator leads + active grant applications</li>
          <li>This-week-in-OWL feed (publishes, sends, orders, automation logs)</li>
        </ul>
      </section>
    </div>
  );
}

import Link from "next/link";
import { pageMetadata } from "@/lib/seo/metadata";
import { requireAuth } from "@/lib/auth/roles";
import { supabaseServer } from "@/lib/clients/supabase-server";
import { SectionHeader, StatCard, Panel, Roadmap } from "@/components/admin/section";

export const metadata = pageMetadata({ title: "My Account", path: "/portal", noIndex: true });
export const dynamic = "force-dynamic";

export default async function CustomerPortalPage() {
  const profile = await requireAuth("/portal");
  const supabase = await supabaseServer();
  const head = { count: "exact" as const, head: true };

  const [orders, downloads, wishlist, loyalty] = await Promise.allSettled([
    supabase.from("orders").select("*", head).eq("profile_id", profile.id),
    supabase.from("entitlements").select("*", head).eq("profile_id", profile.id).eq("revoked", false),
    supabase.from("wishlist_items").select("*", head).eq("profile_id", profile.id),
    supabase.from("loyalty_accounts").select("points").eq("profile_id", profile.id).maybeSingle(),
  ]);
  const n = (r: PromiseSettledResult<{ count: number | null }>) =>
    (r.status === "fulfilled" ? r.value.count ?? 0 : 0).toLocaleString();
  const points =
    loyalty.status === "fulfilled"
      ? ((loyalty.value.data as { points: number } | null)?.points ?? 0)
      : 0;

  return (
    <div className="space-y-8">
      <SectionHeader
        title={`Welcome${profile.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}`}
        description="Your orders, downloads, favorites, and rewards — all in one place."
      />

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Orders" value={n(orders)} />
        <StatCard label="Purchased downloads" value={n(downloads)} />
        <StatCard label="Wishlist" value={n(wishlist)} />
        <StatCard label="Reward points" value={points.toLocaleString()} />
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Orders & shipping">
          <Roadmap
            items={[
              { label: "Order history (linked to your account)", done: true },
              { label: "Shipment tracking" },
              { label: "Reorder + invoice download" },
            ]}
          />
        </Panel>
        <Panel title="Digital library">
          <p className="text-sm text-owl-mist">
            Instant, self-service downloads for everything you&apos;ve purchased —
            printables, coloring books, and curriculum — powered by your
            entitlements (no staff needed).
          </p>
          <div className="mt-3">
            <Roadmap
              items={[
                { label: "Entitlement records grant access automatically", done: true },
                { label: "Signed download links + per-file history" },
              ]}
            />
          </div>
        </Panel>
        <Panel title="Saved & preferences">
          <Roadmap
            items={[
              { label: "Wishlist / favorites", done: true },
              { label: "Saved billing + shipping addresses", done: true },
              { label: "Newsletter preferences" },
            ]}
          />
        </Panel>
        <Panel title="Rewards & referrals">
          <Roadmap
            items={[
              { label: "Loyalty points + tier", done: true },
              { label: "Referral dashboard" },
              { label: "Subscription / membership management" },
            ]}
          />
        </Panel>
      </div>

      <p className="text-sm text-owl-mist">
        Need to update your details?{" "}
        <Link href="/portal/settings" className="text-owl-teal hover:text-owl-teal-deep">
          Account settings
        </Link>
      </p>
    </div>
  );
}

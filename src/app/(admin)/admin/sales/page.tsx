import { pageMetadata } from "@/lib/seo/metadata";
import { requireRole } from "@/lib/auth/roles";
import { supabaseServer } from "@/lib/clients/supabase-server";
import { SectionHeader, StatCard, Panel, Roadmap } from "@/components/admin/section";

export const metadata = pageMetadata({ title: "Sales", path: "/admin/sales", noIndex: true });
export const dynamic = "force-dynamic";

function dollars(cents: number) {
  return (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function shortDateTime(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

interface RecentOrderRow {
  id: string;
  external_id: string;
  customer_email: string | null;
  total_cents: number | null;
  status: string | null;
  placed_at: string | null;
  confirmation_email_sent_at: string | null;
  confirmation_email_message_id: string | null;
  confirmation_email_error: string | null;
  confirmation_email_attempts: number | null;
}

function EmailStatusBadge({ order }: { order: RecentOrderRow }) {
  if (order.confirmation_email_sent_at && !order.confirmation_email_error) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-owl-teal/10 px-2 py-0.5 text-xs font-medium text-owl-teal-deep">
        ✓ Sent {shortDateTime(order.confirmation_email_sent_at)}
      </span>
    );
  }
  if (order.confirmation_email_error) {
    return (
      <span
        className="inline-flex items-center gap-1 rounded-full bg-owl-error/10 px-2 py-0.5 text-xs font-medium text-owl-error"
        title={order.confirmation_email_error}
      >
        ⚠ Failed
        {order.confirmation_email_attempts ? ` (×${order.confirmation_email_attempts})` : ""}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-owl-mist/15 px-2 py-0.5 text-xs font-medium text-owl-mist">
      • Not sent
    </span>
  );
}

export default async function SalesPage() {
  await requireRole("support");
  const supabase = await supabaseServer();
  const head = { count: "exact" as const, head: true };

  const [orders, store, affiliate, recent] = await Promise.allSettled([
    supabase.from("orders").select("*", head),
    supabase.from("orders").select("total_cents").in("status", ["paid", "fulfilled"]),
    supabase.from("affiliate_revenue").select("commission_cents"),
    supabase
      .from("orders")
      .select(
        "id, external_id, customer_email, total_cents, status, placed_at, confirmation_email_sent_at, confirmation_email_message_id, confirmation_email_error, confirmation_email_attempts"
      )
      .order("placed_at", { ascending: false })
      .limit(15),
  ]);

  const orderCount = orders.status === "fulfilled" ? (orders.value.count ?? 0) : 0;
  const storeCents =
    store.status === "fulfilled"
      ? (store.value.data ?? []).reduce(
          (s: number, r: { total_cents: number | null }) => s + (r.total_cents ?? 0),
          0
        )
      : 0;
  const affiliateCents =
    affiliate.status === "fulfilled"
      ? (affiliate.value.data ?? []).reduce(
          (s: number, r: { commission_cents: number | null }) => s + (r.commission_cents ?? 0),
          0
        )
      : 0;

  const recentOrders: RecentOrderRow[] =
    recent.status === "fulfilled" ? ((recent.value.data as RecentOrderRow[]) ?? []) : [];

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Sales"
        description="Store sales, affiliate commissions, and combined revenue. Top products and top coupons roll up from normalized order items."
      />
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Orders" value={orderCount.toLocaleString()} />
        <StatCard label="Store revenue" value={dollars(storeCents)} hint="paid + fulfilled" />
        <StatCard label="Affiliate revenue" value={dollars(affiliateCents)} hint="commissions" />
        <StatCard label="Combined" value={dollars(storeCents + affiliateCents)} />
      </section>

      <Panel title="Recent orders — confirmation email status">
        {recentOrders.length === 0 ? (
          <p className="text-sm text-owl-mist">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-owl-cream-deep text-xs uppercase tracking-wide text-owl-mist">
                  <th className="py-2 pr-4 font-medium">Placed</th>
                  <th className="py-2 pr-4 font-medium">Customer</th>
                  <th className="py-2 pr-4 font-medium">Total</th>
                  <th className="py-2 pr-4 font-medium">Order</th>
                  <th className="py-2 pr-4 font-medium">Confirmation email</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o.id} className="border-b border-owl-cream-deep/50 text-owl-ink">
                    <td className="py-2 pr-4 text-owl-mist">{shortDateTime(o.placed_at)}</td>
                    <td className="py-2 pr-4">{o.customer_email ?? "—"}</td>
                    <td className="py-2 pr-4">{dollars(o.total_cents ?? 0)}</td>
                    <td className="py-2 pr-4 font-mono text-xs text-owl-mist">
                      {o.external_id?.slice(-10) ?? "—"}
                    </td>
                    <td className="py-2 pr-4">
                      <EmailStatusBadge order={o} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="mt-4 text-xs text-owl-mist">
          Emails send automatically on confirmed payment (idempotent across the PayPal capture
          route + webhook). TODO: per-row resend button — for now use{" "}
          <code className="rounded bg-owl-cream px-1">/api/admin/test-order-email</code> to send a
          sample to yourself.
        </p>
      </Panel>

      <Panel title="Build status">
        <Roadmap
          items={[
            { label: "order_items normalized for product-level reporting", done: true },
            { label: "Coupon attribution on orders + redemptions", done: true },
            { label: "Revenue rollup views (store / affiliate / combined daily)", done: true },
            { label: "Automatic order confirmation emails (idempotent)", done: true },
            { label: "Charts + date-range filter UI" },
            { label: "Top products / top coupons leaderboards" },
          ]}
        />
      </Panel>
    </div>
  );
}

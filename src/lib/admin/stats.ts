import "server-only";
import { supabaseServer } from "@/lib/clients/supabase-server";

type CountResult = { count: number | null };

const num = (r: PromiseSettledResult<CountResult>): number =>
  r.status === "fulfilled" ? (r.value.count ?? 0) : 0;

/**
 * Cheap exact-count probes for the dashboard KPI tiles. RLS-scoped to the
 * signed-in staff user; failures degrade to 0 so the dashboard never throws.
 */
export async function getDashboardStats() {
  const supabase = await supabaseServer();
  const head = { count: "exact" as const, head: true };

  const results = await Promise.allSettled([
    supabase.from("crm_contacts").select("*", head),
    supabase.from("newsletter_subscribers").select("*", head).eq("status", "active"),
    supabase.from("newsletter_campaigns").select("*", head),
    supabase.from("coupons").select("*", head).eq("status", "active"),
    supabase.from("affiliate_partners").select("*", head),
    supabase.from("orders").select("*", head),
    supabase.from("downloads").select("*", head),
    supabase.from("blog_posts").select("*", head).eq("status", "published"),
  ]);

  return {
    contacts: num(results[0]),
    subscribers: num(results[1]),
    campaigns: num(results[2]),
    activeCoupons: num(results[3]),
    partners: num(results[4]),
    orders: num(results[5]),
    downloads: num(results[6]),
    publishedPosts: num(results[7]),
  };
}

import "server-only";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/clients/supabase-server";
import {
  hasMinRole,
  type AppRole,
  type SessionProfile,
} from "@/lib/auth/role-utils";

/**
 * OWL Command Center — server-side auth + RBAC guards.
 *
 * Pure role constants/helpers live in ./role-utils (client-safe). This module
 * adds the server-only session lookups + redirect guards. Mirrors the Postgres
 * role hierarchy in supabase/migrations/0002 + 0011.
 */

// Re-export the client-safe utilities so existing server imports keep working.
export {
  APP_ROLES,
  ROLE_RANK,
  ROLE_LABEL,
  STAFF_ROLES,
  rankOf,
  hasMinRole,
  isStaffRole,
  roleHome,
} from "@/lib/auth/role-utils";
export type { AppRole, SessionProfile } from "@/lib/auth/role-utils";

const supabaseConfigured = () =>
  Boolean(
    (process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL) &&
      (process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  );

/**
 * Resolve the signed-in user's profile (id, email, role, full_name).
 * Returns null when no session exists.
 */
export async function getSessionProfile(): Promise<SessionProfile | null> {
  if (!supabaseConfigured()) return null;

  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("id, email, role, full_name")
    .eq("id", user.id)
    .single();

  if (!data) {
    return { id: user.id, email: user.email ?? "", role: "customer", full_name: null };
  }
  return data as SessionProfile;
}

/**
 * Hard guard for the admin area. Redirects anonymous users to /login and
 * non-staff users to a not-authorized state. Returns the profile on success.
 *
 * Soft-passes when Supabase env vars are absent (local pre-provisioning).
 */
export async function requireStaff(): Promise<SessionProfile> {
  if (!supabaseConfigured()) {
    return { id: "dev", email: "dev@local", role: "owner", full_name: "Local Dev" };
  }

  const profile = await getSessionProfile();
  if (!profile) redirect("/login?next=/admin");
  if (!hasMinRole(profile.role, "support")) redirect("/login?error=not_authorized");
  return profile;
}

/**
 * Guard a section that needs more than the staff baseline.
 * Bounces to the dashboard with a forbidden flag if under-privileged.
 */
export async function requireRole(min: AppRole): Promise<SessionProfile> {
  const profile = await requireStaff();
  if (!hasMinRole(profile.role, min)) redirect("/admin?error=forbidden");
  return profile;
}

/**
 * Guard for any authenticated account (the customer/teacher portals).
 * Redirects anonymous users to /login with a return path.
 */
export async function requireAuth(next = "/portal"): Promise<SessionProfile> {
  if (!supabaseConfigured()) {
    return { id: "dev", email: "dev@local", role: "owner", full_name: "Local Dev" };
  }
  const profile = await getSessionProfile();
  if (!profile) redirect(`/login?next=${encodeURIComponent(next)}`);
  return profile;
}

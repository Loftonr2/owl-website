/**
 * Client-safe role utilities (no server-only imports). Shared by both server
 * guards (src/lib/auth/roles.ts) and client components (sidebar, account nav).
 *
 * Keep in sync with the Postgres role hierarchy in
 * supabase/migrations/0002 + 0011.
 */

export const APP_ROLES = [
  "customer",
  "teacher",
  "affiliate",
  "support",
  "editor",
  "marketing_manager",
  "admin",
  "owner",
] as const;

export type AppRole = (typeof APP_ROLES)[number];

export const ROLE_RANK: Record<AppRole, number> = {
  customer: 5,
  teacher: 15,
  affiliate: 18,
  support: 20,
  editor: 30,
  marketing_manager: 35,
  admin: 40,
  owner: 50,
};

export const ROLE_LABEL: Record<AppRole, string> = {
  customer: "Customer",
  teacher: "Teacher",
  affiliate: "Affiliate Partner",
  support: "Support Staff",
  editor: "Editor",
  marketing_manager: "Marketing Manager",
  admin: "Administrator",
  owner: "Owner",
};

export const STAFF_ROLES: AppRole[] = [
  "support",
  "editor",
  "marketing_manager",
  "admin",
  "owner",
];

export type SessionProfile = {
  id: string;
  email: string;
  role: AppRole;
  full_name: string | null;
};

export function rankOf(role?: string | null): number {
  return role && role in ROLE_RANK ? ROLE_RANK[role as AppRole] : -1;
}

export function hasMinRole(role: string | null | undefined, min: AppRole): boolean {
  return rankOf(role) >= ROLE_RANK[min];
}

export function isStaffRole(role: string | null | undefined): boolean {
  return rankOf(role) >= ROLE_RANK.support;
}

/**
 * Role-appropriate landing path:
 *   staff → /admin · teacher → /portal/teacher · everyone else → /portal
 */
export function roleHome(role: string | null | undefined): string {
  if (isStaffRole(role)) return "/admin";
  if (role === "teacher") return "/portal/teacher";
  return "/portal";
}

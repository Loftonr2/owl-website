import type { ReactNode } from "react";
import { requireStaff } from "@/lib/auth/roles";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminTopbar } from "@/components/admin/topbar";

/**
 * Admin layout — auth + RBAC guarded.
 *
 * requireStaff() bounces anonymous users to /login and non-staff users to a
 * not-authorized state, then returns the signed-in profile. The sidebar nav is
 * filtered to the sections the user's role can access.
 */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const profile = await requireStaff();

  return (
    <div className="min-h-screen bg-owl-cream">
      <AdminSidebar role={profile.role} />
      <div className="md:ml-64">
        <AdminTopbar profile={profile} />
        <main className="p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}

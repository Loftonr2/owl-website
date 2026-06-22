import Link from "next/link";
import { pageMetadata } from "@/lib/seo/metadata";
import { requireAuth, ROLE_LABEL, type AppRole } from "@/lib/auth/roles";
import { supabaseServer } from "@/lib/clients/supabase-server";
import { SectionHeader, Panel } from "@/components/admin/section";
import { updateProfile, requestEducatorAccess } from "./actions";

export const metadata = pageMetadata({ title: "Account settings", path: "/portal/settings", noIndex: true });
export const dynamic = "force-dynamic";

const inputClass =
  "mt-2 block w-full rounded-owl-btn border border-owl-mist/30 bg-white px-4 py-2.5 text-owl-ink placeholder:text-owl-mist/60 focus:border-owl-teal focus:outline-none focus:ring-2 focus:ring-owl-teal/30";

export default async function PortalSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; requested?: string; error?: string }>;
}) {
  const profile = await requireAuth("/portal/settings");
  const sp = await searchParams;

  const supabase = await supabaseServer();
  const { data: application } = await supabase
    .from("teacher_applications")
    .select("status")
    .eq("profile_id", profile.id)
    .order("requested_at", { ascending: false })
    .maybeSingle();

  const isCustomer = profile.role === "customer";
  const canRequestEducator = isCustomer && application?.status !== "pending";

  return (
    <div className="space-y-8">
      <SectionHeader title="Account settings" description="Manage your profile, password, and access." />

      {sp.saved === "1" && (
        <p className="rounded-owl-btn bg-owl-teal/10 px-4 py-2 text-sm text-owl-teal-deep">✓ Profile updated.</p>
      )}
      {sp.requested === "1" && (
        <p className="rounded-owl-btn bg-owl-teal/10 px-4 py-2 text-sm text-owl-teal-deep">
          ✓ Educator access requested — we&apos;ll review and email you.
        </p>
      )}

      <Panel title="Profile">
        <form action={updateProfile} className="max-w-md space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-owl-ink">Full name</span>
            <input name="full_name" type="text" defaultValue={profile.full_name ?? ""} className={inputClass} />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-owl-ink">Email</span>
            <input type="email" value={profile.email} disabled className={`${inputClass} opacity-60`} />
            <span className="mt-1 block text-xs text-owl-mist">
              Account role: {ROLE_LABEL[profile.role as AppRole] ?? profile.role}
            </span>
          </label>
          <button
            type="submit"
            className="rounded-owl-btn bg-owl-teal px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-owl-teal-deep"
          >
            Save changes
          </button>
        </form>
      </Panel>

      <Panel title="Password">
        <p className="text-sm text-owl-mist">
          We&apos;ll email you a secure link to set a new password.
        </p>
        <Link
          href="/forgot-password"
          className="mt-3 inline-block rounded-owl-btn border border-owl-cream-deep px-4 py-2 text-sm font-medium text-owl-ink transition-colors hover:bg-owl-cream"
        >
          Reset password
        </Link>
      </Panel>

      {canRequestEducator && (
        <Panel title="Request educator access">
          <p className="text-sm text-owl-mist">
            Are you a teacher? Request access to classroom resources — an OWL admin
            will review your request.
          </p>
          <form action={requestEducatorAccess} className="mt-4 max-w-md space-y-3">
            <label className="block">
              <span className="text-sm font-medium text-owl-ink">School / organization</span>
              <input name="school" type="text" className={inputClass} />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-owl-ink">Your role</span>
              <input name="role_title" type="text" placeholder="e.g. PreK Teacher" className={inputClass} />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-owl-ink">Anything else? (optional)</span>
              <textarea name="message" rows={3} className={inputClass} />
            </label>
            <button
              type="submit"
              className="rounded-owl-btn bg-owl-teal px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-owl-teal-deep"
            >
              Request access
            </button>
          </form>
        </Panel>
      )}

      {application?.status === "pending" && (
        <Panel title="Educator access">
          <p className="text-sm text-owl-ink">Your educator request is pending review.</p>
        </Panel>
      )}
    </div>
  );
}

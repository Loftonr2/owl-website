import Link from "next/link";
import { pageMetadata } from "@/lib/seo/metadata";
import { requireAuth } from "@/lib/auth/roles";
import { supabaseServer } from "@/lib/clients/supabase-server";
import { SectionHeader, Panel, Roadmap } from "@/components/admin/section";

export const metadata = pageMetadata({ title: "Educator Portal", path: "/portal/teacher", noIndex: true });
export const dynamic = "force-dynamic";

export default async function TeacherPortalPage() {
  const profile = await requireAuth("/portal/teacher");
  const isTeacher = profile.role === "teacher" || profile.role === "owner" || profile.role === "admin";

  const supabase = await supabaseServer();
  const { data: application } = await supabase
    .from("teacher_applications")
    .select("status, requested_at")
    .eq("profile_id", profile.id)
    .order("requested_at", { ascending: false })
    .maybeSingle();

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Educator Portal"
        description="Classroom-ready lesson plans, worksheets, and multicultural resources — gated to approved educators by subscription level."
      />

      {!isTeacher && (
        <Panel title="Educator access">
          {application?.status === "pending" ? (
            <p className="text-sm text-owl-ink">
              Your educator request is <span className="font-semibold">pending review</span>.
              We&apos;ll email you when it&apos;s approved. In the meantime you have full
              customer access in your{" "}
              <Link href="/portal" className="text-owl-teal hover:text-owl-teal-deep">account</Link>.
            </p>
          ) : application?.status === "rejected" ? (
            <p className="text-sm text-owl-ink">
              Your educator request wasn&apos;t approved. Contact us if you think this is a
              mistake.
            </p>
          ) : (
            <p className="text-sm text-owl-ink">
              You don&apos;t have educator access yet. Request it from your{" "}
              <Link href="/portal/settings" className="text-owl-teal hover:text-owl-teal-deep">
                account settings
              </Link>
              , or sign up as an educator.
            </p>
          )}
        </Panel>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Curriculum & lessons">
          <Roadmap
            items={[
              { label: "Curriculum lessons readable by approved educators (RLS)", done: true },
              { label: "Classroom-ready lesson plans + pacing" },
              { label: "Printable worksheets + activity packs" },
              { label: "Student engagement materials" },
            ]}
          />
        </Panel>
        <Panel title="Resources & development">
          <Roadmap
            items={[
              { label: "Multicultural + seasonal classroom resources" },
              { label: "Professional development content" },
              { label: "Educator-exclusive newsletters" },
            ]}
          />
        </Panel>
        <Panel title="Licensing & subscription">
          <Roadmap
            items={[
              { label: "School / district licensing information" },
              { label: "Educator subscription management (tiered access)" },
            ]}
          />
        </Panel>
        <Panel title="Account">
          <p className="text-sm text-owl-mist">
            Teachers are segmented separately in the CRM and only ever see
            educator-approved resources for their subscription level.
          </p>
        </Panel>
      </div>
    </div>
  );
}

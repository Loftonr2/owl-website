"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/roles";
import { runCronJob } from "@/lib/cron/runner";
import { CRON_JOBS } from "@/lib/cron/jobs";

/**
 * Manually trigger a cron job from the admin panel. Gated to admin/owner via
 * requireRole("admin") — this is session-authenticated, so it does NOT use
 * CRON_SECRET. The run is logged with triggered_by = 'manual' + the actor.
 */
export async function runJobNow(formData: FormData) {
  const profile = await requireRole("admin");

  const jobKey = String(formData.get("jobKey") ?? "");
  const job = CRON_JOBS[jobKey];
  if (!job) return;

  await runCronJob(jobKey, job.fn, { triggeredBy: "manual", actor: profile.id });
  revalidatePath("/admin/automations");
}

import "server-only";
import { NextResponse } from "next/server";
import { isCronAuthorized, unauthorizedResponse } from "@/lib/cron/auth";
import { runCronJob } from "@/lib/cron/runner";
import { CRON_JOBS } from "@/lib/cron/jobs";

/**
 * Build a secure GET/POST handler for a cron job. Rejects unauthorized requests
 * with 401, runs the job through the logging runner, and returns a clear JSON
 * status. 200 on success/skip, 500 on failure. No secrets are ever returned.
 */
export function makeCronRoute(jobKey: string) {
  const job = CRON_JOBS[jobKey];

  return async function handle(request: Request) {
    if (!isCronAuthorized(request)) return unauthorizedResponse();
    if (!job) {
      return NextResponse.json({ ok: false, error: `Unknown job: ${jobKey}` }, { status: 404 });
    }
    const result = await runCronJob(jobKey, job.fn, { triggeredBy: "cron" });
    return NextResponse.json(result, { status: result.ok ? 200 : 500 });
  };
}

import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabaseServiceRole } from "@/lib/clients/supabase-server";

/**
 * Cron job runner. Wraps each job with structured logging to cron_job_logs and
 * updates scheduled_jobs.last_run_at / last_status. Uses the service-role client
 * (RLS bypassed) so jobs can read/write across the schema. All errors are caught
 * and recorded — a job never throws out of here.
 */

// The service-role client is typed loosely (Database defaults to any).
export type ServiceClient = SupabaseClient;

export type CronContext = {
  triggeredBy: "cron" | "manual";
  actor?: string | null;
};

export type JobResult = {
  status: "success" | "skipped";
  summary: string;
  detail?: Record<string, unknown>;
};

export type JobFn = (db: ServiceClient, ctx: CronContext) => Promise<JobResult>;

export type RunOutcome = {
  ok: boolean;
  job: string;
  status: "success" | "skipped" | "failed";
  summary?: string;
  detail?: Record<string, unknown>;
  error?: string;
  logId?: string;
  durationMs: number;
};

export async function runCronJob(
  jobKey: string,
  fn: JobFn,
  ctx: CronContext
): Promise<RunOutcome> {
  const db = supabaseServiceRole() as unknown as ServiceClient;
  const startedAt = Date.now();

  let logId: string | undefined;
  try {
    const { data } = await db
      .from("cron_job_logs")
      .insert({
        job_key: jobKey,
        status: "running",
        triggered_by: ctx.triggeredBy,
        actor: ctx.actor ?? null,
      })
      .select("id")
      .single();
    logId = (data as { id?: string } | null)?.id;
  } catch {
    // Logging is best-effort; continue running the job even if the log insert fails.
  }

  try {
    const result = await fn(db, ctx);
    const durationMs = Date.now() - startedAt;
    const finishedAt = new Date().toISOString();

    if (logId) {
      await db
        .from("cron_job_logs")
        .update({
          status: result.status,
          finished_at: finishedAt,
          duration_ms: durationMs,
          detail: { summary: result.summary, ...(result.detail ?? {}) },
        })
        .eq("id", logId);
    }
    await db
      .from("scheduled_jobs")
      .update({ last_run_at: finishedAt, last_status: result.status })
      .eq("key", jobKey);

    return {
      ok: true,
      job: jobKey,
      status: result.status,
      summary: result.summary,
      detail: result.detail ?? {},
      logId,
      durationMs,
    };
  } catch (err) {
    const durationMs = Date.now() - startedAt;
    const finishedAt = new Date().toISOString();
    const message = err instanceof Error ? err.message : String(err);

    if (logId) {
      await db
        .from("cron_job_logs")
        .update({
          status: "failed",
          finished_at: finishedAt,
          duration_ms: durationMs,
          error: message.slice(0, 2000),
        })
        .eq("id", logId);
    }
    await db
      .from("scheduled_jobs")
      .update({ last_run_at: finishedAt, last_status: "failed" })
      .eq("key", jobKey);

    return { ok: false, job: jobKey, status: "failed", error: message, logId, durationMs };
  }
}

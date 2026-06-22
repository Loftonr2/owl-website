import { pageMetadata } from "@/lib/seo/metadata";
import { requireRole } from "@/lib/auth/roles";
import { supabaseServer } from "@/lib/clients/supabase-server";
import { SectionHeader, Panel } from "@/components/admin/section";
import { listPartnerAdapters } from "@/lib/affiliates/adapters";
import { runJobNow } from "./actions";

export const metadata = pageMetadata({ title: "Automations", path: "/admin/automations", noIndex: true });
export const dynamic = "force-dynamic";

type Job = {
  key: string;
  name: string;
  schedule_label: string | null;
  cron: string;
  description: string | null;
  last_run_at: string | null;
  last_status: string | null;
  enabled: boolean;
};

type Log = {
  id: string;
  job_key: string;
  status: string;
  triggered_by: string;
  started_at: string;
  finished_at: string | null;
  duration_ms: number | null;
  detail: { summary?: string } | null;
  error: string | null;
};

function fmt(ts: string | null): string {
  if (!ts) return "—";
  return new Date(ts).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
}

function statusPill(status: string | null) {
  const map: Record<string, string> = {
    success: "bg-owl-teal/15 text-owl-teal-deep",
    skipped: "bg-owl-cream text-owl-ink/70",
    failed: "bg-owl-error/10 text-owl-error",
    running: "bg-amber-100 text-amber-700",
  };
  const cls = (status && map[status]) || "bg-owl-cream text-owl-mist";
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${cls}`}>
      {status ?? "never run"}
    </span>
  );
}

export default async function AutomationsPage() {
  await requireRole("admin");
  const supabase = await supabaseServer();

  const [{ data: jobsData }, { data: logsData }] = await Promise.all([
    supabase
      .from("scheduled_jobs")
      .select("key, name, schedule_label, cron, description, last_run_at, last_status, enabled")
      .order("schedule_label", { ascending: true }),
    supabase
      .from("cron_job_logs")
      .select("id, job_key, status, triggered_by, started_at, finished_at, duration_ms, detail, error")
      .order("started_at", { ascending: false })
      .limit(40),
  ]);

  const jobs = (jobsData ?? []) as Job[];
  const logs = (logsData ?? []) as Log[];
  const latestByJob = new Map<string, Log>();
  for (const log of logs) if (!latestByJob.has(log.job_key)) latestByJob.set(log.job_key, log);

  const partners = listPartnerAdapters().map((a) => ({
    name: a.name,
    network: a.network,
    ready: a.hasCredentials(),
    envVars: a.credentialEnvVars,
  }));

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Automations"
        description="Scheduled Vercel Cron jobs and their run history. Trigger any job manually — admin and owner only."
      />

      <Panel title="Scheduled jobs">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-owl-cream-deep text-left text-xs uppercase tracking-wider text-owl-mist">
                <th className="py-2 pr-4 font-medium">Job</th>
                <th className="py-2 pr-4 font-medium">Schedule</th>
                <th className="py-2 pr-4 font-medium">Last run</th>
                <th className="py-2 pr-4 font-medium">Status</th>
                <th className="py-2 pr-4 font-medium">Result</th>
                <th className="py-2 font-medium">Run</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => {
                const last = latestByJob.get(job.key);
                return (
                  <tr key={job.key} className="border-b border-owl-cream-deep/60 align-top">
                    <td className="py-3 pr-4">
                      <p className="font-medium text-owl-ink">{job.name}</p>
                      <p className="text-xs text-owl-mist">{job.description}</p>
                    </td>
                    <td className="py-3 pr-4 text-owl-ink/80">
                      {job.schedule_label ?? job.cron}
                      <span className="block text-[11px] text-owl-mist">{job.cron} UTC</span>
                    </td>
                    <td className="py-3 pr-4 text-owl-ink/80">{fmt(job.last_run_at)}</td>
                    <td className="py-3 pr-4">{statusPill(job.last_status)}</td>
                    <td className="py-3 pr-4 text-xs text-owl-mist">
                      {last?.error ? (
                        <span className="text-owl-error">{last.error}</span>
                      ) : (
                        last?.detail?.summary ?? "—"
                      )}
                    </td>
                    <td className="py-3">
                      <form action={runJobNow}>
                        <input type="hidden" name="jobKey" value={job.key} />
                        <button
                          type="submit"
                          className="rounded-owl-btn border border-owl-cream-deep px-3 py-1.5 text-xs font-medium text-owl-ink transition-colors hover:bg-owl-cream hover:text-owl-teal"
                        >
                          Run now
                        </button>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title="Recent runs">
        {logs.length === 0 ? (
          <p className="text-sm text-owl-mist">No runs yet. Trigger a job above or wait for the schedule.</p>
        ) : (
          <ul className="divide-y divide-owl-cream-deep/60 text-sm">
            {logs.slice(0, 15).map((log) => (
              <li key={log.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <span className="flex items-center gap-2">
                  {statusPill(log.status)}
                  <span className="font-medium text-owl-ink">{log.job_key}</span>
                  <span className="text-xs text-owl-mist">({log.triggered_by})</span>
                </span>
                <span className="text-xs text-owl-mist">
                  {fmt(log.started_at)}
                  {log.duration_ms != null ? ` · ${log.duration_ms}ms` : ""}
                </span>
                <span className="w-full text-xs text-owl-mist">
                  {log.error ? <span className="text-owl-error">{log.error}</span> : log.detail?.summary ?? ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel title="Affiliate integrations">
        <p className="mb-3 text-sm text-owl-mist">
          Coupon refresh + performance sync run per network. Programs without
          credentials are skipped automatically. Add credentials as env vars (or
          in the affiliate_credentials vault) to activate.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-owl-cream-deep text-left text-xs uppercase tracking-wider text-owl-mist">
                <th className="py-2 pr-4 font-medium">Partner</th>
                <th className="py-2 pr-4 font-medium">Network</th>
                <th className="py-2 pr-4 font-medium">Status</th>
                <th className="py-2 font-medium">Required env vars</th>
              </tr>
            </thead>
            <tbody>
              {partners.map((p) => (
                <tr key={p.name} className="border-b border-owl-cream-deep/60">
                  <td className="py-2 pr-4 font-medium text-owl-ink">{p.name}</td>
                  <td className="py-2 pr-4 text-owl-ink/80">{p.network}</td>
                  <td className="py-2 pr-4">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        p.ready ? "bg-owl-teal/15 text-owl-teal-deep" : "bg-owl-cream text-owl-mist"
                      }`}
                    >
                      {p.ready ? "ready" : "needs credentials"}
                    </span>
                  </td>
                  <td className="py-2 font-mono text-[11px] text-owl-mist">{p.envVars.join(", ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

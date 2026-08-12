"use client";

/**
 * /admin/reports — Weekly Report archive.
 *
 * Lists every generated executive_reports row (the canonical weekly report
 * object — the same one that gets emailed also gets saved here), lets an
 * admin open one to read the full HTML, see delivery status, and optionally
 * resend it. Includes a "Send test report" action that generates the current
 * period's report and emails it only to rickoflv@gmail.com for validation.
 */

import { useState, useEffect, useCallback } from "react";
import { FileText, Send, RefreshCw, Mail, CheckCircle, Clock, AlertCircle, FlaskConical } from "lucide-react";
import { cn } from "@/lib/cn";

interface ReportSummary {
  id: string;
  title: string | null;
  period_start: string;
  period_end: string;
  generated_at: string | null;
  status: string;
  delivery_status: string;
  recipients: string[] | null;
  sent_at: string | null;
  email_message_id: string | null;
}

interface ReportDetail extends ReportSummary {
  html: string | null;
  plain_text: string | null;
  executive_summary: string | null;
}

function DeliveryBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; Icon: typeof CheckCircle }> = {
    sent: { label: "Sent", color: "bg-green-50 text-green-700", Icon: CheckCircle },
    test_sent: { label: "Test sent", color: "bg-amber-50 text-amber-700", Icon: FlaskConical },
    pending: { label: "Pending", color: "bg-gray-100 text-gray-600", Icon: Clock },
    failed: { label: "Failed", color: "bg-red-50 text-red-600", Icon: AlertCircle },
  };
  const s = map[status] ?? map.pending;
  const Icon = s.Icon;
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold", s.color)}>
      <Icon className="h-3 w-3" aria-hidden />
      {s.label}
    </span>
  );
}

function fmt(d: string | null) {
  if (!d) return "—";
  // period_start/period_end are date-only ("2026-08-05"); parsing those as
  // UTC midnight and rendering in a timezone behind UTC shows the wrong
  // (previous) calendar day. Anchor date-only strings at local noon so the
  // displayed day always matches the stored calendar date.
  const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(d);
  const date = isDateOnly ? new Date(`${d}T12:00:00`) : new Date(d);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function ReportsAdminPage() {
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ReportDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [sendingTest, setSendingTest] = useState(false);
  const [resending, setResending] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/reports");
      if (res.ok) setReports(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function flash(m: string) {
    setMsg(m);
    setTimeout(() => setMsg(""), 4000);
  }

  async function openReport(id: string) {
    setDetailLoading(true);
    setSelected(null);
    const res = await fetch(`/api/admin/reports/${id}`);
    if (res.ok) setSelected(await res.json());
    else flash("Failed to load report.");
    setDetailLoading(false);
  }

  async function sendTest() {
    setSendingTest(true);
    try {
      const res = await fetch("/api/admin/test-executive-report");
      const data = await res.json();
      if (res.ok) {
        flash(`Test report sent to ${data.sentTo} ✓`);
        void load();
      } else {
        flash(data.error ?? "Test send failed.");
      }
    } finally {
      setSendingTest(false);
    }
  }

  async function resend(id: string) {
    setResending(true);
    try {
      const res = await fetch(`/api/admin/reports/${id}/resend`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
      const data = await res.json();
      if (res.ok) {
        flash(`Resent ✓`);
        void load();
        void openReport(id);
      } else {
        flash(data.error ?? "Resend failed.");
      }
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold text-owl-ink">Weekly Reports</h2>
          <p className="mt-0.5 text-sm text-owl-mist">
            Archive of every weekly admin report — the same object that was emailed.
          </p>
        </div>
        <button
          onClick={() => void sendTest()}
          disabled={sendingTest}
          className="inline-flex items-center gap-2 rounded-owl-btn border border-owl-teal/40 px-4 py-2 text-sm font-semibold text-owl-teal transition-colors hover:bg-owl-teal/5 disabled:opacity-50"
        >
          {sendingTest ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <FlaskConical className="h-3.5 w-3.5" />}
          Send test report to rickoflv@gmail.com
        </button>
      </div>

      {msg && (
        <p className="rounded-lg bg-owl-teal/10 px-4 py-2 text-sm font-medium text-owl-teal">{msg}</p>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        {/* List */}
        <div className="rounded-owl-card border border-owl-cream-deep bg-white lg:col-span-2">
          {loading ? (
            <div className="p-8 text-center text-sm text-owl-mist">Loading…</div>
          ) : reports.length === 0 ? (
            <div className="p-8 text-center text-sm text-owl-mist">
              No reports yet. Send a test report to generate the first one.
            </div>
          ) : (
            <ul className="divide-y divide-owl-cream-deep">
              {reports.map((r) => (
                <li key={r.id}>
                  <button
                    onClick={() => void openReport(r.id)}
                    className={cn(
                      "flex w-full flex-col items-start gap-1 px-4 py-3 text-left transition-colors hover:bg-owl-cream/40",
                      selected?.id === r.id && "bg-owl-cream/60"
                    )}
                  >
                    <div className="flex w-full items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-owl-ink">
                        {fmt(r.period_start)} → {fmt(r.period_end)}
                      </span>
                      <DeliveryBadge status={r.delivery_status} />
                    </div>
                    <span className="text-xs text-owl-mist">
                      Generated {fmt(r.generated_at)}
                      {r.sent_at ? ` · sent ${fmt(r.sent_at)}` : ""}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Detail */}
        <div className="rounded-owl-card border border-owl-cream-deep bg-white lg:col-span-3">
          {detailLoading ? (
            <div className="p-8 text-center text-sm text-owl-mist">Loading report…</div>
          ) : !selected ? (
            <div className="p-8 text-center text-sm text-owl-mist">
              <FileText className="mx-auto mb-2 h-6 w-6 text-owl-mist/50" aria-hidden />
              Select a report to view it.
            </div>
          ) : (
            <div className="flex h-full flex-col">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-owl-cream-deep px-5 py-3">
                <div>
                  <p className="font-semibold text-owl-ink">{selected.title ?? "Weekly report"}</p>
                  <p className="text-xs text-owl-mist">
                    {fmt(selected.period_start)} → {fmt(selected.period_end)} · <DeliveryBadge status={selected.delivery_status} />
                  </p>
                </div>
                <button
                  onClick={() => void resend(selected.id)}
                  disabled={resending || !selected.html}
                  className="inline-flex items-center gap-2 rounded-owl-btn bg-owl-teal px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-owl-teal-deep disabled:opacity-50"
                >
                  {resending ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                  Resend to admins
                </button>
              </div>
              <div className="px-5 py-3 text-xs text-owl-mist">
                {selected.recipients?.length ? (
                  <span className="inline-flex items-center gap-1">
                    <Mail className="h-3 w-3" aria-hidden />
                    Last sent to: {selected.recipients.join(", ")}
                    {selected.email_message_id ? ` · Resend ID ${selected.email_message_id}` : ""}
                  </span>
                ) : (
                  "Not yet sent."
                )}
              </div>
              {selected.html ? (
                <iframe
                  title="Report preview"
                  srcDoc={selected.html}
                  className="min-h-[520px] w-full flex-1 border-0"
                />
              ) : (
                <p className="p-5 text-sm text-owl-mist">No HTML stored for this report.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

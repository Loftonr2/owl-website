# OWL Command Center — Cron Automation

Production Vercel Cron handlers that drive the OWL Command Center's scheduled
work: newsletter sending, executive reporting, coupon refresh, affiliate sync,
and CRM metric snapshots. Built on the schema + RBAC documented in
`ADMIN_COMMAND_CENTER.md` and `ACCOUNT_SYSTEM.md`.

---

## 1. Routes & schedule

All cron times are stored in **UTC**. The ET column assumes US Eastern; during
EST (Nov–Mar) the local time is one hour earlier than shown.

| Route | UTC cron | Local (ET, EDT) | Job |
|---|---|---|---|
| `POST/GET /api/cron/send-newsletter` | `0 13 * * 5` | Fri 9:00 AM | Send the next due newsletter |
| `POST/GET /api/cron/executive-report` | `0 11 * * 1` | Mon 7:00 AM | Weekly executive report email |
| `POST/GET /api/cron/refresh-coupons` | `0 10 * * 3` | Wed 6:00 AM | Refresh + expire coupons |
| `POST/GET /api/cron/sync-affiliates` | `30 10 * * 1` | Mon 6:30 AM | Sync affiliate performance |
| `POST/GET /api/cron/update-crm-metrics` | `45 10 * * 1` | Mon 6:45 AM | Recalculate CRM metrics |

Schedules are declared in `vercel.json` and mirrored (with human labels) in the
`scheduled_jobs` table for the admin panel.

> **Vercel plan note:** these per-week, specific-time schedules require the
> **Pro** plan. The Hobby plan only runs crons once per day. The routes
> themselves work on any plan when invoked manually or by an external scheduler.

---

## 2. Security

Every cron route:
- Requires `CRON_SECRET`. Vercel Cron sends `Authorization: Bearer <CRON_SECRET>`
  automatically; `x-cron-secret: <CRON_SECRET>` is also accepted for local
  testing. **Fails closed** — if `CRON_SECRET` is unset, all requests are 401.
- Returns clear JSON (`{ ok, job, status, summary, detail }`); **never** echoes
  secrets.
- Logs every run (success / skipped / failed) to `cron_job_logs` with duration.
- Is **idempotent / safe to re-run** (see each job below).
- **Degrades gracefully** on missing data (no campaign, no subscribers, no API
  keys) — returns `skipped` or zero counts instead of throwing.

The manual **Run now** buttons in `/admin/automations` are a separate path:
they're session-authenticated and gated to **admin/owner** via
`requireRole("admin")` — they do not use `CRON_SECRET`.

---

## 3. What each job does

**send-newsletter** — finds the next `scheduled` campaign whose `scheduled_for`
is due, atomically claims it (`scheduled → sending → sent`, so re-runs skip),
pulls active `newsletter_subscribers`, sends via Resend in batches of 100,
writes `newsletter_recipients` + a `newsletter_send_logs` summary, and returns
the recipient count.

**executive-report** — calls the `generate_executive_report()` SQL function for
the past 7 days (subscribers, new/unsub, open/click rate, store + affiliate
revenue, top coupons/products/blog posts), appends prior-week errors from
`cron_job_logs`, stores an `executive_reports` row, and emails it to
`REPORT_RECIPIENT_EMAILS` (falling back to `app_settings.report_recipients`).
No recipient emails are hardcoded.

**refresh-coupons** — expires active coupons past `expires_at`, then for each
non-disabled network **with credentials** harvests fresh coupons via its adapter
and upserts them (dedup by network + code). Networks without credentials are
skipped cleanly.

**sync-affiliates** — for each network with credentials, pulls
click/conversion/commission data for the past 7 days and inserts
`affiliate_revenue` rows (dedup by `external_order_id`). Skips networks without
credentials.

**update-crm-metrics** — reconciles engagement scores
(`recompute_engagement_scores()`), recalculates subscriber/customer/teacher/
lead/affiliate/download totals, and upserts a dated `crm_metric_snapshots` row
(one per day) for dashboard charts.

### Affiliate adapter pattern
`src/lib/affiliates/adapters.ts` defines `AffiliateAdapter` plus a default
`PlaceholderAdapter` that reports "no credentials" and returns nothing. Real
integrations register in `REGISTRY` by network slug as keys arrive — no job code
changes needed. So with zero integrations configured today, refresh/sync run
cleanly and simply skip.

---

## 4. Environment variables

| Var | Required | Purpose |
|---|---|---|
| `CRON_SECRET` | ✅ | Authorizes `/api/cron/*`. Long random string. |
| `RESEND_API_KEY` | ✅ (for email) | Resend API key (newsletter + report). |
| `RESEND_FROM_EMAIL` | ✅ (for email) | Verified sender, e.g. `hello@owlsingtogether.com`. |
| `REPORT_RECIPIENT_EMAILS` | optional | Comma-separated report recipients; else DB setting. |
| `SUPABASE_URL` | ✅ | Supabase project URL (server). |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Service role — cron jobs write past RLS. Server only. |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Browser Supabase URL. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Browser anon key. |

Placeholders were added to `.env.local.example`. Set all of these in Vercel
(Project → Settings → Environment Variables) for Production.

---

## 5. Supabase migrations created

- `0012_cron_infrastructure.sql` — `cron_job_logs`, `newsletter_send_logs`,
  `crm_metric_snapshots`; adds `scheduled_jobs.schedule_label`; reconciles the
  five canonical job rows. RLS on all new tables (staff read / admin write;
  service role bypasses).
- `0013_engagement_recompute.sql` — `recompute_engagement_scores()` (service
  role only).

Reused existing tables instead of creating duplicates: `executive_reports`
(= "weekly_reports"), `affiliate_revenue` (= "affiliate_performance"),
`coupon_redemptions`, `newsletter_recipients`. No existing tables were altered
destructively.

---

## 6. Testing

**Locally** (`npm run dev`), with `CRON_SECRET` set in `.env.local`:

```bash
# Authorized — expect 200 + JSON status
curl -s -X POST http://localhost:3000/api/cron/update-crm-metrics \
  -H "Authorization: Bearer $CRON_SECRET" | jq

# Unauthorized — expect 401
curl -s -i -X POST http://localhost:3000/api/cron/update-crm-metrics | head -n1
```

Each route returns `{ ok, job, status, summary, detail }`. Missing data yields
`status: "skipped"` (e.g. no scheduled newsletter) rather than an error. After a
run, confirm a row appears in `cron_job_logs` and `scheduled_jobs.last_status`
updates. Validate `vercel.json` with `vercel` CLI or the dashboard (Cron tab).

---

## 7. Remaining steps

1. Set `CRON_SECRET`, `RESEND_FROM_EMAIL`, and (optionally)
   `REPORT_RECIPIENT_EMAILS` in Vercel + `.env.local`.
2. Enable Vercel Cron (Pro plan) — schedules deploy from `vercel.json`.
3. Configure Resend SMTP/domain so newsletter + report emails deliver.
4. Add real affiliate adapters to `REGISTRY` as API credentials are obtained
   (store secrets in `affiliate_credentials` referencing env-var names).
5. Run `npm run typecheck && npm run build` locally as the final gate.

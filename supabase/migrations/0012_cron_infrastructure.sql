-- ============================================================================
-- OWL Command Center — Migration 0012: Cron / automation infrastructure
-- ============================================================================
-- Adds the run-logging + metrics-snapshot tables the Vercel Cron handlers need.
-- Reuses existing tables where they already cover a requirement:
--   weekly_reports        → executive_reports (0008)
--   affiliate_performance → affiliate_revenue (0005)
--   coupon_redemptions    → coupon_redemptions (0005)
--   newsletter_recipients → newsletter_recipients (0004)
-- Cron handlers write with the service-role client (bypasses RLS); the admin
-- panel reads as staff. Nothing here drops or alters existing columns.
-- ============================================================================

-- ── cron_job_logs — one row per job run (cron or manual) ────────────────────
create table public.cron_job_logs (
  id uuid primary key default gen_random_uuid(),
  job_key text not null,
  status text not null default 'running'
    check (status in ('running','success','failed','skipped')),
  triggered_by text not null default 'cron' check (triggered_by in ('cron','manual')),
  actor uuid references public.profiles(id) on delete set null,
  detail jsonb default '{}'::jsonb,
  error text,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  duration_ms integer
);
create index cron_job_logs_key_idx on public.cron_job_logs(job_key, started_at desc);
create index cron_job_logs_status_idx on public.cron_job_logs(status);

-- ── newsletter_send_logs — per-send summary (complements newsletter_recipients)
create table public.newsletter_send_logs (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references public.newsletter_campaigns(id) on delete set null,
  cron_log_id uuid references public.cron_job_logs(id) on delete set null,
  recipients integer not null default 0,
  sent integer not null default 0,
  failed integer not null default 0,
  skipped boolean not null default false,
  reason text,
  started_at timestamptz not null default now(),
  finished_at timestamptz
);
create index newsletter_send_logs_campaign_idx on public.newsletter_send_logs(campaign_id);

-- ── crm_metric_snapshots — daily/weekly rollups for dashboard charts ────────
create table public.crm_metric_snapshots (
  id uuid primary key default gen_random_uuid(),
  snapshot_date date not null default current_date,
  subscribers integer not null default 0,
  active_subscribers integer not null default 0,
  new_subscribers_7d integer not null default 0,
  unsubscribes_7d integer not null default 0,
  customers integer not null default 0,
  teachers integer not null default 0,
  leads integer not null default 0,
  affiliates integer not null default 0,
  avg_engagement numeric(10,2) not null default 0,
  downloads_total integer not null default 0,
  extra jsonb default '{}'::jsonb,
  captured_at timestamptz not null default now(),
  unique (snapshot_date)
);
create index crm_metric_snapshots_date_idx on public.crm_metric_snapshots(snapshot_date desc);

-- ── RLS ─────────────────────────────────────────────────────────────────────
alter table public.cron_job_logs        enable row level security;
alter table public.newsletter_send_logs enable row level security;
alter table public.crm_metric_snapshots enable row level security;

-- Staff can read run history; admins can manage; service role bypasses RLS.
create policy cron_logs_staff_read on public.cron_job_logs        for select using (public.app_is_staff());
create policy cron_logs_admin_all  on public.cron_job_logs        for all    using (public.app_is_admin()) with check (public.app_is_admin());

create policy nl_send_staff_read   on public.newsletter_send_logs for select using (public.app_is_staff());
create policy nl_send_admin_all    on public.newsletter_send_logs for all    using (public.app_is_admin()) with check (public.app_is_admin());

create policy crm_snap_staff_read  on public.crm_metric_snapshots for select using (public.app_is_staff());
create policy crm_snap_editor_all  on public.crm_metric_snapshots for all    using (public.app_is_editor()) with check (public.app_is_editor());

-- ── Reconcile scheduled_jobs to the five canonical cron keys ────────────────
alter table public.scheduled_jobs add column if not exists schedule_label text;

-- Remove the earlier placeholder seeds (no run history yet).
delete from public.scheduled_jobs where key in ('friday_newsletter','monday_exec_report','coupon_harvest_daily');

insert into public.scheduled_jobs (key, name, cron, timezone, schedule_label, description) values
  ('send-newsletter',    'Send weekly newsletter',   '0 13 * * 5', 'UTC', 'Fridays · 9:00 AM ET',  'Send the next scheduled newsletter and track sends.'),
  ('executive-report',   'Weekly executive report',  '0 11 * * 1', 'UTC', 'Mondays · 7:00 AM ET',  'Generate + email the weekly executive report.'),
  ('refresh-coupons',    'Refresh affiliate coupons','0 10 * * 3', 'UTC', 'Wednesdays · 6:00 AM ET','Harvest fresh coupons; expire stale ones.'),
  ('sync-affiliates',    'Sync affiliate performance','30 10 * * 1','UTC', 'Mondays · 6:30 AM ET',  'Pull clicks/conversions/commissions per network.'),
  ('update-crm-metrics', 'Update CRM metrics',       '45 10 * * 1', 'UTC', 'Mondays · 6:45 AM ET',  'Recalculate CRM totals + snapshot for charts.')
on conflict (key) do update
  set name = excluded.name, cron = excluded.cron, timezone = excluded.timezone,
      schedule_label = excluded.schedule_label, description = excluded.description;

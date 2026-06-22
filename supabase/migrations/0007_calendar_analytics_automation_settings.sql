-- ============================================================================
-- OWL Command Center — Migration 0007: Calendar, Analytics, Automation, Settings
-- ============================================================================

-- ── calendar_events — single unified content calendar ───────────────────────
create table public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  type text not null
    check (type in ('blog','newsletter','video','promotion','holiday','affiliate_campaign','other')),
  status text not null default 'planned'
    check (status in ('planned','scheduled','published','done','canceled')),
  start_at timestamptz not null,
  end_at timestamptz,
  all_day boolean default false,
  ref_table text,                   -- e.g. 'blog_posts','newsletter_campaigns'
  ref_id uuid,
  color text,
  notes text,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index calendar_events_start_idx on public.calendar_events(start_at);
create index calendar_events_type_idx on public.calendar_events(type);
create trigger calendar_events_touch before update on public.calendar_events
  for each row execute function public.touch_updated_at();
create trigger calendar_events_audit after insert or update or delete on public.calendar_events
  for each row execute function public.fn_audit();

-- ── analytics_daily — generic daily metric store (GA4/Beehiiv/YouTube/etc) ──
create table public.analytics_daily (
  id bigserial primary key,
  day date not null,
  source text not null
    check (source in ('ga4','beehiiv','resend','youtube','store','affiliate','internal')),
  metric text not null,
  dimension text default '',
  value numeric not null default 0,
  recorded_at timestamptz default now(),
  unique (day, source, metric, dimension)
);
create index analytics_daily_day_idx on public.analytics_daily(day desc);
create index analytics_daily_metric_idx on public.analytics_daily(source, metric);

-- ── webhook_events — n8n + provider webhook landing zone ────────────────────
create table public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  source text not null,             -- 'paypal','printful','resend','n8n','shopify'...
  event_type text,
  payload jsonb,
  signature_valid boolean,
  processed boolean not null default false,
  processed_at timestamptz,
  error text,
  received_at timestamptz default now()
);
create index webhook_events_source_idx on public.webhook_events(source, event_type);
create index webhook_events_processed_idx on public.webhook_events(processed) where processed = false;

-- ── automation_runs — Claude Code / n8n workflow run log ────────────────────
create table public.automation_runs (
  id uuid primary key default gen_random_uuid(),
  workflow text not null,
  trigger text,
  status text not null default 'running' check (status in ('running','success','failed')),
  started_at timestamptz default now(),
  finished_at timestamptz,
  summary text,
  log text,
  error text
);
create index automation_runs_workflow_idx on public.automation_runs(workflow);
create index automation_runs_started_idx on public.automation_runs(started_at desc);

-- ── scheduled_jobs — registry surfaced in the admin + driven by cron ────────
create table public.scheduled_jobs (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  name text not null,
  cron text not null,
  timezone text default 'America/New_York',
  description text,
  enabled boolean not null default true,
  last_run_at timestamptz,
  last_status text,
  next_run_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create trigger scheduled_jobs_touch before update on public.scheduled_jobs
  for each row execute function public.touch_updated_at();

insert into public.scheduled_jobs (key, name, cron, description) values
  ('friday_newsletter',   'Friday Newsletter Send',     '0 9 * * 5', 'Send the scheduled weekly newsletter every Friday at 9:00 AM ET.'),
  ('monday_exec_report',  'Monday Executive Report',    '0 7 * * 1', 'Generate + email the weekly executive report every Monday at 7:00 AM ET.'),
  ('coupon_harvest_daily','Daily Coupon Harvest',       '0 3 * * *', 'Harvest fresh affiliate coupon codes nightly at 3:00 AM ET.')
on conflict (key) do nothing;

-- ── app_settings — key/value config (admin-managed) ─────────────────────────
create table public.app_settings (
  key text primary key,
  value jsonb,
  description text,
  updated_by uuid references public.profiles(id),
  updated_at timestamptz default now()
);
create trigger app_settings_touch before update on public.app_settings
  for each row execute function public.touch_updated_at();

insert into public.app_settings (key, value, description) values
  ('report_recipients', '["larissa@owlsingtogether.com","rick@owlsingtogether.com"]'::jsonb, 'Executive report email recipients (Larissa + Rick).'),
  ('newsletter_from',   '{"name":"OWL Sing Together","email":"hello@owlsingtogether.com"}'::jsonb, 'Default newsletter sender identity.'),
  ('brand',             '{"name":"OWL Sing Together","site_url":"https://owlsingtogether.com"}'::jsonb, 'Brand + canonical site URL.')
on conflict (key) do nothing;

-- ── feature_flags ───────────────────────────────────────────────────────────
create table public.feature_flags (
  key text primary key,
  enabled boolean not null default false,
  description text,
  updated_at timestamptz default now()
);
create trigger feature_flags_touch before update on public.feature_flags
  for each row execute function public.touch_updated_at();

-- ── RLS ─────────────────────────────────────────────────────────────────────
alter table public.calendar_events  enable row level security;
alter table public.analytics_daily  enable row level security;
alter table public.webhook_events   enable row level security;
alter table public.automation_runs  enable row level security;
alter table public.scheduled_jobs   enable row level security;
alter table public.app_settings     enable row level security;
alter table public.feature_flags    enable row level security;

create policy cal_staff_read   on public.calendar_events for select using (public.app_is_staff());
create policy cal_editor_all   on public.calendar_events for all    using (public.app_is_editor()) with check (public.app_is_editor());

create policy analytics_staff_read on public.analytics_daily for select using (public.app_is_staff());
create policy analytics_editor_all on public.analytics_daily for all    using (public.app_is_editor()) with check (public.app_is_editor());

-- Webhook payloads may carry PII/secrets → admin/owner only.
create policy webhook_admin_all on public.webhook_events for all using (public.app_is_admin()) with check (public.app_is_admin());

create policy automation_staff_read on public.automation_runs for select using (public.app_is_staff());
create policy automation_editor_all on public.automation_runs for all    using (public.app_is_editor()) with check (public.app_is_editor());

create policy jobs_staff_read on public.scheduled_jobs for select using (public.app_is_staff());
create policy jobs_admin_all  on public.scheduled_jobs for all    using (public.app_is_admin()) with check (public.app_is_admin());

create policy settings_admin_all on public.app_settings for all using (public.app_is_admin()) with check (public.app_is_admin());

create policy flags_staff_read on public.feature_flags for select using (public.app_is_staff());
create policy flags_admin_all  on public.feature_flags for all    using (public.app_is_admin()) with check (public.app_is_admin());

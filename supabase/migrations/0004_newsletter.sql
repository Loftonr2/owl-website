-- ============================================================================
-- OWL Command Center — Migration 0004: Newsletter
-- ============================================================================
-- Scheduling system + weekly asset folders (Week-01..Week-NN) + open/click/
-- coupon-usage tracking. The Friday 9:00 AM send job reads scheduled campaigns;
-- provider webhooks (Resend) write into newsletter_events.
-- ============================================================================

create table public.newsletter_campaigns (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  week_folder text,                 -- 'Week-01', 'Week-02', ...
  subject text,
  subject_variants text[] default '{}'::text[],   -- A/B subject testing
  preheader text,
  from_name text default 'OWL Sing Together',
  from_email text default 'hello@owlsingtogether.com',
  status text not null default 'draft'
    check (status in ('draft','scheduled','sending','sent','failed','canceled')),
  segment_id uuid references public.crm_segments(id) on delete set null,
  html_body text,
  html_storage_path text,           -- pointer into the newsletter-assets bucket
  scheduled_for timestamptz,
  sent_at timestamptz,
  resend_broadcast_id text,
  recipients_count integer default 0,
  sent_count integer default 0,
  delivered_count integer default 0,
  open_count integer default 0,
  click_count integer default 0,
  unsub_count integer default 0,
  bounce_count integer default 0,
  revenue_cents integer default 0,  -- attributed via coupon/UTM
  created_by uuid references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index newsletter_campaigns_status_idx on public.newsletter_campaigns(status);
create index newsletter_campaigns_sched_idx  on public.newsletter_campaigns(scheduled_for);
create index newsletter_campaigns_week_idx    on public.newsletter_campaigns(week_folder);

create trigger newsletter_campaigns_touch before update on public.newsletter_campaigns
  for each row execute function public.touch_updated_at();
create trigger newsletter_campaigns_audit after insert or update or delete on public.newsletter_campaigns
  for each row execute function public.fn_audit();

-- ── newsletter_assets — files inside each weekly folder ─────────────────────
create table public.newsletter_assets (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references public.newsletter_campaigns(id) on delete cascade,
  week_folder text not null,
  kind text not null check (kind in ('html','image','pdf','coupon','other')),
  file_name text not null,
  bucket text not null default 'newsletter-assets',
  storage_path text not null,
  public_url text,
  size_bytes bigint,
  content_type text,
  uploaded_by uuid references public.profiles(id),
  created_at timestamptz default now()
);
create index newsletter_assets_campaign_idx on public.newsletter_assets(campaign_id);
create index newsletter_assets_week_idx on public.newsletter_assets(week_folder);

-- ── newsletter_recipients — per-send delivery rows ──────────────────────────
create table public.newsletter_recipients (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.newsletter_campaigns(id) on delete cascade,
  contact_id uuid references public.crm_contacts(id) on delete set null,
  email citext not null,
  status text not null default 'queued'
    check (status in ('queued','sent','delivered','opened','clicked','bounced','unsubscribed','failed')),
  resend_message_id text,
  sent_at timestamptz,
  last_event_at timestamptz,
  unique (campaign_id, email)
);
create index newsletter_recipients_campaign_idx on public.newsletter_recipients(campaign_id);
create index newsletter_recipients_contact_idx on public.newsletter_recipients(contact_id);

-- ── newsletter_events — opens / clicks / coupon usage / unsubscribes ────────
create table public.newsletter_events (
  id bigserial primary key,
  campaign_id uuid references public.newsletter_campaigns(id) on delete cascade,
  recipient_id uuid references public.newsletter_recipients(id) on delete set null,
  contact_id uuid references public.crm_contacts(id) on delete set null,
  email citext,
  type text not null
    check (type in ('delivered','open','click','bounce','complaint','unsubscribe','coupon_redeemed')),
  url text,
  coupon_code text,
  ip inet,
  user_agent text,
  occurred_at timestamptz default now()
);
create index newsletter_events_campaign_idx on public.newsletter_events(campaign_id, type);
create index newsletter_events_occurred_idx on public.newsletter_events(occurred_at desc);

-- Roll event counts up onto the parent campaign as they arrive.
create or replace function public.fn_newsletter_event_rollup()
returns trigger language plpgsql as $$
begin
  if new.campaign_id is null then return new; end if;
  update public.newsletter_campaigns
     set open_count    = open_count    + (case when new.type = 'open'        then 1 else 0 end),
         click_count   = click_count   + (case when new.type = 'click'       then 1 else 0 end),
         unsub_count   = unsub_count   + (case when new.type = 'unsubscribe' then 1 else 0 end),
         bounce_count  = bounce_count  + (case when new.type = 'bounce'      then 1 else 0 end),
         delivered_count = delivered_count + (case when new.type = 'delivered' then 1 else 0 end)
   where id = new.campaign_id;
  return new;
end;
$$;
create trigger newsletter_event_rollup after insert on public.newsletter_events
  for each row execute function public.fn_newsletter_event_rollup();

-- ── RLS ─────────────────────────────────────────────────────────────────────
alter table public.newsletter_campaigns  enable row level security;
alter table public.newsletter_assets     enable row level security;
alter table public.newsletter_recipients enable row level security;
alter table public.newsletter_events     enable row level security;

create policy nl_campaigns_staff_read on public.newsletter_campaigns for select using (public.app_is_staff());
create policy nl_campaigns_editor_all on public.newsletter_campaigns for all    using (public.app_is_editor()) with check (public.app_is_editor());

create policy nl_assets_staff_read   on public.newsletter_assets     for select using (public.app_is_staff());
create policy nl_assets_editor_all   on public.newsletter_assets     for all    using (public.app_is_editor()) with check (public.app_is_editor());

create policy nl_recip_staff_read    on public.newsletter_recipients for select using (public.app_is_staff());
create policy nl_recip_editor_all    on public.newsletter_recipients for all    using (public.app_is_editor()) with check (public.app_is_editor());

create policy nl_events_staff_read   on public.newsletter_events     for select using (public.app_is_staff());
create policy nl_events_editor_all   on public.newsletter_events     for all    using (public.app_is_editor()) with check (public.app_is_editor());

-- ── Storage bucket for weekly newsletter assets (private) ───────────────────
insert into storage.buckets (id, name, public)
values ('newsletter-assets', 'newsletter-assets', false)
on conflict (id) do nothing;

create policy newsletter_assets_staff_read
  on storage.objects for select
  using (bucket_id = 'newsletter-assets' and public.app_is_staff());

create policy newsletter_assets_editor_write
  on storage.objects for insert
  with check (bucket_id = 'newsletter-assets' and public.app_is_editor());

create policy newsletter_assets_editor_delete
  on storage.objects for delete
  using (bucket_id = 'newsletter-assets' and public.app_is_editor());

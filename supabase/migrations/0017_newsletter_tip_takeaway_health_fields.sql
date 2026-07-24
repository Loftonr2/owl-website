-- =============================================================================
-- Migration 0017: Newsletter tip_takeaway, health detail fields, scheduled_send_at
-- Fixes status CHECK constraint to include 'published'
-- =============================================================================

-- 1. Add tip supplemental fields
alter table public.newsletter_campaigns
  add column if not exists tip_takeaway        text,
  add column if not exists tip_illustration_url text,
  add column if not exists tip_newsletter_eligible boolean not null default true;

-- 2. Add structured health alert detail fields
alter table public.newsletter_campaigns
  add column if not exists health_alert_product_name text,
  add column if not exists health_alert_brand        text,
  add column if not exists health_alert_recall_date  date,
  add column if not exists health_alert_source_name  text;

-- 3. Add scheduled send timestamp
alter table public.newsletter_campaigns
  add column if not exists scheduled_send_at timestamptz;

-- 4. Fix status CHECK constraint to include 'published'
--    (Migration 0004 defined: draft, scheduled, sending, sent, failed, canceled)
--    The newsletter resolver queries for status = 'published' so we need it.
alter table public.newsletter_campaigns
  drop constraint if exists newsletter_campaigns_status_check;

alter table public.newsletter_campaigns
  add constraint newsletter_campaigns_status_check
  check (status in ('draft','scheduled','sending','sent','failed','canceled','published'));

comment on column public.newsletter_campaigns.tip_takeaway
  is 'OWL takeaway line for the parenting tip (displayed at end of tip section)';
comment on column public.newsletter_campaigns.tip_illustration_url
  is 'Optional illustration URL for the parenting tip card';
comment on column public.newsletter_campaigns.tip_newsletter_eligible
  is 'Whether this tip should appear in the newsletter email (default true)';
comment on column public.newsletter_campaigns.health_alert_product_name
  is 'Recalled/alerted product name (when health_alert_body is populated)';
comment on column public.newsletter_campaigns.health_alert_brand
  is 'Brand of recalled product';
comment on column public.newsletter_campaigns.health_alert_recall_date
  is 'Official recall date from USDA/CPSC/FDA';
comment on column public.newsletter_campaigns.health_alert_source_name
  is 'Source agency name (e.g. USDA FSIS, CPSC, FDA)';
comment on column public.newsletter_campaigns.scheduled_send_at
  is 'Absolute timestamp when this issue is scheduled to send (used by send queue)';

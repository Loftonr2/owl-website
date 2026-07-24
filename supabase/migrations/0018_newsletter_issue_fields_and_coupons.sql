-- =============================================================================
-- Migration 0018: Newsletter issue fields + coupon system
-- These are the columns that were in the local 0015 file but were never applied
-- to production (the 0015 slot in the DB was consumed by content_posts).
-- =============================================================================

-- ── 1. Newsletter campaign issue fields ───────────────────────────────────────
alter table public.newsletter_campaigns
  add column if not exists issue_number        integer,
  add column if not exists note_title          text      default 'A Note from OWL',
  add column if not exists note_body           text,
  add column if not exists note_image_url      text,
  add column if not exists note_button_label   text,
  add column if not exists note_button_url     text,
  add column if not exists tip_title           text,
  add column if not exists tip_body            text,
  add column if not exists tip_age_range       text      default 'Infant – 12',
  add column if not exists health_alert_title  text,
  add column if not exists health_alert_body   text,
  add column if not exists health_alert_url    text,
  add column if not exists promo_headline      text,
  add column if not exists promo_subheading    text,
  add column if not exists promo_product_slug  text,
  add column if not exists promo_discount_pct  smallint  default 15,
  add column if not exists promo_button_label  text      default 'Shop the Store',
  add column if not exists promo_button_url    text      default '/shop',
  add column if not exists promo_starts_at     timestamptz,
  add column if not exists promo_expires_at    timestamptz,
  add column if not exists news_mode           text      default 'auto',
  add column if not exists blog_mode           text      default 'auto',
  add column if not exists archive_slug        text,
  add column if not exists publication_date    date;

alter table public.newsletter_campaigns
  drop constraint if exists newsletter_campaigns_news_mode_check,
  drop constraint if exists newsletter_campaigns_blog_mode_check;

alter table public.newsletter_campaigns
  add constraint newsletter_campaigns_news_mode_check check (news_mode in ('auto','manual')),
  add constraint newsletter_campaigns_blog_mode_check check (blog_mode in ('auto','manual'));

create unique index if not exists newsletter_campaigns_issue_number_uidx
  on public.newsletter_campaigns (issue_number)
  where issue_number is not null;

create unique index if not exists newsletter_campaigns_archive_slug_uidx
  on public.newsletter_campaigns (archive_slug)
  where archive_slug is not null;

-- ── 2. Junction tables ────────────────────────────────────────────────────────
create table if not exists public.newsletter_issue_news (
  id                    uuid primary key default gen_random_uuid(),
  newsletter_campaign_id uuid not null
    references public.newsletter_campaigns(id) on delete cascade,
  content_post_id       uuid not null
    references public.content_posts(id) on delete cascade,
  display_order         smallint not null default 0,
  created_at            timestamptz default now(),
  unique (newsletter_campaign_id, content_post_id)
);
create index if not exists nl_issue_news_campaign_idx on public.newsletter_issue_news(newsletter_campaign_id);

create table if not exists public.newsletter_issue_blogs (
  id                    uuid primary key default gen_random_uuid(),
  newsletter_campaign_id uuid not null
    references public.newsletter_campaigns(id) on delete cascade,
  content_post_id       uuid not null
    references public.content_posts(id) on delete cascade,
  display_order         smallint not null default 0,
  created_at            timestamptz default now(),
  unique (newsletter_campaign_id, content_post_id)
);
create index if not exists nl_issue_blogs_campaign_idx on public.newsletter_issue_blogs(newsletter_campaign_id);

-- ── 3. Coupon campaigns ───────────────────────────────────────────────────────
create table if not exists public.coupon_campaigns (
  id                    uuid primary key default gen_random_uuid(),
  newsletter_campaign_id uuid references public.newsletter_campaigns(id) on delete set null,
  name                  text not null,
  display_code          text,
  discount_type         text not null default 'percent'
    check (discount_type in ('percent','fixed')),
  discount_value        numeric(10,2) not null default 15,
  applies_to            text not null default 'order'
    check (applies_to in ('order','product','category')),
  applies_to_slug       text,
  minimum_order_cents   integer default 0,
  allow_stacking        boolean not null default false,
  starts_at             timestamptz not null default now(),
  expires_at            timestamptz not null default (now() + interval '7 days'),
  status                text not null default 'scheduled'
    check (status in ('scheduled','active','ended','cancelled')),
  eligible_user_count   integer default 0,
  redeemed_count        integer default 0,
  revenue_cents         integer default 0,
  created_by            uuid references public.profiles(id),
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);
create index if not exists coupon_campaigns_newsletter_idx on public.coupon_campaigns(newsletter_campaign_id);
create index if not exists coupon_campaigns_status_idx on public.coupon_campaigns(status);
create trigger coupon_campaigns_touch before update on public.coupon_campaigns
  for each row execute function public.touch_updated_at();

-- ── 4. Per-user coupon entitlements ──────────────────────────────────────────
create table if not exists public.coupon_entitlements (
  id            uuid primary key default gen_random_uuid(),
  campaign_id   uuid not null references public.coupon_campaigns(id) on delete cascade,
  user_id       uuid not null references public.profiles(id) on delete cascade,
  status        text not null default 'active'
    check (status in ('active','redeemed','expired','cancelled')),
  redeemed_at   timestamptz,
  order_id      uuid references public.orders(id) on delete set null,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now(),
  unique (campaign_id, user_id)
);
create index if not exists coupon_entitlements_user_idx on public.coupon_entitlements(user_id);
create index if not exists coupon_entitlements_campaign_idx on public.coupon_entitlements(campaign_id);
create trigger coupon_entitlements_touch before update on public.coupon_entitlements
  for each row execute function public.touch_updated_at();

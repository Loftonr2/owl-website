-- ============================================================================
-- OWL Sing Together — Migration 0015: Newsletter Issues + Account-Bound Coupons
-- ============================================================================
-- Extends newsletter_campaigns with structured weekly-issue fields (issue_number,
-- note body, parenting tip, health alert, news/blog selectors) and adds the
-- account-bound coupon system (coupon_campaigns → coupon_entitlements →
-- coupon_redemption_events) that powers the OWL Weekly 15% subscriber discount.
--
-- Design principles:
--   • newsletter_campaigns stays the single send/delivery table. This migration
--     adds nullable columns so existing rows survive untouched.
--   • coupon_campaigns is a SEPARATE concept from the general public.coupons
--     table. It owns per-user entitlements; the general table handles affiliate/
--     harvest codes. The two can coexist on the same order but are validated
--     independently.
--   • Every mutating coupon operation is recorded in coupon_redemption_events
--     (audit log). coupon_entitlements.status is the authoritative state.
-- ============================================================================

-- ── 1. Extend newsletter_campaigns with issue-specific fields ────────────────

-- Issue identity
alter table public.newsletter_campaigns
  add column if not exists issue_number        integer,
  add column if not exists note_title          text      default 'A Note from OWL',
  add column if not exists note_body           text,
  add column if not exists note_image_url      text,
  add column if not exists note_button_label   text,
  add column if not exists note_button_url     text,

  -- Parenting tip (optional editable block)
  add column if not exists tip_title           text,
  add column if not exists tip_body            text,
  add column if not exists tip_age_range       text      default 'Infant – 12',

  -- Children's health alert (optional editable block)
  add column if not exists health_alert_title  text,
  add column if not exists health_alert_body   text,
  add column if not exists health_alert_url    text,

  -- Store promotion
  add column if not exists promo_headline      text,
  add column if not exists promo_subheading    text,
  add column if not exists promo_product_slug  text,        -- FK-like ref to seed/Supabase product
  add column if not exists promo_discount_pct  smallint     default 15,
  add column if not exists promo_button_label  text         default 'Shop the Store',
  add column if not exists promo_button_url    text         default '/shop',
  add column if not exists promo_starts_at     timestamptz,
  add column if not exists promo_expires_at    timestamptz,

  -- Content selection mode for news + blog carousels
  add column if not exists news_mode           text         default 'auto'
    check (news_mode in ('auto','manual')),
  add column if not exists blog_mode           text         default 'auto'
    check (blog_mode in ('auto','manual')),

  -- Web-archive slug (separate from broadcast slug)
  add column if not exists archive_slug        text,

  -- Publication date for the issue page
  add column if not exists publication_date    date;

-- Unique issue number (NULL = non-issue campaigns like ad-hoc blasts)
create unique index if not exists newsletter_campaigns_issue_number_uidx
  on public.newsletter_campaigns (issue_number)
  where issue_number is not null;

-- Archive slug must also be unique when set
create unique index if not exists newsletter_campaigns_archive_slug_uidx
  on public.newsletter_campaigns (archive_slug)
  where archive_slug is not null;

-- ── 2. Newsletter issue → news article junction ──────────────────────────────

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
create index if not exists nl_issue_news_campaign_idx
  on public.newsletter_issue_news(newsletter_campaign_id);

-- ── 3. Newsletter issue → blog post junction ─────────────────────────────────

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
create index if not exists nl_issue_blogs_campaign_idx
  on public.newsletter_issue_blogs(newsletter_campaign_id);

-- ── 4. Account-bound coupon campaigns ───────────────────────────────────────
-- Each weekly issue may have one coupon_campaign. Entitlements are issued to
-- individual subscribers; the campaign is the template.

create table if not exists public.coupon_campaigns (
  id                    uuid primary key default gen_random_uuid(),
  newsletter_campaign_id uuid
    references public.newsletter_campaigns(id) on delete set null,
  name                  text not null,
  display_code          text,                          -- cosmetic only e.g. OWLWEEKLY15
  discount_type         text not null default 'percent'
    check (discount_type in ('percent','fixed')),
  discount_value        numeric(10,2) not null default 15,
  applies_to            text not null default 'order'  -- 'order','product','category'
    check (applies_to in ('order','product','category')),
  applies_to_slug       text,                          -- product slug or category when scoped
  minimum_order_cents   integer default 0,
  allow_stacking        boolean not null default false,
  starts_at             timestamptz not null,
  expires_at            timestamptz not null,
  status                text not null default 'scheduled'
    check (status in ('scheduled','active','ended','cancelled')),
  eligible_user_count   integer default 0,
  redeemed_count        integer default 0,
  revenue_cents         integer default 0,
  created_by            uuid references public.profiles(id),
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);
create index if not exists coupon_campaigns_newsletter_idx
  on public.coupon_campaigns(newsletter_campaign_id);
create index if not exists coupon_campaigns_status_idx
  on public.coupon_campaigns(status);
create index if not exists coupon_campaigns_expires_idx
  on public.coupon_campaigns(expires_at);

create trigger coupon_campaigns_touch before update on public.coupon_campaigns
  for each row execute function public.touch_updated_at();

-- ── 5. Per-user entitlements ──────────────────────────────────────────────────
-- One row per eligible user per campaign. The unique constraint is enforced at
-- DB level so concurrent INSERTs cannot create duplicates.

create table if not exists public.coupon_entitlements (
  id            uuid primary key default gen_random_uuid(),
  campaign_id   uuid not null
    references public.coupon_campaigns(id) on delete cascade,
  user_id       uuid not null
    references public.profiles(id) on delete cascade,
  status        text not null default 'active'
    check (status in ('active','redeemed','expired','cancelled')),
  redeemed_at   timestamptz,
  order_id      uuid
    references public.orders(id) on delete set null,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now(),

  -- One entitlement per user per campaign. Enforced at DB level.
  unique (campaign_id, user_id)
);
create index if not exists coupon_entitlements_user_idx
  on public.coupon_entitlements(user_id);
create index if not exists coupon_entitlements_campaign_idx
  on public.coupon_entitlements(campaign_id);
create index if not exists coupon_entitlements_status_idx
  on public.coupon_entitlements(status);

create trigger coupon_entitlements_touch before update on public.coupon_entitlements
  for each row execute function public.touch_updated_at();

-- ── 6. Coupon redemption audit log ───────────────────────────────────────────

create table if not exists public.coupon_redemption_events (
  id              bigserial primary key,
  campaign_id     uuid not null
    references public.coupon_campaigns(id) on delete cascade,
  entitlement_id  uuid
    references public.coupon_entitlements(id) on delete set null,
  user_id         uuid not null
    references public.profiles(id) on delete cascade,
  order_id        uuid
    references public.orders(id) on delete set null,
  event_type      text not null
    check (event_type in (
      'issued',
      'check',
      'applied',
      'redeemed',
      'failed',
      'expired',
      'cancelled',
      'refunded'
    )),
  discount_amount numeric(10,2),
  metadata        jsonb default '{}'::jsonb,
  created_at      timestamptz default now()
);
create index if not exists coupon_events_campaign_idx
  on public.coupon_redemption_events(campaign_id);
create index if not exists coupon_events_user_idx
  on public.coupon_redemption_events(user_id);
create index if not exists coupon_events_created_idx
  on public.coupon_redemption_events(created_at desc);

-- ── 7. Stored function: atomic entitlement redemption ────────────────────────
-- Called from the server-side capture-order route. Returns the discount amount
-- or raises an exception (caught by the route as an error). Uses SELECT FOR
-- UPDATE SKIP LOCKED to prevent race conditions between concurrent checkouts.

create or replace function public.fn_redeem_coupon_entitlement(
  p_campaign_id  uuid,
  p_user_id      uuid,
  p_order_id     uuid
)
returns numeric          -- discount value (e.g. 15.00 for 15%)
language plpgsql
security definer
as $$
declare
  v_entitlement   public.coupon_entitlements%rowtype;
  v_campaign      public.coupon_campaigns%rowtype;
  v_discount      numeric;
  v_now           timestamptz := now();
begin
  -- Lock the entitlement row for atomic check + update
  select * into v_entitlement
    from public.coupon_entitlements
   where campaign_id = p_campaign_id
     and user_id     = p_user_id
     for update skip locked;

  if not found then
    raise exception 'COUPON_NOT_FOUND: No entitlement for this user and campaign.';
  end if;

  if v_entitlement.status <> 'active' then
    raise exception 'COUPON_NOT_ACTIVE: Entitlement status is %.', v_entitlement.status;
  end if;

  -- Fetch campaign
  select * into v_campaign
    from public.coupon_campaigns
   where id = p_campaign_id;

  if v_campaign.status not in ('active', 'scheduled') then
    raise exception 'CAMPAIGN_NOT_ACTIVE: Campaign status is %.', v_campaign.status;
  end if;

  if v_now < v_campaign.starts_at then
    raise exception 'CAMPAIGN_NOT_STARTED: Campaign starts at %.', v_campaign.starts_at;
  end if;

  if v_now > v_campaign.expires_at then
    raise exception 'CAMPAIGN_EXPIRED: Campaign expired at %.', v_campaign.expires_at;
  end if;

  -- Mark redeemed
  update public.coupon_entitlements
     set status      = 'redeemed',
         redeemed_at = v_now,
         order_id    = p_order_id,
         updated_at  = v_now
   where id = v_entitlement.id;

  -- Increment campaign counter
  update public.coupon_campaigns
     set redeemed_count = redeemed_count + 1,
         updated_at     = v_now
   where id = p_campaign_id;

  -- Audit log
  v_discount := v_campaign.discount_value;
  insert into public.coupon_redemption_events
    (campaign_id, entitlement_id, user_id, order_id, event_type, discount_amount)
  values
    (p_campaign_id, v_entitlement.id, p_user_id, p_order_id, 'redeemed', v_discount);

  return v_discount;
end;
$$;

-- ── 8. RLS ───────────────────────────────────────────────────────────────────

alter table public.newsletter_issue_news       enable row level security;
alter table public.newsletter_issue_blogs      enable row level security;
alter table public.coupon_campaigns            enable row level security;
alter table public.coupon_entitlements         enable row level security;
alter table public.coupon_redemption_events    enable row level security;

-- Junction tables: staff read, editor write
create policy nl_issue_news_staff_read  on public.newsletter_issue_news for select using (public.app_is_staff());
create policy nl_issue_news_editor_all  on public.newsletter_issue_news for all    using (public.app_is_editor()) with check (public.app_is_editor());

create policy nl_issue_blogs_staff_read on public.newsletter_issue_blogs for select using (public.app_is_staff());
create policy nl_issue_blogs_editor_all on public.newsletter_issue_blogs for all   using (public.app_is_editor()) with check (public.app_is_editor());

-- coupon_campaigns: staff read, editor write
create policy cc_staff_read  on public.coupon_campaigns for select using (public.app_is_staff());
create policy cc_editor_all  on public.coupon_campaigns for all    using (public.app_is_editor()) with check (public.app_is_editor());

-- coupon_entitlements: owner can read their own, editor all
create policy ce_owner_read  on public.coupon_entitlements for select
  using (user_id = auth.uid() or public.app_is_staff());
create policy ce_editor_all  on public.coupon_entitlements for all
  using (public.app_is_editor()) with check (public.app_is_editor());

-- redemption events: owner can read their own, editor all
create policy cre_owner_read on public.coupon_redemption_events for select
  using (user_id = auth.uid() or public.app_is_staff());
create policy cre_editor_all on public.coupon_redemption_events for all
  using (public.app_is_editor()) with check (public.app_is_editor());

-- ── 9. Convenience view: active entitlement for the current user ─────────────

create or replace view public.v_my_active_entitlement as
select
  ce.id                  as entitlement_id,
  ce.campaign_id,
  ce.status              as entitlement_status,
  cc.display_code,
  cc.discount_type,
  cc.discount_value,
  cc.applies_to,
  cc.applies_to_slug,
  cc.minimum_order_cents,
  cc.allow_stacking,
  cc.starts_at,
  cc.expires_at,
  cc.status              as campaign_status,
  nc.issue_number,
  nc.title               as issue_title,
  nc.promo_headline,
  nc.promo_product_slug
from public.coupon_entitlements ce
join public.coupon_campaigns cc on cc.id = ce.campaign_id
join public.newsletter_campaigns nc on nc.id = cc.newsletter_campaign_id
where ce.user_id      = auth.uid()
  and ce.status       = 'active'
  and cc.status      in ('active','scheduled')
  and cc.expires_at   > now()
  and cc.starts_at   <= now();

-- No RLS on the view — the WHERE clause already scopes to auth.uid().
grant select on public.v_my_active_entitlement to authenticated;

-- ── 10. Helper: auto-activate coupon_campaigns when starts_at arrives ─────────
-- Called by the existing refresh-coupons cron job.

create or replace function public.fn_activate_due_coupon_campaigns()
returns void language plpgsql as $$
begin
  update public.coupon_campaigns
     set status     = 'active',
         updated_at = now()
   where status     = 'scheduled'
     and starts_at  <= now();

  update public.coupon_campaigns
     set status     = 'ended',
         updated_at = now()
   where status     = 'active'
     and expires_at <  now();
end;
$$;

-- ── 11. Seed: Issue #1 newsletter campaign ────────────────────────────────────

insert into public.newsletter_campaigns (
  title,
  slug,
  archive_slug,
  issue_number,
  publication_date,
  subject,
  preheader,
  status,
  note_title,
  note_body,
  promo_headline,
  promo_subheading,
  promo_product_slug,
  promo_discount_pct,
  promo_button_label,
  promo_button_url,
  promo_starts_at,
  promo_expires_at,
  tip_title,
  tip_body,
  tip_age_range,
  news_mode,
  blog_mode
) values (
  'OWL Weekly — Issue #1',
  'owl-weekly-issue-1',
  'issue-1',
  1,
  '2026-07-26',
  'OWL Weekly Issue #1 | Inspire. Educate. Together.',
  'Welcome to the first OWL Weekly — your Sunday letter from Larissa.',
  'draft',
  'A Note from OWL',
  'Hello OWL families! Welcome to the very first issue of OWL Weekly. Each Sunday, we''ll share joyful learning ideas, helpful parenting resources, and a quick look at what''s new across OWL. We hope this weekly note helps your family sing, learn, and grow together.',
  'This Week''s Store Perk',
  'Exclusively for OWL Weekly subscribers',
  'owl-sweatshirt',
  15,
  'Shop the Store',
  '/shop?utm_source=owl_weekly&utm_medium=email&utm_campaign=owl_weekly_issue_1',
  '2026-07-26 00:00:00+00',
  '2026-08-02 23:59:59+00',
  'Create Calm with Daily Routines',
  'Simple routines help kids feel safe, understood, and ready to learn. Try reading a book, singing a lullaby, or turning on gentle music at the same time each day. Small moments today build big security tomorrow.',
  'Infant – 12',
  'auto',
  'auto'
)
on conflict (slug) do nothing;

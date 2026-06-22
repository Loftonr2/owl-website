-- ============================================================================
-- OWL Command Center — Migration 0005: Affiliate Center + Coupon Engine
-- ============================================================================
-- Affiliate partners / products / coupons / revenue, with an admin-only vault
-- for API credentials, plus an automated coupon-harvesting model that surfaces
-- active codes into the newsletter builder.
-- ============================================================================

-- ── affiliate_networks — integration programs (non-secret metadata) ─────────
create table public.affiliate_networks (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  kind text not null default 'network' check (kind in ('network','merchant','direct')),
  api_base text,
  auth_type text,                   -- 'oauth','api_key','pat','none'
  website text,
  default_commission_rate numeric(6,3),
  coupon_feed_url text,
  status text not null default 'active' check (status in ('active','paused','disabled')),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create trigger affiliate_networks_touch before update on public.affiliate_networks
  for each row execute function public.touch_updated_at();
create trigger affiliate_networks_audit after insert or update or delete on public.affiliate_networks
  for each row execute function public.fn_audit();

insert into public.affiliate_networks (slug, name, kind, website) values
  ('amazon-associates',  'Amazon Associates',  'network',  'https://affiliate-program.amazon.com'),
  ('shareasale',         'ShareASale',         'network',  'https://www.shareasale.com'),
  ('cj-affiliate',       'CJ Affiliate',       'network',  'https://www.cj.com'),
  ('rakuten',            'Rakuten Advertising','network',  'https://rakutenadvertising.com'),
  ('bookshop',           'Bookshop.org',       'merchant', 'https://bookshop.org'),
  ('lovevery',           'Lovevery',           'merchant', 'https://lovevery.com'),
  ('learning-resources', 'Learning Resources', 'merchant', 'https://www.learningresources.com'),
  ('lakeshore-learning', 'Lakeshore Learning', 'merchant', 'https://www.lakeshorelearning.com'),
  ('kiwico',             'KiwiCo',             'merchant', 'https://www.kiwico.com'),
  ('little-passports',   'Little Passports',   'merchant', 'https://www.littlepassports.com'),
  ('green-kid-crafts',   'Green Kid Crafts',   'merchant', 'https://www.greenkidcrafts.com'),
  ('highlights',         'Highlights',         'merchant', 'https://www.highlights.com')
on conflict (slug) do nothing;

-- ── affiliate_credentials — admin/owner-only secret vault ───────────────────
-- Prefer storing a reference to a Vercel env var (secret_ref) over the raw
-- value; the raw column exists for networks without env-var support.
create table public.affiliate_credentials (
  id uuid primary key default gen_random_uuid(),
  network_id uuid not null references public.affiliate_networks(id) on delete cascade,
  label text not null,
  secret_ref text,                  -- e.g. 'SHAREASALE_API_TOKEN'
  secret_value text,                -- optional inline secret (admin-only RLS)
  meta jsonb default '{}'::jsonb,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index affiliate_credentials_network_idx on public.affiliate_credentials(network_id);
create trigger affiliate_credentials_touch before update on public.affiliate_credentials
  for each row execute function public.touch_updated_at();
create trigger affiliate_credentials_audit after insert or update or delete on public.affiliate_credentials
  for each row execute function public.fn_audit();

-- ── affiliate_partners — merchant/brand programs we promote ─────────────────
create table public.affiliate_partners (
  id uuid primary key default gen_random_uuid(),
  network_id uuid references public.affiliate_networks(id) on delete set null,
  slug text unique not null,
  name text not null,
  contact_email citext,
  account_id text,
  tracking_id text,
  commission_rate numeric(6,3),
  website text,
  status text not null default 'active' check (status in ('active','paused','ended')),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index affiliate_partners_network_idx on public.affiliate_partners(network_id);
create trigger affiliate_partners_touch before update on public.affiliate_partners
  for each row execute function public.touch_updated_at();
create trigger affiliate_partners_audit after insert or update or delete on public.affiliate_partners
  for each row execute function public.fn_audit();

-- ── affiliate_products — promotable items + tracking links ──────────────────
create table public.affiliate_products (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid references public.affiliate_partners(id) on delete cascade,
  network_id uuid references public.affiliate_networks(id) on delete set null,
  external_product_id text,
  title text not null,
  brand text,
  category text,
  age_range text,
  price_cents integer,
  currency text default 'USD',
  affiliate_url text not null,
  image_url text,
  commission_rate numeric(6,3),
  status text not null default 'active' check (status in ('active','inactive','out_of_stock')),
  last_synced_at timestamptz,
  raw jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index affiliate_products_partner_idx on public.affiliate_products(partner_id);
create index affiliate_products_status_idx on public.affiliate_products(status);
create trigger affiliate_products_touch before update on public.affiliate_products
  for each row execute function public.touch_updated_at();

-- ── affiliate_clicks — outbound click tracking ──────────────────────────────
create table public.affiliate_clicks (
  id bigserial primary key,
  product_id uuid references public.affiliate_products(id) on delete set null,
  coupon_id uuid,                   -- FK added after coupons table below
  partner_id uuid references public.affiliate_partners(id) on delete set null,
  contact_id uuid references public.crm_contacts(id) on delete set null,
  url text,
  referrer text,
  ip inet,
  user_agent text,
  occurred_at timestamptz default now()
);
create index affiliate_clicks_product_idx on public.affiliate_clicks(product_id);
create index affiliate_clicks_occurred_idx on public.affiliate_clicks(occurred_at desc);

-- ── affiliate_revenue — commissions + revenue history ───────────────────────
create table public.affiliate_revenue (
  id uuid primary key default gen_random_uuid(),
  network_id uuid references public.affiliate_networks(id) on delete set null,
  partner_id uuid references public.affiliate_partners(id) on delete set null,
  product_id uuid references public.affiliate_products(id) on delete set null,
  external_order_id text,
  clicks integer default 0,
  conversions integer default 0,
  sale_amount_cents integer default 0,
  commission_cents integer default 0,
  currency text default 'USD',
  status text not null default 'pending' check (status in ('pending','confirmed','paid','reversed')),
  period_start date,
  period_end date,
  recorded_at timestamptz default now(),
  raw jsonb
);
create index affiliate_revenue_network_idx on public.affiliate_revenue(network_id);
create index affiliate_revenue_period_idx on public.affiliate_revenue(period_start, period_end);
create index affiliate_revenue_status_idx on public.affiliate_revenue(status);

-- ── coupons — unified store + affiliate + newsletter codes ──────────────────
create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  scope text not null default 'store' check (scope in ('store','affiliate','newsletter')),
  network_id uuid references public.affiliate_networks(id) on delete set null,
  partner_id uuid references public.affiliate_partners(id) on delete set null,
  title text,
  description text,
  discount_type text check (discount_type in ('percent','fixed','bogo','free_shipping','other')),
  discount_value numeric(10,2),
  currency text default 'USD',
  min_order_cents integer,
  affiliate_url text,
  landing_url text,
  starts_at timestamptz,
  expires_at timestamptz,
  usage_limit integer,
  used_count integer not null default 0,
  status text not null default 'active' check (status in ('active','scheduled','expired','disabled')),
  source text not null default 'manual' check (source in ('manual','harvested')),
  harvested_from text,
  last_verified_at timestamptz,
  featured boolean default false,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create unique index coupons_code_network_uidx on public.coupons (lower(code), coalesce(network_id, '00000000-0000-0000-0000-000000000000'::uuid));
create index coupons_status_idx on public.coupons(status);
create index coupons_scope_idx on public.coupons(scope);
create index coupons_expires_idx on public.coupons(expires_at);
create trigger coupons_touch before update on public.coupons
  for each row execute function public.touch_updated_at();
create trigger coupons_audit after insert or update or delete on public.coupons
  for each row execute function public.fn_audit();

-- Now that coupons exists, wire the deferred FK from affiliate_clicks.
alter table public.affiliate_clicks
  add constraint affiliate_clicks_coupon_fk
  foreign key (coupon_id) references public.coupons(id) on delete set null;

-- ── coupon_redemptions ──────────────────────────────────────────────────────
create table public.coupon_redemptions (
  id uuid primary key default gen_random_uuid(),
  coupon_id uuid references public.coupons(id) on delete set null,
  code text not null,
  order_id uuid references public.orders(id) on delete set null,
  contact_id uuid references public.crm_contacts(id) on delete set null,
  contact_email citext,
  campaign_id uuid references public.newsletter_campaigns(id) on delete set null,
  discount_cents integer,
  source text,
  redeemed_at timestamptz default now()
);
create index coupon_redemptions_coupon_idx on public.coupon_redemptions(coupon_id);
create index coupon_redemptions_redeemed_idx on public.coupon_redemptions(redeemed_at desc);

-- Bump used_count on redemption.
create or replace function public.fn_coupon_redeem()
returns trigger language plpgsql as $$
begin
  if new.coupon_id is not null then
    update public.coupons set used_count = used_count + 1 where id = new.coupon_id;
  end if;
  return new;
end;
$$;
create trigger coupon_redeem_count after insert on public.coupon_redemptions
  for each row execute function public.fn_coupon_redeem();

-- ── coupon_harvest_runs — automated harvesting log ──────────────────────────
create table public.coupon_harvest_runs (
  id uuid primary key default gen_random_uuid(),
  network_id uuid references public.affiliate_networks(id) on delete set null,
  started_at timestamptz default now(),
  finished_at timestamptz,
  status text not null default 'running' check (status in ('running','success','failed')),
  found_count integer default 0,
  new_count integer default 0,
  updated_count integer default 0,
  expired_count integer default 0,
  log text,
  error text
);
create index coupon_harvest_runs_network_idx on public.coupon_harvest_runs(network_id);

-- ── newsletter ↔ coupon link (active coupons surfaced in the builder) ───────
create table public.newsletter_campaign_coupons (
  campaign_id uuid not null references public.newsletter_campaigns(id) on delete cascade,
  coupon_id uuid not null references public.coupons(id) on delete cascade,
  position smallint default 0,
  primary key (campaign_id, coupon_id)
);

-- ── Backfill deferred CRM FKs now that affiliate_partners exists ────────────
alter table public.crm_contacts
  add constraint crm_contacts_affiliate_fk
  foreign key (affiliate_id) references public.affiliate_partners(id) on delete set null;
alter table public.crm_referrals
  add constraint crm_referrals_affiliate_fk
  foreign key (affiliate_id) references public.affiliate_partners(id) on delete set null;

-- ── RLS ─────────────────────────────────────────────────────────────────────
alter table public.affiliate_networks          enable row level security;
alter table public.affiliate_credentials        enable row level security;
alter table public.affiliate_partners           enable row level security;
alter table public.affiliate_products           enable row level security;
alter table public.affiliate_clicks             enable row level security;
alter table public.affiliate_revenue            enable row level security;
alter table public.coupons                      enable row level security;
alter table public.coupon_redemptions           enable row level security;
alter table public.coupon_harvest_runs          enable row level security;
alter table public.newsletter_campaign_coupons  enable row level security;

create policy aff_net_staff_read   on public.affiliate_networks   for select using (public.app_is_staff());
create policy aff_net_editor_all   on public.affiliate_networks   for all    using (public.app_is_editor()) with check (public.app_is_editor());

-- Credentials: admin/owner only, no staff read.
create policy aff_cred_admin_all   on public.affiliate_credentials for all   using (public.app_is_admin()) with check (public.app_is_admin());

create policy aff_part_staff_read  on public.affiliate_partners   for select using (public.app_is_staff());
create policy aff_part_editor_all  on public.affiliate_partners   for all    using (public.app_is_editor()) with check (public.app_is_editor());

create policy aff_prod_staff_read  on public.affiliate_products   for select using (public.app_is_staff());
create policy aff_prod_editor_all  on public.affiliate_products   for all    using (public.app_is_editor()) with check (public.app_is_editor());

create policy aff_click_staff_read on public.affiliate_clicks     for select using (public.app_is_staff());
create policy aff_click_editor_all on public.affiliate_clicks     for all    using (public.app_is_editor()) with check (public.app_is_editor());

create policy aff_rev_staff_read   on public.affiliate_revenue    for select using (public.app_is_staff());
create policy aff_rev_editor_all   on public.affiliate_revenue    for all    using (public.app_is_editor()) with check (public.app_is_editor());

create policy coupons_staff_read   on public.coupons              for select using (public.app_is_staff());
create policy coupons_editor_all   on public.coupons              for all    using (public.app_is_editor()) with check (public.app_is_editor());

create policy coupon_redeem_staff_read on public.coupon_redemptions for select using (public.app_is_staff());
create policy coupon_redeem_editor_all on public.coupon_redemptions for all    using (public.app_is_editor()) with check (public.app_is_editor());

create policy harvest_staff_read   on public.coupon_harvest_runs  for select using (public.app_is_staff());
create policy harvest_editor_all   on public.coupon_harvest_runs  for all    using (public.app_is_editor()) with check (public.app_is_editor());

create policy nl_coupon_staff_read on public.newsletter_campaign_coupons for select using (public.app_is_staff());
create policy nl_coupon_editor_all on public.newsletter_campaign_coupons for all    using (public.app_is_editor()) with check (public.app_is_editor());

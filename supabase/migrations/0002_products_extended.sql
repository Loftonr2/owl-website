-- ============================================================================
-- OWL Sing Together — Products table extended for CRM
-- File:    supabase/migrations/0002_products_extended.sql
-- Run via: supabase db push  OR paste into Supabase Dashboard → SQL Editor
-- ============================================================================

-- Add all CRM fields to the existing products table
alter table public.products
  add column if not exists printify_product_id   text,
  add column if not exists product_type          text,
  add column if not exists description           text,
  add column if not exists short_description     text,
  add column if not exists cost_cents            integer check (cost_cents >= 0),
  add column if not exists profit_cents          integer,
  add column if not exists margin_percent        numeric(5,2),
  add column if not exists product_source        text not null default 'website_exclusive'
    check (product_source in ('printify','website_exclusive','digital_product')),
  add column if not exists images                jsonb default '[]'::jsonb,
  add column if not exists tags                  text[] default '{}'::text[],
  add column if not exists seo_title             text,
  add column if not exists seo_description       text,
  add column if not exists coming_soon           boolean not null default true,
  add column if not exists archived_at           timestamptz;

-- Extend the status check to match the CRM spec
-- (adds 'coming_soon' alongside existing: draft, active, archived)
alter table public.products
  drop constraint if exists products_status_check;

alter table public.products
  add constraint products_status_check
  check (status in ('live','draft','coming_soon','archived'));

-- Extend channel to include 'printful' (spreadsheet source says Printful)
alter table public.products
  drop constraint if exists products_channel_check;

alter table public.products
  add constraint products_channel_check
  check (channel in ('shopify','printify','printful','gumroad','etsy','kdp','tpt','website'));

-- Indexes for CRM query patterns
create index if not exists products_product_source_idx on public.products(product_source);
create index if not exists products_coming_soon_idx on public.products(coming_soon);
create index if not exists products_category_idx on public.products(category);
create index if not exists products_tags_idx on public.products using gin(tags);
create index if not exists products_printify_id_idx on public.products(printify_product_id);

-- ============================================================================
-- Product categories lookup table
-- ============================================================================
create table if not exists public.product_categories (
  slug text primary key,
  name text not null,
  sort_order smallint default 0,
  created_at timestamptz default now()
);

insert into public.product_categories (slug, name, sort_order) values
  ('apparel',              'Apparel',              1),
  ('headwear',             'Headwear',             2),
  ('drinkware',            'Drinkware',            3),
  ('home-accessories',     'Home & Accessories',   4),
  ('stickers',             'Stickers',             5),
  ('plush',                'Plush',                6),
  ('flashcards',           'Flashcards',           7),
  ('coloring',             'Coloring',             8),
  ('digital',              'Digital',              9),
  ('music',                'Music',               10),
  ('backpacks',            'Backpacks',           11),
  ('accessories',          'Accessories',         12),
  ('stationery',           'Stationery',          13),
  ('educational-products', 'Educational Products',14),
  ('home-decor',           'Home & Decor',        15),
  ('bundles',              'Bundles',             16),
  ('coming-soon',          'Coming Soon',         17)
on conflict (slug) do nothing;

alter table public.product_categories enable row level security;

create policy if not exists "product_categories_public_read"
  on public.product_categories for select using (true);

create policy if not exists "product_categories_admin_write"
  on public.product_categories for all using (
    exists (select 1 from public.profiles p
            where p.id = auth.uid() and p.role in ('editor','admin','owner'))
  );

-- ============================================================================
-- RLS: allow public read for coming_soon products too (not just active)
-- ============================================================================
drop policy if exists "products_public_read_active" on public.products;

create policy "products_public_read"
  on public.products for select
  using (status in ('live','coming_soon'));

-- ============================================================================
-- Done. After running:
--   1. supabase db push  (or paste into SQL Editor)
--   2. Seed products via /api/admin/sync-printify or the admin CRM
-- ============================================================================

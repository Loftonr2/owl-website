-- ============================================================================
-- OWL Command Center — Migration 0006: Commerce + Downloads + Blog links
-- ============================================================================
-- Normalized order line items for "top products" reporting, store-coupon
-- attribution, curriculum/lead-magnet download tracking, and the blog-post
-- relationship graph (newsletter, affiliate products, OWL products, lead magnets).
-- ============================================================================

-- ── Store coupon attribution + staff read on orders ─────────────────────────
alter table public.orders add column if not exists coupon_code text;

create policy orders_staff_read
  on public.orders for select using (public.app_is_staff());

-- ── order_items — normalized lines for product-level analytics ──────────────
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  sku text,
  title text not null,
  quantity integer not null default 1,
  unit_price_cents integer not null default 0,
  total_cents integer not null default 0,
  channel text,
  created_at timestamptz default now()
);
create index order_items_order_idx on public.order_items(order_id);
create index order_items_product_idx on public.order_items(product_id);

-- ── lead_magnets — gated freebies that grow the list ────────────────────────
create table public.lead_magnets (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  bucket text default 'printables-free',
  storage_path text,
  file_url text,
  status text not null default 'active' check (status in ('active','archived')),
  download_count integer not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create trigger lead_magnets_touch before update on public.lead_magnets
  for each row execute function public.touch_updated_at();

-- ── downloads — curriculum + printable + lead-magnet download history ───────
create table public.downloads (
  id bigserial primary key,
  contact_id uuid references public.crm_contacts(id) on delete set null,
  email citext,
  resource_type text not null check (resource_type in ('printable','curriculum_pdf','lead_magnet','other')),
  resource_id uuid,
  lesson_id uuid references public.lessons(id) on delete set null,
  product_id uuid references public.products(id) on delete set null,
  lead_magnet_id uuid references public.lead_magnets(id) on delete set null,
  file_name text,
  channel text check (channel in ('free','gated')),
  ip inet,
  user_agent text,
  downloaded_at timestamptz default now()
);
create index downloads_contact_idx on public.downloads(contact_id);
create index downloads_type_idx on public.downloads(resource_type);
create index downloads_when_idx on public.downloads(downloaded_at desc);

-- Bump lead-magnet counters as downloads land.
create or replace function public.fn_download_count()
returns trigger language plpgsql as $$
begin
  if new.lead_magnet_id is not null then
    update public.lead_magnets set download_count = download_count + 1 where id = new.lead_magnet_id;
  end if;
  return new;
end;
$$;
create trigger download_count after insert on public.downloads
  for each row execute function public.fn_download_count();

-- ── Blog post enrichment + relationship graph ───────────────────────────────
alter table public.blog_posts
  add column if not exists scheduled_for timestamptz,
  add column if not exists author_id uuid references public.profiles(id),
  add column if not exists newsletter_campaign_id uuid references public.newsletter_campaigns(id) on delete set null,
  add column if not exists lead_magnet_id uuid references public.lead_magnets(id) on delete set null,
  add column if not exists excerpt text;

create table public.blog_post_relations (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.blog_posts(id) on delete cascade,
  relation_type text not null
    check (relation_type in ('owl_product','affiliate_product','lead_magnet','coupon','video','newsletter')),
  target_id uuid,
  target_url text,
  label text,
  position smallint default 0,
  created_at timestamptz default now()
);
create index blog_post_relations_post_idx on public.blog_post_relations(post_id);

-- ── RLS ─────────────────────────────────────────────────────────────────────
alter table public.order_items         enable row level security;
alter table public.lead_magnets        enable row level security;
alter table public.downloads           enable row level security;
alter table public.blog_post_relations enable row level security;

create policy order_items_staff_read  on public.order_items        for select using (public.app_is_staff());
create policy order_items_editor_all  on public.order_items        for all    using (public.app_is_editor()) with check (public.app_is_editor());

-- Lead magnets are public-facing resources: anyone may read active ones.
create policy lead_magnets_public_read on public.lead_magnets      for select using (status = 'active');
create policy lead_magnets_editor_all  on public.lead_magnets      for all    using (public.app_is_editor()) with check (public.app_is_editor());

create policy downloads_staff_read     on public.downloads          for select using (public.app_is_staff());
create policy downloads_editor_all     on public.downloads          for all    using (public.app_is_editor()) with check (public.app_is_editor());

create policy blog_rel_public_read     on public.blog_post_relations for select using (true);
create policy blog_rel_editor_all      on public.blog_post_relations for all    using (public.app_is_editor()) with check (public.app_is_editor());

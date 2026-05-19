-- ============================================================================
-- OWL Sing Together — Initial migration
-- File:    supabase/migrations/0001_initial.sql
-- Source:  ../../OWL_BUILD_PLAN.md § 4 + ../../OWL-Obsidian-Brain/04_CRM_Admin/ADMIN_CRM_REQUIREMENTS.md
-- ============================================================================
-- Run via Supabase CLI:   supabase db push
-- Or paste into Supabase Dashboard → SQL Editor → New query → Run.
-- ============================================================================

-- Extensions ---------------------------------------------------------------
create extension if not exists "pgcrypto";
create extension if not exists "citext";

-- ============================================================================
-- 1. profiles — app-level user record (mirrors auth.users)
-- ============================================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email citext unique not null,
  full_name text,
  display_name text,
  role text not null default 'viewer'
    check (role in ('viewer','educator','editor','admin','owner')),
  avatar_url text,
  marketing_consent boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index profiles_role_idx on public.profiles(role);

-- Auto-create a profile row whenever auth.users gets a new row.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', null));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ============================================================================
-- 2. blog_categories — 6 pillar hubs (also lives in Sanity but we mirror
--    for fast joins with blog_posts in the admin dashboard)
-- ============================================================================
create table public.blog_categories (
  slug text primary key,
  name text not null,
  description text,
  hub_url text not null
);

insert into public.blog_categories (slug, name, description, hub_url) values
  ('cultural-holidays',       'Cultural Holidays',       'Heritage celebrations from around the world for parents and educators.', '/blog/cultural-holidays'),
  ('early-learning',          'Early Learning',          'ABCs, counting, shapes, colors — the foundational years.',               '/blog/early-learning'),
  ('sel-for-kids',            'SEL for Kids',            'Naming feelings, building empathy, calm parenting tools.',              '/blog/sel-for-kids'),
  ('educational-gifts',       'Educational Gifts',       'Gift guides that actually support learning.',                            '/blog/educational-gifts'),
  ('educator-resources',      'Educator Resources',      'Standards-aligned, culturally responsive classroom tools.',              '/blog/educator-resources'),
  ('music-child-development', 'Music & Child Development','Why music + repetition build little brains.',                            '/blog/music-child-development')
on conflict (slug) do nothing;

-- ============================================================================
-- 3. blog_posts — Sanity mirror for analytics & cache
-- ============================================================================
create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  sanity_id text unique not null,
  slug text unique not null,
  title text not null,
  category_slug text references public.blog_categories(slug),
  summary text,
  status text not null default 'draft'
    check (status in ('draft','scheduled','published','archived')),
  published_at timestamptz,
  view_count integer default 0,
  click_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index blog_posts_status_idx on public.blog_posts(status);
create index blog_posts_category_idx on public.blog_posts(category_slug);
create index blog_posts_published_at_idx on public.blog_posts(published_at desc);

-- ============================================================================
-- 4. products — Shopify / Printify / Gumroad / Etsy / KDP / TpT mirror
-- ============================================================================
create table public.products (
  id uuid primary key default gen_random_uuid(),
  shopify_product_id text unique,
  sanity_id text unique,
  sku text unique,
  title text not null,
  slug text unique not null,
  price_cents integer not null check (price_cents >= 0),
  category text,
  age_range text,
  channel text not null
    check (channel in ('shopify','printify','gumroad','etsy','kdp','tpt')),
  status text not null default 'draft'
    check (status in ('draft','active','archived')),
  featured boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index products_channel_idx on public.products(channel);
create index products_status_idx on public.products(status);
create index products_featured_idx on public.products(featured) where featured = true;

-- ============================================================================
-- 5. orders — Shopify + Gumroad + Stripe webhook landing zone
-- ============================================================================
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  external_id text unique not null,
  source text not null check (source in ('shopify','gumroad','stripe')),
  customer_email citext not null,
  total_cents integer not null check (total_cents >= 0),
  currency text default 'USD',
  status text not null
    check (status in ('pending','paid','fulfilled','refunded','cancelled')),
  line_items jsonb not null,
  placed_at timestamptz not null,
  raw_payload jsonb,
  created_at timestamptz default now()
);

create index orders_email_idx on public.orders(customer_email);
create index orders_status_idx on public.orders(status);
create index orders_placed_at_idx on public.orders(placed_at desc);

-- ============================================================================
-- 6. newsletter_subscribers — Beehiiv mirror
-- ============================================================================
create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email citext unique not null,
  beehiiv_subscription_id text unique,
  segments text[] default '{}'::text[],
  signup_source text,
  utm jsonb,
  status text not null default 'active'
    check (status in ('active','unsubscribed','bounced','pending')),
  subscribed_at timestamptz default now(),
  unsubscribed_at timestamptz
);

create index newsletter_subscribers_status_idx on public.newsletter_subscribers(status);
create index newsletter_subscribers_segments_idx on public.newsletter_subscribers using gin(segments);

-- ============================================================================
-- 7. curriculum_programs — 6 Birth–5 tiers + future expansion
-- ============================================================================
create table public.curriculum_programs (
  id uuid primary key default gen_random_uuid(),
  tier_number smallint not null,
  slug text unique not null,
  name text not null,
  age_band text not null,
  framework text not null,
  year_pack_price_cents integer,
  bundle_price_cents integer,
  description text,
  status text not null default 'draft'
    check (status in ('draft','active','archived')),
  created_at timestamptz default now()
);

insert into public.curriculum_programs (tier_number, slug, name, age_band, framework, year_pack_price_cents, bundle_price_cents, description) values
  (1, 'owl-babies',          'OWL Babies',              '0-1', 'Head Start ELOF Infant',          7900,  12900, 'Lullabies, sensory songs, first words, movement.'),
  (2, 'owl-toddlers-early',  'OWL Toddlers Early',      '1-2', 'Head Start ELOF Infant/Toddler',  8900,  14900, 'Language explosion, identity, self-regulation.'),
  (3, 'owl-toddlers',        'OWL Toddlers',            '2-3', 'Head Start ELOF Toddler',         9900,  16900, 'ABCs, counting, shapes, big feelings.'),
  (4, 'owl-prek-3s',         'OWL PreK 3s',             '3-4', 'State PreK + ELOF',              11900,  19900, 'Vocabulary, numbers, multicultural arts, science.'),
  (5, 'owl-prek-4s',         'OWL PreK 4s',             '4-5', 'State PreK + ELOF 60-month',     13900,  22900, 'Phonics, reading, K-readiness, social skills.'),
  (6, 'birth-5-family-bundle','Birth–5 Family Bundle',  '0-5', '—',                              null,   39900, 'Complete early childhood journey.')
on conflict (slug) do nothing;

-- ============================================================================
-- 8. lesson_categories — units inside a tier
-- ============================================================================
create table public.lesson_categories (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.curriculum_programs(id) on delete cascade,
  unit_number smallint not null,
  title text not null,
  description text,
  unique (program_id, unit_number)
);

-- ============================================================================
-- 9. lessons — 216 weekly lesson plans + ad-hoc
-- ============================================================================
create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  program_id uuid references public.curriculum_programs(id) on delete cascade,
  category_id uuid references public.lesson_categories(id) on delete set null,
  unit_number smallint not null,
  week_number smallint not null,
  title text not null,
  slug text unique not null,
  youtube_video_id text,
  printable_id uuid,
  standards jsonb default '{}'::jsonb,
  pdf_path text,
  status text not null default 'draft'
    check (status in ('draft','active','archived')),
  created_at timestamptz default now(),
  unique (program_id, unit_number, week_number)
);

create index lessons_program_idx on public.lessons(program_id);
create index lessons_status_idx on public.lessons(status);

-- ============================================================================
-- 10. media_assets — Cloudflare R2 + Sanity asset mirror
-- ============================================================================
create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  source text not null check (source in ('sanity','r2','youtube','soundcloud','spotify')),
  kind text not null check (kind in ('image','video','pdf','audio','other')),
  external_id text,
  url text,
  alt_text text,
  meta jsonb,
  uploaded_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

-- ============================================================================
-- 11. contact_messages — public /contact inquiry form
-- ============================================================================
create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  segment text not null
    check (segment in ('parent','educator','media','licensing','sponsor')),
  name text not null,
  email citext not null,
  organization text,
  message text not null,
  status text not null default 'new'
    check (status in ('new','triaged','responded','archived')),
  ip_address inet,
  created_at timestamptz default now()
);

create index contact_messages_status_idx on public.contact_messages(status);
create index contact_messages_segment_idx on public.contact_messages(segment);

-- ============================================================================
-- 12. audit_log — every admin mutation lands here
-- ============================================================================
create table public.audit_log (
  id bigserial primary key,
  actor uuid references public.profiles(id),
  action text not null,
  entity text not null,
  entity_id text,
  diff jsonb,
  ip_address inet,
  created_at timestamptz default now()
);

create index audit_log_entity_idx on public.audit_log(entity, entity_id);
create index audit_log_actor_idx on public.audit_log(actor);

-- ============================================================================
-- 13. admin_users — convenience view of role >= editor
-- ============================================================================
create or replace view public.admin_users as
  select id, email, role, full_name
  from public.profiles
  where role in ('editor','admin','owner');

-- ============================================================================
-- Updated-at trigger (reusable)
-- ============================================================================
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();
create trigger blog_posts_touch before update on public.blog_posts
  for each row execute function public.touch_updated_at();
create trigger products_touch before update on public.products
  for each row execute function public.touch_updated_at();

-- ============================================================================
-- Row-Level Security — enable on every public table
-- ============================================================================
alter table public.profiles                enable row level security;
alter table public.blog_categories         enable row level security;
alter table public.blog_posts              enable row level security;
alter table public.products                enable row level security;
alter table public.orders                  enable row level security;
alter table public.newsletter_subscribers  enable row level security;
alter table public.curriculum_programs     enable row level security;
alter table public.lesson_categories       enable row level security;
alter table public.lessons                 enable row level security;
alter table public.media_assets            enable row level security;
alter table public.contact_messages        enable row level security;
alter table public.audit_log               enable row level security;

-- profiles ----------------------------------------------------------------
create policy "profiles_self_read"
  on public.profiles for select using (auth.uid() = id);

create policy "profiles_self_update"
  on public.profiles for update using (auth.uid() = id);

create policy "profiles_admin_read_all"
  on public.profiles for select using (
    exists (select 1 from public.profiles p
            where p.id = auth.uid() and p.role in ('admin','owner'))
  );

-- blog_categories ---------------------------------------------------------
create policy "blog_categories_public_read"
  on public.blog_categories for select using (true);

create policy "blog_categories_admin_write"
  on public.blog_categories for all using (
    exists (select 1 from public.profiles p
            where p.id = auth.uid() and p.role in ('admin','owner'))
  );

-- blog_posts --------------------------------------------------------------
create policy "blog_posts_public_read_published"
  on public.blog_posts for select using (status = 'published');

create policy "blog_posts_editor_all"
  on public.blog_posts for all using (
    exists (select 1 from public.profiles p
            where p.id = auth.uid() and p.role in ('editor','admin','owner'))
  );

-- products ----------------------------------------------------------------
create policy "products_public_read_active"
  on public.products for select using (status = 'active');

create policy "products_editor_all"
  on public.products for all using (
    exists (select 1 from public.profiles p
            where p.id = auth.uid() and p.role in ('editor','admin','owner'))
  );

-- orders ------------------------------------------------------------------
create policy "orders_customer_self_read"
  on public.orders for select using (
    customer_email = (select email from public.profiles where id = auth.uid())
  );

create policy "orders_admin_all"
  on public.orders for all using (
    exists (select 1 from public.profiles p
            where p.id = auth.uid() and p.role in ('admin','owner'))
  );

-- newsletter_subscribers --------------------------------------------------
create policy "newsletter_admin_all"
  on public.newsletter_subscribers for all using (
    exists (select 1 from public.profiles p
            where p.id = auth.uid() and p.role in ('admin','owner'))
  );

-- curriculum_programs -----------------------------------------------------
create policy "curriculum_public_read_active"
  on public.curriculum_programs for select using (status = 'active');

create policy "curriculum_editor_all"
  on public.curriculum_programs for all using (
    exists (select 1 from public.profiles p
            where p.id = auth.uid() and p.role in ('editor','admin','owner'))
  );

-- lesson_categories -------------------------------------------------------
create policy "lesson_categories_public_read"
  on public.lesson_categories for select using (true);

create policy "lesson_categories_editor_all"
  on public.lesson_categories for all using (
    exists (select 1 from public.profiles p
            where p.id = auth.uid() and p.role in ('editor','admin','owner'))
  );

-- lessons -----------------------------------------------------------------
create policy "lessons_entitled_read"
  on public.lessons for select using (
    exists (select 1 from public.profiles p
            where p.id = auth.uid() and p.role in ('educator','editor','admin','owner'))
  );

create policy "lessons_editor_all"
  on public.lessons for all using (
    exists (select 1 from public.profiles p
            where p.id = auth.uid() and p.role in ('editor','admin','owner'))
  );

-- media_assets ------------------------------------------------------------
create policy "media_public_read"
  on public.media_assets for select using (true);

create policy "media_editor_all"
  on public.media_assets for all using (
    exists (select 1 from public.profiles p
            where p.id = auth.uid() and p.role in ('editor','admin','owner'))
  );

-- contact_messages --------------------------------------------------------
-- Public form uses the service role to insert; this policy permits authed
-- inserts in case we later require email verification.
create policy "contact_anyone_insert"
  on public.contact_messages for insert with check (true);

create policy "contact_admin_read"
  on public.contact_messages for select using (
    exists (select 1 from public.profiles p
            where p.id = auth.uid() and p.role in ('admin','owner'))
  );

create policy "contact_admin_update"
  on public.contact_messages for update using (
    exists (select 1 from public.profiles p
            where p.id = auth.uid() and p.role in ('admin','owner'))
  );

-- audit_log ---------------------------------------------------------------
create policy "audit_admin_only"
  on public.audit_log for all using (
    exists (select 1 from public.profiles p
            where p.id = auth.uid() and p.role in ('admin','owner'))
  );

-- ============================================================================
-- Storage buckets
-- ============================================================================
insert into storage.buckets (id, name, public)
values
  ('printables-free',  'printables-free',  true),
  ('printables-paid',  'printables-paid',  false),
  ('curriculum-pdfs',  'curriculum-pdfs',  false),
  ('media-uploads',    'media-uploads',    true),
  ('og-cache',         'og-cache',         true)
on conflict (id) do nothing;

-- Storage policies --------------------------------------------------------
-- Public buckets allow anonymous read; private buckets only allow editors+ and authed users via signed URLs (signed URLs bypass RLS).
create policy "printables_free_public_read"
  on storage.objects for select
  using (bucket_id = 'printables-free');

create policy "media_uploads_public_read"
  on storage.objects for select
  using (bucket_id = 'media-uploads');

create policy "og_cache_public_read"
  on storage.objects for select
  using (bucket_id = 'og-cache');

create policy "editor_upload_all_buckets"
  on storage.objects for insert
  with check (
    exists (select 1 from public.profiles p
            where p.id = auth.uid() and p.role in ('editor','admin','owner'))
  );

create policy "editor_delete_all_buckets"
  on storage.objects for delete
  using (
    exists (select 1 from public.profiles p
            where p.id = auth.uid() and p.role in ('editor','admin','owner'))
  );

-- ============================================================================
-- Done. After running this migration:
--   1. Sign up your first user via Supabase Auth (Larissa, then Rick).
--   2. Manually set role = 'owner' for those rows in the profiles table.
--   3. Configure Supabase Auth → Settings → Email templates to use your
--      Resend SMTP (or Supabase default for now).
-- ============================================================================

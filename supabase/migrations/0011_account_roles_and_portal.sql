-- ============================================================================
-- OWL Command Center — Migration 0011: 8-role model + customer/teacher portal
-- ============================================================================
-- Opens the platform to public self-service accounts and adds the data
-- foundation for the Customer and Teacher portals.
--
-- Role model (rank):
--   owner(50) admin(40) marketing_manager(35) editor(30) support(20)
--   affiliate(18) teacher(15) customer(5)
-- Staff floor (Command Center access) stays at support(20). customer / teacher /
-- affiliate are below it, so portal users can never reach /admin.
-- ============================================================================

-- ── 1. Migrate legacy role values, then widen the constraint ────────────────
update public.profiles set role = 'customer' where role = 'viewer';
update public.profiles set role = 'teacher'  where role = 'educator';

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check
  check (role in ('customer','teacher','affiliate','support','editor','marketing_manager','admin','owner'));

-- New public signups default to Customer.
alter table public.profiles alter column role set default 'customer';

-- ── 2. Refresh the rank function for the new roles ──────────────────────────
create or replace function public.app_role_rank(p_role text)
returns int language sql immutable set search_path = public as $$
  select case p_role
    when 'owner'             then 50
    when 'admin'             then 40
    when 'marketing_manager' then 35
    when 'editor'            then 30
    when 'support'           then 20
    when 'affiliate'         then 18
    when 'teacher'           then 15
    when 'educator'          then 15   -- legacy alias
    when 'customer'          then 5
    when 'viewer'            then 0    -- legacy alias
    else -1
  end;
$$;

-- ── 3. Teacher applications (approval workflow) ─────────────────────────────
create table public.teacher_applications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  school text,
  role_title text,
  message text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  requested_at timestamptz default now(),
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  notes text
);
create index teacher_applications_profile_idx on public.teacher_applications(profile_id);
create index teacher_applications_status_idx on public.teacher_applications(status);

create trigger teacher_applications_audit after insert or update or delete on public.teacher_applications
  for each row execute function public.fn_audit();

-- Approving an application promotes the profile to 'teacher'.
create or replace function public.fn_teacher_approved()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'approved' and (old.status is distinct from 'approved') then
    new.reviewed_at := now();
    update public.profiles
       set role = 'teacher'
     where id = new.profile_id
       and public.app_role_rank(role) < public.app_role_rank('teacher');
  end if;
  return new;
end;
$$;
create trigger teacher_approved before update on public.teacher_applications
  for each row execute function public.fn_teacher_approved();

-- ── 4. Capture teacher requests at signup via auth metadata ─────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', null));

  if coalesce((new.raw_user_meta_data->>'requested_teacher')::boolean, false) then
    insert into public.teacher_applications (profile_id, school, role_title)
    values (
      new.id,
      new.raw_user_meta_data->>'school',
      new.raw_user_meta_data->>'role_title'
    );
  end if;

  return new;
end;
$$;

-- ── 5. Customer portal data ─────────────────────────────────────────────────

-- Link orders to accounts (by email), backfill, and auto-link future orders.
alter table public.orders add column if not exists profile_id uuid references public.profiles(id) on delete set null;
create index if not exists orders_profile_idx on public.orders(profile_id);
update public.orders o set profile_id = p.id
  from public.profiles p where p.email = o.customer_email and o.profile_id is null;

create or replace function public.fn_link_order_profile()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.profile_id is null then
    select id into new.profile_id from public.profiles where email = new.customer_email limit 1;
  end if;
  return new;
end;
$$;
create trigger link_order_profile before insert on public.orders
  for each row execute function public.fn_link_order_profile();

-- Digital entitlements → power instant, self-service downloads.
create table public.entitlements (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete cascade,
  email citext,
  product_id uuid references public.products(id) on delete set null,
  lead_magnet_id uuid references public.lead_magnets(id) on delete set null,
  order_id uuid references public.orders(id) on delete set null,
  kind text not null default 'digital_product'
    check (kind in ('digital_product','printable','curriculum','coloring_book','membership')),
  source text,
  granted_at timestamptz default now(),
  expires_at timestamptz,
  download_limit integer,
  download_count integer not null default 0,
  revoked boolean not null default false
);
create index entitlements_profile_idx on public.entitlements(profile_id);
create index entitlements_email_idx on public.entitlements(email);
create index entitlements_product_idx on public.entitlements(product_id);

create table public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid references public.products(id) on delete cascade,
  affiliate_product_id uuid references public.affiliate_products(id) on delete cascade,
  note text,
  created_at timestamptz default now()
);
create index wishlist_profile_idx on public.wishlist_items(profile_id);

create table public.saved_addresses (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (kind in ('billing','shipping')),
  full_name text,
  line1 text,
  line2 text,
  city text,
  region text,
  postal_code text,
  country text default 'US',
  phone text,
  is_default boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index saved_addresses_profile_idx on public.saved_addresses(profile_id);
create trigger saved_addresses_touch before update on public.saved_addresses
  for each row execute function public.touch_updated_at();

create table public.loyalty_accounts (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  points integer not null default 0,
  tier text not null default 'seedling' check (tier in ('seedling','sprout','bloom','canopy')),
  updated_at timestamptz default now()
);

create table public.loyalty_events (
  id bigserial primary key,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  points_delta integer not null,
  reason text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);
create index loyalty_events_profile_idx on public.loyalty_events(profile_id, created_at desc);

create or replace function public.fn_loyalty_apply()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.loyalty_accounts (profile_id, points, updated_at)
  values (new.profile_id, greatest(new.points_delta, 0), now())
  on conflict (profile_id) do update
    set points = public.loyalty_accounts.points + new.points_delta,
        updated_at = now();
  return new;
end;
$$;
create trigger loyalty_apply after insert on public.loyalty_events
  for each row execute function public.fn_loyalty_apply();

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  plan text not null,
  audience text not null default 'customer' check (audience in ('customer','educator')),
  status text not null default 'active'
    check (status in ('active','trialing','past_due','canceled','paused')),
  provider text,
  provider_subscription_id text,
  current_period_end timestamptz,
  cancel_at_period_end boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index subscriptions_profile_idx on public.subscriptions(profile_id);
create trigger subscriptions_touch before update on public.subscriptions
  for each row execute function public.touch_updated_at();

-- ── 6. Teachers may read curriculum lessons ─────────────────────────────────
drop policy if exists lessons_entitled_read on public.lessons;
create policy lessons_entitled_read on public.lessons
  for select using (
    public.app_current_role() in ('teacher','educator') or public.app_is_editor()
  );

-- ── 7. RLS — portal tables: row owner self-service + staff oversight ────────
alter table public.teacher_applications enable row level security;
alter table public.entitlements         enable row level security;
alter table public.wishlist_items       enable row level security;
alter table public.saved_addresses      enable row level security;
alter table public.loyalty_accounts     enable row level security;
alter table public.loyalty_events       enable row level security;
alter table public.subscriptions        enable row level security;

-- Teacher applications: applicant self-service; staff read; admins decide.
create policy ta_self_read    on public.teacher_applications for select using (profile_id = auth.uid());
create policy ta_self_insert  on public.teacher_applications for insert with check (profile_id = auth.uid());
create policy ta_staff_read   on public.teacher_applications for select using (public.app_is_staff());
create policy ta_admin_update on public.teacher_applications for update using (public.app_is_admin());

-- Entitlements: row owner reads; editors+ manage; staff read all.
create policy ent_self_read   on public.entitlements for select using (profile_id = auth.uid());
create policy ent_staff_read  on public.entitlements for select using (public.app_is_staff());
create policy ent_editor_all  on public.entitlements for all using (public.app_is_editor()) with check (public.app_is_editor());

create policy wl_self_all     on public.wishlist_items for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());
create policy wl_staff_read   on public.wishlist_items for select using (public.app_is_staff());

create policy addr_self_all   on public.saved_addresses for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());
create policy addr_staff_read on public.saved_addresses for select using (public.app_is_staff());

create policy loy_self_read   on public.loyalty_accounts for select using (profile_id = auth.uid());
create policy loy_staff_read  on public.loyalty_accounts for select using (public.app_is_staff());
create policy loy_editor_all  on public.loyalty_accounts for all using (public.app_is_editor()) with check (public.app_is_editor());

create policy loye_self_read  on public.loyalty_events for select using (profile_id = auth.uid());
create policy loye_staff_read on public.loyalty_events for select using (public.app_is_staff());
create policy loye_editor_all on public.loyalty_events for all using (public.app_is_editor()) with check (public.app_is_editor());

create policy sub_self_read   on public.subscriptions for select using (profile_id = auth.uid());
create policy sub_staff_read  on public.subscriptions for select using (public.app_is_staff());
create policy sub_editor_all  on public.subscriptions for all using (public.app_is_editor()) with check (public.app_is_editor());

-- ── 8. Lock down new internal functions ─────────────────────────────────────
revoke execute on function public.fn_teacher_approved()  from public, anon, authenticated;
revoke execute on function public.fn_link_order_profile() from public, anon, authenticated;
revoke execute on function public.fn_loyalty_apply()      from public, anon, authenticated;

-- ============================================================================
-- OWL Command Center — Migration 0002: RBAC helpers + audit infrastructure
-- ============================================================================
-- Establishes the role hierarchy, recursion-safe permission helpers, and a
-- generic audit trigger reused by every admin-managed table from 0003 onward.
--
-- Role model (reconciled with 0001 + the new Command Center spec):
--   owner        (50)  — Larissa / Rick. Full control incl. settings + secrets.
--   admin        (40)  — "Administrator" in the spec. Everything except owner-only.
--   editor       (30)  — content + commerce operations.
--   support      (20)  — read-most + customer-service actions. NEW in this spec.
--   educator     (10)  — curriculum portal entitlement (not staff).
--   viewer       (0)   — public/authed baseline.
-- ============================================================================

-- ── 1. Extend the role check to include 'support' ───────────────────────────
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check
  check (role in ('viewer','educator','support','editor','admin','owner'));

-- ── 2. Recursion-safe role helpers ─────────────────────────────────────────
-- Numeric rank so policies can express ">= editor" without enumerating roles.
create or replace function public.app_role_rank(p_role text)
returns int language sql immutable as $$
  select case p_role
    when 'owner'    then 50
    when 'admin'    then 40
    when 'editor'   then 30
    when 'support'  then 20
    when 'educator' then 10
    when 'viewer'   then 0
    else -1
  end;
$$;

-- SECURITY DEFINER + locked search_path: reads profiles WITHOUT triggering the
-- table's own RLS, which is what prevents the classic "policy references the
-- same table" infinite-recursion error.
create or replace function public.app_current_role()
returns text
language sql stable security definer set search_path = public as $$
  select coalesce((select role from public.profiles where id = auth.uid()), 'anon');
$$;

create or replace function public.app_has_min_role(p_min text)
returns boolean
language sql stable security definer set search_path = public as $$
  select public.app_role_rank(public.app_current_role()) >= public.app_role_rank(p_min);
$$;

-- Convenience predicates used throughout the RLS policies.
create or replace function public.app_is_staff()  returns boolean language sql stable as $$ select public.app_has_min_role('support'); $$;
create or replace function public.app_is_editor() returns boolean language sql stable as $$ select public.app_has_min_role('editor');  $$;
create or replace function public.app_is_admin()  returns boolean language sql stable as $$ select public.app_has_min_role('admin');   $$;
create or replace function public.app_is_owner()  returns boolean language sql stable as $$ select public.app_has_min_role('owner');   $$;

-- ── 3. Repair the recursive profiles policy from 0001 ───────────────────────
-- 0001's "profiles_admin_read_all" selected from public.profiles inside a
-- profiles policy. Replace it with the helper-based version.
drop policy if exists profiles_admin_read_all on public.profiles;

create policy profiles_staff_read_all
  on public.profiles for select using (public.app_is_staff());

create policy profiles_admin_update_any
  on public.profiles for update using (public.app_is_admin());

create policy profiles_admin_insert
  on public.profiles for insert with check (public.app_is_admin());

-- ── 4. Generic audit trigger ────────────────────────────────────────────────
-- Captures actor (auth.uid()), operation, table, row id, and an old/new diff
-- into the audit_log table created in 0001. Attach to any table with:
--   create trigger <t>_audit after insert or update or delete on public.<t>
--     for each row execute function public.fn_audit();
create or replace function public.fn_audit()
returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_old jsonb;
  v_new jsonb;
  v_id  text;
begin
  if (tg_op = 'DELETE') then
    v_old := to_jsonb(old);
    v_id  := (to_jsonb(old)->>'id');
  elsif (tg_op = 'UPDATE') then
    v_old := to_jsonb(old);
    v_new := to_jsonb(new);
    v_id  := (to_jsonb(new)->>'id');
  else
    v_new := to_jsonb(new);
    v_id  := (to_jsonb(new)->>'id');
  end if;

  insert into public.audit_log (actor, action, entity, entity_id, diff)
  values (
    auth.uid(),
    lower(tg_op),
    tg_table_name,
    v_id,
    jsonb_strip_nulls(jsonb_build_object('old', v_old, 'new', v_new))
  );

  return coalesce(new, old);
end;
$$;

-- ── 5. Let staff read the audit log (admins already had ALL from 0001) ───────
create policy audit_staff_read
  on public.audit_log for select using (public.app_is_staff());

-- ============================================================================
-- Done. 0003+ build the Command Center domain tables on top of these helpers.
-- ============================================================================

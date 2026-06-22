-- ============================================================================
-- OWL Command Center — Migration 0009: Security hardening
-- ============================================================================
-- Resolves Supabase database-linter findings introduced by 0002–0008:
--   * pin search_path on all helper + trigger functions
--   * revoke RPC EXECUTE on trigger/report functions from anon + authenticated
--     (trigger fns run in the trigger context; the report fn is service-only)
--   * make the legacy admin_users view SECURITY INVOKER
-- Functions used inside RLS policies (app_current_role / app_has_min_role /
-- app_is_*) intentionally remain executable by authenticated — they return only
-- the caller's own role and are required for policy evaluation.
-- ============================================================================

-- ── Pin search_path on helpers + trigger functions ─────────────────────────
alter function public.touch_updated_at()            set search_path = public;
alter function public.app_role_rank(text)           set search_path = public;
alter function public.app_is_staff()                set search_path = public;
alter function public.app_is_editor()               set search_path = public;
alter function public.app_is_admin()                set search_path = public;
alter function public.app_is_owner()                set search_path = public;
alter function public.fn_apply_engagement()         set search_path = public;
alter function public.fn_newsletter_event_rollup()  set search_path = public;
alter function public.fn_coupon_redeem()            set search_path = public;
alter function public.fn_download_count()           set search_path = public;

-- ── Revoke RPC execute on functions that should never be called via the API ─
revoke execute on function public.fn_audit()                        from anon, authenticated;
revoke execute on function public.fn_apply_engagement()             from anon, authenticated;
revoke execute on function public.fn_newsletter_event_rollup()      from anon, authenticated;
revoke execute on function public.fn_coupon_redeem()                from anon, authenticated;
revoke execute on function public.fn_download_count()               from anon, authenticated;
revoke execute on function public.touch_updated_at()                from anon, authenticated;
revoke execute on function public.generate_executive_report(date, date) from anon, authenticated;

-- ── Legacy admin_users view → SECURITY INVOKER (was flagged ERROR) ──────────
create or replace view public.admin_users
  with (security_invoker = true) as
  select id, email, role, full_name
  from public.profiles
  where role in ('editor','admin','owner');

-- ============================================================================
-- OWL Command Center — Migration 0010: Revoke PUBLIC execute on internal fns
-- ============================================================================
-- 0009 revoked EXECUTE from anon + authenticated, but Postgres also grants
-- EXECUTE to PUBLIC by default, so those roles still inherited access. Revoke
-- from PUBLIC on the trigger functions (which fire regardless of EXECUTE grants)
-- and on the service-only report function, then re-grant the report to
-- service_role for the Monday cron job.
--
-- Intentionally left executable: app_current_role() and app_has_min_role() are
-- invoked during RLS policy evaluation for authenticated users and only expose
-- the caller's own role.
-- ============================================================================

revoke execute on function public.fn_audit()                            from public;
revoke execute on function public.fn_apply_engagement()                 from public;
revoke execute on function public.fn_newsletter_event_rollup()          from public;
revoke execute on function public.fn_coupon_redeem()                    from public;
revoke execute on function public.fn_download_count()                   from public;
revoke execute on function public.touch_updated_at()                    from public;
revoke execute on function public.handle_new_user()                     from public;
revoke execute on function public.generate_executive_report(date, date) from public;

-- The weekly executive-report cron runs as service_role.
grant execute on function public.generate_executive_report(date, date) to service_role;

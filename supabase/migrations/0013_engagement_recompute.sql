-- ============================================================================
-- OWL Command Center — Migration 0013: engagement recompute helper
-- ============================================================================
-- Reconciles crm_contacts.engagement_score from the event log. The live trigger
-- (fn_apply_engagement) keeps scores current on each insert; this lets the
-- weekly CRM-metrics cron repair any drift in one statement. Service-role only.
-- ============================================================================

create or replace function public.recompute_engagement_scores()
returns integer
language plpgsql security definer set search_path = public as $$
declare
  n integer;
begin
  with sums as (
    select contact_id, coalesce(sum(weight), 0) as s
    from public.crm_engagement_events
    group by contact_id
  )
  update public.crm_contacts c
     set engagement_score = s.s
    from sums s
   where s.contact_id = c.id
     and c.engagement_score is distinct from s.s;
  get diagnostics n = row_count;

  -- Contacts with no events but a non-zero score → reset to 0.
  update public.crm_contacts c
     set engagement_score = 0
   where c.engagement_score <> 0
     and not exists (select 1 from public.crm_engagement_events e where e.contact_id = c.id);

  return n;
end;
$$;

revoke execute on function public.recompute_engagement_scores() from public, anon, authenticated;
grant execute on function public.recompute_engagement_scores() to service_role;

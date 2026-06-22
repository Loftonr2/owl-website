-- ============================================================================
-- OWL Command Center — Migration 0008: Executive reporting + revenue views
-- ============================================================================
-- The Monday 7:00 AM job calls generate_executive_report() and stores the
-- result in executive_reports, then emails it to the report_recipients setting.
-- Views are SECURITY INVOKER so base-table RLS still governs who sees what.
-- ============================================================================

create table public.executive_reports (
  id uuid primary key default gen_random_uuid(),
  period_start date not null,
  period_end date not null,
  generated_at timestamptz default now(),
  metrics jsonb not null default '{}'::jsonb,
  html text,
  status text not null default 'generated' check (status in ('draft','generated','sent','failed')),
  recipients jsonb,
  sent_at timestamptz,
  created_at timestamptz default now()
);
create index executive_reports_period_idx on public.executive_reports(period_start desc);

alter table public.executive_reports enable row level security;
create policy exec_reports_staff_read on public.executive_reports for select using (public.app_is_staff());
create policy exec_reports_admin_all  on public.executive_reports for all    using (public.app_is_admin()) with check (public.app_is_admin());

-- ── generate_executive_report(period_start, period_end) ─────────────────────
create or replace function public.generate_executive_report(p_start date, p_end date)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v jsonb;
  v_start timestamptz := p_start::timestamptz;
  v_end   timestamptz := (p_end + 1)::timestamptz;  -- inclusive of the end day
begin
  select jsonb_build_object(
    'period_start', p_start,
    'period_end',   p_end,
    'generated_at', now(),
    'total_subscribers', (select count(*) from public.newsletter_subscribers where status = 'active'),
    'new_subscribers',   (select count(*) from public.newsletter_subscribers
                            where subscribed_at >= v_start and subscribed_at < v_end),
    'unsubscribes',      (select count(*) from public.newsletter_subscribers
                            where unsubscribed_at >= v_start and unsubscribed_at < v_end),
    'open_rate', (
      select case when coalesce(sum(recipients_count),0) > 0
        then round((sum(open_count)::numeric / sum(recipients_count)) * 100, 2) else 0 end
      from public.newsletter_campaigns
      where status = 'sent' and sent_at >= v_start and sent_at < v_end),
    'click_rate', (
      select case when coalesce(sum(recipients_count),0) > 0
        then round((sum(click_count)::numeric / sum(recipients_count)) * 100, 2) else 0 end
      from public.newsletter_campaigns
      where status = 'sent' and sent_at >= v_start and sent_at < v_end),
    'store_revenue_cents', (
      select coalesce(sum(total_cents),0) from public.orders
      where placed_at >= v_start and placed_at < v_end and status in ('paid','fulfilled')),
    'affiliate_revenue_cents', (
      select coalesce(sum(commission_cents),0) from public.affiliate_revenue
      where recorded_at >= v_start and recorded_at < v_end),
    'top_coupons', coalesce((
      select jsonb_agg(t) from (
        select code, count(*) as redemptions, coalesce(sum(discount_cents),0) as discount_cents
        from public.coupon_redemptions
        where redeemed_at >= v_start and redeemed_at < v_end
        group by code order by count(*) desc limit 5) t), '[]'::jsonb),
    'top_blog_posts', coalesce((
      select jsonb_agg(t) from (
        select title, slug, view_count from public.blog_posts
        where status = 'published' order by view_count desc nulls last limit 5) t), '[]'::jsonb),
    'top_products', coalesce((
      select jsonb_agg(t) from (
        select oi.title, sum(oi.quantity) as units, sum(oi.total_cents) as revenue_cents
        from public.order_items oi join public.orders o on o.id = oi.order_id
        where o.placed_at >= v_start and o.placed_at < v_end and o.status in ('paid','fulfilled')
        group by oi.title order by sum(oi.total_cents) desc limit 5) t), '[]'::jsonb)
  ) into v;
  return v;
end;
$$;

-- ── Revenue rollup views (Sales dashboard) ──────────────────────────────────
create or replace view public.v_store_revenue_daily
  with (security_invoker = true) as
  select date(placed_at) as day,
         count(*)         as orders,
         coalesce(sum(total_cents),0) as revenue_cents
  from public.orders
  where status in ('paid','fulfilled')
  group by date(placed_at);

create or replace view public.v_affiliate_revenue_daily
  with (security_invoker = true) as
  select date(recorded_at) as day,
         coalesce(sum(commission_cents),0) as commission_cents,
         coalesce(sum(conversions),0)      as conversions
  from public.affiliate_revenue
  group by date(recorded_at);

create or replace view public.v_combined_revenue_daily
  with (security_invoker = true) as
  select coalesce(s.day, a.day) as day,
         coalesce(s.revenue_cents,0)   as store_revenue_cents,
         coalesce(a.commission_cents,0) as affiliate_revenue_cents,
         coalesce(s.revenue_cents,0) + coalesce(a.commission_cents,0) as total_revenue_cents
  from public.v_store_revenue_daily s
  full outer join public.v_affiliate_revenue_daily a on a.day = s.day;

-- ── Active coupons (surface into the newsletter builder) ────────────────────
create or replace view public.v_active_coupons
  with (security_invoker = true) as
  select id, code, scope, network_id, partner_id, title, description,
         discount_type, discount_value, affiliate_url, landing_url, expires_at, featured
  from public.coupons
  where status = 'active'
    and (starts_at is null or starts_at <= now())
    and (expires_at is null or expires_at > now());

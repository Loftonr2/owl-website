-- ============================================================================
-- OWL Command Center — Migration 0021: Weekly report archive + change log
-- ============================================================================
-- Extends the existing executive_reports table (created in 0008_reporting.sql)
-- into the canonical "one report object, saved once, emailed once" archive:
--   - adds the fields needed for a full weekly admin report (title, exec
--     summary, structured JSON sections, plain text, Resend delivery info)
--   - adds site_changelog, a lightweight table of human-readable bullets
--     describing what changed on the site/CRM, one row per notable deploy
--     or admin action. The weekly report pulls rows from this table for
--     its "Website Changes & Additions This Week" section instead of
--     inventing anything.
--   - fixes generate_executive_report() to source top posts from
--     content_posts (the live table) instead of the unused legacy
--     blog_posts table, and adds published_content / automation_health /
--     store_summary sub-objects so the report can show real data for
--     those sections without a second round-trip.
-- No existing table is dropped or renamed; nothing here can break the
-- current Monday 7am executive-report cron.
-- ============================================================================

-- ── site_changelog ───────────────────────────────────────────────────────
create table if not exists public.site_changelog (
  id uuid primary key default gen_random_uuid(),
  entry_date date not null default current_date,
  category text not null default 'other'
    check (category in ('feature','fix','content','design','security','automation','store','other')),
  summary text not null,
  commit_sha text,
  created_by text,
  created_at timestamptz not null default now()
);
create index if not exists site_changelog_entry_date_idx on public.site_changelog(entry_date desc);

alter table public.site_changelog enable row level security;
create policy site_changelog_staff_read on public.site_changelog for select using (public.app_is_staff());
create policy site_changelog_admin_all  on public.site_changelog for all    using (public.app_is_admin()) with check (public.app_is_admin());

-- ── executive_reports: extend into the canonical weekly-report archive ────
alter table public.executive_reports
  add column if not exists title text,
  add column if not exists executive_summary text,
  add column if not exists changes_json jsonb not null default '[]'::jsonb,
  add column if not exists published_content_json jsonb not null default '{}'::jsonb,
  add column if not exists automation_health_json jsonb not null default '{}'::jsonb,
  add column if not exists store_summary_json jsonb not null default '{}'::jsonb,
  add column if not exists attention_items_json jsonb not null default '[]'::jsonb,
  add column if not exists plain_text text,
  add column if not exists email_message_id text,
  add column if not exists delivery_status text not null default 'pending'
    check (delivery_status in ('pending','sent','failed','test_sent')),
  add column if not exists updated_at timestamptz not null default now();

comment on table public.executive_reports is
  'Canonical weekly admin report archive. One row per report — the same row that is rendered to HTML/plain text and emailed via Resend is what admins browse in /admin/reports. Formerly "executive_reports"; this is also the weekly_reports archive.';

-- ── generate_executive_report(): fix dead-table reference, add sections ───
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
    -- top_blog_posts now sources from content_posts (the live table) rather
    -- than the legacy/unused blog_posts table, which always had 0 rows.
    -- content_posts has no view_count column (view tracking isn't populated
    -- yet), so this surfaces the most recently published posts instead of
    -- ranking by views.
    'top_blog_posts', coalesce((
      select jsonb_agg(t) from (
        select title, slug, publish_date
        from public.content_posts
        where content_type = 'blog' and status = 'published'
        order by publish_date desc nulls last limit 5) t), '[]'::jsonb),
    'top_products', coalesce((
      select jsonb_agg(t) from (
        select oi.title, sum(oi.quantity) as units, sum(oi.total_cents) as revenue_cents
        from public.order_items oi join public.orders o on o.id = oi.order_id
        where o.placed_at >= v_start and o.placed_at < v_end and o.status in ('paid','fulfilled')
        group by oi.title order by sum(oi.total_cents) desc limit 5) t), '[]'::jsonb),

    -- ── Content published this week (blog + news), sourced from the
    -- idempotent content_publish_events log joined back to content_posts.
    'published_content', jsonb_build_object(
      'blog', coalesce((
        select jsonb_agg(jsonb_build_object('title', cp.title, 'slug', cp.slug, 'published_at', e.published_at) order by e.published_at)
        from public.content_publish_events e
        join public.content_posts cp on cp.id = e.post_id
        where cp.content_type = 'blog' and e.status = 'published'
          and e.published_at >= v_start and e.published_at < v_end), '[]'::jsonb),
      'news', coalesce((
        select jsonb_agg(jsonb_build_object('title', cp.title, 'slug', cp.slug, 'published_at', e.published_at) order by e.published_at)
        from public.content_publish_events e
        join public.content_posts cp on cp.id = e.post_id
        where cp.content_type = 'news' and e.status = 'published'
          and e.published_at >= v_start and e.published_at < v_end), '[]'::jsonb),
      'next_blog', (
        select jsonb_build_object('title', title, 'slug', slug, 'publish_date', publish_date)
        from public.content_posts
        where content_type = 'blog' and status = 'scheduled' and publish_date >= v_end
        order by publish_date asc limit 1),
      'next_news', (
        select jsonb_build_object('title', title, 'slug', slug, 'publish_date', publish_date)
        from public.content_posts
        where content_type = 'news' and status = 'scheduled' and publish_date >= v_end
        order by publish_date asc limit 1)
    ),

    -- ── Automation health: latest run + failure count per job this week ──
    'automation_health', coalesce((
      select jsonb_agg(t) from (
        select job_key,
          max(started_at) filter (where status = 'success') as last_success_at,
          count(*) filter (where status = 'failed' and started_at >= v_start and started_at < v_end) as failures_this_period,
          count(*) filter (where started_at >= v_start and started_at < v_end) as runs_this_period
        from public.cron_job_logs
        group by job_key order by job_key) t), '[]'::jsonb),

    -- ── Store / fulfillment summary for the period ───────────────────────
    'store_summary', jsonb_build_object(
      'new_orders', (select count(*) from public.orders where placed_at >= v_start and placed_at < v_end),
      'fulfilled', (select count(*) from public.orders where status = 'fulfilled' and placed_at >= v_start and placed_at < v_end),
      'unfulfilled', (select count(*) from public.orders where status in ('paid') and placed_at >= v_start and placed_at < v_end),
      'failed', (select count(*) from public.orders where status = 'failed' and placed_at >= v_start and placed_at < v_end)
    ),

    -- ── Website changes & additions this week, from site_changelog ───────
    'website_changes', coalesce((
      select jsonb_agg(jsonb_build_object('category', category, 'summary', summary, 'entry_date', entry_date) order by entry_date, created_at)
      from public.site_changelog
      where entry_date >= p_start and entry_date <= p_end), '[]'::jsonb)
  ) into v;
  return v;
end;
$$;

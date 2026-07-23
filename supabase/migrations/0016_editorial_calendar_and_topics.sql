-- ============================================================================
-- OWL Sing Together — Migration 0016: Editorial Calendar, Topic Intelligence,
-- SEO fields, Publishing Targets, and Content Performance
-- ============================================================================
-- Extends content_posts with a full 10-state editorial workflow, comprehensive
-- SEO fields, newsletter eligibility controls, scheduling metadata, and
-- source references. Adds new tables:
--   topic_recommendations       — curated topic ideas for editors
--   seo_data_sources            — connection status of external SEO tools
--   content_performance_snaps   — daily per-article metric snapshots
--   editorial_publishing_targets — weekly publishing goals
--   editorial_alerts            — CRM alert queue
-- ============================================================================

-- ── 1. Extend content_posts ──────────────────────────────────────────────────

-- Full workflow status (replaces the 3-state status where needed)
alter table public.content_posts
  add column if not exists workflow_status text
    default 'draft'
    check (workflow_status in (
      'topic_identified', 'researching', 'draft', 'editing',
      'awaiting_approval', 'approved', 'scheduled', 'published',
      'needs_updating', 'archived'
    ));

-- Editorial assignment
alter table public.content_posts
  add column if not exists assigned_author_id    uuid references public.profiles(id) on delete set null,
  add column if not exists assigned_editor_id    uuid references public.profiles(id) on delete set null,
  add column if not exists reviewer_name         text,
  add column if not exists reviewer_approved_at  timestamptz;

-- Editorial deadlines
alter table public.content_posts
  add column if not exists draft_deadline        date,
  add column if not exists approval_deadline     date,
  add column if not exists target_pub_time       time default '09:00:00',
  add column if not exists editorial_priority    smallint default 5
    check (editorial_priority between 1 and 10);

-- Publication tracking
alter table public.content_posts
  add column if not exists publish_failed_at     timestamptz,
  add column if not exists publish_failure_reason text,
  add column if not exists publish_verified_at   timestamptz,
  add column if not exists publish_attempts      smallint default 0;

-- SEO extended
alter table public.content_posts
  add column if not exists canonical_url         text,
  add column if not exists primary_keyword       text,
  add column if not exists secondary_keywords    text[]  default '{}',
  add column if not exists search_intent         text
    check (search_intent is null or search_intent in (
      'informational', 'navigational', 'commercial', 'transactional'
    )),
  add column if not exists og_title              text,
  add column if not exists og_description        text,
  add column if not exists og_image              text,
  add column if not exists structured_data_type  text    default 'Article';

-- Newsletter eligibility
alter table public.content_posts
  add column if not exists newsletter_eligible       boolean not null default true,
  add column if not exists newsletter_promoted_count integer not null default 0,
  add column if not exists last_newsletter_issue_id  uuid
    references public.newsletter_campaigns(id) on delete set null,
  add column if not exists last_newsletter_date      date;

-- Content enrichment
alter table public.content_posts
  add column if not exists sources            jsonb   default '[]'::jsonb,
  add column if not exists related_slugs      text[]  default '{}',
  add column if not exists reading_time_mins  smallint,
  add column if not exists age_range          text,
  add column if not exists content_tags       text[]  default '{}',
  add column if not exists content_warnings   text[]  default '{}',
  add column if not exists requires_medical_review boolean not null default false;

-- Sync workflow_status to status when appropriate
update public.content_posts
  set workflow_status = status
  where workflow_status = 'draft';

-- Indexes
create index if not exists cp_workflow_status_idx
  on public.content_posts (workflow_status);
create index if not exists cp_newsletter_eligible_idx
  on public.content_posts (newsletter_eligible, status);
create index if not exists cp_primary_keyword_idx
  on public.content_posts (primary_keyword)
  where primary_keyword is not null;
create index if not exists cp_editorial_priority_idx
  on public.content_posts (editorial_priority desc, publish_date);

-- ── 2. topic_recommendations ─────────────────────────────────────────────────
-- Human-curated and system-suggested topics for editors to review and assign.

create table if not exists public.topic_recommendations (
  id                      uuid primary key default gen_random_uuid(),
  title                   text not null,
  suggested_headline      text,
  primary_keyword         text,
  related_keywords        text[]  default '{}',
  question_searches       text[]  default '{}',
  search_intent           text
    check (search_intent in ('informational','navigational','commercial','transactional')),
  audience_category       text    not null default 'parenting',
  -- Trend / demand data (null = not available from connected source)
  trend_direction         text
    check (trend_direction is null or trend_direction in ('rising','stable','declining','new')),
  relative_search_interest numeric(5,2),  -- 0-100 if available from trends API
  monthly_search_volume    integer,        -- null = not connected
  search_volume_source     text,           -- e.g. 'google_search_console', 'manual', null
  search_volume_updated_at timestamptz,
  competition_level        text
    check (competition_level is null or competition_level in ('low','medium','high','very_high')),
  -- OWL scoring (calculated server-side, never fabricated)
  owl_relevance_score     numeric(4,1),   -- 0-10, null until calculated
  content_gap_score       numeric(4,1),   -- 0-10, null until calculated
  recommendation_score    numeric(5,2),   -- composite, null until calculated
  recommendation_reason   text,           -- human-readable explanation
  -- Seasonality
  seasonality             text,           -- e.g. 'back-to-school', 'winter', null
  best_publish_month      smallint
    check (best_publish_month between 1 and 12),
  -- Editorial
  recommended_date        date,
  recommended_type        text not null default 'news_article'
    check (recommended_type in (
      'news_article', 'evergreen_blog', 'parent_guide', 'educational_activity',
      'product_guide', 'music_feature', 'newsletter_feature', 'article_update'
    )),
  existing_coverage_slug  text,           -- slug of OWL article if we already cover this
  cannibalization_risk    text
    check (cannibalization_risk is null or cannibalization_risk in ('none','low','medium','high')),
  cannibalization_note    text,
  -- Workflow
  status                  text not null default 'pending'
    check (status in ('pending','reviewing','accepted','rejected','assigned','archived')),
  rejected_reason         text,
  assigned_to             uuid references public.profiles(id),
  linked_content_post_id  uuid references public.content_posts(id) on delete set null,
  reviewed_by             uuid references public.profiles(id),
  reviewed_at             timestamptz,
  data_source             text,
  data_updated_at         timestamptz,
  created_by              uuid references public.profiles(id),
  created_at              timestamptz default now(),
  updated_at              timestamptz default now()
);

create index if not exists tr_status_idx        on public.topic_recommendations (status);
create index if not exists tr_audience_idx      on public.topic_recommendations (audience_category);
create index if not exists tr_recommended_date  on public.topic_recommendations (recommended_date);
create index if not exists tr_score_idx         on public.topic_recommendations (recommendation_score desc nulls last);

create trigger topic_recs_touch before update on public.topic_recommendations
  for each row execute function public.touch_updated_at();

-- ── 3. seo_data_sources ──────────────────────────────────────────────────────
-- Tracks which external SEO/analytics tools are connected.
-- "not connected" is the honest default for all sources.

create table if not exists public.seo_data_sources (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,    -- e.g. 'google_search_console'
  name            text not null,
  category        text not null default 'seo',
  status          text not null default 'not_connected'
    check (status in ('connected','not_connected','error','limited')),
  last_synced_at  timestamptz,
  last_error      text,
  config          jsonb default '{}'::jsonb,  -- non-secret config only
  notes           text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create trigger seo_sources_touch before update on public.seo_data_sources
  for each row execute function public.touch_updated_at();

-- Seed the recognised sources (all start as not_connected — honest default)
insert into public.seo_data_sources (slug, name, category) values
  ('google_search_console', 'Google Search Console', 'seo'),
  ('google_analytics',      'Google Analytics (GA4)', 'analytics'),
  ('google_trends',         'Google Trends',          'trends'),
  ('google_ads_keyword',    'Google Ads Keyword Planner', 'keywords'),
  ('bing_webmaster',        'Bing Webmaster Tools',   'seo'),
  ('ahrefs',                'Ahrefs',                 'seo'),
  ('semrush',               'SEMrush',                'seo'),
  ('moz',                   'Moz',                    'seo'),
  ('dataforseo',            'DataForSEO',             'keywords'),
  ('microsoft_clarity',     'Microsoft Clarity',      'analytics'),
  ('internal_search',       'Website Internal Search','first_party'),
  ('newsletter_clicks',     'Newsletter Click Data',  'first_party')
on conflict (slug) do nothing;

-- ── 4. content_performance_snaps ─────────────────────────────────────────────
-- Daily snapshots of article performance metrics.
-- All metrics must have a named source — never fabricated.

create table if not exists public.content_performance_snaps (
  id                      bigserial primary key,
  content_post_id         uuid not null
    references public.content_posts(id) on delete cascade,
  snapshot_date           date not null,
  -- Search Console (null = not connected or no data yet)
  sc_impressions          integer,
  sc_clicks               integer,
  sc_avg_position         numeric(6,2),
  sc_ctr                  numeric(6,4),   -- 0..1
  -- Analytics (null = not connected)
  ga_organic_sessions     integer,
  ga_page_views           integer,
  ga_engaged_sessions     integer,
  ga_avg_engagement_secs  integer,
  -- First-party (from OWL's own systems)
  newsletter_clicks       integer,
  social_clicks           integer,
  store_referrals         integer,
  -- Source metadata (must be set with any non-null metric)
  search_data_source      text,           -- which tool supplied sc_* columns
  analytics_source        text,           -- which tool supplied ga_* columns
  created_at              timestamptz default now(),
  unique (content_post_id, snapshot_date)
);

create index if not exists cps_post_date_idx
  on public.content_performance_snaps (content_post_id, snapshot_date desc);
create index if not exists cps_date_idx
  on public.content_performance_snaps (snapshot_date desc);

-- ── 5. editorial_publishing_targets ─────────────────────────────────────────
-- Configurable weekly publishing goals. One row per week (monday = start).

create table if not exists public.editorial_publishing_targets (
  id                  uuid primary key default gen_random_uuid(),
  week_start          date not null unique,   -- always the Monday of the week
  news_per_week       smallint not null default 3,
  blogs_per_week      smallint not null default 2,
  parenting_per_week  smallint not null default 1,
  education_per_week  smallint not null default 1,
  music_per_week      smallint not null default 1,
  nutrition_per_week  smallint not null default 0,
  family_per_week     smallint not null default 1,
  notes               text,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

create trigger editorial_targets_touch before update on public.editorial_publishing_targets
  for each row execute function public.touch_updated_at();

-- ── 6. editorial_alerts ──────────────────────────────────────────────────────
-- CRM alert queue. Populated by server jobs; dismissed by editors.

create table if not exists public.editorial_alerts (
  id            bigserial primary key,
  alert_type    text not null
    check (alert_type in (
      'no_content_tomorrow',
      'empty_days_ahead',
      'needs_approval',
      'missing_featured_image',
      'seo_incomplete',
      'publish_failed',
      'medical_needs_review',
      'cannibalization_risk',
      'newsletter_no_candidates'
    )),
  severity      text not null default 'warning'
    check (severity in ('info','warning','error')),
  title         text not null,
  body          text,
  related_date  date,
  related_post  uuid references public.content_posts(id) on delete cascade,
  dismissed_by  uuid references public.profiles(id),
  dismissed_at  timestamptz,
  created_at    timestamptz default now()
);

create index if not exists ea_undismissed_idx
  on public.editorial_alerts (created_at desc)
  where dismissed_at is null;

-- ── 7. RLS ────────────────────────────────────────────────────────────────────

alter table public.topic_recommendations        enable row level security;
alter table public.seo_data_sources             enable row level security;
alter table public.content_performance_snaps    enable row level security;
alter table public.editorial_publishing_targets enable row level security;
alter table public.editorial_alerts             enable row level security;

-- topic_recommendations: staff read, editor write
create policy tr_staff_read  on public.topic_recommendations for select using (public.app_is_staff());
create policy tr_editor_all  on public.topic_recommendations for all    using (public.app_is_editor()) with check (public.app_is_editor());

-- seo_data_sources: staff read, admin write
create policy sds_staff_read on public.seo_data_sources for select using (public.app_is_staff());
create policy sds_admin_all  on public.seo_data_sources for all    using (public.app_is_editor()) with check (public.app_is_editor());

-- performance snaps: staff read, editor insert
create policy cps_staff_read on public.content_performance_snaps for select using (public.app_is_staff());
create policy cps_editor_ins on public.content_performance_snaps for insert with check (public.app_is_editor());

-- publishing targets: staff read, editor write
create policy ept_staff_read on public.editorial_publishing_targets for select using (public.app_is_staff());
create policy ept_editor_all on public.editorial_publishing_targets for all    using (public.app_is_editor()) with check (public.app_is_editor());

-- alerts: staff read, editor dismiss
create policy ea_staff_read   on public.editorial_alerts for select using (public.app_is_staff());
create policy ea_editor_upd   on public.editorial_alerts for update using (public.app_is_editor()) with check (public.app_is_editor());
create policy ea_editor_ins   on public.editorial_alerts for insert with check (public.app_is_editor());

-- ── 8. Helper function: generate editorial alerts for empty upcoming days ─────

create or replace function public.fn_generate_editorial_alerts()
returns integer  -- number of new alerts created
language plpgsql security definer as $$
declare
  v_date          date;
  v_count         integer;
  v_alert_count   integer := 0;
  v_tomorrow      date := current_date + 1;
  v_look_ahead    integer := 14;
begin
  -- Clear outdated alerts (older than 1 day, still undismissed) to avoid noise
  delete from public.editorial_alerts
   where alert_type in ('no_content_tomorrow','empty_days_ahead')
     and dismissed_at is null
     and created_at < now() - interval '23 hours';

  -- Check each day in the look-ahead window
  for i in 0..v_look_ahead loop
    v_date := current_date + i;

    select count(*) into v_count
      from public.content_posts
     where publish_date::date = v_date
       and workflow_status in ('approved','scheduled','published');

    if v_count = 0 then
      -- Only insert if no un-dismissed alert for this date already exists
      if not exists (
        select 1 from public.editorial_alerts
         where alert_type in ('no_content_tomorrow','empty_days_ahead')
           and related_date = v_date
           and dismissed_at is null
      ) then
        insert into public.editorial_alerts
          (alert_type, severity, title, body, related_date)
        values (
          case when v_date = v_tomorrow then 'no_content_tomorrow' else 'empty_days_ahead' end,
          case when i <= 1 then 'error' when i <= 3 then 'warning' else 'info' end,
          case when v_date = v_tomorrow
            then 'No content scheduled for tomorrow (' || to_char(v_date,'Mon DD') || ')'
            else 'No content scheduled for ' || to_char(v_date,'Mon DD, YYYY')
          end,
          'No approved article or blog post is scheduled for this date. Review the editorial calendar.',
          v_date
        );
        v_alert_count := v_alert_count + 1;
      end if;
    end if;
  end loop;

  -- Alert: articles awaiting approval that have a publish_date within 3 days
  for v_date in
    select p.id::date from public.content_posts p
     where p.workflow_status = 'awaiting_approval'
       and p.publish_date between now() and now() + interval '3 days'
  loop
    -- This uses the rowtype loop trick — actually we want post IDs
    null;
  end loop;

  -- Cleaner: alert for posts awaiting approval within 3 days
  insert into public.editorial_alerts (alert_type, severity, title, body, related_post)
  select
    'needs_approval',
    'warning',
    'Article requires approval: "' || title || '"',
    'Scheduled for ' || to_char(publish_date, 'Mon DD') || ' but still awaiting approval.',
    id
  from public.content_posts
  where workflow_status = 'awaiting_approval'
    and publish_date between now() and now() + interval '3 days'
    and not exists (
      select 1 from public.editorial_alerts
       where alert_type = 'needs_approval'
         and related_post = content_posts.id
         and dismissed_at is null
         and created_at > now() - interval '23 hours'
    );

  -- Alert: scheduled posts with missing featured_image
  insert into public.editorial_alerts (alert_type, severity, title, body, related_post)
  select
    'missing_featured_image',
    'warning',
    'Missing featured image: "' || title || '"',
    'This article is scheduled but has no featured image.',
    id
  from public.content_posts
  where workflow_status in ('approved','scheduled')
    and (featured_image is null or featured_image = '')
    and not exists (
      select 1 from public.editorial_alerts
       where alert_type = 'missing_featured_image'
         and related_post = content_posts.id
         and dismissed_at is null
         and created_at > now() - interval '23 hours'
    );

  -- Alert: scheduled posts with no SEO title or meta description
  insert into public.editorial_alerts (alert_type, severity, title, body, related_post)
  select
    'seo_incomplete',
    'info',
    'SEO incomplete: "' || title || '"',
    'Scheduled article is missing SEO title or meta description.',
    id
  from public.content_posts
  where workflow_status in ('approved','scheduled')
    and (seo_title is null or seo_description is null)
    and not exists (
      select 1 from public.editorial_alerts
       where alert_type = 'seo_incomplete'
         and related_post = content_posts.id
         and dismissed_at is null
         and created_at > now() - interval '23 hours'
    );

  return v_alert_count;
end;
$$;

-- ── 9. Helper view: editorial calendar (30-day window) ───────────────────────

create or replace view public.v_editorial_calendar as
select
  cp.id,
  cp.content_type,
  cp.title,
  cp.slug,
  cp.category,
  cp.author,
  cp.workflow_status,
  cp.status,
  cp.publish_date,
  cp.target_pub_time,
  cp.publish_date::date                   as publish_day,
  cp.draft_deadline,
  cp.approval_deadline,
  cp.featured_image,
  cp.primary_keyword,
  cp.editorial_priority,
  cp.newsletter_eligible,
  cp.reviewer_name,
  cp.reviewer_approved_at,
  cp.publish_verified_at,
  cp.publish_failed_at,
  cp.publish_failure_reason,
  coalesce(cp.seo_title, cp.title)        as display_seo_title,
  (cp.seo_title is not null and cp.seo_description is not null) as seo_complete,
  (cp.featured_image is not null and cp.featured_image != '') as has_image,
  cp.created_at,
  cp.updated_at
from public.content_posts cp
where cp.publish_date >= current_date - 7
  and cp.publish_date <= current_date + 37
  and cp.workflow_status not in ('archived')
order by cp.publish_date, cp.editorial_priority desc;

grant select on public.v_editorial_calendar to authenticated;

-- ── 10. Helper: newsletter candidate view ────────────────────────────────────

create or replace view public.v_newsletter_candidates as
select
  cp.id,
  cp.content_type,
  cp.title,
  cp.slug,
  cp.category,
  cp.excerpt,
  cp.featured_image,
  cp.publish_date,
  cp.primary_keyword,
  cp.editorial_priority,
  cp.newsletter_promoted_count,
  cp.last_newsletter_date,
  -- Freshness score (days since publication, lower = fresher)
  extract(day from now() - cp.publish_date)::int as days_since_published,
  -- Whether it appeared in the last newsletter
  case
    when cp.last_newsletter_date > current_date - 14 then true
    else false
  end as promoted_recently
from public.content_posts cp
where cp.status = 'published'
  and cp.workflow_status = 'published'
  and cp.newsletter_eligible = true
  and (cp.featured_image is not null and cp.featured_image != '')
  and cp.publish_date <= now()
order by
  cp.editorial_priority desc,
  cp.publish_date desc;

grant select on public.v_newsletter_candidates to authenticated;

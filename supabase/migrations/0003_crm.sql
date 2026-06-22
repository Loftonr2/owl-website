-- ============================================================================
-- OWL Command Center — Migration 0003: CRM
-- ============================================================================
-- Unified people table covering subscribers, customers, educators, affiliates,
-- and leads — plus tags, segments, engagement scoring, and referral tracking.
-- Purchase history and download history are joined in via views (see 0008)
-- using the shared email key.
-- ============================================================================

-- ── crm_contacts — one row per person, any combination of types ─────────────
create table public.crm_contacts (
  id uuid primary key default gen_random_uuid(),
  email citext unique not null,
  full_name text,
  first_name text,
  last_name text,
  phone text,
  -- A person can be several things at once (subscriber + customer + educator).
  contact_types text[] not null default '{}'::text[],
  lifecycle_stage text not null default 'lead'
    check (lifecycle_stage in ('lead','subscriber','customer','educator','affiliate','churned')),
  source text,
  engagement_score integer not null default 0,
  -- External system links (filled by webhooks / sync jobs).
  beehiiv_subscription_id text,
  shopify_customer_id text,
  stripe_customer_id text,
  -- Referral attribution.
  referred_by uuid references public.crm_contacts(id) on delete set null,
  affiliate_id uuid, -- FK added in 0005 once affiliate_partners exists
  marketing_consent boolean default false,
  organization text,
  country text,
  notes text,
  first_seen_at timestamptz default now(),
  last_seen_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index crm_contacts_lifecycle_idx on public.crm_contacts(lifecycle_stage);
create index crm_contacts_types_idx     on public.crm_contacts using gin(contact_types);
create index crm_contacts_score_idx     on public.crm_contacts(engagement_score desc);
create index crm_contacts_referred_idx  on public.crm_contacts(referred_by);

create trigger crm_contacts_touch before update on public.crm_contacts
  for each row execute function public.touch_updated_at();
create trigger crm_contacts_audit after insert or update or delete on public.crm_contacts
  for each row execute function public.fn_audit();

-- ── crm_tags + join ─────────────────────────────────────────────────────────
create table public.crm_tags (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  color text default '#0E7C7B',
  description text,
  created_at timestamptz default now()
);

create table public.crm_contact_tags (
  contact_id uuid not null references public.crm_contacts(id) on delete cascade,
  tag_id uuid not null references public.crm_tags(id) on delete cascade,
  tagged_at timestamptz default now(),
  primary key (contact_id, tag_id)
);
create index crm_contact_tags_tag_idx on public.crm_contact_tags(tag_id);

-- ── crm_segments — static or rule-based audiences ───────────────────────────
create table public.crm_segments (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  is_dynamic boolean not null default false,
  -- For dynamic segments: a JSON rule definition the app evaluates.
  definition jsonb default '{}'::jsonb,
  member_count integer not null default 0,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger crm_segments_touch before update on public.crm_segments
  for each row execute function public.touch_updated_at();
create trigger crm_segments_audit after insert or update or delete on public.crm_segments
  for each row execute function public.fn_audit();

create table public.crm_segment_members (
  segment_id uuid not null references public.crm_segments(id) on delete cascade,
  contact_id uuid not null references public.crm_contacts(id) on delete cascade,
  added_at timestamptz default now(),
  primary key (segment_id, contact_id)
);
create index crm_segment_members_contact_idx on public.crm_segment_members(contact_id);

-- ── crm_engagement_events — drives the engagement_score ─────────────────────
create table public.crm_engagement_events (
  id bigserial primary key,
  contact_id uuid not null references public.crm_contacts(id) on delete cascade,
  event_type text not null,        -- open, click, purchase, download, signup, reply...
  weight integer not null default 1,
  source text,                     -- newsletter, store, blog, affiliate...
  metadata jsonb default '{}'::jsonb,
  occurred_at timestamptz default now()
);
create index crm_engagement_contact_idx on public.crm_engagement_events(contact_id);
create index crm_engagement_occurred_idx on public.crm_engagement_events(occurred_at desc);

-- Keep engagement_score + last_seen_at current as events arrive.
create or replace function public.fn_apply_engagement()
returns trigger language plpgsql as $$
begin
  update public.crm_contacts
     set engagement_score = engagement_score + coalesce(new.weight, 0),
         last_seen_at = greatest(coalesce(last_seen_at, new.occurred_at), new.occurred_at)
   where id = new.contact_id;
  return new;
end;
$$;

create trigger crm_engagement_apply after insert on public.crm_engagement_events
  for each row execute function public.fn_apply_engagement();

-- ── crm_notes — timeline notes per contact ──────────────────────────────────
create table public.crm_notes (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references public.crm_contacts(id) on delete cascade,
  author_id uuid references public.profiles(id),
  body text not null,
  created_at timestamptz default now()
);
create index crm_notes_contact_idx on public.crm_notes(contact_id, created_at desc);

-- ── crm_referrals — explicit referral tracking ──────────────────────────────
create table public.crm_referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_contact_id uuid references public.crm_contacts(id) on delete set null,
  referred_email citext not null,
  referred_contact_id uuid references public.crm_contacts(id) on delete set null,
  channel text,                    -- newsletter, affiliate, share-link...
  affiliate_id uuid,               -- FK added in 0005
  status text not null default 'pending'
    check (status in ('pending','signed_up','converted','expired')),
  reward_cents integer,
  created_at timestamptz default now(),
  converted_at timestamptz
);
create index crm_referrals_referrer_idx on public.crm_referrals(referrer_contact_id);
create index crm_referrals_status_idx on public.crm_referrals(status);

-- ── RLS — staff read, editor write across CRM ───────────────────────────────
alter table public.crm_contacts          enable row level security;
alter table public.crm_tags              enable row level security;
alter table public.crm_contact_tags      enable row level security;
alter table public.crm_segments          enable row level security;
alter table public.crm_segment_members   enable row level security;
alter table public.crm_engagement_events enable row level security;
alter table public.crm_notes             enable row level security;
alter table public.crm_referrals         enable row level security;

-- Contacts: staff (incl. support) read; editors+ write.
create policy crm_contacts_staff_read   on public.crm_contacts          for select using (public.app_is_staff());
create policy crm_contacts_editor_write on public.crm_contacts          for all    using (public.app_is_editor()) with check (public.app_is_editor());

create policy crm_tags_staff_read       on public.crm_tags              for select using (public.app_is_staff());
create policy crm_tags_editor_write     on public.crm_tags              for all    using (public.app_is_editor()) with check (public.app_is_editor());

create policy crm_ctag_staff_read       on public.crm_contact_tags      for select using (public.app_is_staff());
create policy crm_ctag_editor_write     on public.crm_contact_tags      for all    using (public.app_is_editor()) with check (public.app_is_editor());

create policy crm_seg_staff_read        on public.crm_segments          for select using (public.app_is_staff());
create policy crm_seg_editor_write      on public.crm_segments          for all    using (public.app_is_editor()) with check (public.app_is_editor());

create policy crm_segm_staff_read       on public.crm_segment_members   for select using (public.app_is_staff());
create policy crm_segm_editor_write     on public.crm_segment_members   for all    using (public.app_is_editor()) with check (public.app_is_editor());

create policy crm_eng_staff_read        on public.crm_engagement_events for select using (public.app_is_staff());
create policy crm_eng_editor_write      on public.crm_engagement_events for all    using (public.app_is_editor()) with check (public.app_is_editor());

-- Notes: support can add notes (CS workflow) but editing/deleting is editor+.
create policy crm_notes_staff_read      on public.crm_notes             for select using (public.app_is_staff());
create policy crm_notes_staff_insert    on public.crm_notes             for insert with check (public.app_is_staff());
create policy crm_notes_editor_modify   on public.crm_notes             for update using (public.app_is_editor());
create policy crm_notes_editor_delete   on public.crm_notes             for delete using (public.app_is_editor());

create policy crm_ref_staff_read        on public.crm_referrals         for select using (public.app_is_staff());
create policy crm_ref_editor_write      on public.crm_referrals         for all    using (public.app_is_editor()) with check (public.app_is_editor());

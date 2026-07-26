-- Migration 0019: Content publish events (idempotency) + newsletter test deliveries
-- Applied: 2026-07-26

-- ── 1. content_publish_events ─────────────────────────────────────────────────
-- Records every time the daily publisher processes a post.
-- Used for idempotency (one publish per post per local ET date) and CRM reporting.
CREATE TABLE IF NOT EXISTS public.content_publish_events (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id        UUID NOT NULL REFERENCES public.content_posts(id) ON DELETE CASCADE,
  job_key        TEXT NOT NULL DEFAULT 'publish-scheduled-content',
  local_date_et  DATE NOT NULL,           -- America/New_York calendar date the job ran
  published_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status         TEXT NOT NULL DEFAULT 'published', -- published | skipped | failed
  error          TEXT
);

-- Prevent double-publishing the same post on the same ET calendar day
CREATE UNIQUE INDEX IF NOT EXISTS content_publish_events_post_date_uq
  ON public.content_publish_events (post_id, local_date_et);

-- Index for CRM queries (latest events per date)
CREATE INDEX IF NOT EXISTS content_publish_events_date_idx
  ON public.content_publish_events (local_date_et DESC);

-- ── 2. newsletter_test_deliveries ─────────────────────────────────────────────
-- Separate log for test sends — never touches campaign status or analytics.
CREATE TABLE IF NOT EXISTS public.newsletter_test_deliveries (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id      UUID NOT NULL REFERENCES public.newsletter_campaigns(id) ON DELETE CASCADE,
  recipient_email  TEXT NOT NULL,
  subject          TEXT NOT NULL,
  resend_message_id TEXT,
  status           TEXT NOT NULL DEFAULT 'sent', -- sent | failed
  error            TEXT,
  template_version TEXT,
  sent_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS newsletter_test_deliveries_campaign_idx
  ON public.newsletter_test_deliveries (campaign_id, sent_at DESC);

-- ── 3. Register publish-scheduled-content in scheduled_jobs ──────────────────
INSERT INTO public.scheduled_jobs (key, name, cron, schedule_label, description, enabled)
VALUES (
  'publish-scheduled-content',
  'Daily content publisher',
  '0 * * * *',
  'Daily · 7:00 AM ET (hourly check)',
  'Publishes approved and scheduled news articles and blog posts at 7:00 AM America/New_York. Runs hourly; checks local ET hour before acting. Idempotent.',
  true
)
ON CONFLICT (key) DO UPDATE SET
  cron           = EXCLUDED.cron,
  schedule_label = EXCLUDED.schedule_label,
  description    = EXCLUDED.description;

-- ── 4. Register weekly-content-digest in scheduled_jobs ───────────────────────
INSERT INTO public.scheduled_jobs (key, name, cron, schedule_label, description, enabled)
VALUES (
  'weekly-content-digest',
  'Weekly content digest (Sunday)',
  '0 8 * * 0',
  'Sundays · 8:00 AM UTC',
  'Sends admin recipients a summary of next week''s scheduled blogs, news articles, and newsletter issues.',
  true
)
ON CONFLICT (key) DO UPDATE SET
  cron           = EXCLUDED.cron,
  schedule_label = EXCLUDED.schedule_label,
  description    = EXCLUDED.description;

-- ── 5. Fix app_settings: newsletter_admin_recipients (real Gmail addresses) ───
INSERT INTO public.app_settings (key, value)
VALUES ('newsletter_admin_recipients', '["rickoflv@gmail.com", "larissapola777@gmail.com"]'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- ── 6. Fix app_settings: report_recipients (real Gmail addresses) ─────────────
UPDATE public.app_settings
SET value = '["rickoflv@gmail.com", "larissapola777@gmail.com"]'::jsonb
WHERE key = 'report_recipients';

-- ── 7. Fix Issue #1: set email subject ───────────────────────────────────────
UPDATE public.newsletter_campaigns
SET subject = 'OWL Weekly Issue #1 — Welcome, OWL Families!'
WHERE issue_number = 1 AND subject IS NULL;

-- ── 8. Immediately publish all overdue scheduled posts ────────────────────────
-- These items were stuck because the cron route was broken.
-- Publishing them now catches up the backlog.
UPDATE public.content_posts
SET
  status          = 'published',
  workflow_status = 'published',
  updated_at      = NOW()
WHERE status = 'scheduled'
  AND workflow_status = 'scheduled'
  AND publish_date <= NOW();

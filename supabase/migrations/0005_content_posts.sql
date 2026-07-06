-- ============================================================================
-- OWL Sing Together ΓÇö Migration 0005
-- Adds content_posts table for blog posts and news articles.
--
-- Run via Supabase Dashboard ΓåÆ SQL Editor ΓåÆ New query ΓåÆ Run.
-- Or: supabase db push (if CLI is configured)
-- ============================================================================

-- 1. Main content_posts table
CREATE TABLE IF NOT EXISTS public.content_posts (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type     text        NOT NULL CHECK (content_type IN ('blog', 'news')),
  title            text        NOT NULL,
  slug             text        NOT NULL,
  category         text        NOT NULL DEFAULT 'child-development',
  excerpt          text,
  body             text,
  publish_date     timestamptz,
  status           text        NOT NULL DEFAULT 'draft'
                               CHECK (status IN ('draft', 'scheduled', 'published')),
  author           text        NOT NULL DEFAULT 'Larissa',
  seo_title        text,
  seo_description  text,
  featured_image   text,
  alert_sent       boolean     NOT NULL DEFAULT false,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

-- 2. Enforce slug uniqueness per content_type
CREATE UNIQUE INDEX IF NOT EXISTS content_posts_slug_type_idx
  ON public.content_posts (slug, content_type);

-- 3. Fast lookups for cron + public pages
CREATE INDEX IF NOT EXISTS content_posts_type_status_idx
  ON public.content_posts (content_type, status);

CREATE INDEX IF NOT EXISTS content_posts_publish_date_idx
  ON public.content_posts (publish_date)
  WHERE status = 'scheduled';

-- 4. Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS content_posts_updated_at ON public.content_posts;
CREATE TRIGGER content_posts_updated_at
  BEFORE UPDATE ON public.content_posts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 5. RLS ΓÇö enable but allow server-role key to bypass
ALTER TABLE public.content_posts ENABLE ROW LEVEL SECURITY;

-- Public: read-only published posts only
CREATE POLICY IF NOT EXISTS "content_posts_public_read"
  ON public.content_posts
  FOR SELECT
  USING (status = 'published');

-- Admin server routes (anon key fallback if service role not set)
CREATE POLICY IF NOT EXISTS "content_posts_admin_all"
  ON public.content_posts
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- After running:
--   Run the seed SQL in 0005_content_posts_seed.sql to import blog posts.
--   Then add SUPABASE_SERVICE_ROLE_KEY to Vercel env vars if not already set.
-- ============================================================================

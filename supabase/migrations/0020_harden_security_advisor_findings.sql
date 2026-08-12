-- ============================================================================
-- OWL Sing Together — Migration 0020: Harden Security Advisor Findings
-- ============================================================================
-- Addresses all Supabase Security Advisor errors and warnings identified on
-- 2026-08-12. Applied as a single atomic migration so every change is tracked
-- in the repository and can be rolled back as a unit.
--
-- CHANGES (in order of priority):
--   PHASE 2  — Convert 4 SECURITY DEFINER views to SECURITY INVOKER
--   PHASE 3  — Enable RLS on 6 tables + create least-privilege policies
--   PHASE 4  — Narrow 2 overly-permissive existing policies
--   PHASE 5  — Pin search_path on 2 functions
--   PHASE 6  — Revoke direct EXECUTE on 2 trigger/cron-only SECURITY DEFINER fns
--
-- INTENTIONALLY NOT CHANGED:
--   app_current_role(), app_has_min_role() — EXECUTE retained for anon +
--     authenticated because these functions are evaluated during RLS policy
--     checks. Revoking EXECUTE would cause "permission denied" errors when any
--     policy that calls them is evaluated for unauthenticated users.
--   citext extension in public schema — 13 columns across 8 tables depend on it.
--     Moving it would require ALTER TABLE … ALTER COLUMN on every dependent
--     column, which risks data type coercion errors. Risk outweighs benefit.
--     Accepted as a low-priority Advisor warning.
--   Storage bucket listing policies — managed through the Supabase dashboard
--     Storage UI, not via SQL migration. No SQL equivalent for bucket-level
--     listing policies. Addressed separately in Phase 9 (dashboard).
--   Leaked password protection — Supabase Auth setting, not a SQL change.
--     Addressed separately in Phase 9 (dashboard).
-- ============================================================================


-- ============================================================================
-- PHASE 2: Convert SECURITY DEFINER views to SECURITY INVOKER
-- ============================================================================
-- In PostgreSQL, views default to security-definer behavior when no explicit
-- security option is set. That means the view runs with the owner's privileges
-- (bypassing RLS on underlying tables). Setting security_invoker = true makes
-- the view run with the querying role's privileges, so the caller's RLS applies.
--
-- All 4 flagged views read from tables that already have RLS enabled with
-- appropriate policies, so converting them to security_invoker is safe.
-- ============================================================================

-- ── products_fulfillment_ready ───────────────────────────────────────────────
-- Used by: admin CRM (SQL queries only — not in any TypeScript route)
-- Underlying table: products (RLS: public SELECT for live/coming_soon; editor ALL)
-- With security_invoker: anon sees live products only; admins see all printify products.
-- Also: tighten grants — anon should not access this admin diagnostic view.

CREATE OR REPLACE VIEW public.products_fulfillment_ready
  WITH (security_invoker = true) AS
SELECT
  id, slug, title, printify_product_id, printify_variant_id,
  product_source, status, price_cents, category
FROM public.products
WHERE product_source = 'printify'
  AND printify_product_id IS NOT NULL
  AND printify_variant_id IS NOT NULL
  AND status = ANY (ARRAY['live', 'coming_soon']);

-- Revoke the default broad public grants; keep authenticated for admin CRM use
REVOKE ALL ON public.products_fulfillment_ready FROM anon;
GRANT SELECT ON public.products_fulfillment_ready TO authenticated;
GRANT SELECT ON public.products_fulfillment_ready TO service_role;


-- ── products_missing_printify_id ─────────────────────────────────────────────
-- Used by: admin CRM (SQL queries only)
-- Underlying table: products (same RLS as above)

CREATE OR REPLACE VIEW public.products_missing_printify_id
  WITH (security_invoker = true) AS
SELECT
  id, slug, title, product_source, printify_product_id, printify_variant_id,
  status, price_cents, category
FROM public.products
WHERE product_source = 'printify'
  AND (printify_product_id IS NULL OR printify_variant_id IS NULL);

REVOKE ALL ON public.products_missing_printify_id FROM anon;
GRANT SELECT ON public.products_missing_printify_id TO authenticated;
GRANT SELECT ON public.products_missing_printify_id TO service_role;


-- ── v_editorial_calendar ─────────────────────────────────────────────────────
-- Used by: admin CRM editorial calendar page (authenticated editors only)
-- Underlying table: content_posts (RLS: public SELECT for published; editor ALL)
-- With security_invoker: admins see all posts in the date window (pass editor ALL);
--   anon sees only published posts within the window (pass public SELECT).
-- We revoke anon entirely — the editorial calendar is not a public page.

CREATE OR REPLACE VIEW public.v_editorial_calendar
  WITH (security_invoker = true) AS
SELECT
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
  cp.publish_date::date                                       AS publish_day,
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
  COALESCE(cp.seo_title, cp.title)                           AS display_seo_title,
  (cp.seo_title IS NOT NULL AND cp.seo_description IS NOT NULL) AS seo_complete,
  (cp.featured_image IS NOT NULL AND cp.featured_image <> '') AS has_image,
  cp.created_at,
  cp.updated_at
FROM public.content_posts cp
WHERE cp.publish_date >= CURRENT_DATE - 7
  AND cp.publish_date <= CURRENT_DATE + 37
  AND cp.workflow_status <> 'archived'
ORDER BY cp.publish_date, cp.editorial_priority DESC;

REVOKE ALL ON public.v_editorial_calendar FROM anon;
-- Retain authenticated grant (editors use this view in the CRM)
GRANT SELECT ON public.v_editorial_calendar TO authenticated;
GRANT SELECT ON public.v_editorial_calendar TO service_role;


-- ── v_newsletter_candidates ──────────────────────────────────────────────────
-- Used by: newsletter auto-selector API + cron (both run as authenticated or service_role)
-- Underlying table: content_posts (same RLS as above)
-- With security_invoker: only published posts are visible to anon/authenticated.
-- The view already filters to status = 'published', so invoker security is redundant
-- but correct and eliminates the Advisor finding.
-- Anon access revoked — this is an internal admin/cron view.

CREATE OR REPLACE VIEW public.v_newsletter_candidates
  WITH (security_invoker = true) AS
SELECT
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
  EXTRACT(day FROM now() - cp.publish_date)::int AS days_since_published,
  CASE
    WHEN cp.last_newsletter_date > CURRENT_DATE - 14 THEN true
    ELSE false
  END AS promoted_recently
FROM public.content_posts cp
WHERE cp.status = 'published'
  AND cp.workflow_status = 'published'
  AND cp.newsletter_eligible = true
  AND (cp.featured_image IS NOT NULL AND cp.featured_image <> '')
  AND cp.publish_date <= now()
ORDER BY cp.editorial_priority DESC, cp.publish_date DESC;

REVOKE ALL ON public.v_newsletter_candidates FROM anon;
GRANT SELECT ON public.v_newsletter_candidates TO authenticated;
GRANT SELECT ON public.v_newsletter_candidates TO service_role;


-- ============================================================================
-- PHASE 3: Enable RLS on 6 tables
-- ============================================================================
-- None of these tables had RLS enabled in production despite migrations that
-- intended to enable it. All server-side operations (cron jobs, API routes) use
-- the service_role client which bypasses RLS, so enabling RLS only affects
-- direct anon/authenticated queries through the PostgREST Data API.
-- ============================================================================

-- ── newsletter_issue_news ────────────────────────────────────────────────────
-- Purpose: junction table — maps newsletter campaigns to manually picked news articles
-- Readers: the public newsletter archive page (anon), CRM editors
-- Writers: CRM editors only
-- The public archive calls resolveNewsletterIssue() via supabaseServer() with
-- no user JWT for anonymous visitors, so anon needs SELECT to see curated articles.

ALTER TABLE public.newsletter_issue_news ENABLE ROW LEVEL SECURITY;

-- Drop any stale policies from prior partial migrations
DROP POLICY IF EXISTS nl_issue_news_staff_read  ON public.newsletter_issue_news;
DROP POLICY IF EXISTS nl_issue_news_editor_all  ON public.newsletter_issue_news;

-- Public SELECT: anon + authenticated can read (needed for public newsletter archive)
CREATE POLICY nl_issue_news_public_select ON public.newsletter_issue_news
  FOR SELECT USING (true);

-- Editor INSERT
CREATE POLICY nl_issue_news_editor_insert ON public.newsletter_issue_news
  FOR INSERT WITH CHECK (public.app_is_editor());

-- Editor UPDATE
CREATE POLICY nl_issue_news_editor_update ON public.newsletter_issue_news
  FOR UPDATE USING (public.app_is_editor()) WITH CHECK (public.app_is_editor());

-- Editor DELETE
CREATE POLICY nl_issue_news_editor_delete ON public.newsletter_issue_news
  FOR DELETE USING (public.app_is_editor());


-- ── newsletter_issue_blogs ───────────────────────────────────────────────────
-- Same design as newsletter_issue_news — public archive readers need SELECT.

ALTER TABLE public.newsletter_issue_blogs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS nl_issue_blogs_staff_read ON public.newsletter_issue_blogs;
DROP POLICY IF EXISTS nl_issue_blogs_editor_all ON public.newsletter_issue_blogs;

CREATE POLICY nl_issue_blogs_public_select ON public.newsletter_issue_blogs
  FOR SELECT USING (true);

CREATE POLICY nl_issue_blogs_editor_insert ON public.newsletter_issue_blogs
  FOR INSERT WITH CHECK (public.app_is_editor());

CREATE POLICY nl_issue_blogs_editor_update ON public.newsletter_issue_blogs
  FOR UPDATE USING (public.app_is_editor()) WITH CHECK (public.app_is_editor());

CREATE POLICY nl_issue_blogs_editor_delete ON public.newsletter_issue_blogs
  FOR DELETE USING (public.app_is_editor());


-- ── coupon_campaigns ─────────────────────────────────────────────────────────
-- Purpose: defines per-newsletter discount campaigns
-- Readers: staff (CRM) + the coupon validation API (uses service_role)
-- Writers: editors (CRM) + service_role (bypasses RLS)
-- Anon users never need to read raw campaign rows — they use v_my_active_entitlement.

ALTER TABLE public.coupon_campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS cc_staff_read ON public.coupon_campaigns;
DROP POLICY IF EXISTS cc_editor_all ON public.coupon_campaigns;

CREATE POLICY coupon_campaigns_staff_select ON public.coupon_campaigns
  FOR SELECT USING (public.app_is_staff());

CREATE POLICY coupon_campaigns_editor_insert ON public.coupon_campaigns
  FOR INSERT WITH CHECK (public.app_is_editor());

CREATE POLICY coupon_campaigns_editor_update ON public.coupon_campaigns
  FOR UPDATE USING (public.app_is_editor()) WITH CHECK (public.app_is_editor());

CREATE POLICY coupon_campaigns_editor_delete ON public.coupon_campaigns
  FOR DELETE USING (public.app_is_editor());


-- ── coupon_entitlements ──────────────────────────────────────────────────────
-- Purpose: one row per eligible user per campaign
-- Readers: the entitlement owner (for My Account), staff (CRM)
-- Writers: editor / service_role (fn_redeem_coupon_entitlement runs as SECURITY DEFINER)
-- Anon users have no entitlements.

ALTER TABLE public.coupon_entitlements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS ce_owner_read ON public.coupon_entitlements;
DROP POLICY IF EXISTS ce_editor_all ON public.coupon_entitlements;

CREATE POLICY coupon_entitlements_owner_select ON public.coupon_entitlements
  FOR SELECT USING (user_id = auth.uid() OR public.app_is_staff());

CREATE POLICY coupon_entitlements_editor_insert ON public.coupon_entitlements
  FOR INSERT WITH CHECK (public.app_is_editor());

CREATE POLICY coupon_entitlements_editor_update ON public.coupon_entitlements
  FOR UPDATE USING (public.app_is_editor()) WITH CHECK (public.app_is_editor());

CREATE POLICY coupon_entitlements_editor_delete ON public.coupon_entitlements
  FOR DELETE USING (public.app_is_editor());


-- ── content_publish_events ───────────────────────────────────────────────────
-- Purpose: idempotency log for the daily content publisher cron job
-- Readers: admin CRM only
-- Writers: cron job via service_role (bypasses RLS)
-- Anon users have no business reading this table.

ALTER TABLE public.content_publish_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY content_publish_events_staff_select ON public.content_publish_events
  FOR SELECT USING (public.app_is_staff());

-- Service_role writes bypass RLS — no INSERT policy needed for cron jobs.
-- If the CRM ever needs to create backdated records (admin use), editor INSERT:
CREATE POLICY content_publish_events_editor_insert ON public.content_publish_events
  FOR INSERT WITH CHECK (public.app_is_editor());


-- ── newsletter_test_deliveries ───────────────────────────────────────────────
-- Purpose: log of test email sends (completely separate from production delivery)
-- Readers: admin CRM only
-- Writers: test-send API route via supabaseServiceRole() (bypasses RLS)
-- Anon users have no business accessing test delivery logs.

ALTER TABLE public.newsletter_test_deliveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY newsletter_test_deliveries_staff_select ON public.newsletter_test_deliveries
  FOR SELECT USING (public.app_is_staff());

-- Service_role writes bypass RLS — the test-send route uses supabaseServiceRole().
-- Editor INSERT for any future CRM use:
CREATE POLICY newsletter_test_deliveries_editor_insert ON public.newsletter_test_deliveries
  FOR INSERT WITH CHECK (public.app_is_editor());


-- ============================================================================
-- PHASE 4: Narrow overly-permissive existing policies
-- ============================================================================

-- ── contact_messages — contact_anyone_insert ─────────────────────────────────
-- Previous: WITH CHECK (true) — flagged as "Policy Always True"
-- Fix: require non-empty email and non-empty message.
-- This is the minimum validation for a contact form. The intent (anon can INSERT)
-- is preserved; only the check clause becomes non-trivially true.

DROP POLICY IF EXISTS contact_anyone_insert ON public.contact_messages;
CREATE POLICY contact_anyone_insert ON public.contact_messages
  FOR INSERT WITH CHECK (
    email IS NOT NULL
    AND trim(email::text) <> ''
    AND message IS NOT NULL
    AND trim(message) <> ''
  );


-- ── content_posts — content_posts_admin_all ──────────────────────────────────
-- Previous: FOR ALL USING (true) — any authenticated user could INSERT/UPDATE/DELETE
-- Fix: require editor role (editor, admin, or owner).
-- The public SELECT policy (status = 'published') remains unchanged and continues
-- to allow anon reads of published content. The cron publisher uses service_role
-- (bypasses RLS). The newsletter resolver reads published posts via the public
-- SELECT policy when called without auth.

DROP POLICY IF EXISTS content_posts_admin_all ON public.content_posts;
CREATE POLICY content_posts_admin_all ON public.content_posts
  FOR ALL
  USING (public.app_is_editor())
  WITH CHECK (public.app_is_editor());


-- ============================================================================
-- PHASE 5: Pin search_path on functions with mutable paths
-- ============================================================================
-- A mutable search_path is exploitable when someone can create objects in a
-- schema that appears before 'public' in the path. SECURITY DEFINER functions
-- are especially dangerous because they run with elevated privileges.
-- ============================================================================

-- ── set_updated_at ───────────────────────────────────────────────────────────
-- Not SECURITY DEFINER, but an open search_path is still Advisor-flagged.
ALTER FUNCTION public.set_updated_at() SET search_path = pg_catalog, public;

-- ── fn_generate_editorial_alerts ─────────────────────────────────────────────
-- IS SECURITY DEFINER — pinning the path is important here.
ALTER FUNCTION public.fn_generate_editorial_alerts() SET search_path = pg_catalog, public;


-- ============================================================================
-- PHASE 6: Restrict EXECUTE on SECURITY DEFINER functions
-- ============================================================================
-- fn_generate_editorial_alerts: cron/admin-only function. Regular users and
--   anonymous visitors must not be able to invoke it directly via RPC.
-- handle_new_user: Auth trigger function. It is invoked by the trigger mechanism,
--   not by user RPC. Granting EXECUTE to anon/authenticated is unnecessary.
-- ============================================================================

-- fn_generate_editorial_alerts: revoke from anon + authenticated + PUBLIC, keep service_role
-- Note: PostgreSQL GRANT/REVOKE on specific roles does NOT remove a PUBLIC grant.
-- Revoking from PUBLIC is required to prevent anon from inheriting EXECUTE via the
-- implicit PUBLIC role membership.
REVOKE EXECUTE ON FUNCTION public.fn_generate_editorial_alerts() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.fn_generate_editorial_alerts() FROM anon;
REVOKE EXECUTE ON FUNCTION public.fn_generate_editorial_alerts() FROM authenticated;
GRANT  EXECUTE ON FUNCTION public.fn_generate_editorial_alerts() TO service_role;

-- handle_new_user: trigger only — no direct user invocation needed
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;
-- postgres and service_role retain implicit access via ownership / trigger mechanism


-- ============================================================================
-- PHASE 7: citext extension — DEFERRED (high-risk, low-benefit)
-- ============================================================================
-- citext is installed in the 'public' schema. Moving it to the 'extensions'
-- schema would require:
--   1. DROP EXTENSION citext CASCADE  (drops all citext columns — DESTRUCTIVE)
--   2. CREATE EXTENSION citext WITH SCHEMA extensions
--   3. Recreating all 13 dependent columns in 8 tables
-- This migration does NOT attempt this change. The citext-in-public warning is
-- acknowledged and accepted as a low-severity finding. It will be reviewed
-- when a full schema migration with zero-downtime column type changes is planned.


-- ============================================================================
-- PHASE 9 NOTES: Dashboard-only changes (cannot be expressed as SQL)
-- ============================================================================
-- Storage bucket listing (media-uploads, og-cache, printables-free):
--   Open the Supabase dashboard → Storage → Policies and set:
--   - media-uploads:      Allow GET on known paths; disable public listing
--   - og-cache:           Allow GET only; listing not required by any route
--   - printables-free:    Allow GET on known paths; listing is intentional for
--                         free downloads but review whether enumeration is needed
--
-- Leaked Password Protection:
--   Dashboard → Authentication → Settings → Security → Enable "Password strength"
--   and "HaveIBeenPwned" leak detection if available on this plan.
--   Does not affect existing sessions or require password resets.


-- ============================================================================
-- PHASE 10: Intentionally retained Advisor warnings (documented)
-- ============================================================================
-- app_current_role(), app_has_min_role() — "Public Can Execute SECURITY DEFINER"
--   These functions are called during RLS policy evaluation on multiple tables.
--   In PostgreSQL, when a policy contains USING (public.app_is_editor()), the
--   calling role must have EXECUTE on app_is_editor(), which in turn calls
--   app_current_role(). Revoking EXECUTE from anon would cause:
--     ERROR 42501: permission denied for function app_current_role
--   on any RLS policy evaluation for unauthenticated users. These functions
--   are intentionally callable but are SECURITY DEFINER and return only the
--   caller's own role — they cannot be exploited to escalate privileges.
--   Status: Accepted warning. No change.
--
-- contact_messages.contact_anyone_insert — "Policy Always True" (partially)
--   After this migration, the INSERT policy checks non-empty email + message.
--   The Advisor may still flag it as permissive (any visitor can INSERT).
--   This is the intended behavior: contact form submissions are public.
--   Status: Accepted residual warning. INSERT intentionally open to anon.
-- ============================================================================

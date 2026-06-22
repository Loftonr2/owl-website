# OWL Command Center

A unified admin system at `/admin`, built into the existing Next.js (App Router)
+ Supabase + Vercel website. This document covers the database schema, the
role-based security model, the build status of all ten sections, the scheduled
automations, and the deployment / next-phase guide.

> **Foundation phase shipped:** full database schema for all ten sections,
> Supabase email/password auth, role-based permissions (RLS), audit logging, and
> the role-gated admin shell with a live-KPI dashboard and a scaffold page per
> section. The remaining UI, API routes, and integration sync jobs are scoped
> per section under "Build status" below and are ready to layer on.

---

## 1. Architecture at a glance

| Layer | Implementation |
|---|---|
| App | Next.js App Router, route group `src/app/(admin)` mounted at `/admin` |
| Auth | Supabase Auth — **email + password** (primary) with magic-link fallback |
| AuthZ | Postgres Row-Level Security, driven by `app_has_min_role()` helpers |
| DB | Supabase Postgres 17, project `owl-sing-together` (`rvajnrkpbqvnajkdhpsr`) |
| Storage | Supabase Storage — `newsletter-assets` (private) + existing buckets |
| Email | Resend (already a dependency) |
| Commerce | PayPal + Printful + existing Stripe/Shopify mirrors |
| Analytics | GA4 → `analytics_daily` |
| Automation | n8n-compatible webhooks (`webhook_events`) + Vercel Cron |

### Key source files

```
supabase/migrations/0002_rbac_and_audit.sql        RBAC helpers + audit trigger
supabase/migrations/0003_crm.sql                   CRM
supabase/migrations/0004_newsletter.sql            Newsletter + asset folders
supabase/migrations/0005_affiliate_and_coupons.sql Affiliate Center + Coupon Engine
supabase/migrations/0006_commerce_downloads_blog.sql Order items, downloads, blog links
supabase/migrations/0007_calendar_analytics_automation_settings.sql
supabase/migrations/0008_reporting.sql             Exec report fn + revenue views
supabase/migrations/0009_security_hardening.sql    Linter fixes (search_path, grants)

src/lib/auth/roles.ts            Role model + requireStaff()/requireRole() guards
src/lib/admin/nav.ts             The 10 sections + per-section min role
src/lib/admin/stats.ts           Dashboard KPI probes
src/components/admin/*            Sidebar, topbar, section scaffolding
src/app/(admin)/layout.tsx       Auth + RBAC guarded shell
src/app/(admin)/admin/**         Dashboard + 9 section pages
src/app/login/*                  Email/password + magic-link sign-in
```

---

## 2. Security model (RBAC)

Five+ roles live on `public.profiles.role`. The four **staff** roles can enter
the Command Center:

| Role | Rank | Meaning (spec) | Can do |
|---|---|---|---|
| `owner` | 50 | Owner | Everything, incl. Settings + credential vault |
| `admin` | 40 | Administrator | Everything except owner-only |
| `editor` | 30 | Editor | Content + commerce operations |
| `support` | 20 | Support | Read-most + customer-service actions |
| `educator` | 10 | — | Curriculum portal entitlement (not staff) |
| `viewer` | 0 | — | Authed baseline |

Enforcement is **defense-in-depth**:

1. **Middleware** redirects unauthenticated `/admin` requests to `/login`.
2. **Layout** calls `requireStaff()` (server) — bounces non-staff.
3. **Each page** calls `requireRole('editor' | 'admin' | …)` for its tier.
4. **RLS** is the real boundary: every table has policies built on the
   recursion-safe SQL helpers `app_is_staff()`, `app_is_editor()`,
   `app_is_admin()`, `app_is_owner()`.

These helpers are `SECURITY DEFINER` with a pinned `search_path`, so a policy on
`profiles` can read `profiles` without infinite recursion.

### Audit log

Every mutation on sensitive tables fires `fn_audit()`, writing actor
(`auth.uid()`), operation, table, row id, and an old/new JSON diff into
`public.audit_log`. Attached to: profiles-adjacent domain tables incl.
`crm_contacts`, `crm_segments`, `newsletter_campaigns`, all `affiliate_*`,
`coupons`, `calendar_events`, and `affiliate_credentials`.

---

## 3. Schema by section

### CRM (`0003`)
`crm_contacts` (unified subscribers/customers/educators/affiliates/leads with
`contact_types[]`, `lifecycle_stage`, `engagement_score`, external IDs,
referral attribution) · `crm_tags` + `crm_contact_tags` · `crm_segments`
(static or rule-based) + `crm_segment_members` · `crm_engagement_events`
(auto-bumps `engagement_score`) · `crm_notes` · `crm_referrals`.

### Newsletter (`0004`)
`newsletter_campaigns` (status, `week_folder` = `Week-01..NN`, `subject_variants[]`
for A/B, `scheduled_for`, counters) · `newsletter_assets` (per weekly folder:
html / image / pdf / coupon) · `newsletter_recipients` · `newsletter_events`
(open / click / coupon_redeemed / unsubscribe, with count rollups) · private
`newsletter-assets` storage bucket.

### Affiliate Center + Coupon Engine (`0005`)
`affiliate_networks` (12 programs seeded: Amazon Associates, ShareASale, CJ,
Rakuten, Bookshop, Lovevery, Learning Resources, Lakeshore, KiwiCo, Little
Passports, Green Kid Crafts, Highlights) · `affiliate_credentials`
(**owner/admin-only** vault) · `affiliate_partners` · `affiliate_products`
(tracking links) · `affiliate_clicks` · `affiliate_revenue` (commissions +
history) · `coupons` (unified store/affiliate/newsletter, manual or harvested) ·
`coupon_redemptions` · `coupon_harvest_runs` · `newsletter_campaign_coupons`.

### Commerce / Downloads / Blog (`0006`)
`order_items` (normalized lines for top-product reporting) + `orders.coupon_code`
· `lead_magnets` · `downloads` (curriculum/printable/lead-magnet history, linked
to contacts) · `blog_posts` enriched with `scheduled_for`, `author_id`,
`newsletter_campaign_id`, `lead_magnet_id` · `blog_post_relations`
(owl_product / affiliate_product / lead_magnet / coupon / video / newsletter).

### Calendar / Analytics / Automation / Settings (`0007`)
`calendar_events` (blog / newsletter / video / promotion / holiday /
affiliate_campaign) · `analytics_daily` (generic GA4/Resend/YouTube/store/affiliate
metric store) · `webhook_events` (n8n + provider landing zone) · `automation_runs`
· `scheduled_jobs` (registry, seeded) · `app_settings` · `feature_flags`.

### Executive reporting (`0008`)
`executive_reports` + `generate_executive_report(period_start, period_end)`
returning the full metric set (subscribers, new/unsub, open/click rate, store +
affiliate revenue, top coupons, top blog posts, top products). Plus revenue
views `v_store_revenue_daily`, `v_affiliate_revenue_daily`,
`v_combined_revenue_daily`, and `v_active_coupons` (feeds the newsletter builder).

---

## 4. Scheduled automations

Registered in `public.scheduled_jobs`; wire each to **Vercel Cron** (or n8n):

| Job key | Cron (ET) | Action |
|---|---|---|
| `friday_newsletter` | `0 9 * * 5` | Send the scheduled weekly newsletter, then track opens/clicks/coupon usage |
| `monday_exec_report` | `0 7 * * 1` | `generate_executive_report()` for the prior week → store → email Larissa + Rick |
| `coupon_harvest_daily` | `0 3 * * *` | Harvest fresh affiliate coupon codes into `coupons` |

Recipients for the executive report are configurable in
`app_settings.report_recipients` (defaults to Larissa + Rick).

### Suggested route handlers (next phase)
```
src/app/api/cron/newsletter-send/route.ts    # reads scheduled campaigns, sends via Resend
src/app/api/cron/exec-report/route.ts         # calls generate_executive_report, emails it
src/app/api/cron/coupon-harvest/route.ts      # per-network harvest adapters
src/app/api/webhooks/[source]/route.ts        # paypal / printful / resend / n8n → webhook_events
src/app/api/track/click/route.ts              # affiliate redirect + affiliate_clicks
```
Protect cron routes with a `CRON_SECRET` header check; they use the service-role
client (bypasses RLS).

---

## 5. Deployment guide

1. **Migrations** — already applied to the live project via MCP. For a fresh
   environment, run `supabase db push` (or paste `0002`→`0009` into the SQL
   editor in order). They are additive and safe to re-run on a clean DB.
2. **Env vars** (Vercel + `.env.local`) — `SUPABASE_URL`, `SUPABASE_ANON_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY`, plus their `NEXT_PUBLIC_*` mirrors;
   `RESEND_API_KEY`; PayPal / Printful keys; `GA4_MEASUREMENT_ID`;
   `N8N_WEBHOOK_BASE_URL`; and a new `CRON_SECRET` for the cron routes.
3. **Create the first owner**
   - Supabase Dashboard → Authentication → **Add user** (email + password) for
     Larissa, then Rick. (Signup stays disabled — admin is invite-only.)
   - In SQL editor: `update public.profiles set role='owner' where email in
     ('larissa@…','rick@…');` (a profile row auto-creates via the
     `handle_new_user` trigger on first sign-in / user creation).
4. **Sign in** at `/login` with email + password → lands on `/admin`.
5. **Cron** — add the three jobs above in `vercel.json` once the route handlers
   land, or trigger them from n8n against the API routes.

---

## 6. Verification notes

- Migrations `0002`–`0009` applied cleanly; `list_tables` confirms 47 base
  tables. Supabase security advisors were re-run and the items introduced by
  this work (mutable `search_path`, RPC-exposed trigger/report functions) were
  resolved in `0009`. Remaining advisor notes (`citext` in `public`, a few
  pre-existing store views, public-bucket listing) predate this work and are
  tracked separately.
- The helper functions `app_current_role()` / `app_has_min_role()` remain
  callable by authenticated users **by design** — they are required for RLS
  policy evaluation and only return the caller's own role.

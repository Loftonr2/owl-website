# OWL_BUILD_PLAN.md

**Project:** [www.owlsingtogether.com](https://www.owlsingtogether.com)
**Repo root:** `C:\Users\Ricko\OneDrive\Documents\Claude\Projects\OWL Website Build\owl-website`
**Source of truth:** `..\OWL-Obsidian-Brain\`
**Plan date:** 2026-05-11

> This file is the build plan for everything Day-1 OWL needs: public site, blog, newsletter, store, admin CRM, curriculum system, animation, SEO, QA, and deployment. It maps deliverables to phased work and assigns each phase to one of the 13 specialist agent roles below.

---

## 1. Current Project Status

**Phase 1 — Foundation: ✅ COMPLETE**

The Next.js 15 repo is scaffolded with TypeScript, App Router, Tailwind CSS 3.4, ESLint 9, and `src/` directory layout. `npm install` has been run (308 top-level packages in `node_modules/`). The repo is in OneDrive at the path above and the [Obsidian brain](../OWL-Obsidian-Brain/) is connected via `CLAUDE.md`.

What ships today:

| Layer | State |
|---|---|
| Next.js + React 19 + TS | ✅ scaffolded |
| Tailwind CSS + OWL design tokens | ✅ wired (`tailwind.config.ts`, `globals.css`) |
| ESLint + Prettier (with Tailwind class sorting) | ✅ configured |
| Route groups `(marketing)` / `(admin)` | ✅ created |
| Site header + footer chrome | ✅ stub components |
| UI primitives — Button / Card / Chip (cva variants) | ✅ shipped |
| Framer Motion | ✅ installed (not yet used) |
| Service-client stubs (Sanity, Supabase ×2, Stripe, Resend, Beehiiv) | ✅ lazy-instantiating, soft-fail on missing env |
| SEO foundation (sitemap, robots, JSON-LD helpers, metadata helper) | ✅ live |
| `/api/health` + `/api/newsletter/subscribe` | ✅ live (newsletter route validates with zod, soft-fails until Beehiiv+Resend keys set) |
| Welcome email (React Email template) | ✅ Day-0 of the 5-email sequence |
| Sanity scaffold (env, queries, schema registry) | ✅ stubbed for Phase 2 |
| Middleware | ✅ no-op pass-through; Phase 2 will enable auth guard |
| Playwright e2e | ✅ config + first smoke test |
| Brand bridge: `CLAUDE.md`, `README.md`, `.env.local.example` | ✅ all at repo root |

What does **NOT** work yet (by design — Phase 2+):

- No live CMS (Sanity project not yet created)
- No live auth (Supabase project not yet created)
- No live commerce (Stripe products not yet created)
- No real Resend domain (transactional email won't deliver until DNS is set)
- No Beehiiv publication wired
- No real content (videos, products, printables, blog posts, curriculum) yet — schemas come Phase 2, content Phase 4–6
- Homepage is a placeholder hero, not the full 13-section spec

---

## 2. Missing Packages

**None.** Phase 1 already added every package required for Phases 2–9:

**Production deps (24):**
`next`, `react`, `react-dom`, `framer-motion`, `lucide-react`, `clsx`, `tailwind-merge`, `class-variance-authority`, `@radix-ui/react-slot`, `zod`, `react-hook-form`, `@hookform/resolvers`, `@sanity/client`, `@sanity/image-url`, `next-sanity`, `@portabletext/react`, `@supabase/supabase-js`, `@supabase/ssr`, `stripe`, `resend`, `react-email`, `@react-email/components`, `date-fns`

**Dev deps (12):**
`typescript`, `@types/{node,react,react-dom}`, `tailwindcss`, `autoprefixer`, `postcss`, `eslint`, `eslint-config-next`, `prettier`, `prettier-plugin-tailwindcss`, `@playwright/test`

**Packages we'll add later only if/when needed:**
- `sanity` + `@sanity/vision` — when we mount the embedded Studio at `/studio` (Phase 2)
- `vitest` + `@testing-library/react` — if we add unit tests beyond Playwright e2e (Phase 9, optional)
- `@vercel/og` — if we want dynamic Open Graph images (Phase 6+)
- `tailwindcss-animate` — if we adopt full shadcn animations (Phase 4+ if needed)

---

## 3. Required Environment Variables

All canonical names are documented in `.env.local.example` (mirrored from `../OWL-Obsidian-Brain/11_Tech_Requirements/TECH_STACK.md §9`). Today only `NEXT_PUBLIC_SITE_URL` is required for the dev server to boot; the rest are filled in as each integration goes live.

| Group | Vars | Required by |
|---|---|---|
| Site | `NEXT_PUBLIC_SITE_URL` | Always |
| Sanity | `SANITY_PROJECT_ID`, `SANITY_DATASET`, `SANITY_API_TOKEN`, `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET` | Phase 2 |
| Supabase | `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Phase 2 |
| Shopify | `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_STOREFRONT_ACCESS_TOKEN`, `SHOPIFY_ADMIN_API_TOKEN` | Phase 3 |
| Printify / Gumroad | `PRINTIFY_API_KEY`, `GUMROAD_API_KEY` | Phase 3 |
| Stripe | `STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Phase 3 |
| Email | `BEEHIIV_API_KEY`, `BEEHIIV_PUBLICATION_ID`, `RESEND_API_KEY`, `CONVERTKIT_API_KEY` | Phase 3 |
| Storage | `CLOUDFLARE_R2_ACCESS_KEY`, `CLOUDFLARE_R2_SECRET_KEY`, `CLOUDFLARE_R2_BUCKET` | Phase 3 |
| Analytics | `GA4_MEASUREMENT_ID` | Phase 6 |
| AI | `ELEVENLABS_API_KEY`, `ANTHROPIC_API_KEY` | When automation runs |
| Automation | `N8N_WEBHOOK_BASE_URL` | When n8n is hosted |
| Product DB | `AIRTABLE_API_KEY`, `AIRTABLE_BASE_ID` | Optional, Phase 7+ |

---

## 4. Database Schema Plan (Supabase / Postgres)

> Phase 2 deliverable. Migrations live in `supabase/migrations/NNNN_*.sql`.

### 4.1 Tables

```sql
-- 4.1.1 users (mirrors auth.users, app-level fields only)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email citext unique not null,
  full_name text,
  display_name text,
  role text not null default 'viewer' check (role in ('viewer','educator','editor','admin','owner')),
  avatar_url text,
  marketing_consent boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4.1.2 admin_users (allowlist of role >= editor; surfaced for fast checks)
create view public.admin_users as
  select id, email, role from public.profiles where role in ('editor','admin','owner');

-- 4.1.3 blog_posts (mirror of Sanity blogArticle for analytics + cache)
create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  sanity_id text unique not null,
  slug text unique not null,
  title text not null,
  category text not null,
  summary text,
  published_at timestamptz,
  status text not null default 'draft' check (status in ('draft','scheduled','published','archived')),
  view_count integer default 0,
  click_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4.1.4 blog_categories (6 SEO pillar hubs from BLOG_NEWSLETTER_SYSTEM.md)
create table public.blog_categories (
  slug text primary key,
  name text not null,
  description text,
  hub_url text not null
);
-- seed: cultural-holidays, early-learning, sel-for-kids, educational-gifts, educator-resources, music-child-development

-- 4.1.5 products (Shopify mirror for analytics)
create table public.products (
  id uuid primary key default gen_random_uuid(),
  shopify_product_id text unique,
  sanity_id text unique,
  sku text unique,
  title text not null,
  slug text unique not null,
  price_cents integer not null,
  category text,
  age_range text,
  channel text not null check (channel in ('shopify','printify','gumroad','etsy','kdp','tpt')),
  status text not null default 'draft' check (status in ('draft','active','archived')),
  created_at timestamptz default now()
);

-- 4.1.6 orders (Shopify + Gumroad webhooks land here)
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  external_id text unique not null,
  source text not null check (source in ('shopify','gumroad','stripe')),
  customer_email citext not null,
  total_cents integer not null,
  currency text default 'USD',
  status text not null check (status in ('pending','paid','fulfilled','refunded','cancelled')),
  line_items jsonb not null,
  placed_at timestamptz not null,
  raw_payload jsonb
);

-- 4.1.7 newsletter_subscribers (Beehiiv mirror — Source of truth is Beehiiv API)
create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email citext unique not null,
  beehiiv_subscription_id text unique,
  segments text[] default '{}'::text[],
  signup_source text,
  utm jsonb,
  status text not null default 'active' check (status in ('active','unsubscribed','bounced','pending')),
  subscribed_at timestamptz default now(),
  unsubscribed_at timestamptz
);

-- 4.1.8 curriculum_programs (6 Birth–5 tiers + Grade 6 expansion)
create table public.curriculum_programs (
  id uuid primary key default gen_random_uuid(),
  tier_number smallint not null,
  slug text unique not null,
  name text not null,
  age_band text not null,
  framework text not null,
  year_pack_price_cents integer,
  bundle_price_cents integer,
  description text,
  status text not null default 'draft'
);

-- 4.1.9 lessons (216 weekly plans + ad-hoc)
create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  program_id uuid references public.curriculum_programs(id) on delete cascade,
  unit_number smallint not null,
  week_number smallint not null,
  title text not null,
  slug text unique not null,
  youtube_video_id text,
  printable_id uuid,
  standards jsonb default '{}'::jsonb,
  pdf_path text,
  created_at timestamptz default now()
);

-- 4.1.10 lesson_categories (units inside a tier)
create table public.lesson_categories (
  id uuid primary key default gen_random_uuid(),
  program_id uuid references public.curriculum_programs(id) on delete cascade,
  unit_number smallint not null,
  title text not null,
  description text
);

-- 4.1.11 media_assets (Cloudflare R2 + Sanity asset mirror)
create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  source text not null check (source in ('sanity','r2','youtube','soundcloud','spotify')),
  kind text not null check (kind in ('image','video','pdf','audio','other')),
  external_id text,
  url text,
  alt_text text,
  meta jsonb,
  uploaded_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

-- 4.1.12 contact_messages (public inquiry form)
create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  segment text not null check (segment in ('parent','educator','media','licensing','sponsor')),
  name text not null,
  email citext not null,
  organization text,
  message text not null,
  status text not null default 'new' check (status in ('new','triaged','responded','archived')),
  created_at timestamptz default now()
);

-- 4.1.13 audit_log
create table public.audit_log (
  id bigserial primary key,
  actor uuid references public.profiles(id),
  action text not null,
  entity text not null,
  entity_id text,
  diff jsonb,
  ip_address inet,
  created_at timestamptz default now()
);
```

### 4.2 Row-Level Security (RLS)

> Enable RLS on every table. Defaults are deny; policies grant explicit access.

```sql
alter table public.profiles enable row level security;
-- Profile self-read/update
create policy "profiles_self_read" on public.profiles for select using (auth.uid() = id);
create policy "profiles_self_update" on public.profiles for update using (auth.uid() = id);
-- Admins read all
create policy "profiles_admin_read" on public.profiles for select using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','owner'))
);

alter table public.blog_posts enable row level security;
-- Public read of published
create policy "blog_public_read" on public.blog_posts for select using (status = 'published');
-- Editor+ writes
create policy "blog_editor_write" on public.blog_posts for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('editor','admin','owner'))
);

alter table public.products enable row level security;
create policy "products_public_read" on public.products for select using (status = 'active');
create policy "products_editor_write" on public.products for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('editor','admin','owner'))
);

alter table public.orders enable row level security;
-- Customer reads their own
create policy "orders_customer_read" on public.orders for select using (
  customer_email = (select email from public.profiles where id = auth.uid())
);
-- Admins read all
create policy "orders_admin_read" on public.orders for select using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','owner'))
);

alter table public.newsletter_subscribers enable row level security;
-- Admin-only
create policy "subs_admin_only" on public.newsletter_subscribers for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','owner'))
);

alter table public.curriculum_programs enable row level security;
create policy "curriculum_public_read" on public.curriculum_programs for select using (status = 'active');
create policy "curriculum_editor_write" on public.curriculum_programs for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('editor','admin','owner'))
);

alter table public.lessons enable row level security;
create policy "lessons_owner_read" on public.lessons for select using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('educator','editor','admin','owner'))
);

alter table public.contact_messages enable row level security;
-- Admin-only read; anyone can insert via the public form (route handler uses service role)
create policy "contact_admin_read" on public.contact_messages for select using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','owner'))
);

alter table public.audit_log enable row level security;
create policy "audit_admin_only" on public.audit_log for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','owner'))
);
```

### 4.3 Storage Buckets

| Bucket | Purpose | Visibility | Used by |
|---|---|---|---|
| `printables-free` | Free email-gated printable PDFs | Public + signed URLs | Phase 4 |
| `printables-paid` | Paid printable PDFs | Private, signed URLs only | Phase 3 |
| `curriculum-pdfs` | Generated lesson plan PDFs | Private + entitlement check | Phase 8 |
| `media-uploads` | Editorial image uploads (CMS asset fallback) | Public | Phase 2 |
| `og-cache` | Dynamic OG image cache | Public | Phase 6 |

> Most images live in Sanity. R2 is for gated PDFs and large binary assets. Cloudflare R2 can be swapped for Supabase Storage if we want a single backend.

---

## 5. Page Structure

### 5.1 Public Pages

| Route | Owner role | Status | Phase |
|---|---|---|---|
| `/` (Home) | Frontend Engineer | placeholder | 4 |
| `/about` (About Larissa) | Frontend Engineer | not started | 4 |
| `/programs` (Programs overview) | Frontend Engineer | not started | 5 |
| `/curriculum` (Public curriculum overview) | Frontend Engineer | not started | 5 |
| `/watch` (Video library) | Frontend Engineer | not started | 5 |
| `/watch/[slug]` (Video detail) | Frontend Engineer | not started | 5 |
| `/music` (Music + playlists) | Frontend Engineer | not started | 5 |
| `/music/[slug]` (Playlist detail) | Frontend Engineer | not started | 5 |
| `/shop` (Store landing) | Store Engineer | not started | 5 |
| `/shop/[slug]` (Product detail) | Store Engineer | not started | 5 |
| `/printables` (Hub) | Frontend Engineer | not started | 5 |
| `/printables/[slug]` (Detail + email gate) | Frontend Engineer | not started | 5 |
| `/holidays` (Hub) | Frontend Engineer | not started | 6 |
| `/holidays/[slug]` (11 holiday pages) | Frontend Engineer | not started | 6 |
| `/blog` (Hub) | Blog CMS Engineer | not started | 6 |
| `/blog/[category]` (6 pillar hubs) | Blog CMS Engineer | not started | 6 |
| `/blog/[slug]` (Article) | Blog CMS Engineer | not started | 6 |
| `/newsletter` (Signup landing) | Newsletter Engineer | not started | 4 |
| `/educators` (Public landing — pre-portal) | Frontend Engineer | not started | 6 |
| `/parent-resources` (Curated parent guide) | Frontend Engineer | not started | 6 |
| `/teacher-resources` (Curated educator guide) | Frontend Engineer | not started | 6 |
| `/contact` (5-segment inquiry) | Frontend Engineer | not started | 6 |
| `/privacy` (Privacy policy) | Backend / Legal | not started | 9 |
| `/terms` (Terms of service) | Backend / Legal | not started | 9 |
| `/sitemap.xml` | SEO Engineer | ✅ shipped | 1 |
| `/robots.txt` | SEO Engineer | ✅ shipped | 1 |

### 5.2 Admin Pages

| Route | Owner role | Status | Phase |
|---|---|---|---|
| `/admin` (Dashboard) | Backend Engineer | stub | 7 |
| `/admin/blog` (Manage posts) | Blog CMS Engineer | not started | 7 |
| `/admin/products` (Manage products) | Store Engineer | not started | 7 |
| `/admin/orders` (Manage orders) | Store Engineer | not started | 7 |
| `/admin/newsletter` (Subscribers + sends) | Newsletter Engineer | not started | 7 |
| `/admin/curriculum` (Programs + lessons) | Curriculum Engineer | not started | 7 |
| `/admin/lessons` (Lesson library) | Curriculum Engineer | not started | 7 |
| `/admin/media` (Media library) | Backend Engineer | not started | 7 |
| `/admin/users` (User + role management) | Backend Engineer | not started | 7 |
| `/admin/analytics` (KPI overview) | Backend Engineer | not started | 7 |
| `/admin/settings` (Site settings) | Backend Engineer | not started | 7 |
| `/login` (Magic link sign-in) | Backend Engineer | not started | 2 |
| `/studio/[[...index]]` (Sanity Studio embed) | Blog CMS Engineer | not started | 2 |

### 5.3 API Routes

| Route | Status | Phase |
|---|---|---|
| `GET /api/health` | ✅ shipped | 1 |
| `POST /api/newsletter/subscribe` | ✅ shipped (zod + soft-fail) | 1 |
| `POST /api/contact` | not started | 6 |
| `POST /api/stripe/webhook` | not started | 3 |
| `POST /api/shopify/webhook` | not started | 3 |
| `POST /api/printable/download` (signed-URL issuer) | not started | 5 |
| `GET /api/admin/analytics/summary` | not started | 7 |
| `POST /api/admin/curriculum/regenerate` (Claude Code → Docraptor) | not started | 8 |

---

## 6. Admin CRM Structure

> Full spec: `../OWL-Obsidian-Brain/04_CRM_Admin/ADMIN_CRM_REQUIREMENTS.md`.

The admin shell already exists at `src/app/(admin)/layout.tsx` (auth-guarded, sidebar stub). The cockpit's 11 surfaces are queued for Phase 7:

| Surface | Phase 7 module | Source |
|---|---|---|
| Dashboard | KPI tiles + this-week feed | Beehiiv, YouTube, Shopify, Supabase, Sanity APIs |
| Blog Manager | List + editor + scheduler + Claude SEO draft button | Sanity (source of truth) + Supabase mirror |
| Product Manager | Cross-channel listing tool | Shopify + Printify + Gumroad APIs |
| Newsletter Manager | Send schedule, segment editor, A/B subject lines, welcome-flow editor | Beehiiv API |
| Curriculum Manager | Tier folders, 36-week grid, lesson card editor, regenerate via Claude SKILL | Sanity + Supabase + R2 |
| Media Manager | Image + video + PDF + audio library | Sanity assets + R2 |
| Customers | Joined Supabase × Shopify view | Supabase + Shopify |
| Orders | Live order list + refund/exchange tools | Shopify + Gumroad + Stripe |
| Educator Pipeline | Lead list + drip status + district CRM table | Supabase |
| Analytics | GA4 + Beehiiv + YouTube + Shopify pulls | GA4, Beehiiv, YouTube, Shopify |
| Settings | Brand assets, domain, integration keys (read-only), feature flags | Supabase + Vercel envs |

---

## 7. Store Structure

> Full spec: `../OWL-Obsidian-Brain/06_Store_Commerce/STORE_REQUIREMENTS.md`.

**Day-1 catalog:** 25 SKUs (10 coloring books + 10 stickers + 5 digital bundles), authored in Sanity, mirrored to Shopify (physical via Printify Premium) and Gumroad (digital).

**Stripe scope:**
- Memberships ($3 OWL Friend / $7 OWL Family / $15 OWL Champion)
- Educator subscriptions ($199 individual / $4,999 site / $24,999 district)
- Digital downloads (one-off via Stripe Checkout)
- Webhook: `checkout.session.completed` → write to `orders`, send Resend receipt, issue R2 signed URL for digital deliverables

**Shopify scope:**
- Physical product catalog (Printify-fulfilled)
- Checkout, cart drawer, tax, shipping
- Webhook: `orders/create` + `orders/fulfilled` → mirror to `orders` + customer notify

**Required product page modules** (per spec):
Large gallery, product story, age range, "Supports learning in…" block, related OWL video, related printable, bundle upsell, email capture, reviews, shipping copy, JSON-LD `Product` schema.

**Cart UX:**
Drawer-style with digital add-on upsell at checkout; themed gift bundles surfaced seasonally; Klaviyo abandoned cart flow.

---

## 8. Blog CMS Structure

> Full spec: `../OWL-Obsidian-Brain/07_Blog_Newsletter/BLOG_NEWSLETTER_SYSTEM.md`.

**Source of truth:** Sanity (headless CMS).
**Render:** Next.js App Router + ISR.

**Schema (`blogArticle` in Sanity):**
`title`, `slug`, `category` (ref to one of 6 pillar hubs), `summary` (100w), `body` (Portable Text), `relatedContent[]` (refs to video / printable / product / holiday hub / blog), `publishedAt`, `status` (draft|scheduled|published|archived), `seoTitle`, `seoDescription`, `ogImage`.

**Article template enforcement:**
H1 with target keyword in first 60 chars · 100-word summary · 800–1,200 word body · 1 embedded OWL video · 1 related printable CTA block · 1 related product / bundle block · newsletter CTA · 3–5 internal links · JSON-LD `Article` schema.

**Admin Blog Manager (`/admin/blog`):**
List view (status, category, author, date) · rich editor (Portable Text) · inline embeds · SEO panel · scheduling · "Draft from SEO brief" button (Claude Code Monday research trigger) · bulk re-tag/recategorize/unpublish.

**Editorial workflow:**
Draft → Review → Scheduled → Published. Enforced by Sanity roles (Owner, Editor, Contributor, Reviewer).

---

## 9. Curriculum Structure

> Full spec: `../OWL-Obsidian-Brain/05_Curriculum/CURRICULUM_SYSTEM.md`.

**6 Birth–5 tiers + Grade 6 expansion**, each 36-week / 9-month structure organized into 6 thematic units of 6 weeks.

**Universal lesson structure (each week):**
- 5-day daily activity guide (15–60 min/day depending on age band)
- 1 OWL YouTube video integration (with Larissa as host)
- 1 branded printable worksheet (OWL footer, Larissa avatar header)
- 1 educator note / caregiver tip
- 1 assessment milestone marker
- 1 OWL merchandise product tie-in

**Generation pipeline (Phase 8):**
1. Seed `standards_database.json` (CDC + Head Start ELOF + Common Core + top-15 state PDFs)
2. Claude Code `owl-lesson-generator` SKILL.md generates 252 lesson plan documents
3. Canva API populates branded printable PNGs
4. Docraptor (or PDF Generator API) assembles 6–8 page weekly lesson PDFs
5. Auto-upload to Cloudflare R2 + auto-create Shopify/Gumroad/TpT listings

**Admin Curriculum Manager (`/admin/curriculum`):**
- 6 tier folders + 36-week calendar grid
- Per-lesson cards: linked video, linked printable, educator note, assessment milestone, product
- Regenerate-lesson button (calls Claude Code SKILL via `/api/admin/curriculum/regenerate`)
- Standards alignment matrix view (per state)
- PDF preview + regenerate
- Bulk publish to Shopify + Gumroad + TpT

---

## 10. Deployment Checklist

> Phase 9 deliverable. Production target: Vercel + Cloudflare R2 + Supabase + Vercel Postgres-via-Supabase.

**Pre-launch (in order):**

- [ ] Domain registered: `owlsingtogether.com` + `weowlsingtogether.com` (and `.org` defensive)
- [ ] Vercel project linked to GitHub repo + `main` branch auto-deploys to production
- [ ] Vercel staging branch with `staging` Sanity dataset
- [ ] DNS in Cloudflare with proxy + SSL
- [ ] Sanity production dataset created + schemas deployed
- [ ] Supabase production project created + migrations run + RLS enabled + admin user seeded (Larissa + Rick)
- [ ] Resend domain verified (SPF/DKIM/DMARC for `owlsingtogether.com`)
- [ ] Beehiiv publication live + sender domain matching Resend
- [ ] Stripe account live mode + products created + webhook endpoint registered + signing secret in Vercel envs
- [ ] Shopify store live + Printify connected + webhook endpoint registered
- [ ] Cloudflare R2 bucket + signed-URL generation tested
- [ ] All Vercel env vars set (Production + Preview)
- [ ] GA4 property + measurement ID in Vercel envs + cookie consent banner live
- [ ] `next-sitemap` regenerates daily (cron via Vercel or n8n)
- [ ] Privacy policy + Terms of Service published at `/privacy` + `/terms`
- [ ] COPPA review checklist signed off by attorney
- [ ] Lighthouse budget passing: LCP < 2.5s, CLS < 0.1, INP < 200ms
- [ ] Playwright e2e green in CI
- [ ] WCAG 2.1 AA audit passed on homepage + 1 of each template type
- [ ] OG default image (`/og/owl-default.png`) shipped
- [ ] Favicons + manifest shipped (32, 192, 512, Apple touch)
- [ ] Sitemap accessible at `/sitemap.xml`; robots at `/robots.txt`
- [ ] First Sanity content seeded (≥10 videos, ≥10 printables, ≥10 products, ≥8 blog articles, ≥3 holiday hubs)
- [ ] First Stripe test order placed + webhook fires + Resend receipt delivers
- [ ] First Beehiiv test broadcast sent
- [ ] First curriculum lesson plan generated end-to-end via the SKILL

**Launch day (May 15, 2026 per business plan):**
- [ ] Switch DNS to Vercel
- [ ] Verify CDN cache warm
- [ ] Verify analytics events firing
- [ ] Announce on YouTube + IG + FB + Pinterest
- [ ] First "OWL Weekly" newsletter sends Sunday 8AM EST

---

## 11. Security Requirements

- **Supabase RLS:** enabled on every table; deny by default; per-table policies above.
- **Admin routes:** middleware-gated by Supabase session check + role membership.
- **Auth:** magic-link sign-in (Supabase Auth) + WebAuthn for owner/editor (Phase 7+).
- **Environment vars:** never committed. `.env.local` is gitignored. Vercel envs scoped per environment.
- **Stripe webhook validation:** every webhook verifies `STRIPE_WEBHOOK_SECRET` before mutating state.
- **Shopify webhook validation:** HMAC SHA-256 with shop secret.
- **Form validation:** all public forms go through zod schemas; honeypot field; Cloudflare Turnstile on `/contact` and `/newsletter` (Phase 6).
- **Cookie banner:** granular consent (necessary / analytics / marketing); analytics + marketing OFF by default until consent.
- **COPPA-safe:** no child-targeted tracking; newsletters and accounts are for parents/educators.
- **Newsletter consent:** double-opt-in via Beehiiv before active sends.

---

## 12. Design Requirements

> Full spec: `../OWL-Obsidian-Brain/09_Design_System/DESIGN_STYLE_GUIDE.md`.

**Feel:** Premium · Warm · Educational · Child-friendly · Cinematic · Modern · Trustworthy for parents · Professional for investors.

**Visual direction:**
- Warm classroom lighting
- Soft gold tones
- Owl mascot branding (mascot in every page corner)
- Joyful learning energy
- Music-based education cues
- Clean modern layouts (subtle glassmorphism only where appropriate — e.g., sticky header background blur)

**Palette tokens** (already wired in `tailwind.config.ts` + `globals.css`):
`--owl-cream` · `--owl-teal` · `--owl-amber` · `--owl-forest` · `--owl-ink` · `--owl-mist` · `--owl-rose`.

**Typography:** Nunito (rounded, soft, highly legible).

**Motion:** Gentle fade · soft hover lift · subtle mascot loop · `prefers-reduced-motion` respected. **No autoplay audio. No abrupt transitions.**

**Anti-patterns:** Primary-color toy palette · neon · sharp 90° corners · stock-photo families · autoplay video · first-load popups · all-caps over 18px · stereotyped "kid font" tropes.

---

## 13. Agent Role Assignments

| # | Role | Hat I wear when… | Deliverables across the 9 phases |
|---|---|---|---|
| 1 | Product Architect | Defining what's being built and why | This file; phased plan; route map; database schema; launch roadmap |
| 2 | UI/UX Designer | Designing components and layouts | `DESIGN_STYLE_GUIDE.md`; component inventory; spacing rules; responsive behavior |
| 3 | Frontend Engineer | Building pages, components, forms | All public pages; UI primitives; forms; client-side state |
| 4 | Backend Engineer | Writing server actions, API routes, auth flows | API routes (newsletter, contact, webhooks); server actions; middleware; admin auth guards |
| 5 | Supabase Engineer | Designing DB, auth, storage, RLS | Migrations; RLS policies; storage buckets; auth flow; type generation |
| 6 | Store Engineer | Wiring commerce | Stripe products + checkout + webhook; Shopify integration; Printify sync; cart drawer; product pages |
| 7 | Newsletter Engineer | Email systems | Beehiiv subscribe + send; Resend transactional templates; 5-email welcome flow; segmented automations |
| 8 | Blog CMS Engineer | Editorial pipeline | Sanity schemas; Studio embed; blog hub + article template; Blog Manager admin UI |
| 9 | Curriculum Engineer | Lesson plan system | Curriculum schemas; lesson grid UI; Docraptor/Claude Code generation pipeline; admin curriculum manager |
| 10 | Animation Engineer | Motion polish | Framer Motion page transitions; hover lifts; mascot loop; loading skeletons |
| 11 | SEO Engineer | Discoverability | sitemap + robots (✅); structured data (✅); metadata helper (✅); image alt enforcement; internal linking matrix; Lighthouse budget |
| 12 | QA Engineer | Quality gates | Playwright e2e (✅ first test); a11y audit; type-check + lint; visual regression; Lighthouse CI |
| 13 | Deployment Engineer | Ship to production | Vercel config; DNS; envs; CDN; webhook endpoints; launch-day playbook |

---

## 14. Phased Implementation Plan

| Phase | Status | Roles primarily involved | Deliverable |
|---|---|---|---|
| 1. Foundation | ✅ COMPLETE | Product Architect, Frontend, Backend | Repo, route groups, service-client stubs, SEO foundation, UI primitives, first API routes, Playwright, Prettier |
| 2. CMS + Auth | ⏳ next | Blog CMS, Supabase, Backend | Sanity Studio live + 10 schemas; Supabase migrations; middleware auth guard; `/admin` protected; `/login` magic-link |
| 3. Commerce + Email | ⏳ pending | Store, Newsletter, Backend | Stripe Checkout + webhook; Shopify + Printify integration; Resend templates wired; Beehiiv subscribe + welcome flow live |
| 4. Homepage v1 | ⏳ pending | Frontend, UI/UX, Animation | 13-section homepage built per spec; hero; trust strip; newsletter capture |
| 5. Public funnel pages | ⏳ pending | Frontend, Store | Watch (+ detail), Music (+ detail), Printables (+ gate), Shop (+ product detail) |
| 6. SEO content surfaces | ⏳ pending | Blog CMS, SEO, Frontend | Blog hub + 6 pillar hubs + article template; Holidays hub + 11 hubs; About; Contact; Parent + Teacher Resources |
| 7. Admin CRM v1 | ⏳ pending | Backend, Blog CMS, Newsletter, Store, Curriculum | All 11 admin surfaces; KPI dashboard; managers wired to live APIs |
| 8. Curriculum + Educator Portal | ⏳ pending | Curriculum, Backend, Store | Curriculum generation pipeline; gated educator portal; Stripe-billed licensing; lesson library |
| 9. QA + Performance + Launch | ⏳ pending | QA, SEO, Deployment | Full Playwright suite; Lighthouse CI; a11y audit; deployment checklist green; launch day |

---

## 15. Run Commands

```powershell
cd "C:\Users\Ricko\OneDrive\Documents\Claude\Projects\OWL Website Build\owl-website"

# Boot dev server
npm run dev                # http://localhost:3000

# Verify health
# (in another shell)
curl http://localhost:3000/api/health

# Lint, type-check, format
npm run lint
npm run typecheck
npm run format

# Run e2e (one-time installer first)
npm run test:e2e:install
npm run test:e2e
```

---

## 16. Next Action

**Phase 2 — CMS + Auth.** Tell me "go Phase 2" and I'll:

1. `npx sanity@latest init --bare` against a new project (you'll OAuth in browser; I'll capture the project ID)
2. Implement the 10 content schemas in `src/sanity/schemas/`
3. Mount the embedded Studio at `/studio/[[...index]]`
4. Create the Supabase project (you provide URL + keys)
5. Write migration `0001_initial.sql` with all tables + RLS policies from § 4
6. Enable middleware auth guard + build `/login`
7. Update `CURRENT_SPRINT.md` after each milestone

---

*Source plans live in `..\OWL-Obsidian-Brain\`. This build plan supersedes nothing — it's the operational mapping of the brain's specs to actual code work.*

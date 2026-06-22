# OWL Account & Identity System

The central identity layer for the whole OWL ecosystem — public accounts, the
Parent/Customer portal, the Teacher (educator) portal, and the Command Center —
all behind a single role-aware **Login / My Account** control in the site header.

Built on Supabase Auth (email + password) with Postgres RLS for access control.
This extends the Command Center foundation documented in
`ADMIN_COMMAND_CENTER.md`.

---

## 1. Roles (8) and where each lands

| Role | Rank | Home after login | Notes |
|---|---|---|---|
| `owner` | 50 | `/admin` | Full control incl. settings + secrets |
| `admin` | 40 | `/admin` | Administrator |
| `marketing_manager` | 35 | `/admin` | Newsletter/blog/affiliate/analytics; no Settings |
| `editor` | 30 | `/admin` | Content + commerce ops |
| `support` | 20 | `/admin` | Read-most + customer service |
| `affiliate` | 18 | `/portal` | Affiliate Partner (future portal) |
| `teacher` | 15 | `/portal/teacher` | Educator — gated curriculum resources |
| `customer` | 5 | `/portal` | Default for new signups |

**Staff floor = `support` (20).** Customer/teacher/affiliate sit below it, so
portal users can never reach `/admin` — enforced in middleware, layout guards,
and Postgres RLS.

Role utilities are split for safe reuse:
- `src/lib/auth/role-utils.ts` — pure, client-safe (`ROLE_RANK`, `roleHome`,
  `hasMinRole`, `ROLE_LABEL`, `AppRole`).
- `src/lib/auth/roles.ts` — server-only guards (`getSessionProfile`,
  `requireStaff`, `requireRole`, `requireAuth`) that re-export the utilities.

---

## 2. Auth flows

| Route | Purpose |
|---|---|
| `/login` | Email + password sign-in (magic-link fallback). Links to signup + reset. |
| `/signup` | Public self-registration. Customer by default; "Educator" requests teacher access. |
| `/forgot-password` | Sends a Resend-delivered reset link. |
| `/reset-password` | Sets a new password from the recovery session. |
| `/auth/callback` | Exchanges the email code for a session, routes to `/account`. |
| `/account` | Post-login **role router** → sends each user to their home. |
| `/auth/sign-out` | Clears the session (POST). |

Server Actions live beside each route (`actions.ts`) and validate with Zod.

### Teacher approval workflow
1. At signup the user selects "Educator" → `requested_teacher` rides in auth
   metadata.
2. The `handle_new_user` trigger creates the profile **and** a pending
   `teacher_applications` row.
3. An admin sets the application `status = 'approved'`; a trigger
   (`fn_teacher_approved`) promotes the profile to `teacher` automatically.
4. Customers can also request access later from `/portal/settings`.

---

## 3. Navigation

`src/components/account/account-nav.tsx` (client) reads the session in the
browser — keeping marketing pages static — and renders:

- **Logged out:** a "Log in" button.
- **Logged in:** an avatar dropdown (`account-menu.tsx`) with the user's name,
  role, a link to their dashboard (role-aware), account settings, and sign-out.

It's injected into the existing `SiteHeader` via a new `accountSlot` prop, so
the header stays a client component and the auth state is per-user without
forcing dynamic rendering of every page. The cart icon remains; wiring a live
item count is a follow-up once a cart store exists.

---

## 4. Portals

`src/app/portal/*` is auth-guarded by `requireAuth()` in `portal/layout.tsx`.

- **`/portal` (Customer):** KPI tiles (orders, purchased downloads, wishlist,
  reward points — all read through self-RLS) + panels for orders/shipping,
  digital library, saved & preferences, and rewards/referrals.
- **`/portal/teacher` (Educator):** application-status banner + curriculum,
  resources, licensing, and subscription panels. Curriculum lessons are
  readable by approved educators via RLS.
- **`/portal/settings`:** edit name, reset password, and request educator access.

---

## 5. Data model (migration `0011`)

New tables, all RLS-protected with a **row-owner self-service + staff oversight**
pattern (`profile_id = auth.uid()` for the owner; `app_is_staff()` for staff):

`teacher_applications` · `entitlements` (powers instant digital downloads) ·
`wishlist_items` · `saved_addresses` · `loyalty_accounts` + `loyalty_events`
(auto-rolled-up points) · `subscriptions`. Plus `orders.profile_id` (auto-linked
to accounts by email on insert, and backfilled) and an extended `lessons` read
policy for teachers.

---

## 6. Go-live checklist (Supabase Dashboard — required)

These live-project settings can't be changed from migrations:

1. **Enable signups** — Authentication → Providers → Email → turn **Enable
   sign-ups** on (the repo `config.toml` is already set for the CLI). Until this
   is on, `/signup` returns "Signups not allowed".
2. **Resend SMTP** — Authentication → Emails → SMTP: enter your Resend SMTP
   credentials and a verified `from` address (e.g. `hello@owlsingtogether.com`)
   so confirmation/reset emails are OWL-branded. Customize the email templates.
3. **Redirect URLs** — Authentication → URL Configuration: add
   `https://owlsingtogether.com/auth/callback` (and any preview domains).
4. **Env vars** — ensure `NEXT_PUBLIC_SUPABASE_URL` and
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set in Vercel (the browser account-nav
   needs them; without them the header simply shows "Log in").

Existing admin accounts (Larissa, Rick) are unaffected — they remain `admin`
and now sign in through the same `/login`, landing on the Command Center.

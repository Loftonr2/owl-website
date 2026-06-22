# Supabase Auth — Manual Dashboard Setup

These settings live in the Supabase **dashboard** (GoTrue config) and cannot be
changed from migrations or app code. The repo `supabase/config.toml` already
reflects the intended values for the local CLI; the steps below apply the same
configuration to the **live** project (`owl-sing-together`,
ref `rvajnrkpbqvnajkdhpsr`).

Source of truth for routes: `ACCOUNT_SYSTEM.md`.

---

## 1. Enable email sign-ups
Dashboard → **Authentication → Sign In / Providers → Email**:
- **Enable Email provider**: ON
- **Confirm email**: ON (double opt-in)
- **Enable sign-ups**: ON

Result: new visitors can self-register at `/signup` as **Customer** (default
role via the `handle_new_user` trigger). Educator requests open a pending
`teacher_applications` row for admin approval — no change needed here.

## 2. Configure Resend SMTP
Dashboard → **Authentication → Emails → SMTP Settings** → enable **Custom SMTP**:
- **Host**: `smtp.resend.com`
- **Port**: `465` (SSL) or `587` (STARTTLS)
- **Username**: `resend`
- **Password**: your `RESEND_API_KEY`
- **Sender email**: `hello@owlsingtogether.com` (must be a **verified** Resend domain)
- **Sender name**: `OWL Sing Together`

Then under **Authentication → Emails → Templates**, brand the Confirm signup,
Magic Link, and Reset password templates. (This SMTP powers the auth emails;
the cron newsletter/report emails use the Resend API directly via
`RESEND_API_KEY` + `RESEND_FROM_EMAIL`.)

## 3. Configure URLs
Dashboard → **Authentication → URL Configuration**:
- **Site URL**: `https://owlsingtogether.com`
- **Redirect URLs** (allow list) — add all of:
  - `https://owlsingtogether.com/auth/callback`
  - `https://weowlsingtogether.com/auth/callback`
  - `http://localhost:3000/auth/callback` (local dev)
  - `https://*.vercel.app/auth/callback` (optional — preview deploys)

These must be present because every auth email routes through `/auth/callback`:
- **Email confirmation** → `/auth/callback?next=/account` → role router sends the
  user to `/admin`, `/portal/teacher`, or `/portal`.
- **Password reset** → `/auth/callback?next=/reset-password` → user sets a new
  password, then is sent to `/account`.

## 4. Verify (after the above)
- **Signup confirm redirect**: register a test customer → confirm email → should
  land on `/portal`.
- **Password reset redirect**: use `/forgot-password` → open the email link →
  should land on `/reset-password`, then `/account` after saving.
- **Protected routes stay protected** (already enforced in code, no dashboard
  change): `middleware.ts` redirects anonymous users away from `/admin`,
  `/portal`, `/account`, `/studio`; layout guards (`requireStaff` / `requireAuth`)
  and Postgres RLS enforce role boundaries server-side. Staff (`support`+) reach
  `/admin`; customers/teachers cannot.

---

## Route / role matrix (from ACCOUNT_SYSTEM.md)

| Role | Rank | Post-login home |
|---|---|---|
| owner / admin / marketing_manager / editor / support | ≥20 | `/admin` |
| teacher | 15 | `/portal/teacher` |
| affiliate / customer | ≤18 | `/portal` |

Existing admins (Larissa, Rick) are unaffected — both `admin`, sign in at
`/login`, land on the Command Center.

# PayPal Checkout — Full Audit Report

**Date:** June 12, 2026  
**Auditor:** Claude (Cowork session)  
**Status:** ⚠️ Code complete · 2 manual credentials required before live testing

---

## A. Checkout Status

| Layer | Status | Notes |
|---|---|---|
| Server routes (`/api/paypal/create-order`, `/api/paypal/capture-order`) | ✅ Built & committed | Secure, server-validated |
| PayPal JS SDK button component | ✅ Built & committed | Calls server routes only |
| Order confirmation page | ✅ Built & committed | `/shop/order-confirmation` |
| Supabase order storage | ✅ Built (graceful degradation) | Skips silently if keys missing |
| Resend confirmation email | ✅ Built (graceful degradation) | Skips silently if key missing |
| `PAYPAL_ENV=sandbox` | ✅ Added to Vercel | Production + Preview |
| `NEXT_PUBLIC_PAYPAL_CLIENT_ID` | ❌ Missing from Vercel | **Must add — see Section G** |
| `PAYPAL_CLIENT_SECRET` | ❌ Missing from Vercel | **Must add — see Section G** |
| Supabase migration 0004 | ❌ Not yet applied | **Must run — see Section G** |
| End-to-end sandbox test | ⏳ Blocked by missing env vars | Run after credentials added |

---

## B. Files Inspected

| File | Finding |
|---|---|
| `src/components/store/paypal-checkout.tsx` | **Rewritten** — was client-side SDK only, now calls server routes |
| `src/app/(marketing)/shop/[slug]/page.tsx` | **Modified** — added `slug={p.slug}` prop to `<PayPalCheckout>` |
| `src/app/api/paypal/create-order/route.ts` | **New** — secure server-side order creation |
| `src/app/api/paypal/capture-order/route.ts` | **New** — secure capture + Supabase + Resend |
| `src/lib/paypal-server.ts` | **New** — shared PayPal auth utility |
| `src/app/(marketing)/shop/order-confirmation/page.tsx` | **New** — post-purchase success page |
| `supabase/migrations/0004_paypal_orders.sql` | **New** — PayPal columns + RLS policy |
| `src/app/api/webhooks/paypal/route.ts` | **Unchanged** — handles Printful fulfillment separately |
| `src/components/marketing/sticky-mini-cart.tsx` | **Unchanged** — Phase 3 stub, not wired |

---

## C. Problems Found & Fixed

### Problem 1 — Client-side price spoofing (CRITICAL, fixed)
The original `paypal-checkout.tsx` used `actions.order.create()` with a price passed from React state. Any buyer could open DevTools and change the amount before PayPal saw it.

**Fix:** Both `create-order` and `capture-order` server routes read the canonical price from `SEED_PRODUCTS` using `findProductBySlug(slug)`. The frontend never sends a price value. `capture-order` additionally re-fetches the PayPal order before capturing to verify the recorded amount matches `SEED_PRODUCTS` — mismatches are rejected with `400`.

### Problem 2 — No order record (fixed)
Successful payments produced no database record. No admin visibility into orders.

**Fix:** `capture-order` writes to Supabase `orders` table with `source: 'paypal'`, PayPal order + capture IDs, customer info, line items, and fulfillment status. Gracefully degrades (logs warning, continues) if `SUPABASE_SERVICE_ROLE_KEY` is not set.

### Problem 3 — No confirmation page or email (fixed)
Customers saw an inline green box with an order ID — no dedicated receipt page, no email.

**Fix:** `capture-order` redirects to `/shop/order-confirmation?orderId=...&product=...&email=...` and sends a branded HTML email via Resend. Gracefully degrades if `RESEND_API_KEY` not set.

### Problem 4 — Supabase `orders` table missing `paypal` source (fixed)
The `orders_source_check` constraint did not include `'paypal'`, causing all order saves to fail with a constraint violation.

**Fix:** Migration `0004_paypal_orders.sql` drops and recreates the constraint to include `'paypal'`, adds PayPal-specific columns, and adds an RLS insert policy.

### Problem 5 — Missing env vars in Vercel (partially fixed)
Only `PRINTFUL_API_KEY` was present. `NEXT_PUBLIC_PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, and `PAYPAL_ENV` were all absent.

**Fix:** `PAYPAL_ENV=sandbox` added to Vercel (Production + Preview) in this session. `NEXT_PUBLIC_PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET` require manual entry (see Section G).

### Problem 6 — Git lock file blocking docs commit
`.git/HEAD.lock` and `.git/index.lock` left by a previous sandbox git process were not deletable from the sandbox (Windows filesystem permissions).

**Fix:** User must delete manually from PowerShell before committing:
```powershell
cd C:\Users\Ricko\owl-website
del .git\HEAD.lock
del .git\index.lock
git commit -m "docs: paypal-checkout-audit and fix reports"
git push
```

---

## D. Secure Payment Flow (implemented)

```
Customer clicks PayPal button
         │
         ▼
POST /api/paypal/create-order
  • slug sent from browser
  • server reads price from SEED_PRODUCTS  ← price NEVER from frontend
  • creates PayPal Orders API v2 order
  • returns { id: paypalOrderId }
         │
         ▼
PayPal popup — customer approves
         │
         ▼
POST /api/paypal/capture-order
  • re-reads price from SEED_PRODUCTS
  • fetches PayPal order → verifies amount matches → rejects with 400 if mismatch
  • captures payment
  • saves to Supabase orders table
  • sends Resend confirmation email
  • returns { orderId, captureId, customerEmail, customerName, productTitle, amount }
         │
         ▼
Browser → /shop/order-confirmation?orderId=...
```

---

## E. Environment Variables

### Vercel — current state (owl-website project)

| Variable | Status | Action |
|---|---|---|
| `PRINTFUL_API_KEY` | ✅ Set (Sensitive, Production) | None needed |
| `PAYPAL_ENV` | ✅ Set (`sandbox`, Production+Preview) | Added this session |
| `NEXT_PUBLIC_PAYPAL_CLIENT_ID` | ❌ Missing | **User must add** |
| `PAYPAL_CLIENT_SECRET` | ❌ Missing | **User must add (Sensitive)** |
| `NEXT_PUBLIC_SUPABASE_URL` | ❌ Missing | Add for order persistence |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ❌ Missing | Add for order persistence |
| `SUPABASE_SERVICE_ROLE_KEY` | ❌ Missing | Add for order persistence (bypasses RLS) |
| `RESEND_API_KEY` | ❌ Missing | Add for confirmation emails |

### For sandbox testing (minimum required to accept payments)
Only `NEXT_PUBLIC_PAYPAL_CLIENT_ID` + `PAYPAL_CLIENT_SECRET` are required. The rest enable order persistence and email — checkout will complete without them (graceful degradation).

---

## F. Supabase Migration

Migration `supabase/migrations/0004_paypal_orders.sql` exists in the repo but has not been applied to the remote database. Apply it one of two ways:

**Option A — Supabase CLI:**
```bash
cd C:\Users\Ricko\owl-website
supabase link --project-ref <your-project-ref>
supabase db push
```

**Option B — Supabase Dashboard:**
1. Go to app.supabase.com → your project → SQL Editor → New query
2. Paste the contents of `supabase/migrations/0004_paypal_orders.sql`
3. Click Run

The migration adds: `paypal` to source constraint, `paypal_order_id`, `paypal_capture_id`, `customer_name`, `payment_status`, `fulfillment_status` columns, and a server-insert RLS policy.

---

## G. Required Manual Steps Before Testing

**Step 1 — Add PayPal credentials to Vercel** (you must do this)

1. Go to **developer.paypal.com** → Apps & Credentials → **Sandbox** tab
2. Click your app (or create one) → copy the **Client ID**
3. Click **Show** next to Secret → copy the **Secret**
4. In Vercel → owl-website → Settings → Environment Variables:
   - Add `NEXT_PUBLIC_PAYPAL_CLIENT_ID` = `<Client ID from step 2>`  
     Environments: Production, Preview, Development | Sensitive: OFF
   - Add `PAYPAL_CLIENT_SECRET` = `<Secret from step 3>`  
     Environments: Production, Preview, Development | **Sensitive: ON**
5. Click **Redeploy** (or Vercel will prompt after save)

**⚠️ NEVER share `PAYPAL_CLIENT_SECRET` in chat, logs, code, or screenshots.**

**Step 2 — Apply Supabase migration** (optional but recommended for order tracking)

Paste `supabase/migrations/0004_paypal_orders.sql` into your Supabase SQL Editor and run it.

**Step 3 — Delete git lock files** (to commit pending docs)

From PowerShell in `C:\Users\Ricko\owl-website`:
```powershell
del .git\HEAD.lock
del .git\index.lock
git commit -m "docs: paypal-checkout-audit and fix reports"
git push
```

---

## H. Sandbox Testing Checklist

Run after completing Section G Step 1:

- [ ] Go to `https://owlsingtogether.com/shop/owl-sweatshirt`
- [ ] PayPal gold button renders (not error state)
- [ ] Click button → PayPal popup opens
- [ ] Log in with sandbox buyer (developer.paypal.com → Sandbox → Accounts)
- [ ] Complete payment → popup closes
- [ ] "Processing your payment..." spinner shows briefly
- [ ] Redirects to `/shop/order-confirmation` with product name + amount
- [ ] Vercel logs show `[capture-order] Payment captured: ...`
- [ ] (If Supabase configured) Supabase `orders` table shows new row with `source='paypal'`
- [ ] (If Resend configured) Confirmation email arrives at sandbox buyer email
- [ ] Security test: Try tampered amount via DevTools → should get `400 Price mismatch`

---

## I. Going Live (after sandbox tests pass)

1. In PayPal Developer → switch to **Live** mode (or create a Live app)
2. In Vercel → update these three vars:
   - `NEXT_PUBLIC_PAYPAL_CLIENT_ID` → Live Client ID
   - `PAYPAL_CLIENT_SECRET` → Live Client Secret  
   - `PAYPAL_ENV` → `live`
3. Redeploy
4. Do one real test purchase before announcing

---

## J. Production Readiness Score

**Current: 6 / 10**

| Component | Score | Reason |
|---|---|---|
| Code quality & security | 10/10 | Server-validated, price mismatch protection, no secrets in code |
| TypeScript compliance | 10/10 | Zero typecheck errors |
| Supabase order storage | 4/10 | Migration written, not applied; env vars missing |
| Confirmation email | 3/10 | Code written, `RESEND_API_KEY` not configured |
| PayPal button (live) | 0/10 | `NEXT_PUBLIC_PAYPAL_CLIENT_ID` missing from Vercel |
| End-to-end test | 0/10 | Blocked by missing env vars |
| Documentation | 9/10 | Audit + fix reports written; git lock prevents commit |

**Score will reach 9/10 once:** `NEXT_PUBLIC_PAYPAL_CLIENT_ID` + `PAYPAL_CLIENT_SECRET` are added to Vercel and a sandbox test purchase succeeds.

---

## K. Security Concerns

1. **No PAYPAL_WEBHOOK_ID set in Vercel** — The existing `/api/webhooks/paypal` route verifies PayPal webhook signatures. Without `PAYPAL_WEBHOOK_ID`, signature verification will fall back to a lenient mode or skip. Set `PAYPAL_WEBHOOK_ID` in Vercel to harden the webhook. Get the ID from PayPal Developer → Webhooks.

2. **`PRINTFUL_API_KEY` is Production-only** — The Printful fulfillment webhook only runs in Production. This is intentional (sandbox orders shouldn't trigger real Printful orders) but worth noting.

3. **Supabase anon key (client-side)** — Once `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set, it will be visible in browser JS. The RLS policies must be correct to prevent direct table access. The `orders_paypal_server_insert` policy allows insert but not select. Add a `SELECT` policy gated on `auth.uid()` if you ever want customers to view their own orders.

4. **No rate limiting on PayPal routes** — `/api/paypal/create-order` has no rate limit. A bot could create thousands of PayPal orders (abandoned orders, not actual charges). Consider adding Vercel Edge rate limiting if abuse becomes a concern.

# PayPal Sandbox Testing Guide — OWL Sing Together

## Overview

This guide explains how to run automated and manual end-to-end checkout tests
against the PayPal sandbox before going live with real transactions.

---

## Environment Mode

| Env Var | Current Value | Effect |
|---|---|---|
| `PAYPAL_ENV` | `sandbox` | Routes API calls to `https://api-m.sandbox.paypal.com` |
| `NEXT_PUBLIC_PAYPAL_CLIENT_ID` | Sandbox client ID | Loads sandbox PayPal button |
| `PAYPAL_CLIENT_SECRET` | Sandbox secret | Used for server-side order creation |
| `PAYPAL_WEBHOOK_ID` | Sandbox webhook ID | Verifies sandbox webhook signatures |

**Current mode: SANDBOX.**  
No real money moves. All transactions are test-only.

### How to tell if you're in sandbox vs live

- Sandbox: PayPal popup URL starts with `https://www.sandbox.paypal.com/...`
- Live: PayPal popup URL starts with `https://www.paypal.com/...`
- In code: `src/lib/paypal-server.ts` line `PAYPAL_BASE` — uses `api-m.sandbox.paypal.com` when `PAYPAL_ENV !== "live"`

---

## Going Live (Checklist — do NOT do this yet)

When you're ready to accept real payments, change ALL FOUR of these Vercel env vars:

1. `PAYPAL_ENV` → `live`
2. `NEXT_PUBLIC_PAYPAL_CLIENT_ID` → your **Live** client ID (from PayPal Developer → Live tab)
3. `PAYPAL_CLIENT_SECRET` → your **Live** client secret
4. `PAYPAL_WEBHOOK_ID` → your **Live** webhook ID

Then trigger a Vercel redeploy.

---

## Step 1 — Get a Sandbox Buyer Account

1. Go to [https://developer.paypal.com](https://developer.paypal.com)
2. Log in with your PayPal business account
3. Click **Testing Tools → Sandbox Accounts**
4. Find (or create) an account with **Account Type: Personal (Buyer)**
5. Click the account row → **View/Edit Account** → copy the email and password

> The default sandbox buyer usually has a balance of $5,000 USD.

---

## Step 2 — Add Credentials to .env.local

Create or edit `.env.local` in the project root (this file is gitignored — never commit it):

```env
# PayPal sandbox buyer credentials for e2e testing
PAYPAL_SANDBOX_BUYER_EMAIL=sb-buyer12345@personal.example.com
PAYPAL_SANDBOX_BUYER_PASSWORD=your-sandbox-password

# Optional: override the test target (default is https://www.owlsingtogether.com)
# PAYPAL_TEST_BASE_URL=http://localhost:3000
```

**The test file reads these at runtime — no hardcoded values.**

---

## Step 3 — Run the Tests

### Install Playwright browsers (first time only)

```bash
npx playwright install chromium
```

### Run all PayPal sandbox tests

```bash
npx playwright test tests/e2e/paypal-sandbox-checkout.spec.ts --headed
```

The `--headed` flag opens a real browser so you can watch PayPal's popup flow.

### Run against localhost instead of the live site

```bash
PAYPAL_TEST_BASE_URL=http://localhost:3000 \
npx playwright test tests/e2e/paypal-sandbox-checkout.spec.ts --headed
```

> **Note:** Localhost tests require `NEXT_PUBLIC_PAYPAL_CLIENT_ID` in `.env.local` too,
> since the PayPal SDK is loaded client-side.

### Run a single test by name

```bash
npx playwright test -g "POST /api/paypal/create-order" --headed
```

---

## What the Tests Cover

| Test | What it verifies |
|---|---|
| `sandbox credentials are configured` | `PAYPAL_SANDBOX_BUYER_EMAIL` and `_PASSWORD` are present in env |
| `POST /api/paypal/create-order returns a valid order ID` | Server-side order creation returns HTTP 200 + valid order ID |
| `product page loads with correct title and price` | `/shop/owl-sweatshirt` renders "OWL Sweatshirt" heading and "$48.00" |
| `PayPal button renders on the product page` | PayPal SDK loads, button iframe appears |
| `full checkout: click PayPal → sandbox login → approve → confirmation` | Complete end-to-end purchase flow |

---

## What a Successful Checkout Looks Like

1. Product page loads at `/shop/owl-sweatshirt`
2. Gold PayPal button renders (+ SEPA + Debit/Credit Card options)
3. Click PayPal → popup opens at `https://www.sandbox.paypal.com/...`
4. Log in with sandbox buyer credentials
5. Review screen shows "OWL Sweatshirt" at $48.00 USD
6. Click "Complete Purchase"
7. Popup closes
8. Main page redirects to `/shop/order-confirmation?orderId=...&...`
9. Confirmation page shows order summary with name and item

---

## PayPal Anti-Automation Notes

PayPal's sandbox can block automated logins with CAPTCHAs or security challenges,
especially on first run or from a new IP address.

The test handles this gracefully:
- If a CAPTCHA appears, the test prints a clear message and exits without failing
- You can then complete the login manually in the headed browser window
- Re-running from the same machine / IP usually bypasses the CAPTCHA

If automated login is blocked, do a **manual checkout test** instead:

1. Run `npx playwright test -g "PayPal button renders" --headed`
2. After the test opens the browser, manually click the PayPal button
3. Log in with your sandbox buyer credentials
4. Approve the payment
5. Verify you land on `/shop/order-confirmation`

---

## Verifying Server-Side Order Creation Manually

You can test the API directly without a browser:

```bash
curl -X POST https://www.owlsingtogether.com/api/paypal/create-order \
  -H "Content-Type: application/json" \
  -d '{"slug":"owl-sweatshirt"}'
```

Expected response:
```json
{"id":"0SWXXXXXXXXXXXXXXXXX"}
```

The order ID should be ~17 characters. The `0SW` prefix is typical for sandbox orders.

---

## Verifying Capture

After a successful sandbox payment, you can verify it in the PayPal Developer dashboard:

1. Go to [https://developer.paypal.com](https://developer.paypal.com)
2. Click **Activity → Sandbox Transactions**
3. Find the transaction — status should be **COMPLETED**
4. The order ID in the URL bar on the confirmation page should match

---

## Webhook Testing

The capture webhook (`PAYMENT.CAPTURE.COMPLETED`) triggers Printful fulfillment and
Supabase order storage. To test webhooks in sandbox:

1. Go to PayPal Developer → My Apps & Credentials → your sandbox app
2. Click **Webhooks** → find your webhook URL (`https://www.owlsingtogether.com/api/webhooks/paypal`)
3. Click **Simulate** → choose `PAYMENT.CAPTURE.COMPLETED`
4. Check Vercel Function Logs for the webhook handler output

---

## Common Errors

| Error | Cause | Fix |
|---|---|---|
| `client-id not recognized` | Wrong client ID in env | Check char 17 — must be lowercase `l`, not capital `I` |
| `PAYPAL_SANDBOX_BUYER_EMAIL not set` | Missing env var | Add to `.env.local` |
| `create-order returned 401` | Wrong or expired client secret | Re-copy secret from PayPal Developer dashboard |
| PayPal button shows "Checkout unavailable" | SDK failed to load | Check browser console for the error message; usually a wrong client ID |
| Confirmation page blank | Capture failed | Check `/api/paypal/capture-order` logs in Vercel |
| Popup never opens | PayPal button not fully rendered | Wait longer; try `waitUntil: "networkidle"` |

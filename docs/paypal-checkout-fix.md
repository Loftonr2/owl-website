# PayPal Checkout Fix — OWL Sing Together

**Updated:** June 2026  
**Account:** Quill Productions — quillproductionslv@gmail.com  
**Site:** https://www.owlsingtogether.com

---

## What Was Broken

| Issue | Status |
|-------|--------|
| Single-product only (no cart) | FIXED |
| Sandbox mode serving real customers | FIXED (env-controlled) |
| Webhook verifying against hardcoded live API in sandbox | FIXED |
| Spiral Notebook image missing (12 KB stub) | FIXED |
| Guest card checkout unclear | DOCUMENTED below |

---

## Current Mode

Controlled by `PAYPAL_ENV` environment variable:

| `PAYPAL_ENV` value | API used | Client ID used |
|---|---|---|
| anything except `"live"` (or unset) | `https://api-m.sandbox.paypal.com` | `NEXT_PUBLIC_PAYPAL_CLIENT_ID` (sandbox) |
| `"live"` | `https://api-m.paypal.com` | `NEXT_PUBLIC_PAYPAL_CLIENT_ID` (live) |

**Local dev** → `.env.local` should have `PAYPAL_ENV=sandbox` and sandbox Client ID  
**Production (Vercel)** → Set `PAYPAL_ENV=live` and live credentials

---

## Environment Variables

### Sandbox (for local testing only — `.env.local`)

```
PAYPAL_ENV=sandbox
NEXT_PUBLIC_PAYPAL_CLIENT_ID=<sandbox client id from developer.paypal.com>
PAYPAL_CLIENT_SECRET=<sandbox secret — never commit>
PAYPAL_WEBHOOK_ID=<sandbox webhook id>
```

### Live (Vercel production)

Add these in Vercel → Settings → Environment Variables → Production:

```
PAYPAL_ENV=live
NEXT_PUBLIC_PAYPAL_CLIENT_ID=<live client id>
PAYPAL_CLIENT_SECRET=<live secret>
PAYPAL_WEBHOOK_ID=<live webhook id>
```

### Where to find credentials

1. Go to https://developer.paypal.com/dashboard/applications
2. Log in as quillproductionslv@gmail.com
3. Toggle **Sandbox / Live** in the top-right
4. Click your app → copy Client ID and Secret

---

## Cart System Architecture

```
Product page
  └── <AddToCartButton>  →  CartContext (useReducer)
                                └── localStorage "owl-cart-v1"

SiteHeader
  └── <ShoppingBag button>  →  openDrawer()

<CartDrawer>  (mounted once in marketing layout)
  ├── Item list with qty steppers
  ├── Remove buttons
  ├── Subtotal
  └── <CartPayPalCheckout>
        ├── POST /api/paypal/create-order  { items: [{slug, quantity}] }
        │     └── server looks up prices from SEED_PRODUCTS (never trusts client)
        │     └── returns { id: paypalOrderId }
        ├── PayPal popup (card or PayPal account)
        └── POST /api/paypal/capture-order  { orderID, items }
              ├── re-validates all prices server-side
              ├── verifies PayPal amount === server total (security check)
              ├── captures payment
              ├── saves order to Supabase
              ├── sends Resend confirmation email
              └── redirects → /shop/order-confirmation
```

---

## Guest Card Checkout

Real customers **do NOT need a PayPal account**. When the PayPal popup opens:
- There is a "Pay with Debit or Credit Card" option at the bottom
- Customers can enter their card details directly
- This works in live mode with a verified PayPal Business account

> ⚠️ In **sandbox mode**, guest card checkout requires a sandbox buyer account or
> a real card — sandbox popups often block guest checkout. This is normal.

---

## Testing Sandbox Locally

1. Set `.env.local` to sandbox credentials
2. Run `npm run dev`
3. Go to `/shop` → add item → open cart → checkout
4. In the PayPal popup, log in with a **sandbox buyer account**:
   - Find sandbox accounts at developer.paypal.com → Sandbox → Accounts
   - Use an account with type "Personal" (the buyer)
5. Complete purchase → verify redirect to `/shop/order-confirmation`

Full guide: `PAYPAL_SANDBOX_TESTING.md`

---

## Webhook Setup

In PayPal Developer Dashboard → your app → Webhooks:

- **URL:** `https://www.owlsingtogether.com/api/webhooks/paypal`
- **Events:** `PAYMENT.CAPTURE.COMPLETED`, `CHECKOUT.ORDER.APPROVED`, `PAYMENT.CAPTURE.DENIED`, `PAYMENT.CAPTURE.REFUNDED`
- Copy the **Webhook ID** → Vercel → `PAYPAL_WEBHOOK_ID`

The webhook handles Printful auto-fulfillment for physical products on `PAYMENT.CAPTURE.COMPLETED`.

---

## Vercel Checklist Before Going Live

- [ ] `PAYPAL_ENV` = `live`
- [ ] `NEXT_PUBLIC_PAYPAL_CLIENT_ID` = live Client ID (from PayPal Developer Dashboard)
- [ ] `PAYPAL_CLIENT_SECRET` = live Client Secret
- [ ] `PAYPAL_WEBHOOK_ID` = live Webhook ID
- [ ] PayPal Business account verified and approved for payments
- [ ] Test a $1 real purchase before announcing to customers
- [ ] Confirm order appears in Supabase `orders` table
- [ ] Confirm Printful order is auto-created for physical items
- [ ] Confirm confirmation email arrives via Resend

---

## Return URLs

Configured in `/api/paypal/create-order` and the PayPal JS SDK:

- **Success:** `https://www.owlsingtogether.com/shop/order-confirmation`
- **Cancel:** Returns to the cart drawer (no redirect)

---

## Files Changed in This Fix

| File | Change |
|------|--------|
| `src/types/cart.ts` | NEW — CartItem, CartOrderItem types |
| `src/contexts/cart-context.tsx` | NEW — CartProvider, useCart hook |
| `src/components/store/add-to-cart-button.tsx` | NEW — Add to Cart button |
| `src/components/store/cart-drawer.tsx` | NEW — slide-over cart panel |
| `src/components/store/cart-paypal-checkout.tsx` | NEW — cart-aware PayPal button |
| `src/app/api/paypal/create-order/route.ts` | REWRITTEN — multi-item cart |
| `src/app/api/paypal/capture-order/route.ts` | REWRITTEN — multi-item, price re-validation |
| `src/app/api/webhooks/paypal/route.ts` | PATCHED — PAYPAL_BASE for sandbox verification |
| `src/app/(marketing)/layout.tsx` | MODIFIED — CartProvider + CartDrawer |
| `src/components/marketing/site-header.tsx` | MODIFIED — cart badge + openDrawer |
| `src/app/(marketing)/shop/[slug]/page.tsx` | MODIFIED — AddToCartButton replaces PayPalCheckout |
| `src/app/(marketing)/shop/order-confirmation/page.tsx` | MODIFIED — multi-item display |
| `public/images/products/owl-spiral-notebook.png` | FIXED — real 1.5MB product image |

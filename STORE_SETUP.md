# OWL Store — Fulfillment Setup Checklist

Complete these steps to enable fully automated dropshipping:
**Customer pays → PayPal webhook → Printify order → Production → Shipping**

---

## STEP 1 — Add Environment Variables to Vercel

Go to **Vercel Dashboard → owl-website → Settings → Environment Variables** and add:

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_PAYPAL_CLIENT_ID` | [developer.paypal.com](https://developer.paypal.com/dashboard/applications) → My Apps → Create App → Client ID |
| `PAYPAL_CLIENT_SECRET` | Same page → Secret Key (needed for webhook signature verification) |
| `PAYPAL_WEBHOOK_ID` | Add this **after** Step 2 below |
| `PRINTIFY_API_KEY` | [printify.com/app/account/api](https://printify.com/app/account/api) |
| `PRINTIFY_SHOP_ID` | Printify Dashboard → Stores → numeric ID in the URL |
| `NEXT_PUBLIC_SUPABASE_URL` | [Supabase Dashboard](https://supabase.com/dashboard) → Project → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Same page → anon public key |

**Redeploy on Vercel after adding variables** — go to Deployments → Redeploy.

---

## STEP 2 — Register PayPal Webhook

1. Go to [developer.paypal.com](https://developer.paypal.com/dashboard/applications)
2. Click **My Apps & Credentials**
3. Select your app (or create one)
4. Scroll to **Webhooks** → click **Add Webhook**
5. Set the webhook URL to:
   ```
   https://owlsingtogether.com/api/webhooks/paypal
   ```
6. Enable these **4 events**:
   - `CHECKOUT.ORDER.APPROVED`
   - `PAYMENT.CAPTURE.COMPLETED`
   - `PAYMENT.CAPTURE.DENIED`
   - `PAYMENT.CAPTURE.REFUNDED`
7. Click **Save**
8. Copy the **Webhook ID** that appears
9. Add it to Vercel as `PAYPAL_WEBHOOK_ID`
10. Redeploy

**Verify the webhook is working:**
```
GET https://owlsingtogether.com/api/webhooks/paypal
```
This returns a credential health check. All items should show ✅.

---

## STEP 3 — Add Printify Product IDs

For each physical product, find its Printify Product ID and Variant ID:

1. Go to [printify.com/app/store/products](https://printify.com/app/store/products)
2. Click a product
3. The **Product ID** is the numeric ID in the URL: `printify.com/app/store/products/**12345678**/...`
4. The **Variant ID** is found in the product's Variants tab — hover over each variant to see its ID, or use the Printify API:
   ```
   GET https://api.printify.com/v1/shops/{shop_id}/products/{product_id}.json
   Authorization: Bearer YOUR_API_KEY
   ```

5. Add the IDs to `src/lib/seed/products.ts` for each product:
   ```typescript
   {
     slug: "owl-t-shirt",
     title: "OWL T-Shirt",
     printifyProductId: "12345678",   // ← add this
     printifyVariantId: 12345,         // ← add this (pick the default variant)
     // ... rest of fields
   }
   ```

6. Commit and push:
   ```powershell
   cd C:\Users\Ricko\owl-website
   git add src/lib/seed/products.ts
   git commit -m "feat(store): add Printify Product IDs"
   git push
   ```

**View products missing IDs:** go to `/admin/products` → filter by "Missing Printify ID"

---

## STEP 4 — Run the Supabase Migration

1. Open your **Supabase Dashboard** → SQL Editor → New Query
2. Paste the contents of `supabase/migrations/0002_products_extended.sql`
3. Click **Run**

This extends the `products` table with CRM fields (cost, margin, Printify IDs, SEO fields, etc.).

---

## STEP 5 — Test the Full Flow

### Sandbox test (PayPal test mode):
1. Use PayPal sandbox credentials in your env vars
2. Make a test purchase using a PayPal sandbox buyer account
3. Check server logs for: `[PayPal Webhook] ✅ Printify order created: ...`

### Test scenarios to verify:

| Scenario | Expected result |
|---|---|
| Payment completed, Printify IDs present | `auto_fulfilled` — order submitted to Printify |
| Payment completed, Printify IDs missing | `manual_review_required` — order logged, admin alerted |
| Duplicate webhook received | `duplicate_ignored` — no double-submit |
| Payment denied | `payment_denied` — no order created |
| Refund received | `refunded` — logged, cancel Printify order manually |
| Printify API error | `fulfillment_failed` — order saved, manual review |

**Check webhook status anytime:**
```
GET https://owlsingtogether.com/api/webhooks/paypal
GET https://owlsingtogether.com/api/admin/sync-printify
```

---

## FULFILLMENT FLOW SUMMARY

```
Customer adds product to cart
  ↓
Customer clicks PayPal button (/shop/[slug])
  ↓
PayPal processes payment
  ↓
PayPal sends webhook → POST /api/webhooks/paypal
  ↓
Webhook verifies PayPal signature (PAYPAL_WEBHOOK_ID)
  ↓
Webhook checks for duplicate (idempotency guard)
  ↓
Webhook looks up product by SKU → finds printifyProductId + printifyVariantId
  ↓
  IF IDs present AND credentials set:
    → POST to Printify API → order created
    → Order saved to Supabase with status: submitted_to_printify
    → Printify → Production → Shipping → Customer
  
  IF IDs missing OR credentials missing:
    → Order saved to Supabase with status: manual_review_required
    → Console warning with full order details
    → Admin manually submits at printify.com
```

---

## FILES INVOLVED

| File | Purpose |
|---|---|
| `src/app/api/webhooks/paypal/route.ts` | Main webhook handler |
| `src/app/api/printify/route.ts` | Manual order creation fallback |
| `src/app/api/admin/sync-printify/route.ts` | Pull products from Printify |
| `src/components/store/paypal-checkout.tsx` | PayPal button on product pages |
| `src/lib/seed/products.ts` | Product data including Printify IDs |
| `src/app/(admin)/admin/products/page.tsx` | Admin CRM |
| `supabase/migrations/0002_products_extended.sql` | DB schema for products |
| `.env.local` | Local env vars (never commit) |

---

## REMAINING MANUAL STEPS

- [ ] Add all env vars to Vercel dashboard
- [ ] Register PayPal webhook URL and copy Webhook ID
- [ ] Add Printify Product ID + Variant ID for all 35 physical products
- [ ] Run Supabase migration `0002_products_extended.sql`
- [ ] Test with PayPal sandbox
- [ ] Switch PayPal from sandbox to live credentials

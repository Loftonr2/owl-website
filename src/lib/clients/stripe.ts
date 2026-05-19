import Stripe from "stripe";

/**
 * Server-only Stripe client. Lazy-instantiated so missing keys don't
 * crash the build in environments where Stripe isn't used (preview, tests).
 *
 * Use this for:
 *  - Memberships ($3/$7/$15 tiers)
 *  - Educator subscriptions ($199/yr, $4,999/yr, $24,999/yr)
 *  - Digital download checkout
 *  - Refunds + webhooks
 *
 * Shopify Checkout handles physical product orders; Stripe handles the rest.
 */

let _stripe: Stripe | null = null;

export function stripe(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("stripe() requires STRIPE_SECRET_KEY. Set it in .env.local.");
  }
  _stripe = new Stripe(key, {
    apiVersion: "2025-02-24.acacia",
    typescript: true,
    appInfo: {
      name: "OWL Sing Together",
      url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://owlsingtogether.com",
    },
  });
  return _stripe;
}

export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? "";

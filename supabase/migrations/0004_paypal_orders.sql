-- ============================================================================
-- OWL Sing Together — Migration 0004
-- Adds PayPal checkout support to the orders table.
--
-- Run via Supabase CLI:  supabase db push
-- Or paste into Supabase Dashboard → SQL Editor → New query → Run.
-- ============================================================================

-- 1. Expand source constraint to include 'paypal'
--    (The auto-generated name follows the pattern {table}_{column}_check)
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_source_check;
ALTER TABLE public.orders
  ADD CONSTRAINT orders_source_check
  CHECK (source IN ('shopify', 'gumroad', 'stripe', 'paypal'));

-- 2. PayPal-specific columns
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS paypal_order_id    text,
  ADD COLUMN IF NOT EXISTS paypal_capture_id  text,
  ADD COLUMN IF NOT EXISTS customer_name      text,
  ADD COLUMN IF NOT EXISTS shipping_address   jsonb,
  ADD COLUMN IF NOT EXISTS subtotal_cents     integer,
  ADD COLUMN IF NOT EXISTS shipping_cents     integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tax_cents          integer DEFAULT 0;

-- 3. Payment and fulfillment status columns with constrained values
--    (separate from the generic 'status' column which continues to track
--     the high-level order lifecycle: pending → paid → fulfilled → etc.)
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_status text
    CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  ADD COLUMN IF NOT EXISTS fulfillment_status text DEFAULT 'unfulfilled'
    CHECK (fulfillment_status IN ('unfulfilled', 'pending_printful', 'fulfilled', 'failed'));

-- 4. Index for fast PayPal order ID lookups (admin CRM, webhook deduplication)
CREATE INDEX IF NOT EXISTS orders_paypal_order_id_idx
  ON public.orders (paypal_order_id)
  WHERE paypal_order_id IS NOT NULL;

-- 5. Allow server-side PayPal API routes to insert orders using the anon key
--    when SUPABASE_SERVICE_ROLE_KEY is not set.
--    NOTE: The service role key bypasses RLS entirely and is preferred.
--    This policy is a fallback for local dev / initial setup.
CREATE POLICY IF NOT EXISTS "orders_paypal_server_insert"
  ON public.orders
  FOR INSERT
  WITH CHECK (source = 'paypal');

-- ============================================================================
-- After running this migration:
--   1. Verify with: SELECT column_name FROM information_schema.columns
--                   WHERE table_name = 'orders' ORDER BY ordinal_position;
--   2. Set SUPABASE_SERVICE_ROLE_KEY in Vercel → Settings → Env Vars
--      so server routes use it instead of the anon key.
-- ============================================================================

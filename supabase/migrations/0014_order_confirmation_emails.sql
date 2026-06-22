-- ============================================================================
-- OWL Sing Together — Migration 0014
-- Order confirmation email tracking + atomic idempotent claim.
--
-- Adds per-order columns to track the branded purchase-confirmation email
-- (sent timestamp, Resend message id, last error, attempt count) and a
-- service-role-only function that atomically "claims" an order for sending so
-- a customer is emailed EXACTLY ONCE even if the PayPal capture route and the
-- PAYMENT.CAPTURE.COMPLETED webhook both fire, or PayPal retries the webhook.
--
-- Applied to the live project via the Supabase MCP apply_migration tool.
-- ============================================================================

alter table public.orders
  add column if not exists confirmation_email_sent_at    timestamptz,
  add column if not exists confirmation_email_message_id text,
  add column if not exists confirmation_email_error      text,
  add column if not exists confirmation_email_attempts   integer not null default 0;

-- Atomic "claim to send": flips confirmation_email_sent_at null -> now() and
-- bumps attempts in ONE statement, returning the order only to the caller that
-- won the claim. external_id (= paypal_order_id) is UNIQUE, so there is exactly
-- one row per order and the claim is race-safe across serverless instances.
-- Returns no rows if the order was already claimed/sent.
create or replace function public.claim_order_confirmation_email(p_external_id text)
returns table (
  id                uuid,
  external_id       text,
  customer_email    text,
  customer_name     text,
  line_items        jsonb,
  subtotal_cents    integer,
  shipping_cents    integer,
  tax_cents         integer,
  total_cents       integer,
  currency          text,
  shipping_address  jsonb,
  paypal_order_id   text,
  paypal_capture_id text,
  coupon_code       text,
  placed_at         timestamptz
)
language sql
security definer
set search_path = ''
as $$
  update public.orders o
     set confirmation_email_sent_at  = now(),
         confirmation_email_attempts = coalesce(o.confirmation_email_attempts, 0) + 1
   where o.external_id = p_external_id
     and o.confirmation_email_sent_at is null
  returning
    o.id,
    o.external_id,
    o.customer_email::text,
    o.customer_name,
    o.line_items,
    o.subtotal_cents,
    o.shipping_cents,
    o.tax_cents,
    o.total_cents,
    o.currency,
    o.shipping_address,
    o.paypal_order_id,
    o.paypal_capture_id,
    o.coupon_code,
    o.placed_at;
$$;

revoke all on function public.claim_order_confirmation_email(text) from public;
revoke all on function public.claim_order_confirmation_email(text) from anon;
revoke all on function public.claim_order_confirmation_email(text) from authenticated;
grant execute on function public.claim_order_confirmation_email(text) to service_role;

comment on function public.claim_order_confirmation_email(text) is
  'Atomically claims an order for confirmation-email sending (sent_at null->now, attempts+1). Returns the order row only to the winning caller; no rows if already claimed/sent. Service-role only.';

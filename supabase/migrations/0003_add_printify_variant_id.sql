-- ============================================================================
-- OWL Sing Together — Add printify_variant_id to products table
-- File:    supabase/migrations/0003_add_printify_variant_id.sql
-- Run via: Supabase Dashboard → SQL Editor → New Query → paste → Run
--          OR: supabase db push (if Supabase CLI is configured)
-- Safe:    Uses IF NOT EXISTS — will not fail if column already exists
-- ============================================================================

-- Add printify_variant_id column (was missing from 0002 migration)
alter table public.products
  add column if not exists printify_variant_id integer;

-- Index for fast lookup during order fulfillment
create index if not exists products_printify_variant_id_idx
  on public.products(printify_variant_id);

-- Convenience view: products ready for auto-fulfillment
create or replace view public.products_fulfillment_ready as
  select
    id,
    slug,
    title,
    printify_product_id,
    printify_variant_id,
    product_source,
    status,
    price_cents,
    category
  from public.products
  where
    product_source = 'printify'
    and printify_product_id is not null
    and printify_variant_id is not null
    and status in ('live', 'coming_soon');

-- Convenience view: products missing Printify IDs (need manual fulfillment)
create or replace view public.products_missing_printify_id as
  select
    id,
    slug,
    title,
    product_source,
    printify_product_id,
    printify_variant_id,
    status,
    price_cents,
    category
  from public.products
  where
    product_source = 'printify'
    and (printify_product_id is null or printify_variant_id is null);

-- ============================================================================
-- After running this migration:
--   1. Visit /admin/products to see which products are missing Printify IDs
--   2. Click the edit icon on any Printify product to enter IDs in-browser
--   3. IDs are saved to Supabase and used automatically by the webhook
-- ============================================================================

/**
 * Cart types — shared between CartContext, API routes, and PayPal checkout.
 * Keep this file import-free from server-only modules so it can be used
 * on both client and server.
 */

export interface CartItem {
  /** Product slug (matches SEED_PRODUCTS.slug — used for server-side price lookup) */
  slug: string;
  /** Display title */
  title: string;
  /** Display price string e.g. "$48.00" — presentational only, never trusted for payment */
  price: string;
  /** Numeric price in USD — presentational only, never trusted for payment */
  priceAmount: number;
  /** How many of this item */
  quantity: number;
  /** Optional: product image src for cart thumbnail */
  image?: string;
  /** Optional: Printful sync_variant_id for fulfillment */
  printfulVariantId?: number | null;
  /** Product category (PHYSICAL_GOODS vs DIGITAL_GOODS) */
  category?: string;
}

/** Payload sent from client to /api/paypal/create-order */
export interface CreateOrderPayload {
  items: CartOrderItem[];
}

/** Payload sent from client to /api/paypal/capture-order */
export interface CaptureOrderPayload {
  orderID: string;
  items: CartOrderItem[];
}

/** Lightweight item representation safe to send to the server */
export interface CartOrderItem {
  slug: string;
  quantity: number;
}

"use client";

/**
 * AddToCartButton
 * ───────────────
 * Client component used on product detail pages.
 * Adds the product to the CartContext and opens the cart drawer.
 *
 * Props flow:
 *   - slug / title / price / priceAmount come from the server-rendered page
 *   - image is optional (passed from resolveProductImage)
 *   - The component never handles money — the cart just stores display values
 *     that the server will re-validate when creating the PayPal order
 */

import { useState } from "react";
import { ShoppingBag, Check } from "lucide-react";
import { useCart } from "@/contexts/cart-context";
import type { CartItem } from "@/types/cart";
import { cn } from "@/lib/cn";

interface AddToCartButtonProps {
  slug: string;
  title: string;
  /** Display price string e.g. "$48.00" */
  price: string;
  /** Numeric price — used for subtotal display (not for payment) */
  priceAmount: number;
  /** Optional image src for cart thumbnail */
  image?: string;
  /** Product category */
  category?: string;
}

export function AddToCartButton({
  slug,
  title,
  price,
  priceAmount,
  image,
  category,
}: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  function handleAddToCart() {
    const item: CartItem = {
      slug,
      title,
      price,
      priceAmount,
      quantity: 1,
      image,
      category,
    };
    addItem(item);

    // Show brief "Added!" confirmation
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={handleAddToCart}
      className={cn(
        "flex w-full items-center justify-center gap-2 rounded-owl-btn px-6 py-3.5 text-sm font-semibold shadow-owl-1",
        "transition-all duration-200 ease-owl-quick",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-owl-teal/60 focus-visible:ring-offset-2",
        added
          ? "bg-owl-forest text-white"
          : "bg-owl-teal text-white hover:bg-owl-teal-deep hover:-translate-y-px hover:shadow-owl-2 active:translate-y-0"
      )}
    >
      {added ? (
        <>
          <Check className="h-4 w-4" aria-hidden />
          Added to cart!
        </>
      ) : (
        <>
          <ShoppingBag className="h-4 w-4" aria-hidden />
          Add to Cart
        </>
      )}
    </button>
  );
}

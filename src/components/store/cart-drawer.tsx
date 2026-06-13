"use client";

/**
 * CartDrawer
 * ──────────
 * Slide-over panel from the right that shows the current cart contents and
 * hosts the PayPal checkout button.
 *
 * - Accessible: focus-trap, aria-modal, Escape to close
 * - Empty state: friendly illustration + "Keep shopping" CTA
 * - Each item: thumbnail, title, price, quantity stepper, remove button
 * - Footer: subtotal + PayPalCheckout (reads cart from context internally)
 */

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/contexts/cart-context";
import { CartPayPalCheckout } from "@/components/store/cart-paypal-checkout";
import { cn } from "@/lib/cn";

export function CartDrawer() {
  const { items, itemCount, subtotalFormatted, drawerOpen, closeDrawer, removeItem, updateQty } =
    useCart();

  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Focus the close button when drawer opens
  useEffect(() => {
    if (drawerOpen) {
      setTimeout(() => closeRef.current?.focus(), 50);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  // Escape closes
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && drawerOpen) closeDrawer();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen, closeDrawer]);

  return (
    <>
      {/* Backdrop */}
      <div
        ref={overlayRef}
        aria-hidden
        onClick={closeDrawer}
        className={cn(
          "fixed inset-0 z-[60] bg-owl-ink/30 backdrop-blur-sm transition-opacity duration-300",
          drawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className={cn(
          "fixed right-0 top-0 z-[70] flex h-full w-full max-w-md flex-col",
          "bg-owl-cream shadow-2xl transition-transform duration-300 ease-owl-quick",
          drawerOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-owl-cream-deep px-6 py-4">
          <div className="flex items-center gap-3">
            <ShoppingBag className="h-5 w-5 text-owl-teal" aria-hidden />
            <span className="font-display text-lg font-bold text-owl-ink">
              Your Cart
            </span>
            {itemCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-owl-teal text-[11px] font-bold text-white">
                {itemCount}
              </span>
            )}
          </div>
          <button
            ref={closeRef}
            type="button"
            aria-label="Close cart"
            onClick={closeDrawer}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full text-owl-ink/60",
              "hover:bg-owl-cream-deep hover:text-owl-ink",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-owl-teal/60"
            )}
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            // Empty state
            <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-owl-cream-deep">
                <ShoppingBag className="h-10 w-10 text-owl-mist" strokeWidth={1} aria-hidden />
              </div>
              <div>
                <p className="font-display text-lg font-bold text-owl-ink">Your cart is empty</p>
                <p className="mt-1 text-sm text-owl-mist">
                  Add something wonderful for your little learner.
                </p>
              </div>
              <Link
                href="/shop"
                onClick={closeDrawer}
                className={cn(
                  "rounded-owl-btn bg-owl-teal px-6 py-2.5 text-sm font-semibold text-white shadow-owl-1",
                  "hover:bg-owl-teal-deep hover:-translate-y-px hover:shadow-owl-2",
                  "transition-all duration-150 ease-owl-quick",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-owl-teal/60"
                )}
              >
                Browse the shop
              </Link>
            </div>
          ) : (
            // Item list
            <ul className="space-y-4" role="list" aria-label="Cart items">
              {items.map((item) => (
                <li
                  key={item.slug}
                  className="flex gap-4 rounded-owl-card bg-owl-white p-4 shadow-owl-1"
                >
                  {/* Thumbnail */}
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-owl-card bg-owl-cream-deep">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <span className="font-display text-2xl font-extrabold text-owl-ink/20">
                          {item.title.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex flex-1 flex-col gap-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold leading-tight text-owl-ink">
                        {item.title}
                      </p>
                      <button
                        type="button"
                        aria-label={`Remove ${item.title}`}
                        onClick={() => removeItem(item.slug)}
                        className="mt-0.5 shrink-0 text-owl-mist hover:text-red-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden />
                      </button>
                    </div>

                    <p className="text-sm font-bold text-owl-teal">{item.price}</p>

                    {/* Quantity stepper */}
                    <div className="mt-1 flex items-center gap-2">
                      <button
                        type="button"
                        aria-label={`Decrease quantity of ${item.title}`}
                        onClick={() => updateQty(item.slug, item.quantity - 1)}
                        className={cn(
                          "flex h-6 w-6 items-center justify-center rounded-full border border-owl-cream-deep",
                          "text-owl-ink/60 hover:border-owl-teal hover:text-owl-teal",
                          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-owl-teal/60",
                          "transition-colors duration-100"
                        )}
                      >
                        <Minus className="h-3 w-3" aria-hidden />
                      </button>
                      <span
                        className="min-w-[1.5rem] text-center text-sm font-semibold text-owl-ink"
                        aria-label={`Quantity: ${item.quantity}`}
                      >
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        aria-label={`Increase quantity of ${item.title}`}
                        onClick={() => updateQty(item.slug, item.quantity + 1)}
                        className={cn(
                          "flex h-6 w-6 items-center justify-center rounded-full border border-owl-cream-deep",
                          "text-owl-ink/60 hover:border-owl-teal hover:text-owl-teal",
                          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-owl-teal/60",
                          "transition-colors duration-100"
                        )}
                      >
                        <Plus className="h-3 w-3" aria-hidden />
                      </button>
                      <span className="ml-auto text-xs text-owl-mist">
                        ×{" "}
                        <span className="font-semibold text-owl-ink/70">
                          {item.quantity > 1
                            ? `$${(item.priceAmount * item.quantity).toFixed(2)}`
                            : item.price}
                        </span>
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer — only shown when cart has items */}
        {items.length > 0 && (
          <div className="border-t border-owl-cream-deep bg-owl-cream px-6 pb-8 pt-4">
            {/* Subtotal */}
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-medium text-owl-ink/70">Subtotal</span>
              <span className="font-display text-lg font-bold text-owl-ink">
                {subtotalFormatted}
              </span>
            </div>
            <p className="mb-4 text-[11px] text-owl-mist">
              Shipping calculated at PayPal checkout · Taxes may apply
            </p>

            {/* PayPal checkout reads from cart context */}
            <CartPayPalCheckout onSuccess={closeDrawer} />

            <Link
              href="/shop"
              onClick={closeDrawer}
              className={cn(
                "mt-3 block w-full rounded-owl-btn border border-owl-cream-deep py-2.5 text-center text-sm font-semibold text-owl-ink/70",
                "hover:border-owl-teal hover:text-owl-teal",
                "transition-colors duration-150 ease-owl-quick",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-owl-teal/60"
              )}
            >
              Continue shopping
            </Link>
          </div>
        )}
      </div>
    </>
  );
}

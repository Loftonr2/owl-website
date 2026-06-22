"use client";

/**
 * CartPayPalCheckout
 * ───────────────────
 * Reads cart items from CartContext and drives the PayPal JS SDK button.
 * This replaces the single-product PayPalCheckout on the cart drawer.
 *
 * Flow:
 *  1. createOrder  → POST /api/paypal/create-order with full cart items
 *  2. Customer approves in PayPal popup
 *  3. onApprove   → POST /api/paypal/capture-order with full cart items
 *  4. clearCart() + redirect to /shop/order-confirmation
 *
 * Price is NEVER trusted from the frontend — both routes re-derive it from
 * SEED_PRODUCTS by slug on the server.
 */

import { useEffect, useRef, useState } from "react";
import { useCart } from "@/contexts/cart-context";
import type { CartOrderItem } from "@/types/cart";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    paypal?: any;
  }
}

interface CartPayPalCheckoutProps {
  /** Called after a successful payment (e.g. to close the drawer) */
  onSuccess?: () => void;
}

export function CartPayPalCheckout({ onSuccess }: CartPayPalCheckoutProps) {
  const { items, clearCart } = useCart();
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "capturing" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const renderedRef = useRef(false);
  const itemsRef = useRef(items);

  // Keep itemsRef current without re-triggering the SDK mount effect
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

  // Re-render PayPal button if cart changes significantly (different items)
  const itemKey = items.map((i) => `${i.slug}:${i.quantity}`).join(",");

  useEffect(() => {
    if (!clientId) {
      setStatus("error");
      setErrorMsg(
        "PayPal client ID not configured. Add NEXT_PUBLIC_PAYPAL_CLIENT_ID to Vercel."
      );
      return;
    }

    // Reset on cart change so the button re-mounts cleanly
    renderedRef.current = false;
    if (containerRef.current) containerRef.current.innerHTML = "";
    setStatus("loading");

    const existingScript = document.getElementById("paypal-sdk");
    if (existingScript && window.paypal) {
      initButtons();
      return;
    }

    if (!existingScript) {
      const script = document.createElement("script");
      script.id = "paypal-sdk";
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&intent=capture`;
      script.async = true;
      script.onload = initButtons;
      script.onerror = () => {
        setStatus("error");
        setErrorMsg("Failed to load PayPal. Check your connection and try again.");
      };
      document.body.appendChild(script);
    } else {
      // Script exists but window.paypal not ready — wait
      const poll = setInterval(() => {
        if (window.paypal) {
          clearInterval(poll);
          initButtons();
        }
      }, 100);
      return () => clearInterval(poll);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId, itemKey]);

  function buildOrderItems(): CartOrderItem[] {
    return itemsRef.current.map((i) => ({ slug: i.slug, quantity: i.quantity }));
  }

  function initButtons() {
    if (!window.paypal || !containerRef.current || renderedRef.current) return;
    renderedRef.current = true;

    window.paypal
      .Buttons({
        style: {
          layout: "vertical",
          color: "gold",
          shape: "pill",
          label: "pay",
          height: 48,
        },

        // ── Create order server-side ──────────────────────────────────────────
        createOrder: async () => {
          const orderItems = buildOrderItems();
          if (!orderItems.length) throw new Error("Cart is empty");

          const res = await fetch("/api/paypal/create-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items: orderItems }),
          });

          if (!res.ok) {
            const data = (await res.json().catch(() => ({}))) as { error?: string };
            throw new Error(data.error ?? "Order creation failed — please try again.");
          }

          const data = (await res.json()) as { id: string };
          return data.id;
        },

        // ── Capture after buyer approves ──────────────────────────────────────
        onApprove: async (data: { orderID: string }) => {
          setStatus("capturing");
          const orderItems = buildOrderItems();

          try {
            const res = await fetch("/api/paypal/capture-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderID: data.orderID, items: orderItems }),
            });

            if (!res.ok) {
              const err = (await res.json().catch(() => ({}))) as { error?: string };
              throw new Error(err.error ?? "Payment capture failed — please contact support.");
            }

            const result = (await res.json()) as {
              orderId: string;
              customerEmail: string;
              customerName: string;
              totalAmount: string;
            };

            clearCart();
            onSuccess?.();

            // Build confirmation URL query params
            const params = new URLSearchParams({
              orderId: result.orderId,
              email: result.customerEmail,
              name: result.customerName,
              amount: result.totalAmount,
              // Pass a short summary of what was ordered
              items: orderItems.map((i) => `${i.slug}×${i.quantity}`).join(","),
            });
            window.location.href = "/shop/order-confirmation?" + params.toString();
          } catch (err) {
            const msg = err instanceof Error ? err.message : "Payment processing error.";
            setStatus("error");
            setErrorMsg(msg);
          }
        },

        onCancel: () => setStatus("ready"),

        onError: (err: unknown) => {
          const msg = err instanceof Error ? err.message : "An unexpected checkout error occurred.";
          setStatus("error");
          setErrorMsg(msg);
        },
      })
      .render(containerRef.current)
      .then(() => setStatus("ready"))
      .catch((err: unknown) => {
        setStatus("error");
        setErrorMsg(err instanceof Error ? err.message : "Failed to render PayPal button.");
      });
  }

  if (status === "capturing") {
    return (
      <div className="rounded-2xl border border-owl-teal/30 bg-owl-teal/10 p-4 text-center">
        <div className="mx-auto mb-2 h-5 w-5 animate-spin rounded-full border-2 border-owl-teal border-t-transparent" />
        <p className="text-sm font-semibold text-owl-teal">Processing payment…</p>
        <p className="mt-0.5 text-xs text-owl-mist">Do not close this tab.</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
        <p className="text-sm font-semibold text-red-700">Checkout unavailable</p>
        <p className="mt-1 text-xs text-red-600">{errorMsg}</p>
        <button
          type="button"
          onClick={() => {
            setStatus("loading");
            setErrorMsg("");
            renderedRef.current = false;
            if (containerRef.current) containerRef.current.innerHTML = "";
            initButtons();
          }}
          className="mt-2 text-xs text-owl-teal underline hover:no-underline"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {status === "loading" && (
        <div className="h-12 animate-pulse rounded-full bg-[#FFC439]/40" />
      )}
      <div ref={containerRef} className={status === "loading" ? "hidden" : ""} />
      <p className="text-center text-[10px] text-owl-mist">
        Secure checkout via PayPal · Cards accepted · No PayPal account needed
      </p>
    </div>
  );
}

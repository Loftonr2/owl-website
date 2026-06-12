"use client";

import { useEffect, useRef, useState } from "react";

interface PayPalCheckoutProps {
  /** Product slug — used server-side for price lookup and validation */
  slug: string;
  /** Product title shown while loading */
  productTitle: string;
  /**
   * Price string like "$30.50" — used for display only.
   * The actual charge amount is always looked up server-side from SEED_PRODUCTS.
   */
  price: string;
  /** Called after a successful payment and redirect (optional extra hook) */
  onSuccess?: (orderId: string) => void;
  /** Called if the payment fails or is cancelled */
  onError?: (err: string) => void;
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    paypal?: any;
  }
}

/**
 * PayPalCheckout — loads the PayPal JS SDK via script tag and renders
 * the hosted PayPal button.
 *
 * Payment flow (secure, server-validated):
 *   1. Customer clicks PayPal button
 *   2. createOrder  → POST /api/paypal/create-order  (server reads price from seed)
 *   3. Customer approves payment in PayPal popup
 *   4. onApprove    → POST /api/paypal/capture-order (server captures + saves to Supabase)
 *   5. Redirect to /shop/order-confirmation with order details in query params
 *
 * The price is NEVER trusted from the frontend. Both create-order and
 * capture-order validate it against SEED_PRODUCTS on the server.
 *
 * Required env vars:
 *   NEXT_PUBLIC_PAYPAL_CLIENT_ID  — PayPal app client ID (safe to expose)
 *   PAYPAL_CLIENT_SECRET          — Server-only, set in Vercel env vars
 */
export function PayPalCheckout({
  slug,
  productTitle,
  price,
  onSuccess,
  onError,
}: PayPalCheckoutProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "capturing" | "error">(
    "loading"
  );
  const [errorMsg, setErrorMsg] = useState("");
  const renderedRef = useRef(false);

  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

  useEffect(() => {
    if (!clientId) {
      setStatus("error");
      setErrorMsg(
        "PayPal client ID not configured. Add NEXT_PUBLIC_PAYPAL_CLIENT_ID to Vercel environment variables."
      );
      return;
    }

    // Load PayPal SDK if not already loaded
    const existingScript = document.getElementById("paypal-sdk");
    if (existingScript) {
      initButtons();
      return;
    }

    const script = document.createElement("script");
    script.id = "paypal-sdk";
    script.src =
      "https://www.paypal.com/sdk/js?client-id=" +
      clientId +
      "&currency=USD&intent=capture";
    script.async = true;
    script.onload = initButtons;
    script.onerror = () => {
      setStatus("error");
      setErrorMsg("Failed to load PayPal. Check your internet connection and try again.");
    };
    document.body.appendChild(script);

    return () => {
      // Don't remove the script — it is shared across the page session
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId, slug]);

  function initButtons() {
    if (!window.paypal || !containerRef.current || renderedRef.current) return;
    renderedRef.current = true;

    window.paypal
      .Buttons({
        style: {
          layout: "vertical",
          color: "gold",
          shape: "pill",
          label: "paypal",
          height: 48,
        },

        // ── Step 2: Create PayPal order via server (price is validated server-side) ──
        createOrder: async () => {
          try {
            const res = await fetch("/api/paypal/create-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ slug }),
            });

            if (!res.ok) {
              const data = (await res.json().catch(() => ({}))) as {
                error?: string;
              };
              throw new Error(data.error ?? "Order creation failed — please try again.");
            }

            const data = (await res.json()) as { id: string };
            return data.id; // PayPal order ID — returned to SDK to open the popup
          } catch (err) {
            const msg = err instanceof Error ? err.message : "Could not start checkout.";
            setStatus("error");
            setErrorMsg(msg);
            onError?.(msg);
            throw err; // re-throw so PayPal SDK closes the popup
          }
        },

        // ── Step 4: Capture payment via server after buyer approves ──────────────
        onApprove: async (data: { orderID: string }, _actions: unknown) => {
          setStatus("capturing");

          try {
            const res = await fetch("/api/paypal/capture-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderID: data.orderID, slug }),
            });

            if (!res.ok) {
              const errData = (await res.json().catch(() => ({}))) as {
                error?: string;
              };
              throw new Error(
                errData.error ?? "Payment capture failed — please contact support."
              );
            }

            const result = (await res.json()) as {
              orderId: string;
              captureId: string;
              customerEmail: string;
              customerName: string;
              productTitle: string;
              amount: string;
            };

            onSuccess?.(result.orderId);

            // ── Step 5: Redirect to confirmation page ──────────────────────────
            const params = new URLSearchParams({
              orderId: result.orderId,
              product: result.productTitle,
              email: result.customerEmail,
              name: result.customerName,
              amount: result.amount,
            });
            window.location.href = "/shop/order-confirmation?" + params.toString();
          } catch (err) {
            const msg = err instanceof Error ? err.message : "Payment processing error.";
            setStatus("error");
            setErrorMsg(msg);
            onError?.(msg);
          }
        },

        // Customer clicked "Cancel" in the PayPal popup — reset so they can retry
        onCancel: () => {
          setStatus("ready");
        },

        onError: (err: unknown) => {
          const msg =
            err instanceof Error ? err.message : "An unexpected error occurred.";
          setStatus("error");
          setErrorMsg(msg);
          onError?.(msg);
        },
      })
      .render(containerRef.current)
      .then(() => setStatus("ready"))
      .catch((err: unknown) => {
        setStatus("error");
        setErrorMsg(
          err instanceof Error ? err.message : "Failed to render PayPal button."
        );
      });
  }

  // ── Capturing / processing state ─────────────────────────────────────────────
  if (status === "capturing") {
    return (
      <div className="rounded-2xl border border-owl-teal/30 bg-owl-teal/10 p-6 text-center">
        <div className="mx-auto mb-3 h-6 w-6 animate-spin rounded-full border-2 border-owl-teal border-t-transparent" />
        <p className="font-display text-sm font-semibold text-owl-teal">
          Processing your payment...
        </p>
        <p className="mt-1 text-xs text-owl-mist">Please do not close this page.</p>
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────────────────────────
  if (status === "error") {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
        <p className="text-sm font-semibold text-red-700">Checkout unavailable</p>
        <p className="mt-1 text-xs text-red-600">{errorMsg}</p>
        {!clientId && (
          <p className="mt-2 font-mono text-[11px] text-red-500">
            Add NEXT_PUBLIC_PAYPAL_CLIENT_ID to Vercel environment variables.
          </p>
        )}
      </div>
    );
  }

  // ── Button container ──────────────────────────────────────────────────────────
  return (
    <div className="space-y-3">
      {/* Loading skeleton */}
      {status === "loading" && (
        <div className="h-12 animate-pulse rounded-full bg-[#FFC439]/40" />
      )}
      {/* PayPal button mounts here */}
      <div ref={containerRef} className={status === "loading" ? "hidden" : ""} />
      <p className="text-center text-[11px] text-owl-mist">
        Secure checkout via PayPal · Cards accepted
      </p>
      <p className="text-center font-mono text-[10px] text-owl-mist/50">
        {price}
      </p>
    </div>
  );
}

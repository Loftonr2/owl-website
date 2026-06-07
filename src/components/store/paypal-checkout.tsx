"use client";

import { useEffect, useRef, useState } from "react";

interface PayPalCheckoutProps {
  /** Product title shown in the PayPal order summary */
  productTitle: string;
  /** Price string like "$30.50" — parsed to USD value */
  price: string;
  /** Called after a successful payment capture */
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
 * the hosted PayPal button. No npm package required.
 *
 * Requires: NEXT_PUBLIC_PAYPAL_CLIENT_ID in .env.local
 * Sandbox client ID format: starts with "AQ..." or "sb"
 * Live client ID format:    starts with "AQ..." (longer string)
 *
 * PayPal handles all card processing, fraud detection, and order confirmation.
 */
export function PayPalCheckout({
  productTitle,
  price,
  onSuccess,
  onError,
}: PayPalCheckoutProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [orderId, setOrderId] = useState("");
  const renderedRef = useRef(false);

  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

  // Parse price string to numeric USD value
  const amount = parseFloat(price.replace(/[^0-9.]/g, "")).toFixed(2);

  useEffect(() => {
    if (!clientId) {
      setStatus("error");
      setErrorMsg("PayPal client ID not configured. Add NEXT_PUBLIC_PAYPAL_CLIENT_ID to .env.local.");
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
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&intent=capture`;
    script.async = true;
    script.onload = initButtons;
    script.onerror = () => {
      setStatus("error");
      setErrorMsg("Failed to load PayPal. Check your internet connection and try again.");
    };
    document.body.appendChild(script);

    return () => {
      // Don't remove the script — it's shared across the page
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId, amount]);

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

        // Create the PayPal order
        createOrder: (_data: unknown, actions: { order: { create: (o: object) => Promise<string> } }) => {
          return actions.order.create({
            purchase_units: [
              {
                description: productTitle,
                amount: {
                  currency_code: "USD",
                  value: amount,
                },
              },
            ],
          });
        },

        // Capture payment after buyer approves
        onApprove: async (data: { orderID: string }, actions: { order: { capture: () => Promise<{ status: string }> } }) => {
          const details = await actions.order.capture();
          if (details.status === "COMPLETED") {
            setOrderId(data.orderID);
            setStatus("success");
            onSuccess?.(data.orderID);
          } else {
            setStatus("error");
            setErrorMsg("Payment was not completed. Please try again.");
            onError?.("Payment not completed");
          }
        },

        // Handle cancellation
        onCancel: () => {
          setStatus("ready"); // Reset — user can try again
        },

        onError: (err: unknown) => {
          const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
          setStatus("error");
          setErrorMsg(msg);
          onError?.(msg);
        },
      })
      .render(containerRef.current)
      .then(() => setStatus("ready"))
      .catch((err: unknown) => {
        setStatus("error");
        setErrorMsg(err instanceof Error ? err.message : "Failed to render PayPal button.");
      });
  }

  // Success state
  if (status === "success") {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-center">
        <div className="mb-3 text-4xl">🎉</div>
        <h3 className="font-display text-lg font-bold text-green-800">Payment Successful!</h3>
        <p className="mt-1 text-sm text-green-700">
          Your order has been placed. Check your email for confirmation.
        </p>
        <p className="mt-2 font-mono text-xs text-green-600">Order ID: {orderId}</p>
      </div>
    );
  }

  // Error state
  if (status === "error") {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
        <p className="text-sm font-semibold text-red-700">PayPal checkout unavailable</p>
        <p className="mt-1 text-xs text-red-600">{errorMsg}</p>
        {!clientId && (
          <p className="mt-2 font-mono text-[11px] text-red-500">
            Add NEXT_PUBLIC_PAYPAL_CLIENT_ID to .env.local
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Loading skeleton */}
      {status === "loading" && (
        <div className="h-12 animate-pulse rounded-full bg-[#FFC439]/40" />
      )}
      {/* PayPal button mounts here */}
      <div ref={containerRef} className={status === "loading" ? "hidden" : ""} />
      <p className="text-center text-[11px] text-owl-mist">
        Secure checkout via PayPal. Card payments accepted.
      </p>
    </div>
  );
}

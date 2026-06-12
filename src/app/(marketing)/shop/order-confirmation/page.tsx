"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, ShoppingBag, Mail, ArrowRight } from "lucide-react";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { OwlMark } from "@/components/brand/owl-logo";

function OrderConfirmationContent() {
  const params = useSearchParams();

  const orderId = params.get("orderId") ?? "";
  const product = params.get("product") ?? "your order";
  const email = params.get("email") ?? "";
  const name = params.get("name") ?? "";
  const amount = params.get("amount") ?? "";

  const firstName = name.split(" ")[0] || "";

  return (
    <Section width="narrow" pad="lg" bg="cream-deep">
      <div className="flex flex-col items-center text-center">
        {/* OWL watermark */}
        <OwlMark
          decorative
          className="mb-6 h-14 w-14 text-owl-teal opacity-80"
        />

        {/* Success icon */}
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-owl-teal/15 ring-4 ring-owl-teal/10">
          <CheckCircle className="h-10 w-10 text-owl-teal" strokeWidth={1.5} />
        </div>

        <h1 className="font-display text-3xl font-extrabold text-owl-ink sm:text-4xl">
          {firstName ? `Thank you, ${firstName}!` : "Order Confirmed!"}
        </h1>
        <p className="mt-3 max-w-sm text-base text-owl-mist">
          Your payment was received. We are preparing your order now.
        </p>

        {/* Order summary card */}
        <div className="mt-8 w-full max-w-md overflow-hidden rounded-owl-card border border-owl-cream-deep bg-owl-white shadow-owl-1">
          {/* Card header */}
          <div className="border-b border-owl-cream-deep bg-owl-cream px-6 py-4">
            <p className="font-display text-xs font-bold uppercase tracking-[0.18em] text-owl-teal">
              Order Summary
            </p>
          </div>

          {/* Card body */}
          <div className="px-6 py-5 text-left">
            <p className="font-display text-lg font-bold text-owl-ink">{product}</p>
            {amount && (
              <p className="mt-1 font-display text-sm font-semibold text-owl-teal">
                ${amount} USD
              </p>
            )}

            {email && (
              <div className="mt-4 flex items-start gap-3 rounded-lg bg-owl-cream px-4 py-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-owl-mist" />
                <div>
                  <p className="text-xs font-semibold text-owl-ink">
                    Confirmation sent to
                  </p>
                  <p className="mt-0.5 text-sm text-owl-ink/70">{email}</p>
                </div>
              </div>
            )}

            {orderId && (
              <p className="mt-4 font-mono text-[11px] text-owl-mist">
                Order ID: {orderId}
              </p>
            )}
          </div>
        </div>

        {/* Shipping note */}
        <p className="mt-6 max-w-xs text-sm text-owl-mist">
          You will receive a shipping confirmation email once your order is on its way.
        </p>

        {/* CTAs */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button intent="primary" size="lg" asChild>
            <Link href="/shop">
              <ShoppingBag className="h-4 w-4" aria-hidden />
              Keep shopping
            </Link>
          </Button>
          <Button intent="tertiary" size="lg" asChild>
            <Link href="/">
              Back to home
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </Button>
        </div>
      </div>
    </Section>
  );
}

function LoadingState() {
  return (
    <Section width="narrow" pad="lg" bg="cream-deep">
      <div className="flex flex-col items-center text-center">
        <div className="mb-6 h-20 w-20 animate-pulse rounded-full bg-owl-cream-deep" />
        <div className="h-8 w-48 animate-pulse rounded-lg bg-owl-cream-deep" />
        <div className="mt-3 h-4 w-64 animate-pulse rounded bg-owl-cream-deep" />
      </div>
    </Section>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <OrderConfirmationContent />
    </Suspense>
  );
}

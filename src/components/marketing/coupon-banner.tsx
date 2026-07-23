"use client";

/**
 * CouponBanner
 * Shows the signed-in user's active OWL Weekly account-bound coupon.
 * Fetches from /api/newsletter/coupon/check on mount.
 * Stores the _token in state so the checkout can call /api/newsletter/coupon/apply.
 */

import { useEffect, useState } from "react";
import { Tag, Clock, ChevronRight } from "lucide-react";

interface CouponEntitlement {
  display_code: string | null;
  discount_type: string;
  discount_value: number;
  applies_to: string;
  minimum_order_cents: number;
  allow_stacking: boolean;
  expires_at: string;
  promo_headline: string | null;
  issue_title: string | null;
  issue_number: number | null;
  _token: string;
}

interface CouponBannerProps {
  /** Called when the user explicitly claims the coupon (optional) */
  onClaim?: (token: string, discountPct: number) => void;
  className?: string;
}

export function CouponBanner({ onClaim, className = "" }: CouponBannerProps) {
  const [entitlement, setEntitlement] = useState<CouponEntitlement | null>(null);
  const [loading, setLoading] = useState(true);
  const [claimed, setClaimed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/newsletter/coupon/check")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (!cancelled && d?.entitlement) setEntitlement(d.entitlement);
      })
      .catch(() => null)
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (loading || !entitlement) return null;

  const expiresDate = new Date(entitlement.expires_at);
  const daysLeft = Math.max(0, Math.ceil((expiresDate.getTime() - Date.now()) / 86_400_000));
  const discountLabel = entitlement.discount_type === "percent"
    ? `${entitlement.discount_value}% off`
    : `$${entitlement.discount_value} off`;

  function handleClaim() {
    if (!entitlement) return;
    setClaimed(true);
    onClaim?.(entitlement._token, entitlement.discount_value);
  }

  return (
    <div
      className={`relative overflow-hidden rounded-owl-card border border-owl-teal/30 bg-gradient-to-r from-owl-teal/10 via-owl-cream to-owl-amber/10 p-4 shadow-owl-1 ${className}`}
      role="region"
      aria-label="Your OWL Weekly coupon"
    >
      {/* Accent line */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-owl-teal via-owl-amber to-owl-teal"
      />

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <span
            aria-hidden
            className="flex-shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-full bg-owl-teal/15 text-owl-teal"
          >
            <Tag className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="font-display text-sm font-bold text-owl-ink">
              {entitlement.promo_headline ?? "Your OWL Weekly Perk"}
            </p>
            <p className="mt-0.5 text-sm text-owl-ink/75">
              <span className="font-semibold text-owl-teal">{discountLabel}</span>
              {entitlement.display_code && (
                <> · <code className="rounded bg-owl-teal/10 px-1 py-0.5 text-xs font-mono">{entitlement.display_code}</code></>
              )}
              {entitlement.issue_number && (
                <> · Issue #{entitlement.issue_number}</>
              )}
            </p>
            {daysLeft <= 7 && (
              <p className="mt-1 flex items-center gap-1 text-xs text-owl-amber">
                <Clock className="h-3 w-3" aria-hidden />
                {daysLeft === 0 ? "Expires today!" : `${daysLeft} day${daysLeft === 1 ? "" : "s"} left`}
              </p>
            )}
          </div>
        </div>

        {onClaim && !claimed && (
          <button
            onClick={handleClaim}
            className="flex-shrink-0 inline-flex items-center gap-1 rounded-full bg-owl-teal px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-owl-teal-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-owl-teal/40"
          >
            Apply <ChevronRight className="h-3.5 w-3.5" aria-hidden />
          </button>
        )}
        {claimed && (
          <span className="flex-shrink-0 text-sm font-semibold text-owl-teal">Applied ✓</span>
        )}
      </div>
    </div>
  );
}

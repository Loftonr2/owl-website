"use client";

import { useState, useTransition } from "react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";

/**
 * Newsletter subscribe form — hits /api/newsletter/subscribe (zod + Beehiiv).
 *
 * Reusable on:
 *  - Homepage footer band
 *  - Printable-of-the-week email gate
 *  - /newsletter signup page
 *  - Any blog/video/printable page
 *
 * Props lets you opt into segment-tagging without rewriting the form.
 */
type NewsletterFormProps = {
  /** Optional segment routing into Beehiiv (A1..A7) */
  segment?: "A1" | "A2" | "A3" | "A4" | "A5" | "A6" | "A7";
  /** Track where the signup happened */
  source?: "homepage" | "footer" | "printable-gate" | "blog" | "video" | "shop" | "other";
  /** Override the headline + body of the form */
  headline?: string;
  body?: string;
  /** Button copy */
  ctaLabel?: string;
  /** Visual mode: stacked or inline (default) */
  layout?: "inline" | "stacked";
  className?: string;
};

export function NewsletterForm({
  segment,
  source = "other",
  headline,
  body,
  ctaLabel = "Get the printable",
  layout = "inline",
  className,
}: NewsletterFormProps) {
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<
    | { state: "idle" }
    | { state: "success" }
    | { state: "error"; message: string }
  >({ state: "idle" });

  return (
    <form
      className={cn("space-y-3", className)}
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const email = String(fd.get("email") ?? "");
        const hp = String(fd.get("hp") ?? "");

        startTransition(async () => {
          try {
            const res = await fetch("/api/newsletter/subscribe", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email,
                hp,
                source,
                segments: segment ? [segment] : undefined,
              }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
              setStatus({
                state: "error",
                message: typeof data?.error === "string" ? data.error : "Something went wrong.",
              });
              return;
            }
            setStatus({ state: "success" });
          } catch {
            setStatus({ state: "error", message: "Network error — try again." });
          }
        });
      }}
    >
      {(headline || body) && (
        <div>
          {headline && <p className="font-display text-base font-semibold text-owl-ink">{headline}</p>}
          {body && <p className="mt-1 text-sm text-owl-mist">{body}</p>}
        </div>
      )}

      {status.state === "success" ? (
        <div
          role="status"
          className="rounded-owl-btn bg-owl-teal/10 px-4 py-3 text-sm text-owl-teal-deep"
        >
          ✓ Check your inbox to confirm — your printable is on the way.
        </div>
      ) : (
        <div
          className={cn(
            "flex gap-2",
            layout === "stacked" ? "flex-col" : "flex-col sm:flex-row"
          )}
        >
          {/* Honeypot — must stay empty. Bots fill it. */}
          <input
            type="text"
            name="hp"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden
            className="hidden"
          />
          <label className="sr-only" htmlFor={`nl-email-${source}`}>
            Email address
          </label>
          <input
            id={`nl-email-${source}`}
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            className="flex-1 rounded-owl-btn border border-owl-mist/30 bg-white px-4 py-3 text-owl-ink placeholder:text-owl-mist/60 focus:border-owl-teal focus:outline-none focus:ring-2 focus:ring-owl-teal/30"
          />
          <Button type="submit" intent="primary" disabled={pending}>
            {pending ? "Sending…" : ctaLabel}
          </Button>
        </div>
      )}

      {status.state === "error" && (
        <p role="alert" className="text-sm text-owl-error">
          {status.message}
        </p>
      )}

      <p className="text-xs text-owl-mist">
        We&apos;ll email you weekly. No spam. Unsubscribe any time.
      </p>
    </form>
  );
}

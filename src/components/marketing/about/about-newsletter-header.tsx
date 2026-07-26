"use client";

/**
 * AboutNewsletterHeader
 * ──────────────────────
 * "Join OWL Weekly" section placed directly beneath the About Us video hero.
 *
 * Uses the approved "Join OWL Weekly" header artwork (Header Image.png from
 * the Newsletter asset folder) as the primary visual. A real, functional
 * subscription form is rendered below the artwork — NOT baked into the image.
 *
 * Form reuses the existing /api/newsletter/subscribe endpoint and the shared
 * NewsletterForm component pattern (email validation, loading, success,
 * already-subscribed, error states).
 */

import Image from "next/image";
import { useState, useTransition } from "react";
import { cn } from "@/lib/cn";

const FORM_ID = "about-hero-nl";

export function AboutNewsletterHeader() {
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<
    | { state: "idle" }
    | { state: "success" }
    | { state: "already" }
    | { state: "error"; message: string }
  >({ state: "idle" });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim();
    const hp = String(fd.get("hp") ?? "");

    if (!email) return;

    startTransition(async () => {
      try {
        const res = await fetch("/api/newsletter/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, hp, source: "about" }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.status === 409 || data?.error?.toLowerCase().includes("already")) {
          setStatus({ state: "already" });
          return;
        }
        if (!res.ok) {
          setStatus({
            state: "error",
            message: typeof data?.error === "string" ? data.error : "Something went wrong.",
          });
          return;
        }
        setStatus({ state: "success" });
      } catch {
        setStatus({ state: "error", message: "Network error — please try again." });
      }
    });
  };

  return (
    <section
      aria-labelledby="about-newsletter-heading"
      className="bg-[#F5EDE0] py-0"
    >
      {/* ── Approved header artwork ── */}
      <div className="relative w-full overflow-hidden">
        <Image
          src="/images/newsletter/redesign/join-owl-weekly-header.png"
          alt="Join OWL Weekly — inspiring tips, trusted guidance, and joyful learning for your family, delivered every Sunday. Featuring Parenting Tips, Health Updates, Learning Inspiration, and Store Perks."
          width={1512}
          height={604}
          className="w-full object-cover"
          sizes="100vw"
          priority
        />
      </div>

      {/* ── Real subscription form (below the artwork) ── */}
      <div className="bg-[#F5EDE0] px-6 pb-14 pt-8 sm:px-10">
        <div className="mx-auto max-w-xl text-center">
          <h2
            id="about-newsletter-heading"
            className="font-display text-xl font-extrabold text-owl-ink"
          >
            Get uplifting songs, resources, and family updates every Sunday.
          </h2>
          <p className="mt-2 text-sm text-owl-ink/70">
            Double opt-in via Beehiiv. No spam. Unsubscribe any time.
          </p>

          {status.state === "success" ? (
            <div
              role="status"
              aria-live="polite"
              className="mt-6 rounded-2xl bg-owl-teal/10 px-6 py-4 text-sm font-semibold text-owl-teal-deep"
            >
              ✓ Check your inbox to confirm — welcome to OWL Weekly!
            </div>
          ) : status.state === "already" ? (
            <div
              role="status"
              aria-live="polite"
              className="mt-6 rounded-2xl bg-owl-amber/10 px-6 py-4 text-sm font-semibold text-owl-amber"
            >
              You&apos;re already subscribed — see you Sunday!
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="mt-6">
              {/* Honeypot */}
              <input
                type="text"
                name="hp"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="hidden"
              />
              <div className="flex flex-col gap-3 sm:flex-row">
                <label className="sr-only" htmlFor={FORM_ID}>
                  Email address
                </label>
                <input
                  id={FORM_ID}
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="Your email address"
                  className={cn(
                    "flex-1 rounded-2xl border border-owl-mist/30 bg-white",
                    "px-5 py-3 text-owl-ink placeholder:text-owl-mist/60",
                    "focus:border-owl-teal focus:outline-none focus:ring-2 focus:ring-owl-teal/30",
                    "min-h-[44px]"
                  )}
                />
                <button
                  type="submit"
                  disabled={pending}
                  className={cn(
                    "rounded-2xl bg-owl-amber px-7 py-3 font-display text-sm font-bold text-white",
                    "transition-all duration-150 hover:bg-owl-amber/90",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-owl-amber focus-visible:ring-offset-2",
                    "disabled:opacity-60",
                    "min-h-[44px] whitespace-nowrap"
                  )}
                >
                  {pending ? "Sending…" : "Sign Me Up!"}
                </button>
              </div>

              {status.state === "error" && (
                <p role="alert" aria-live="assertive" className="mt-3 text-sm text-owl-error">
                  {status.message}
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

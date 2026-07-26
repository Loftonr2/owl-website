"use client";

import { type FormEvent, useState, useTransition } from "react";
import { CheckCircle2, Mail } from "lucide-react";

interface Props {
  /** Unique per-page instance — prevents duplicate `id` when multiple forms exist. */
  instanceId: string;
}

/**
 * NewsletterHeroForm
 * ──────────────────
 * Client component for the "Join OWL Weekly" hero signup.
 * Uses the same /api/newsletter/subscribe endpoint as NewsletterSubscribeForm
 * but renders a coral gradient button with circular arrow icon to match the
 * approved Header Image wireframe.
 *
 * Features:
 * - Honeypot bot protection
 * - useTransition loading state (prevents double-submit)
 * - Clear success / error states
 * - Keyboard accessible (Enter submits, aria-label on input)
 * - Unique DOM ids via instanceId
 */
export function NewsletterHeroForm({ instanceId }: Props) {
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
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
            source: "other",
            segments: ["A2"],
          }),
        });

        if (!res.ok) {
          let msg = "Something went wrong — please try again.";
          try {
            const data = (await res.json()) as Record<string, unknown>;
            if (typeof data.error === "string") msg = data.error;
          } catch {
            // ignore json parse error
          }
          setErrorMsg(msg);
          setStatus("error");
          return;
        }

        setStatus("success");
      } catch {
        setErrorMsg("Network error — please try again.");
        setStatus("error");
      }
    });
  }

  /* ── Success state ── */
  if (status === "success") {
    return (
      <div
        role="status"
        className="flex items-start gap-3 rounded-2xl bg-[#159A9C]/10 px-5 py-4"
      >
        <CheckCircle2
          className="mt-0.5 h-5 w-5 shrink-0 text-[#159A9C]"
          aria-hidden
        />
        <p className="font-body text-sm font-medium text-[#082B63]">
          You&apos;re in! Look out for OWL Weekly in your inbox every Sunday.
        </p>
      </div>
    );
  }

  /* ── Form ── */
  return (
    <form onSubmit={handleSubmit} className="space-y-3" noValidate>
      {/* Honeypot — must stay hidden and empty. Bots fill it. */}
      <input
        type="text"
        name="hp"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="hidden"
      />

      <label className="sr-only" htmlFor={`nl-email-${instanceId}`}>
        Email address
      </label>

      <div className="flex flex-col gap-2.5 sm:flex-row">
        {/* Email input */}
        <div className="relative flex-1">
          <Mail
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#159A9C]"
            aria-hidden
          />
          <input
            id={`nl-email-${instanceId}`}
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="Enter your email address"
            disabled={pending}
            className="w-full rounded-full border border-[#159A9C]/25 bg-white py-3.5 pl-11 pr-4 font-body text-[#082B63] placeholder:text-[#9CA3AF] transition-colors focus:border-[#159A9C] focus:outline-none focus:ring-2 focus:ring-[#159A9C]/20 disabled:opacity-60"
          />
        </div>

        {/* Coral-to-orange gradient button with circular arrow icon */}
        <button
          type="submit"
          disabled={pending}
          aria-disabled={pending}
          className="flex items-center gap-3 whitespace-nowrap rounded-full px-7 py-3.5 font-display text-base font-bold text-white shadow-[0_4px_16px_rgba(255,90,67,0.35)] transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(255,90,67,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A43] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
          style={{
            background: "linear-gradient(135deg, #FF5A43 0%, #FF8A4C 100%)",
          }}
        >
          <span>{pending ? "Joining…" : "Sign Me Up!"}</span>
          {/* Circular arrow icon on right */}
          <span
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/25"
            aria-hidden
          >
            <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5">
              <path
                d="M3 8h10M9 5l4 3-4 3"
                stroke="white"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </button>
      </div>

      {status === "error" && (
        <p role="alert" className="font-body text-sm text-red-600">
          {errorMsg}
        </p>
      )}
    </form>
  );
}

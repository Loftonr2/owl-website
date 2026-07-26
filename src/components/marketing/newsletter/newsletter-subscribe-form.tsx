"use client";

import { useState, useTransition } from "react";
import { cn } from "@/lib/cn";
import { Mail, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  /** Unique per-page instance — used to generate a unique label `for` id. */
  instanceId: string;
  source?: "homepage" | "footer" | "printable-gate" | "blog" | "video" | "shop" | "other";
  segment?: "A1" | "A2" | "A3" | "A4" | "A5" | "A6" | "A7";
  ctaLabel?: string;
  inputPlaceholder?: string;
  layout?: "inline" | "stacked";
  successMessage?: string;
  className?: string;
  inputClassName?: string;
  buttonIntent?: "primary" | "secondary";
};

export function NewsletterSubscribeForm({
  instanceId,
  source = "other",
  segment,
  ctaLabel = "Sign Me Up!",
  inputPlaceholder = "Enter your email address",
  layout = "inline",
  successMessage = "You're in! Look out for OWL Weekly in your inbox every Sunday.",
  className,
  inputClassName,
  buttonIntent = "primary",
}: Props) {
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  if (status === "success") {
    return (
      <div
        role="status"
        className="flex items-start gap-3 rounded-2xl bg-owl-teal/10 px-5 py-4 text-owl-teal-deep"
      >
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
        <p className="font-body text-sm font-medium">{successMessage}</p>
      </div>
    );
  }

  return (
    <form
      className={cn("space-y-2", className)}
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
            if (!res.ok) {
              const data = await res.json().catch(() => ({}));
              setErrorMsg(
                typeof data?.error === "string"
                  ? data.error
                  : "Something went wrong — please try again."
              );
              setStatus("error");
              return;
            }
            setStatus("success");
          } catch {
            setErrorMsg("Network error — please try again.");
            setStatus("error");
          }
        });
      }}
    >
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

      <div
        className={cn(
          "flex gap-3",
          layout === "stacked" ? "flex-col" : "flex-col sm:flex-row"
        )}
      >
        {/* Email input with mail icon */}
        <div className="relative flex-1">
          <Mail
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-owl-mist"
            aria-hidden
          />
          <input
            id={`nl-email-${instanceId}`}
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder={inputPlaceholder}
            className={cn(
              "w-full rounded-owl-btn border border-owl-mist/30 bg-white py-3 pl-10 pr-4",
              "font-body text-owl-ink placeholder:text-owl-mist/60",
              "focus:border-owl-teal focus:outline-none focus:ring-2 focus:ring-owl-teal/30",
              "transition-colors duration-150",
              inputClassName
            )}
          />
        </div>

        <Button
          type="submit"
          intent={buttonIntent}
          disabled={pending}
          loading={pending}
          size="md"
        >
          {ctaLabel}
        </Button>
      </div>

      {status === "error" && (
        <p role="alert" className="text-sm text-red-600">
          {errorMsg}
        </p>
      )}
    </form>
  );
}

"use client";

/**
 * AboutLowerNewsletter
 * ─────────────────────
 * "Let's Keep Singing Together" lower CTA section.
 * Light aqua background, OWL mascot, real newsletter form (source="about-footer"),
 * social links (YouTube / Instagram / Facebook / Pinterest / Email),
 * music note and leaf decorations.
 */

import Image from "next/image";
import Link from "next/link";
import { Youtube, Instagram, Facebook, Mail, Music, Leaf } from "lucide-react";
import { useState, useTransition } from "react";
import { cn } from "@/lib/cn";

const FORM_ID = "about-footer-nl";

/** Lucide-react has no Pinterest icon — use inline SVG */
function PinterestIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
    </svg>
  );
}

const SOCIALS: Array<{
  href: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    href: "https://www.youtube.com/@Owlsingtogetherchannel",
    label: "OWL on YouTube",
    Icon: Youtube,
  },
  {
    href: "https://www.instagram.com/owlsingtogether",
    label: "OWL on Instagram",
    Icon: Instagram,
  },
  {
    href: "https://www.facebook.com/owlsingtogether",
    label: "OWL on Facebook",
    Icon: Facebook,
  },
  {
    href: "https://www.pinterest.com/owlsingtogether",
    label: "OWL on Pinterest",
    Icon: PinterestIcon,
  },
  {
    href: "mailto:hello@owlsingtogether.com",
    label: "Email OWL",
    Icon: Mail,
  },
];

export function AboutLowerNewsletter() {
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
          body: JSON.stringify({ email, hp, source: "about-footer" }),
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
      aria-labelledby="about-lower-nl-heading"
      className="relative overflow-hidden bg-[#EAF5F5] py-16 md:py-24"
    >
      {/* Decorative music note + leaf */}
      <Music
        className="pointer-events-none absolute -left-4 top-8 h-20 w-20 rotate-[-12deg] text-owl-teal/10"
        aria-hidden
      />
      <Leaf
        className="pointer-events-none absolute bottom-8 right-6 h-16 w-16 rotate-20 text-owl-forest/10"
        aria-hidden
      />

      <div className="relative mx-auto max-w-3xl px-6 text-center sm:px-10">
        {/* Mascot */}
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-owl-teal shadow-owl-1">
          <Image
            src="/images/brand/mascot.png"
            alt=""
            width={72}
            height={72}
            className="h-auto w-[75%] object-contain"
            aria-hidden
          />
        </div>

        {/* Eyebrow */}
        <p className="font-display text-xs font-bold uppercase tracking-[0.25em] text-owl-teal">
          STAY IN TUNE
        </p>

        {/* Heading */}
        <h2
          id="about-lower-nl-heading"
          className="mt-3 font-display text-3xl font-extrabold text-owl-ink sm:text-4xl"
        >
          Let&apos;s Keep Singing Together
        </h2>

        {/* Body */}
        <p className="mt-4 text-base leading-relaxed text-owl-ink/75">
          Join thousands of families and educators who receive uplifting songs, trusted guidance,
          and joyful learning ideas — delivered every Sunday morning to your inbox.
        </p>

        {/* Form */}
        <div className="mt-8">
          {status.state === "success" ? (
            <div
              role="status"
              aria-live="polite"
              className="rounded-2xl bg-owl-teal/10 px-6 py-4 text-sm font-semibold text-owl-teal-deep"
            >
              ✓ Check your inbox to confirm — welcome to OWL Weekly!
            </div>
          ) : status.state === "already" ? (
            <div
              role="status"
              aria-live="polite"
              className="rounded-2xl bg-owl-amber/10 px-6 py-4 text-sm font-semibold text-owl-amber"
            >
              You&apos;re already subscribed — see you Sunday!
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
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
                    "flex-1 rounded-2xl border border-owl-teal/20 bg-white",
                    "px-5 py-3 text-owl-ink placeholder:text-owl-mist/60",
                    "focus:border-owl-teal focus:outline-none focus:ring-2 focus:ring-owl-teal/30",
                    "min-h-[44px]"
                  )}
                />
                <button
                  type="submit"
                  disabled={pending}
                  className={cn(
                    "rounded-2xl bg-owl-teal px-7 py-3 font-display text-sm font-bold text-white",
                    "transition-all duration-150 hover:bg-owl-teal-deep",
                    "focus-visible:outline-none focus-visible:ring-2",
                    "focus-visible:ring-owl-teal focus-visible:ring-offset-2",
                    "disabled:opacity-60",
                    "min-h-[44px] whitespace-nowrap"
                  )}
                >
                  {pending ? "Sending…" : "Join OWL Weekly"}
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

        {/* Social links */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <p className="w-full font-display text-xs font-bold uppercase tracking-[0.2em] text-owl-ink/50">
            Follow Along
          </p>
          {SOCIALS.map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              aria-label={label}
              target={href.startsWith("mailto") ? undefined : "_blank"}
              rel={href.startsWith("mailto") ? undefined : "noopener noreferrer"}
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-owl-1",
                "text-owl-teal transition-all duration-150",
                "hover:-translate-y-0.5 hover:bg-owl-teal hover:text-white hover:shadow-owl-2",
                "focus-visible:outline-none focus-visible:ring-2",
                "focus-visible:ring-owl-teal focus-visible:ring-offset-2"
              )}
            >
              <Icon className="h-5 w-5" aria-hidden />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

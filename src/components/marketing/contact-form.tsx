"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";

const SEGMENTS = [
  { value: "parent", label: "Parent / caregiver" },
  { value: "educator", label: "Educator / school" },
  { value: "media", label: "Press / media" },
  { value: "licensing", label: "Licensing inquiry" },
  { value: "sponsor", label: "Brand / sponsor" },
] as const;

type Status =
  | { state: "idle" }
  | { state: "success" }
  | { state: "error"; message: string };

export function ContactForm({ defaultSegment }: { defaultSegment?: typeof SEGMENTS[number]["value"] }) {
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<Status>({ state: "idle" });

  if (status.state === "success") {
    return (
      <div
        role="status"
        className="rounded-owl-card border border-owl-teal/30 bg-owl-teal/10 p-6 text-sm text-owl-teal-deep"
      >
        ✓ Thank you — we&apos;ve received your message and will be in touch soon.
      </div>
    );
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const payload = {
          segment: String(fd.get("segment") ?? ""),
          name: String(fd.get("name") ?? ""),
          email: String(fd.get("email") ?? ""),
          organization: String(fd.get("organization") ?? ""),
          message: String(fd.get("message") ?? ""),
          hp: String(fd.get("hp") ?? ""),
        };
        startTransition(async () => {
          try {
            const res = await fetch("/api/contact", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
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
      <input type="text" name="hp" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />

      <Field label="I'm a…" htmlFor="contact-segment" required>
        <select
          id="contact-segment"
          name="segment"
          required
          defaultValue={defaultSegment ?? "parent"}
          className="block w-full rounded-owl-btn border border-owl-mist/30 bg-white px-4 py-3 text-owl-ink focus:border-owl-teal focus:outline-none focus:ring-2 focus:ring-owl-teal/30"
        >
          {SEGMENTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Your name" htmlFor="contact-name" required>
          <Input id="contact-name" name="name" required autoComplete="name" />
        </Field>
        <Field label="Email" htmlFor="contact-email" required>
          <Input id="contact-email" name="email" type="email" required autoComplete="email" />
        </Field>
      </div>

      <Field label="Organization (optional)" htmlFor="contact-org">
        <Input id="contact-org" name="organization" autoComplete="organization" />
      </Field>

      <Field label="Message" htmlFor="contact-msg" required>
        <textarea
          id="contact-msg"
          name="message"
          required
          rows={6}
          minLength={20}
          maxLength={4000}
          className="block w-full rounded-owl-btn border border-owl-mist/30 bg-white px-4 py-3 text-owl-ink placeholder:text-owl-mist/60 focus:border-owl-teal focus:outline-none focus:ring-2 focus:ring-owl-teal/30"
          placeholder="Tell us what you need help with…"
        />
      </Field>

      {status.state === "error" && (
        <p role="alert" className="text-sm text-owl-error">
          {status.message}
        </p>
      )}

      <Button type="submit" intent="primary" size="lg" disabled={pending}>
        {pending ? "Sending…" : "Send message"}
      </Button>

      <p className="text-xs text-owl-mist">
        We typically reply within 2 business days. For urgent licensing or media requests, mention it in your message.
      </p>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="block">
      <span className="block text-sm font-medium text-owl-ink">
        {label}
        {required && <span className="ml-1 text-owl-error">*</span>}
      </span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="block w-full rounded-owl-btn border border-owl-mist/30 bg-white px-4 py-3 text-owl-ink placeholder:text-owl-mist/60 focus:border-owl-teal focus:outline-none focus:ring-2 focus:ring-owl-teal/30"
    />
  );
}

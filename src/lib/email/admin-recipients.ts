/**
 * Canonical administrative email recipient resolver.
 *
 * All operational emails (daily publishing reports, failure alerts, queue
 * warnings, weekly statistics, Sunday newsletter summaries, import completion
 * reports, and any other cron/automation output) MUST be sent to every address
 * returned by this function.
 *
 * Configuration:
 *   Set REPORT_RECIPIENT_EMAILS in Vercel (or .env.local) to a comma-separated
 *   list of addresses.  Example:
 *     REPORT_RECIPIENT_EMAILS=rickoflv@gmail.com,larissapola777@gmail.com
 *
 *   If the env var is absent or empty the function falls back to the two
 *   required administrative recipients defined in DEFAULT_ADMIN_RECIPIENTS.
 *   Both addresses are always required — do not remove either one.
 *
 * Usage:
 *   import { resolveAdminRecipients } from "@/lib/email/admin-recipients";
 *   const to = resolveAdminRecipients();           // ["rick@...", "larissa@..."]
 *   await sendEmail({ to, subject, html, text });
 */

/** Both required administrative recipients.  Never remove either address. */
export const DEFAULT_ADMIN_RECIPIENTS: readonly string[] = [
  "rickoflv@gmail.com",
  "larissapola777@gmail.com",
];

/**
 * Return the resolved list of administrative email recipients.
 *
 * Resolution order:
 *  1. REPORT_RECIPIENT_EMAILS env var (comma-separated)
 *  2. DEFAULT_ADMIN_RECIPIENTS (hardcoded fallback)
 *
 * The returned list is de-duplicated, trimmed, and guaranteed to be non-empty.
 * Throws if the resolved list is empty (which should never happen given the
 * hardcoded fallback).
 */
export function resolveAdminRecipients(): string[] {
  const env = process.env.REPORT_RECIPIENT_EMAILS?.trim();

  if (env) {
    let parsed: string[] | null = null;
    try {
      const jsonParsed = JSON.parse(env);
      if (Array.isArray(jsonParsed)) parsed = jsonParsed as string[];
    } catch {
      // Not JSON — fall through to comma split
    }

    const addresses = (parsed ?? env.split(","))
      .map((s) => s.trim().toLowerCase())
      .filter((s) => s.length > 0 && s.includes("@"));

    if (addresses.length > 0) {
      return [...new Set(addresses)];
    }
  }

  return [...DEFAULT_ADMIN_RECIPIENTS];
}

/**
 * Validate that both required administrative recipients are present in the
 * resolved list.  Returns an array of missing addresses (empty = all present).
 */
export function getMissingRequiredRecipients(recipients: string[]): string[] {
  const normalised = recipients.map((r) => r.trim().toLowerCase());
  return DEFAULT_ADMIN_RECIPIENTS.filter(
    (required) => !normalised.includes(required.toLowerCase())
  );
}

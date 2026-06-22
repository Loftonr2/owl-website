/**
 * Low-level Resend email sender — SERVER ONLY.
 *
 * Never import this from a Client Component. It reads RESEND_API_KEY and
 * RESEND_FROM_EMAIL from the server environment and must run only inside route
 * handlers, server actions, or server components. (We use the documented REST
 * endpoint rather than the SDK so the field names are stable across versions
 * and match the rest of the store's server code.)
 *
 * Throws clear, actionable errors when configuration is missing so a
 * misconfiguration surfaces in logs instead of silently dropping mail.
 */

/** Support / reply-to inbox for the OWL store. */
export const SUPPORT_EMAIL = "hello@owlsingtogether.com";

const RESEND_ENDPOINT = "https://api.resend.com/emails";

export interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  /** Plain-text fallback. Required — every email must degrade gracefully. */
  text: string;
  replyTo?: string;
  /** Override the From header. Defaults to RESEND_FROM_EMAIL. */
  from?: string;
}

export interface SendEmailResult {
  id: string;
}

/**
 * Resolve the From header. A bare address (hello@owlsingtogether.com) is wrapped
 * with the OWL display name; a value that already contains "<...>" is used as-is.
 */
export function resolveFromAddress(explicit?: string): string {
  const raw = (explicit ?? process.env.RESEND_FROM_EMAIL ?? "").trim();
  if (!raw) {
    throw new Error(
      'RESEND_FROM_EMAIL is not configured. Set it to e.g. "OWL Sing Together <hello@owlsingtogether.com>".'
    );
  }
  return raw.includes("<") ? raw : `OWL Sing Together <${raw}>`;
}

/**
 * Send a single transactional email through Resend.
 * Resolves with the Resend message id, or throws with a descriptive message.
 */
export async function sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured. Confirmation emails cannot be sent.");
  }

  const from = resolveFromAddress(params.from);

  const res = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: Array.isArray(params.to) ? params.to : [params.to],
      subject: params.subject,
      html: params.html,
      text: params.text,
      reply_to: params.replyTo ?? SUPPORT_EMAIL,
    }),
  });

  const data = (await res.json().catch(() => ({}))) as {
    id?: string;
    message?: string;
    name?: string;
  };

  if (!res.ok) {
    throw new Error(
      `Resend send failed (${res.status}): ${data.message ?? data.name ?? "unknown error"}`
    );
  }
  if (!data.id) {
    throw new Error("Resend send succeeded but returned no message id.");
  }

  return { id: data.id };
}

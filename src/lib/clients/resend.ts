import { Resend } from "resend";

/**
 * Resend client (transactional email).
 * Newsletter broadcasts go through Beehiiv; this is for:
 *  - Welcome confirmation (double opt-in)
 *  - Printable download delivery
 *  - Order receipts + shipping notifications
 *  - Educator portal magic-link auth (Phase 3)
 *  - Inquiry auto-replies
 */

let _resend: Resend | null = null;

export function resend(): Resend {
  if (_resend) return _resend;
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error("resend() requires RESEND_API_KEY. Set it in .env.local.");
  }
  _resend = new Resend(key);
  return _resend;
}

export const EMAIL_FROM = {
  hello: "OWL Sing Together <hello@owlsingtogether.com>",
  orders: "OWL Orders <orders@owlsingtogether.com>",
  educator: "OWL for Educators <educators@owlsingtogether.com>",
} as const;

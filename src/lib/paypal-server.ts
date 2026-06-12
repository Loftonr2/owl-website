/**
 * PayPal Server Utilities
 * ── Server-side only. Never import this from client components. ──
 *
 * Reads PAYPAL_ENV to choose sandbox vs live endpoint.
 * Defaults to sandbox so test runs are safe.
 *
 * Required env vars:
 *   NEXT_PUBLIC_PAYPAL_CLIENT_ID  — PayPal app client ID (shared with frontend button)
 *   PAYPAL_CLIENT_SECRET          — PayPal app secret (server-only, never expose to client)
 *   PAYPAL_ENV                    — "sandbox" (default) | "live"
 */

export const PAYPAL_BASE =
  process.env.PAYPAL_ENV === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

/**
 * Exchange client credentials for a short-lived PayPal access token.
 * Tokens last ~9 hours; in production you'd cache them, but for low-volume
 * OWL orders fetching fresh per-request is fine.
 */
export async function getPayPalAccessToken(): Promise<string> {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? "";
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET ?? "";

  if (!clientId || !clientSecret) {
    throw new Error(
      "PayPal credentials not configured. " +
        "Set NEXT_PUBLIC_PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in Vercel → Settings → Environment Variables."
    );
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`PayPal token fetch failed (${res.status}): ${errText.slice(0, 200)}`);
  }

  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

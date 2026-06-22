/**
 * Beehiiv subscriptions client (newsletter signup).
 * Beehiiv doesn't ship an official Node SDK; we hit their REST API directly.
 * Used by:
 *  - /api/newsletter/subscribe — main public form submissions
 *  - The footer + homepage + printable-gate signup forms
 *  - The 7-segment routing (A1 Parents of Toddlers … A7 Gift Buyers)
 */

const BEEHIIV_API = "https://api.beehiiv.com/v2";

type SubscribePayload = {
  email: string;
  segments?: string[]; // A1..A7 + signup-source tags
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  referring_site?: string;
};

export async function beehiivSubscribe(payload: SubscribePayload) {
  const apiKey = process.env.BEEHIIV_API_KEY;
  const pubId = process.env.BEEHIIV_PUBLICATION_ID;
  if (!apiKey || !pubId) {
    throw new Error(
      "beehiivSubscribe() requires BEEHIIV_API_KEY and BEEHIIV_PUBLICATION_ID."
    );
  }

  const res = await fetch(`${BEEHIIV_API}/publications/${pubId}/subscriptions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      email: payload.email,
      reactivate_existing: false,
      send_welcome_email: true,
      utm_source: payload.utm_source ?? "website",
      utm_medium: payload.utm_medium ?? "form",
      utm_campaign: payload.utm_campaign,
      referring_site: payload.referring_site,
      custom_fields: payload.segments?.length
        ? [{ name: "segments", value: payload.segments.join(",") }]
        : undefined,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Beehiiv subscribe failed: ${res.status} ${text}`);
  }
  return (await res.json()) as { data: { id: string; email: string; status: string } };
}

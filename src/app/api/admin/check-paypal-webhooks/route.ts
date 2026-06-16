import { NextResponse } from "next/server";
import { getPayPalAccessToken, PAYPAL_BASE } from "@/lib/paypal-server";

const TARGET_URL = "https://www.owlsingtogether.com/api/webhooks/paypal";
const REQUIRED_EVENTS = ["CHECKOUT.ORDER.APPROVED","PAYMENT.CAPTURE.COMPLETED","PAYMENT.CAPTURE.DENIED","PAYMENT.CAPTURE.REFUNDED"];

export async function GET() {
  try {
    const token = await getPayPalAccessToken();
    const res = await fetch(`${PAYPAL_BASE}/v1/notifications/webhooks`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return NextResponse.json({ err: "list failed", status: res.status }, { status: 500 });
    const data = await res.json() as { webhooks: Array<{ id: string; url: string; event_types: Array<{ name: string }> }> };
    const vercelId = process.env.PAYPAL_WEBHOOK_ID ?? "";
    const owl = data.webhooks?.find(w => w.id === vercelId || w.url === TARGET_URL);
    const events = owl?.event_types?.map(e => e.name) ?? [];
    const missingEvents = REQUIRED_EVENTS.filter(e => !events.includes(e));
    return NextResponse.json({
      mode: process.env.PAYPAL_ENV ?? "sandbox",
      vercelWebhookId: vercelId,
      found: !!owl,
      webhookId: owl?.id ?? null,
      currentUrl: owl?.url ?? null,
      urlCorrect: owl?.url === TARGET_URL,
      targetUrl: TARGET_URL,
      events,
      missingEvents,
      idMatch: owl?.id === vercelId,
      allWebhooks: data.webhooks?.map(w => ({ id: w.id, url: w.url })) ?? [],
    });
  } catch (err) {
    return NextResponse.json({ err: String(err) }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { webhookId, url, addEvents } = await req.json() as { webhookId: string; url?: string; addEvents?: string[] };
    const token = await getPayPalAccessToken();
    const ops: object[] = [];
    if (url) ops.push({ op: "replace", path: "/url", value: url });
    if (addEvents?.length) ops.push({ op: "add", path: "/event_types", value: addEvents.map(n => ({ name: n })) });
    if (!ops.length) return NextResponse.json({ err: "no ops" }, { status: 400 });
    const res = await fetch(`${PAYPAL_BASE}/v1/notifications/webhooks/${webhookId}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(ops),
      cache: "no-store",
    });
    const result = await res.json();
    return NextResponse.json({ status: res.status, result });
  } catch (err) {
    return NextResponse.json({ err: String(err) }, { status: 500 });
  }
}

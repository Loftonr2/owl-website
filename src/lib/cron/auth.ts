import "server-only";
import { NextResponse } from "next/server";

/**
 * Authorize a cron invocation.
 *
 * Vercel Cron automatically sends `Authorization: Bearer <CRON_SECRET>` when the
 * CRON_SECRET env var is set. We also accept an `x-cron-secret` header for local
 * curl testing. Fails closed: if CRON_SECRET is unset, nothing is authorized.
 *
 * The secret is only ever compared, never logged or returned.
 */
export function isCronAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const auth = request.headers.get("authorization");
  if (auth && auth === `Bearer ${secret}`) return true;

  const headerSecret = request.headers.get("x-cron-secret");
  if (headerSecret && headerSecret === secret) return true;

  return false;
}

export function unauthorizedResponse() {
  return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
}

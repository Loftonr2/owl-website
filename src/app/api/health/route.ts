import { NextResponse } from "next/server";

/**
 * GET /api/health
 * Liveness probe. Returns 200 + a tiny JSON body. Hooked by uptime monitors.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "owl-website",
    timestamp: new Date().toISOString(),
  });
}

import { makeCronRoute } from "@/lib/cron/route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const handler = makeCronRoute("refresh-coupons");
export const GET = handler;
export const POST = handler;

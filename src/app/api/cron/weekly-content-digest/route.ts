import { makeCronRoute } from "@/lib/cron/route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const handler = makeCronRoute("weekly-content-digest");
export const GET = handler;
export const POST = handler;

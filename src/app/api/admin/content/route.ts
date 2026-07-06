/**
 * GET /api/admin/content
 * Returns all content_posts for the admin CRM (bypasses RLS via service role).
 * Accepts optional query params: content_type, status, category
 */

import { NextRequest, NextResponse } from "next/server";
import { adminGetAllPosts } from "@/lib/content-posts";
import type { ContentType, PostStatus } from "@/lib/content-posts";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const content_type = searchParams.get("content_type") as ContentType | null;
    const status = searchParams.get("status") as PostStatus | null;
    const category = searchParams.get("category") ?? undefined;

    const posts = await adminGetAllPosts({
      ...(content_type ? { content_type } : {}),
      ...(status ? { status } : {}),
      ...(category ? { category } : {}),
    });

    return NextResponse.json({ posts });
  } catch (err) {
    console.error("[/api/admin/content GET]", err);
    return NextResponse.json(
      { error: "Failed to fetch content posts" },
      { status: 500 }
    );
  }
}

/**
 * content-posts.ts
 * Data layer for blog posts and news articles stored in Supabase.
 * All public-facing queries enforce status = 'published'.
 * Admin queries use the service-role key and skip RLS.
 */

import { supabaseServer, supabaseServiceRole } from "@/lib/clients/supabase-server";

export type ContentType = "blog" | "news";
export type PostStatus = "draft" | "scheduled" | "published";

export interface ContentPost {
  id: string;
  content_type: ContentType;
  title: string;
  slug: string;
  category: string;
  excerpt: string | null;
  body: string | null;
  publish_date: string | null;
  status: PostStatus;
  author: string;
  seo_title: string | null;
  seo_description: string | null;
  featured_image: string | null;
  alert_sent: boolean;
  created_at: string;
  updated_at: string;
}

// ΓöÇΓöÇΓöÇ Public helpers (published only) ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

/**
 * Fetch published posts of a given type, newest first.
 * Optionally filter by category. Paginates at `limit`.
 */
export async function getPublishedPosts(
  type: ContentType,
  options: { category?: string; limit?: number; offset?: number } = {}
): Promise<ContentPost[]> {
  const supabase = await supabaseServer();
  let query = supabase
    .from("content_posts")
    .select("*")
    .eq("content_type", type)
    .eq("status", "published")
    .lte("publish_date", new Date().toISOString())
    .order("publish_date", { ascending: false });

  if (options.category) query = query.eq("category", options.category);
  if (options.limit) query = query.limit(options.limit);
  if (options.offset) query = query.range(options.offset, (options.offset ?? 0) + (options.limit ?? 10) - 1);

  const { data, error } = await query;
  if (error) {
    console.error("[content-posts] getPublishedPosts error:", error.message);
    return [];
  }
  return (data ?? []) as ContentPost[];
}

/**
 * Fetch a single published post by slug + type.
 */
export async function getPublishedPostBySlug(
  type: ContentType,
  slug: string
): Promise<ContentPost | null> {
  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("content_posts")
    .select("*")
    .eq("content_type", type)
    .eq("slug", slug)
    .eq("status", "published")
    .lte("publish_date", new Date().toISOString())
    .maybeSingle();

  if (error) {
    console.error("[content-posts] getPublishedPostBySlug error:", error.message);
    return null;
  }
  return data as ContentPost | null;
}

/**
 * Fetch all published slugs for static generation.
 */
export async function getPublishedSlugs(type: ContentType): Promise<string[]> {
  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("content_posts")
    .select("slug")
    .eq("content_type", type)
    .eq("status", "published")
    .lte("publish_date", new Date().toISOString());

  if (error) return [];
  return (data ?? []).map((r: { slug: string }) => r.slug);
}

// ΓöÇΓöÇΓöÇ Admin helpers (service role ΓÇö bypasses RLS) ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

/**
 * Fetch ALL posts (admin CRM).
 */
export async function adminGetAllPosts(filters?: {
  content_type?: ContentType;
  status?: PostStatus;
  category?: string;
}): Promise<ContentPost[]> {
  const supabase = supabaseServiceRole();
  let query = supabase
    .from("content_posts")
    .select("*")
    .order("publish_date", { ascending: true });

  if (filters?.content_type) query = query.eq("content_type", filters.content_type);
  if (filters?.status) query = query.eq("status", filters.status);
  if (filters?.category) query = query.eq("category", filters.category);

  const { data, error } = await query;
  if (error) {
    console.error("[content-posts] adminGetAllPosts error:", error.message);
    return [];
  }
  return (data ?? []) as ContentPost[];
}

/**
 * Update a post's fields (admin only).
 */
export async function adminUpdatePost(
  id: string,
  fields: Partial<Pick<ContentPost, "title" | "slug" | "category" | "excerpt" | "body" | "publish_date" | "status" | "author" | "seo_title" | "seo_description" | "featured_image">>
): Promise<{ success: boolean; error?: string }> {
  const supabase = supabaseServiceRole();
  const { error } = await supabase
    .from("content_posts")
    .update(fields)
    .eq("id", id);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

/**
 * Publish all scheduled posts whose publish_date Γëñ now.
 * Returns how many were published.
 */
export async function publishDuePosts(): Promise<number> {
  const supabase = supabaseServiceRole();
  const { data, error } = await supabase
    .from("content_posts")
    .update({ status: "published" })
    .eq("status", "scheduled")
    .lte("publish_date", new Date().toISOString())
    .select("id");

  if (error) {
    console.error("[content-posts] publishDuePosts error:", error.message);
    return 0;
  }
  return data?.length ?? 0;
}

/**
 * Count remaining scheduled posts per content_type.
 */
export async function getScheduledQueueCounts(): Promise<Record<ContentType, number>> {
  const supabase = supabaseServiceRole();
  const { data, error } = await supabase
    .from("content_posts")
    .select("content_type")
    .eq("status", "scheduled")
    .gt("publish_date", new Date().toISOString());

  if (error) return { blog: 0, news: 0 };

  const counts: Record<ContentType, number> = { blog: 0, news: 0 };
  for (const row of data ?? []) {
    counts[row.content_type as ContentType]++;
  }
  return counts;
}

/**
 * Mark alert_sent = true for a content_type to suppress duplicate low-queue emails.
 * Reset when new content is added (alert_sent = false).
 */
export async function setAlertSent(type: ContentType, sent: boolean): Promise<void> {
  const supabase = supabaseServiceRole();
  await supabase
    .from("content_posts")
    .update({ alert_sent: sent })
    .eq("content_type", type)
    .eq("status", "scheduled");
}

/**
 * Check whether a low-queue alert has already been sent for this type.
 * Returns true if ALL remaining scheduled posts have alert_sent = true.
 */
export async function isAlertAlreadySent(type: ContentType): Promise<boolean> {
  const supabase = supabaseServiceRole();
  const { data } = await supabase
    .from("content_posts")
    .select("alert_sent")
    .eq("content_type", type)
    .eq("status", "scheduled")
    .gt("publish_date", new Date().toISOString());

  if (!data || data.length === 0) return false;
  return data.every((r: { alert_sent: boolean }) => r.alert_sent === true);
}

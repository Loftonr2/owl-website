
import "server-only";
import { supabaseServer } from "@/lib/clients/supabase-server";
import { SEED_PRODUCTS } from "@/lib/seed/products";
import { siteConfig } from "@/lib/site-config";
import type { NewsletterIssueData, NewsletterArticleCard } from "@/components/marketing/newsletter-template";

/**
 * resolveNewsletterIssue
 * ──────────────────────
 * Fetches a newsletter_campaign by archive_slug and assembles NewsletterIssueData:
 *  - Merges issue fields from the campaign row
 *  - Resolves news articles (manual picks or auto-3)
 *  - Resolves blog posts (manual picks or auto-3)
 *  - Resolves promoted product image from seed catalog
 */
export async function resolveNewsletterIssue(
  archiveSlug: string
): Promise<NewsletterIssueData | null> {
  const supabase = await supabaseServer();

  const { data: campaign } = await supabase
    .from("newsletter_campaigns")
    .select("*")
    .eq("archive_slug", archiveSlug)
    .in("status", ["published", "sent", "draft", "scheduled"])
    .maybeSingle();

  if (!campaign) return null;

  // ── Resolve news articles ────────────────────────────────────────────────
  let newsArticles: NewsletterArticleCard[] = [];
  if (campaign.news_mode === "manual") {
    const { data: picks } = await supabase
      .from("newsletter_issue_news")
      .select("display_order, content_posts!inner(id,title,slug,category,excerpt,featured_image)")
      .eq("newsletter_campaign_id", campaign.id)
      .order("display_order");
    type NLNewsRow = { display_order: number; content_posts: { title: string; slug: string; category: string; excerpt: string | null; featured_image: string | null } };
    newsArticles = ((picks ?? []) as unknown as NLNewsRow[]).map(({ content_posts: p }) => ({
      image_url: p.featured_image ?? null,
      category: p.category,
      title: p.title,
      excerpt: p.excerpt ?? null,
      href: `/news/${p.slug}`,
    }));
  }
  if (newsArticles.length < 3) {
    const { data: auto } = await supabase
      .from("content_posts")
      .select("title,slug,category,excerpt,featured_image")
      .eq("content_type", "news")
      .eq("status", "published")
      .order("publish_date", { ascending: false })
      .limit(3 - newsArticles.length);
    newsArticles = [
      ...newsArticles,
      ...(auto ?? []).map((p) => ({
        image_url: p.featured_image ?? null,
        category: p.category,
        title: p.title,
        excerpt: p.excerpt ?? null,
        href: `/news/${p.slug}`,
      })),
    ];
  }

  // ── Resolve blog posts ───────────────────────────────────────────────────
  let blogPosts: NewsletterArticleCard[] = [];
  if (campaign.blog_mode === "manual") {
    const { data: picks } = await supabase
      .from("newsletter_issue_blogs")
      .select("display_order, content_posts!inner(title,slug,category,excerpt,featured_image)")
      .eq("newsletter_campaign_id", campaign.id)
      .order("display_order");
    type NLBlogRow = { display_order: number; content_posts: { title: string; slug: string; category: string; excerpt: string | null; featured_image: string | null } };
    blogPosts = ((picks ?? []) as unknown as NLBlogRow[]).map(({ content_posts: p }) => ({
      image_url: p.featured_image ?? null,
      category: p.category,
      title: p.title,
      excerpt: p.excerpt ?? null,
      href: `/blog/${p.slug}`,
    }));
  }
  if (blogPosts.length < 3) {
    const { data: auto } = await supabase
      .from("content_posts")
      .select("title,slug,category,excerpt,featured_image")
      .eq("content_type", "blog")
      .eq("status", "published")
      .order("publish_date", { ascending: false })
      .limit(3 - blogPosts.length);
    blogPosts = [
      ...blogPosts,
      ...(auto ?? []).map((p) => ({
        image_url: p.featured_image ?? null,
        category: p.category,
        title: p.title,
        excerpt: p.excerpt ?? null,
        href: `/blog/${p.slug}`,
      })),
    ];
  }

  // ── Resolve promo product image ──────────────────────────────────────────
  let promoProductImage: string | null = null;
  let promoProductTitle: string | null = null;
  if (campaign.promo_product_slug) {
    const seedProduct = SEED_PRODUCTS.find((p) => p.slug === campaign.promo_product_slug);
    if (seedProduct) {
      promoProductTitle = seedProduct.title;
      // Try the standard public image path
      promoProductImage = `/images/products/${campaign.promo_product_slug}.jpg`;
    }
  }

  // ── Format publication date ───────────────────────────────────────────────
  const pubDate = campaign.publication_date
    ? new Date(campaign.publication_date + "T12:00:00Z").toLocaleDateString("en-US", {
        weekday: "long", year: "numeric", month: "long", day: "numeric",
        timeZone: "America/New_York",
      })
    : "";

  return {
    issue_number: campaign.issue_number ?? 1,
    publication_date: pubDate,
    title: campaign.title,
    note_title: campaign.note_title ?? "A Note from OWL",
    note_body: campaign.note_body ?? "",
    note_image_url: campaign.note_image_url ?? null,
    note_button_label: campaign.note_button_label ?? null,
    note_button_url: campaign.note_button_url ?? null,
    promo_headline: campaign.promo_headline ?? null,
    promo_subheading: campaign.promo_subheading ?? null,
    promo_product_slug: campaign.promo_product_slug ?? null,
    promo_product_title: promoProductTitle,
    promo_product_image: promoProductImage,
    promo_discount_pct: campaign.promo_discount_pct ?? 15,
    promo_button_label: campaign.promo_button_label ?? "Shop the Store",
    promo_button_url: campaign.promo_button_url ?? `${siteConfig.url}/shop`,
    tip_title: campaign.tip_title ?? null,
    tip_body: campaign.tip_body ?? null,
    tip_age_range: campaign.tip_age_range ?? null,
    tip_takeaway: campaign.tip_takeaway ?? null,
    tip_illustration_url: campaign.tip_illustration_url ?? null,
    health_alert_title: campaign.health_alert_title ?? null,
    health_alert_body: campaign.health_alert_body ?? null,
    health_alert_url: campaign.health_alert_url ?? null,
    health_alert_product_name: campaign.health_alert_product_name ?? null,
    health_alert_brand: campaign.health_alert_brand ?? null,
    health_alert_recall_date: campaign.health_alert_recall_date ?? null,
    health_alert_source_name: campaign.health_alert_source_name ?? null,
    news_articles: newsArticles,
    blog_posts: blogPosts,
    utm_campaign: `owl_weekly_issue_${campaign.issue_number ?? 1}`,
  };
}

/**
 * getPublishedNewsletterIssues
 * ─────────────────────────────
 * Used by the archive listing page.
 */
export async function getPublishedNewsletterIssues() {
  const supabase = await supabaseServer();
  const { data } = await supabase
    .from("newsletter_campaigns")
    .select(
      "id,issue_number,archive_slug,title,publication_date,status,promo_product_slug,recipients_count,open_count,click_count"
    )
    .not("issue_number", "is", null)
    .in("status", ["published", "sent"])
    .order("issue_number", { ascending: false });
  return data ?? [];
}

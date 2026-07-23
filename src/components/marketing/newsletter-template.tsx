
"use client";

/**
 * OWL Weekly Newsletter Template
 * ─────────────────────────────────────────────────────────────────────────────
 * Renders the weekly issue as:
 *  1. A responsive web page (React component, with Tailwind)
 *  2. Email-safe HTML (via generateNewsletterHtml() — table-based, inline CSS)
 *
 * Props are typed by NewsletterIssueData. Passed in by:
 *  - /newsletter/[slug]/page.tsx  (web view)
 *  - /api/newsletter/preview route (preview in CRM)
 *  - send-newsletter cron job (generates html_body)
 */

import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface NewsletterArticleCard {
  image_url: string | null;
  category: string;
  title: string;
  excerpt: string | null;
  href: string;
}

export interface NewsletterIssueData {
  // Header
  issue_number: number;
  publication_date: string; // e.g. "Sunday, July 26, 2026"
  title: string;

  // Note from OWL
  note_title: string;
  note_body: string;
  note_image_url?: string | null;
  note_button_label?: string | null;
  note_button_url?: string | null;

  // Store promotion
  promo_headline?: string | null;
  promo_subheading?: string | null;
  promo_product_slug?: string | null;
  promo_product_title?: string | null;
  promo_product_image?: string | null;
  promo_discount_pct?: number;
  promo_button_label?: string;
  promo_button_url?: string;

  // Parenting tip (optional)
  tip_title?: string | null;
  tip_body?: string | null;
  tip_age_range?: string | null;

  // Health alert (optional)
  health_alert_title?: string | null;
  health_alert_body?: string | null;
  health_alert_url?: string | null;

  // Content
  news_articles: NewsletterArticleCard[];
  blog_posts: NewsletterArticleCard[];

  // Branding
  utm_campaign?: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function utm(url: string, campaign: string): string {
  const u = url.startsWith("http") ? url : `${siteConfig.url}${url}`;
  const sep = u.includes("?") ? "&" : "?";
  return `${u}${sep}utm_source=owl_weekly&utm_medium=email&utm_campaign=${campaign}`;
}

function categoryColor(category: string): string {
  const map: Record<string, string> = {
    "newborn care": "#0da89f",
    "baby sleep": "#146b44",
    nutrition: "#d97706",
    parenting: "#e95b6e",
    activities: "#0da89f",
    "family life": "#7c3aed",
    "child development": "#0da89f",
    music: "#146b44",
  };
  return map[category.toLowerCase()] ?? "#0da89f";
}

// ── Web component ─────────────────────────────────────────────────────────────

export function NewsletterTemplate({ data }: { data: NewsletterIssueData }) {
  const campaign = data.utm_campaign ?? `owl_weekly_issue_${data.issue_number}`;
  const shopUrl = utm(data.promo_button_url ?? "/shop", campaign);
  const newsUrl = utm("/news", campaign);
  const blogUrl = utm("/blog", campaign);

  return (
    <div className="mx-auto max-w-[680px] bg-white font-sans text-[#1a1a2e]">

      {/* ── HEADER ── */}
      <div
        className="relative overflow-hidden rounded-t-2xl px-6 pb-6 pt-5"
        style={{ background: "linear-gradient(135deg, #e8f9f8 0%, #f0fbf9 60%, #fff8ec 100%)" }}
      >
        {/* Wave top accent */}
        <div
          className="absolute inset-x-0 top-0 h-3 rounded-t-2xl"
          style={{ background: "linear-gradient(90deg, #0da89f 0%, #14b8a6 50%, #0da89f 100%)" }}
        />
        <div className="mt-3 flex flex-col items-center gap-2 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          {/* Mascot + brand */}
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <Image
                src="/images/brand/owl-mascot.png"
                alt="OWL Mascot"
                width={72}
                height={72}
                className="h-16 w-16 object-contain drop-shadow-sm sm:h-[72px] sm:w-[72px]"
              />
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="font-display text-4xl font-extrabold" style={{ color: "#1a1a2e" }}>
                  O<span style={{ color: "#0da89f" }}>W</span>L
                </span>
                <span
                  className="font-display text-2xl font-bold italic"
                  style={{ color: "#1a1a2e" }}
                >
                  {" "}Weekly
                </span>
              </div>
              <p className="mt-0.5 text-sm font-medium" style={{ color: "#4b5563" }}>
                Inspire. Educate. Together.
              </p>
            </div>
          </div>
          {/* Issue badge + date */}
          <div className="flex flex-col items-center gap-1 sm:items-end">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold text-white"
              style={{ background: "#e95b6e" }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              Issue #{data.issue_number}
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              {data.publication_date}
            </span>
          </div>
        </div>
      </div>

      {/* ── NOTE FROM OWL ── */}
      <div className="mx-3 mt-4 rounded-xl border border-[#e2f7f6] bg-white p-5 shadow-sm">
        <div className="flex items-start gap-4">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
            style={{ background: "#e2f7f6" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0da89f" strokeWidth="2.2" aria-hidden><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </div>
          <div className="flex-1">
            <h2 className="font-display text-lg font-bold text-[#1a1a2e]">{data.note_title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">{data.note_body}</p>
            {data.note_button_label && data.note_button_url && (
              <Link
                href={utm(data.note_button_url, campaign)}
                className="mt-3 inline-block rounded-full px-4 py-1.5 text-sm font-semibold text-white"
                style={{ background: "#0da89f" }}
              >
                {data.note_button_label}
              </Link>
            )}
          </div>
          {data.note_image_url && (
            <div className="hidden shrink-0 sm:block">
              <Image
                src={data.note_image_url}
                alt=""
                width={72}
                height={72}
                className="h-16 w-16 rounded-full border-2 border-[#e2f7f6] object-cover"
              />
            </div>
          )}
        </div>
      </div>

      {/* ── STORE PROMO + PARENTING TIP (side by side on desktop) ── */}
      <div className="mx-3 mt-4 flex flex-col gap-4 sm:flex-row">

        {/* Store Promo */}
        {data.promo_headline && (
          <div
            className="flex-1 rounded-xl p-5 text-white"
            style={{ background: "linear-gradient(135deg, #0da89f 0%, #0f9e96 100%)" }}
          >
            <p className="font-display text-sm font-semibold text-teal-100">{data.promo_headline}</p>
            {data.promo_product_image && (
              <div className="my-3 flex items-center gap-3">
                <Image
                  src={data.promo_product_image}
                  alt={data.promo_product_title ?? "Featured product"}
                  width={64}
                  height={64}
                  className="h-14 w-14 rounded-lg bg-white/20 object-contain p-1"
                />
                <div className="flex flex-col">
                  <span
                    className="font-display text-4xl font-black leading-none"
                    style={{ color: "#fbbf24" }}
                  >
                    {data.promo_discount_pct ?? 15}% Off
                  </span>
                  {data.promo_subheading && (
                    <span className="mt-1 text-xs text-teal-100">{data.promo_subheading}</span>
                  )}
                </div>
              </div>
            )}
            {!data.promo_product_image && (
              <div
                className="my-3 font-display text-5xl font-black leading-none"
                style={{ color: "#fbbf24" }}
              >
                {data.promo_discount_pct ?? 15}% Off
              </div>
            )}
            <div className="mt-1 mb-3 inline-block rounded-full bg-white/20 px-3 py-0.5 text-xs font-bold text-white">
              Use code: OWLWEEKLY{data.promo_discount_pct ?? 15}
            </div>
            <div>
              <Link
                href={shopUrl}
                className="inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-bold"
                style={{ background: "#1a1a2e", color: "#ffffff" }}
              >
                {data.promo_button_label ?? "Shop the Store"}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
            </div>
          </div>
        )}

        {/* Parenting Tip */}
        {data.tip_title && (
          <div
            className="flex-1 rounded-xl p-5"
            style={{ background: "#fefce8", border: "1px solid #fde68a" }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-full"
                  style={{ background: "#fbbf24" }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="white" aria-hidden><path d="M12 2a7 7 0 0 1 7 7c0 3.5-2.3 6.4-5.5 7.3V18a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-1.7C7.3 15.4 5 12.5 5 9a7 7 0 0 1 7-7zm-1 19h2v1.5a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5V21z"/></svg>
                </span>
                <p className="font-display text-sm font-bold text-[#1a1a2e]">Parenting Tip<br />of the Week</p>
              </div>
              {data.tip_age_range && (
                <span
                  className="rounded-full px-2.5 py-1 text-[10px] font-bold text-white"
                  style={{ background: "#0da89f" }}
                >
                  Ages: {data.tip_age_range}
                </span>
              )}
            </div>
            <h3 className="mt-3 font-display text-sm font-bold" style={{ color: "#0da89f" }}>
              {data.tip_title}
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-gray-600">{data.tip_body}</p>
            <p className="mt-3 text-[11px] font-medium" style={{ color: "#e95b6e" }}>
              ♥ Consistency + Connection = Confidence
            </p>
          </div>
        )}
      </div>

      {/* ── HEALTH ALERT ── */}
      {data.health_alert_title && (
        <div className="mx-3 mt-4 rounded-xl border border-[#fecaca] bg-[#fef2f2] p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#fee2e2]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" aria-hidden><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </span>
            <p className="font-display text-sm font-bold text-[#1a1a2e]">{data.health_alert_title}</p>
          </div>
          <div className="ml-10 rounded-lg border border-[#fca5a5] bg-white p-3">
            <div className="flex items-start gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2.5" className="mt-0.5 shrink-0" aria-hidden><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              <div className="flex-1">
                <p className="text-xs text-gray-600">{data.health_alert_body}</p>
              </div>
              {data.health_alert_url && (
                <Link
                  href={utm(data.health_alert_url, campaign)}
                  className="shrink-0 rounded-full px-3 py-1 text-xs font-bold text-white"
                  style={{ background: "#e95b6e" }}
                >
                  Read Alert →
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── LATEST NEWS ── */}
      {data.news_articles.length > 0 && (
        <div className="mx-3 mt-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="flex h-8 w-8 items-center justify-center rounded-full"
                style={{ background: "#0da89f" }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" aria-hidden><path d="M22 4s-3 8-11 8S0 4 0 4"/><polyline points="8,16 12,12 16,16"/></svg>
              </span>
              <h2 className="font-display text-lg font-bold text-[#1a1a2e]">Latest News</h2>
            </div>
            <Link
              href={newsUrl}
              className="text-xs font-semibold"
              style={{ color: "#0da89f" }}
            >
              View all news →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {data.news_articles.slice(0, 3).map((article, i) => (
              <ArticleCard key={i} article={article} campaign={campaign} />
            ))}
          </div>
        </div>
      )}

      {/* ── LATEST FROM THE BLOG ── */}
      {data.blog_posts.length > 0 && (
        <div className="mx-3 mt-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="flex h-8 w-8 items-center justify-center rounded-full"
                style={{ background: "#7c3aed" }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" aria-hidden><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
              </span>
              <h2 className="font-display text-lg font-bold text-[#1a1a2e]">Latest from the Blog</h2>
            </div>
            <Link
              href={blogUrl}
              className="text-xs font-semibold"
              style={{ color: "#7c3aed" }}
            >
              View all blog posts →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {data.blog_posts.slice(0, 3).map((post, i) => (
              <ArticleCard key={i} article={post} campaign={campaign} />
            ))}
          </div>
        </div>
      )}

      {/* ── FOOTER ── */}
      <div
        className="mx-3 mb-3 mt-6 rounded-xl p-5 text-center"
        style={{ background: "linear-gradient(135deg, #e8f9f8 0%, #f0fbf9 100%)", border: "1px solid #ccf2ef" }}
      >
        <div className="flex items-center justify-center gap-3">
          <Image
            src="/images/brand/owl-mascot.png"
            alt="OWL mascot"
            width={40}
            height={40}
            className="h-10 w-10 object-contain"
          />
          <div className="text-left">
            <p className="font-display text-sm font-bold text-[#1a1a2e]">
              Thanks for being part of the OWL family!
            </p>
          </div>
        </div>

        {/* Social icons */}
        <div className="mt-4 flex items-center justify-center gap-3">
          <p className="text-xs text-gray-500">Follow us for daily tips, updates &amp; more!</p>
          {[
            { href: siteConfig.social.facebook, label: "Facebook", color: "#1877f2", d: "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" },
            { href: siteConfig.social.instagram, label: "Instagram", color: "#e1306c", d: "M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z M17.5 6.5h.01" },
            { href: siteConfig.social.youtube, label: "YouTube", color: "#ff0000", d: "M22.54 6.42a2.78 2.78 0 0 0-1.95-1.95C18.88 4 12 4 12 4s-6.88 0-8.59.47a2.78 2.78 0 0 0-1.95 1.95A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.5C5.12 20 12 20 12 20s6.88 0 8.59-.47a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" },
            { href: siteConfig.social.pinterest, label: "Pinterest", color: "#e60023", d: "M12 2C6.477 2 2 6.477 2 12c0 4.236 2.636 7.855 6.356 9.312-.088-.791-.167-2.005.035-2.868.181-.78 1.172-4.97 1.172-4.97s-.299-.598-.299-1.482c0-1.388.806-2.428 1.808-2.428.852 0 1.265.64 1.265 1.408 0 .858-.546 2.14-.828 3.33-.236.995.499 1.806 1.476 1.806 1.772 0 3.137-1.868 3.137-4.565 0-2.387-1.715-4.056-4.164-4.056-2.836 0-4.5 2.127-4.5 4.326 0 .856.33 1.773.741 2.274a.3.3 0 0 1 .069.284c-.076.31-.243.995-.276 1.134-.044.183-.145.221-.334.133-1.249-.581-2.03-2.407-2.03-3.874 0-3.154 2.292-6.052 6.608-6.052 3.469 0 6.165 2.473 6.165 5.776 0 3.447-2.173 6.22-5.19 6.22-1.013 0-1.966-.527-2.292-1.148l-.623 2.378c-.226.869-.835 1.958-1.244 2.621.937.29 1.931.446 2.962.446C17.523 22 22 17.523 22 12S17.523 2 12 2z" },
          ].map((s) => (
            <a key={s.label} href={s.href} aria-label={s.label} className="flex h-8 w-8 items-center justify-center rounded-full text-white transition-opacity hover:opacity-80" style={{ background: s.color }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d={s.d}/></svg>
            </a>
          ))}
        </div>

        {/* Brand tagline */}
        <p className="mt-3 font-display text-xs font-bold italic" style={{ color: "#0da89f" }}>
          Sing. Learn. Grow. Together.
        </p>

        {/* Legal / compliance */}
        <div className="mt-4 space-x-2 text-[10px] text-gray-400">
          <span>You&apos;re receiving this because you&apos;re part of the OWL family.</span>
        </div>
        <div className="mt-1 space-x-3 text-[10px]">
          <Link href={utm("/newsletter", campaign)} className="underline" style={{ color: "#0da89f" }}>View in browser</Link>
          <Link href="/portal/settings" className="underline text-gray-400">Manage Preferences</Link>
          <Link href="/api/newsletter/unsubscribe" className="underline text-gray-400">Unsubscribe</Link>
          <Link href="/contact" className="underline text-gray-400">Privacy</Link>
          <Link href="/" className="underline text-gray-400">owlsingtogether.com</Link>
        </div>
        <p className="mt-2 text-[10px] text-gray-400">
          OWL Sing Together · hello@owlsingtogether.com
        </p>
      </div>
    </div>
  );
}

// ── Article card sub-component ────────────────────────────────────────────────

function ArticleCard({ article, campaign }: { article: NewsletterArticleCard; campaign: string }) {
  const href = utm(article.href, campaign);
  const catColor = categoryColor(article.category);
  return (
    <a
      href={href}
      className="group block overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      {article.image_url ? (
        <div className="relative h-28 w-full overflow-hidden bg-gray-100">
          <Image
            src={article.image_url}
            alt={article.title}
            fill
            sizes="(min-width: 640px) 33vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <span
            className="absolute left-2 top-2 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white"
            style={{ background: catColor }}
          >
            {article.category}
          </span>
        </div>
      ) : (
        <div className="flex h-10 items-center px-3 py-2">
          <span
            className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white"
            style={{ background: catColor }}
          >
            {article.category}
          </span>
        </div>
      )}
      <div className="p-3">
        <p className="font-display text-sm font-bold leading-snug text-[#1a1a2e] line-clamp-2">
          {article.title}
        </p>
        {article.excerpt && (
          <p className="mt-1 text-xs leading-relaxed text-gray-500 line-clamp-2">{article.excerpt}</p>
        )}
        <p className="mt-2 text-xs font-semibold" style={{ color: catColor }}>
          Read More →
        </p>
      </div>
    </a>
  );
}

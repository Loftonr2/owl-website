/**
 * NewsCard
 * Compact article card used in 5-column grids on the News and Blog pages.
 *
 * Design spec (News/Blog mockup):
 *  - 16:10 thumbnail image (fills the top of the card)
 *  - Color-coded category pill (small, rounded-full)
 *  - Bold title, 2-line clamp
 *  - Calendar icon + formatted date at the bottom
 *  - Subtle border + shadow; lifts 4px on hover
 *
 * The optional `href` prop lets the Blog page reuse this card component
 * with links to /blog/{slug} instead of the default /news/{slug}.
 */
import Link from "next/link";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/cn";
import type { UINewsCategory } from "@/lib/news-categories";

export interface NewsCardProps {
  slug: string;
  title: string;
  publishedAt: string;
  featuredImage: string;
  category: UINewsCategory;
  /**
   * Explicit link destination. Defaults to /news/{slug}.
   * Pass /blog/{slug} when reusing this card on the Blog page.
   */
  href?: string;
  className?: string;
}

export function NewsCard({
  slug,
  title,
  publishedAt,
  featuredImage,
  category,
  href,
  className,
}: NewsCardProps) {
  const linkHref = href ?? `/news/${slug}`;

  // publishedAt is a Postgres timestamptz serialized as e.g.
  // "2026-07-14 00:00:00+00" or "2026-07-14T00:00:00+00:00" -- almost
  // always midnight UTC. Formatting that directly with toLocaleDateString
  // renders the PREVIOUS calendar day once the client's timezone is behind
  // UTC, and disagrees with the server's own render of the same string --
  // a hydration text mismatch (React error #418) in addition to showing
  // the wrong date. We only care about the calendar day, so pull the
  // YYYY-MM-DD prefix out of whatever format we're given and re-anchor it
  // at local noon; that date then renders identically on server and
  // client regardless of either side's timezone.
  const dateOnlyMatch = publishedAt.match(/^(\d{4}-\d{2}-\d{2})/);
  const dateStr = new Date(dateOnlyMatch ? `${dateOnlyMatch[1]}T12:00:00` : publishedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Link
      href={linkHref}
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl bg-white",
        "border border-neutral-100 shadow-sm",
        "transition-all duration-300 hover:-translate-y-1 hover:shadow-md",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-owl-teal focus-visible:ring-offset-2",
        className
      )}
    >
      {/* Thumbnail */}
      <div className="aspect-[16/10] overflow-hidden bg-neutral-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={featuredImage}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-2 p-3">
        {/* Category pill */}
        <span
          className="inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
          style={{ backgroundColor: category.pillBg, color: category.pillText }}
        >
          {category.label}
        </span>

        {/* Title */}
        <p className="font-display text-sm font-bold leading-snug text-owl-ink line-clamp-2 flex-1">
          {title}
        </p>

        {/* Date */}
        <div className="flex items-center gap-1 text-[11px] text-owl-mist">
          <Calendar className="h-3 w-3 shrink-0" aria-hidden />
          <time dateTime={publishedAt}>{dateStr}</time>
        </div>
      </div>
    </Link>
  );
}

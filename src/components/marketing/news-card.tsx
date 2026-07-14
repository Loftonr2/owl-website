/**
 * NewsCard
 * Compact article card used in the 5-column "Latest News" grid.
 *
 * Design spec (News page mockup):
 *  - 16:10 thumbnail image (fills the top of the card)
 *  - Color-coded category pill (small, rounded-full)
 *  - Bold title, 2-line clamp
 *  - Calendar icon + formatted date at the bottom
 *  - Subtle border + shadow; lifts 4px on hover
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
  className?: string;
}

export function NewsCard({
  slug,
  title,
  publishedAt,
  featuredImage,
  category,
  className,
}: NewsCardProps) {
  const dateStr = new Date(publishedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Link
      href={`/news/${slug}`}
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
          alt=""
          aria-hidden
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

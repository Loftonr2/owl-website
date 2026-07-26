import Link from "next/link";
import { Chip } from "@/components/ui/chip";
import { resolveContentCardImage } from "@/lib/content-images";

export type BlogCardProps = {
  slug: string;
  title: string;
  summary: string;
  categoryName: string;
  /** Category slug - used to pick a fallback image when featuredImage is absent. */
  category?: string;
  publishedAt: string;
  tone: "teal" | "amber" | "forest" | "rose" | "mist" | "cream";
  featuredImage?: string | null;
  readTime?: number | null;
  /** When true the card links to /news/[slug] instead of /blog/[slug] */
  contentType?: "blog" | "news";
};

export function BlogCard({
  slug,
  title,
  summary,
  categoryName,
  category,
  publishedAt,
  tone: _tone,
  featuredImage,
  readTime,
  contentType = "blog",
}: BlogCardProps) {
  const href = contentType === "news" ? `/news/${slug}` : `/blog/${slug}`;

  // Always resolve to a real image — never a page header or hero banner.
  const imageSrc = resolveContentCardImage({
    slug,
    featured_image: featuredImage ?? null,
    category: category ?? "",
    content_type: contentType,
  });

  return (
    <Link
      href={href}
      className="group flex h-full flex-col overflow-hidden rounded-owl-card border border-owl-cream-deep bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-owl-2"
    >
      {/* Thumbnail - always shows a real image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageSrc}
        alt={title}
        className="aspect-[16/9] w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
      />

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <Chip intent="teal" className="w-fit text-[11px]">{categoryName}</Chip>
        <h3 className="mt-3 font-display text-base font-semibold leading-snug text-owl-ink transition-colors duration-150 group-hover:text-owl-teal line-clamp-2">
          {title}
        </h3>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-owl-mist">{summary}</p>

        <div className="mt-auto flex items-center justify-between pt-4">
          <p className="text-xs text-owl-mist/80">
            {new Date(publishedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
          {readTime != null && (
            <p className="text-xs text-owl-mist/70">{readTime} min read</p>
          )}
        </div>

        <span className="mt-3 text-xs font-semibold text-owl-teal opacity-0 transition-opacity duration-150 group-hover:opacity-100">
          Read more &rarr;
        </span>
      </div>
    </Link>
  );
}

/** Utility: estimate read time from body text (~200 wpm). */
export function estimateReadTime(body: string | null | undefined): number {
  if (!body) return 1;
  const words = body.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

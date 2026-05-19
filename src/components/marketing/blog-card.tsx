import Link from "next/link";
import { Chip } from "@/components/ui/chip";

export type BlogCardProps = {
  slug: string;
  title: string;
  summary: string;
  categoryName: string;
  publishedAt: string;
  tone: "teal" | "amber" | "forest" | "rose" | "mist" | "cream";
};

const toneBg: Record<BlogCardProps["tone"], string> = {
  teal: "bg-owl-teal/15",
  amber: "bg-owl-amber-soft/40",
  forest: "bg-owl-forest/15",
  rose: "bg-owl-rose/25",
  mist: "bg-owl-mist/20",
  cream: "bg-owl-cream-deep",
};

export function BlogCard({
  slug,
  title,
  summary,
  categoryName,
  publishedAt,
  tone,
}: BlogCardProps) {
  return (
    <Link
      href={`/blog/${slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-owl-card border border-owl-cream-deep bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className={`flex aspect-[16/9] items-center justify-center ${toneBg[tone]}`}>
        <span className="font-display text-3xl font-bold text-owl-ink/30">
          {title.charAt(0)}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <Chip intent="teal" className="w-fit">{categoryName}</Chip>
        <h3 className="mt-3 font-display text-lg font-semibold leading-tight text-owl-ink">
          {title}
        </h3>
        <p className="mt-2 line-clamp-3 text-sm text-owl-mist">{summary}</p>
        <p className="mt-auto pt-4 text-xs text-owl-mist">
          {new Date(publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </p>
      </div>
    </Link>
  );
}

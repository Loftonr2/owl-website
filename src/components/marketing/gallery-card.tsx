import { cn } from "@/lib/cn";

export type GalleryCardProps = {
  title: string;
  caption?: string;
  collection: string;
  tone: "teal" | "amber" | "forest" | "rose" | "mist" | "cream";
  span?: "default" | "wide" | "tall";
};

const toneBg: Record<GalleryCardProps["tone"], string> = {
  teal: "bg-owl-teal/15",
  amber: "bg-owl-amber-soft/40",
  forest: "bg-owl-forest/15",
  rose: "bg-owl-rose/25",
  mist: "bg-owl-mist/20",
  cream: "bg-owl-cream-deep",
};

const span: Record<NonNullable<GalleryCardProps["span"]>, string> = {
  default: "",
  wide: "md:col-span-2",
  tall: "md:row-span-2",
};

export function GalleryCard({
  title,
  caption,
  collection,
  tone,
  span: spanKind = "default",
}: GalleryCardProps) {
  return (
    <figure
      className={cn(
        "group flex flex-col overflow-hidden rounded-owl-card border border-owl-cream-deep bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md",
        span[spanKind]
      )}
    >
      <div className={`flex flex-1 items-center justify-center p-10 ${toneBg[tone]}`}>
        <span className="font-display text-3xl font-bold text-owl-ink/30">
          {title.charAt(0)}
        </span>
      </div>
      <figcaption className="p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-owl-mist">
          {collection}
        </p>
        <p className="mt-1 font-display text-sm font-semibold leading-tight text-owl-ink">
          {title}
        </p>
        {caption && <p className="mt-1 text-xs text-owl-mist">{caption}</p>}
      </figcaption>
    </figure>
  );
}

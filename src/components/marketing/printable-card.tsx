import Image from "next/image";
import Link from "next/link";
import { Download, FileText } from "lucide-react";
import { Chip } from "@/components/ui/chip";
import { cn } from "@/lib/cn";

export type PrintableCardProps = {
  slug: string;
  title: string;
  ageRange: string;
  pages: number;
  freeOrPaid: "free" | "paid";
  price?: string;
  skill: string;
  tone: "teal" | "amber" | "forest" | "rose" | "mist" | "cream";
  /** Optional cover-page preview image (generated from PDF page 1). */
  previewSrc?: string;
  /** If set, the card shows a Download button pointing to this URL instead of linking to /printables/:slug. */
  downloadHref?: string;
};

const toneStyles: Record<
  PrintableCardProps["tone"],
  { bg: string; bar: string; badgeBg: string; badgeText: string; icon: string }
> = {
  teal: {
    bg: "bg-gradient-to-br from-[#e5f8f4] via-[#f0faf7] to-[#fff8ec]",
    bar: "bg-owl-teal",
    badgeBg: "bg-owl-teal",
    badgeText: "text-white",
    icon: "bg-owl-teal/15 text-owl-teal",
  },
  amber: {
    bg: "bg-gradient-to-br from-[#fef3d8] via-[#fdf7eb] to-[#fff8ec]",
    bar: "bg-owl-amber",
    badgeBg: "bg-owl-amber",
    badgeText: "text-white",
    icon: "bg-owl-amber/20 text-owl-amber",
  },
  forest: {
    bg: "bg-gradient-to-br from-[#dff0e6] via-[#eef6f1] to-[#fff8ec]",
    bar: "bg-owl-forest",
    badgeBg: "bg-owl-forest",
    badgeText: "text-white",
    icon: "bg-owl-forest/15 text-owl-forest",
  },
  rose: {
    bg: "bg-gradient-to-br from-[#fce8e4] via-[#fdf3f1] to-[#fff8ec]",
    bar: "bg-owl-rose",
    badgeBg: "bg-owl-rose",
    badgeText: "text-white",
    icon: "bg-owl-rose/20 text-owl-rose",
  },
  mist: {
    bg: "bg-gradient-to-br from-[#e6edf5] via-[#f1f5fa] to-[#fff8ec]",
    bar: "bg-owl-mist",
    badgeBg: "bg-owl-mist",
    badgeText: "text-white",
    icon: "bg-owl-mist/20 text-owl-mist",
  },
  cream: {
    bg: "bg-gradient-to-br from-[#f5efe0] via-[#faf5ec] to-[#fff8ec]",
    bar: "bg-owl-amber",
    badgeBg: "bg-owl-amber",
    badgeText: "text-white",
    icon: "bg-owl-amber/15 text-owl-amber",
  },
};

export function PrintableCard({
  slug,
  title,
  ageRange,
  pages,
  freeOrPaid,
  price,
  skill,
  tone,
  previewSrc,
  downloadHref,
}: PrintableCardProps) {
  const t = toneStyles[tone];
  const badgeLabel = freeOrPaid === "free" ? "Free" : (price ?? "Paid");

  const cardInner = (
    <>
      {/* Image / preview area */}
      <div
        className={cn(
          "relative isolate flex aspect-[3/4] items-center justify-center overflow-hidden rounded-t-owl-card",
          t.bg
        )}
      >
        {/* Top colour bar */}
        <span
          aria-hidden
          className={cn("pointer-events-none absolute inset-x-0 top-0 h-2", t.bar)}
        />

        {/* Free / price badge */}
        <span
          className={cn(
            "absolute left-3 top-4 z-10 rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-sm",
            t.badgeBg,
            t.badgeText
          )}
        >
          {badgeLabel}
        </span>

        {previewSrc ? (
          <Image
            src={previewSrc}
            alt={`${title} preview`}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 85vw"
            className="object-cover object-top transition-transform duration-300 ease-owl group-hover:scale-[1.03]"
          />
        ) : (
          <span
            className={cn(
              "flex h-16 w-16 items-center justify-center rounded-full",
              t.icon
            )}
          >
            <FileText className="h-8 w-8" aria-hidden />
          </span>
        )}
      </div>

      {/* Text content */}
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-owl-mist">{skill}</p>
        <h3 className="mt-1 font-display text-base font-semibold leading-tight text-owl-ink line-clamp-2">
          {title}
        </h3>
        <div className="mt-auto flex items-center justify-between pt-4">
          <Chip intent="teal">Ages {ageRange}</Chip>
          <span className="text-xs text-owl-mist">{pages} pages</span>
        </div>
        {downloadHref && (
          <a
            href={downloadHref}
            download
            aria-label={`Download ${title} for free`}
            className={cn(
              "mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-full px-4 py-2",
              "font-display text-sm font-semibold text-white transition-all duration-200 ease-owl hover:opacity-90",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-owl-teal focus-visible:ring-offset-2",
              t.bar
            )}
          >
            <Download className="h-3.5 w-3.5" aria-hidden />
            Download free
          </a>
        )}
      </div>
    </>
  );

  if (downloadHref) {
    return (
      <div className="group flex h-full flex-col overflow-hidden rounded-owl-card border border-owl-cream-deep bg-white shadow-sm transition-all duration-300 ease-owl hover:-translate-y-1 hover:shadow-owl-2">
        {cardInner}
      </div>
    );
  }

  return (
    <Link
      href={`/printables/${slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-owl-card border border-owl-cream-deep bg-white shadow-sm transition-all duration-300 ease-owl hover:-translate-y-1 hover:shadow-owl-2"
    >
      {cardInner}
    </Link>
  );
}

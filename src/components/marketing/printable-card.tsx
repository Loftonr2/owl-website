import Link from "next/link";
import { FileText } from "lucide-react";
import { Chip } from "@/components/ui/chip";

export type PrintableCardProps = {
  slug: string;
  title: string;
  ageRange: string;
  pages: number;
  freeOrPaid: "free" | "paid";
  price?: string;
  skill: string;
  tone: "teal" | "amber" | "forest" | "rose" | "mist" | "cream";
};

const toneBg: Record<PrintableCardProps["tone"], string> = {
  teal: "bg-owl-teal/10",
  amber: "bg-owl-amber-soft/30",
  forest: "bg-owl-forest/10",
  rose: "bg-owl-rose/20",
  mist: "bg-owl-mist/15",
  cream: "bg-owl-cream-deep",
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
}: PrintableCardProps) {
  return (
    <Link
      href={`/printables/${slug}`}
      className="group flex h-full flex-col rounded-owl-card border border-owl-cream-deep bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className={`relative flex aspect-[3/4] items-center justify-center rounded-t-owl-card ${toneBg[tone]}`}>
        <FileText className="h-12 w-12 text-owl-ink/40" aria-hidden />
        <span
          className={`absolute left-3 top-3 rounded-full px-2 py-0.5 text-xs font-semibold ${
            freeOrPaid === "free" ? "bg-owl-amber text-white" : "bg-owl-teal text-white"
          }`}
        >
          {freeOrPaid === "free" ? "Free" : price}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-owl-mist">{skill}</p>
        <h3 className="mt-1 font-display text-base font-semibold leading-tight text-owl-ink">
          {title}
        </h3>
        <div className="mt-auto flex items-center justify-between pt-4">
          <Chip intent="teal">Ages {ageRange}</Chip>
          <span className="text-xs text-owl-mist">{pages} pages</span>
        </div>
      </div>
    </Link>
  );
}

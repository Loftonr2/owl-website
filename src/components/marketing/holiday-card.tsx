import Link from "next/link";

export type HolidayCardProps = {
  slug: string;
  name: string;
  month: string;
  intro: string;
  emoji: string;
  tone: "amber" | "teal" | "forest" | "rose" | "mist" | "cream";
};

const toneBg: Record<HolidayCardProps["tone"], string> = {
  amber: "bg-owl-amber-soft/40",
  teal: "bg-owl-teal/15",
  forest: "bg-owl-forest/15",
  rose: "bg-owl-rose/25",
  mist: "bg-owl-mist/20",
  cream: "bg-owl-cream-deep",
};

export function HolidayCard({ slug, name, month, intro, emoji, tone }: HolidayCardProps) {
  return (
    <Link
      href={`/holidays/${slug}`}
      className="group flex h-full flex-col rounded-owl-card border border-owl-cream-deep bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className={`flex aspect-square items-center justify-center text-5xl ${toneBg[tone]}`}>
        <span aria-hidden>{emoji}</span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-owl-mist">
          {month}
        </p>
        <h3 className="mt-1 font-display text-base font-semibold leading-tight text-owl-ink">
          {name}
        </h3>
        <p className="mt-2 line-clamp-3 text-sm text-owl-mist">{intro}</p>
        <span className="mt-auto pt-4 font-display text-sm font-semibold text-owl-teal group-hover:text-owl-teal-deep">
          Explore →
        </span>
      </div>
    </Link>
  );
}

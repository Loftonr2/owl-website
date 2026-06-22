import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Page intro: title + supporting copy. */
export function SectionHeader({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h2 className="font-display text-2xl font-semibold text-owl-ink">{title}</h2>
        {description && <p className="mt-1 max-w-2xl text-sm text-owl-mist">{description}</p>}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </header>
  );
}

/** A single KPI tile. */
export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-owl-card border border-owl-cream-deep bg-white p-5">
      <p className="text-xs font-medium uppercase tracking-wider text-owl-mist">{label}</p>
      <p className="mt-2 font-display text-2xl font-semibold text-owl-ink">{value}</p>
      {hint && <p className="mt-1 text-xs text-owl-mist">{hint}</p>}
    </div>
  );
}

/** Generic white panel. */
export function Panel({
  title,
  children,
  className,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-owl-card border border-owl-cream-deep bg-white p-6", className)}>
      {title && <p className="mb-3 font-semibold text-owl-ink">{title}</p>}
      {children}
    </section>
  );
}

/** Roadmap checklist used by section scaffolds to show what's wired vs. pending. */
export function Roadmap({ items }: { items: { label: string; done?: boolean }[] }) {
  return (
    <ul className="space-y-2 text-sm">
      {items.map((item) => (
        <li key={item.label} className="flex items-start gap-2">
          <span
            className={cn(
              "mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
              item.done ? "bg-owl-teal/15 text-owl-teal-deep" : "bg-owl-cream text-owl-mist"
            )}
            aria-hidden
          >
            {item.done ? "✓" : "•"}
          </span>
          <span className={item.done ? "text-owl-ink" : "text-owl-mist"}>{item.label}</span>
        </li>
      ))}
    </ul>
  );
}

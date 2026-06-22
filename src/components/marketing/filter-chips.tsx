"use client";

import { useState } from "react";
import { Chip } from "@/components/ui/chip";

/**
 * Filter chip row — client component. Maintains the selected filter in
 * local state and emits onChange. Used by Watch, Music, Printables, Shop, Gallery.
 *
 * Phase 5 only filters the in-memory seed lists on the page. Phase 6+ will
 * pipe these to a Sanity query parameter via the URL.
 */
type Option = { value: string; label: string };

export function FilterChips({
  label,
  options,
  defaultValue = "all",
  onChange,
}: {
  label: string;
  options: ReadonlyArray<Option>;
  defaultValue?: string;
  onChange?: (value: string) => void;
}) {
  const [selected, setSelected] = useState(defaultValue);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="font-display text-xs font-semibold uppercase tracking-wide text-owl-mist">
        {label}
      </span>
      <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
        {[{ value: "all", label: "All" }, ...options].map((opt) => {
          const active = opt.value === selected;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => {
                setSelected(opt.value);
                onChange?.(opt.value);
              }}
              className="rounded-full focus:outline-none focus:ring-2 focus:ring-owl-teal/40"
            >
              <Chip
                intent={active ? "teal" : "neutral"}
                interactive
                className={active ? "ring-2 ring-owl-teal/30" : undefined}
              >
                {opt.label}
              </Chip>
            </button>
          );
        })}
      </div>
    </div>
  );
}

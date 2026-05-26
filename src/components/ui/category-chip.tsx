"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { type ChipProps } from "./chip";
import { useMouseMagnet } from "@/lib/motion/mouse";
import { cn } from "@/lib/cn";

/**
 * CategoryChip — filter-strip chip with optional icon + count badge.
 *
 * v2 (cursor-magnet hover): pulls 2–3 px toward the cursor on fine-pointer
 * devices. Reduced-motion + touch skip the effect.
 *
 * Wraps `<Chip>` for filter strips with one consistent look:
 *   - Leading lucide icon (optional)
 *   - Label
 *   - Trailing count badge (optional)
 *   - Active state
 *   - Subtle cursor-magnet (2–3 px max)
 *
 *   <CategoryChip
 *     icon={Music2}
 *     label="ABCs"
 *     count={12}
 *     active={selected === "abcs"}
 *     onSelect={() => setSelected("abcs")}
 *   />
 *
 * Renders as a real `<button>` so keyboard navigation + screen-reader
 * `aria-pressed` work out of the box.
 *
 * For static (non-interactive) taxonomy badges, use `<Chip>` directly.
 */

export interface CategoryChipProps {
  label: React.ReactNode;
  icon?: LucideIcon;
  count?: number;
  active?: boolean;
  intent?: ChipProps["intent"];
  onSelect?: () => void;
  /** Pass-through href to render as a link instead of a button. */
  href?: string;
  className?: string;
  /** Accessible name override. Falls back to the visible label. */
  ariaLabel?: string;
}

export function CategoryChip({
  label,
  icon: Icon,
  count,
  active = false,
  intent = "neutral",
  onSelect,
  href,
  className,
  ariaLabel,
}: CategoryChipProps) {
  const { ref: magnetAnchorRef, style: magnetStyle } = useMouseMagnet<HTMLAnchorElement>({
    strength: 3,
  });
  const { ref: magnetButtonRef, style: magnetButtonStyle } = useMouseMagnet<HTMLButtonElement>({
    strength: 3,
  });

  const content = (
    <>
      {Icon && <Icon className="h-3.5 w-3.5" aria-hidden />}
      <span>{label}</span>
      {typeof count === "number" && (
        <span
          aria-hidden
          className={cn(
            "ml-0.5 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full px-1 text-[10px] font-bold tabular-nums",
            active ? "bg-owl-white/25 text-current" : "bg-owl-ink/10 text-owl-ink/70"
          )}
        >
          {count}
        </span>
      )}
    </>
  );

  if (href) {
    return (
      <a
        ref={magnetAnchorRef}
        href={href}
        aria-label={ariaLabel}
        aria-current={active ? "page" : undefined}
        style={magnetStyle}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-[background-color,color,box-shadow] duration-150 ease-owl-quick focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-owl-teal/60 focus-visible:ring-offset-1 focus-visible:ring-offset-owl-cream",
          active
            ? "bg-owl-teal text-white shadow-owl-1"
            : "bg-owl-cream-deep text-owl-ink hover:shadow-owl-1",
          className
        )}
      >
        {content}
      </a>
    );
  }

  // Chip's `as="button"` polymorphism doesn't accept a ref via our existing
  // forwardRef, so we render a plain <button> with the magnet attached and
  // re-use Chip's styling via inline classes. Slight duplication but keeps
  // the magnet wiring clean.
  return (
    <button
      ref={magnetButtonRef}
      type="button"
      onClick={onSelect}
      aria-label={ariaLabel}
      aria-pressed={active}
      style={magnetButtonStyle}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold cursor-pointer",
        "transition-[background-color,color,box-shadow] duration-150 ease-owl-quick",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-owl-teal/60 focus-visible:ring-offset-1 focus-visible:ring-offset-owl-cream",
        active
          ? "bg-owl-teal text-white shadow-owl-1"
          : intent === "amber"
            ? "bg-owl-amber/15 text-owl-amber hover:shadow-owl-1"
            : intent === "forest"
              ? "bg-owl-forest/10 text-owl-forest hover:shadow-owl-1"
              : intent === "rose"
                ? "bg-owl-rose/20 text-owl-ink hover:shadow-owl-1"
                : intent === "teal"
                  ? "bg-owl-teal/10 text-owl-teal hover:shadow-owl-1"
                  : "bg-owl-cream-deep text-owl-ink hover:shadow-owl-1",
        className
      )}
    >
      {content}
    </button>
  );
}

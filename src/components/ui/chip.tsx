import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

/**
 * Chip — taxonomy badge / filter pill primitive.
 *
 * Three layers of capability:
 *   1. Plain `<Chip>` — static badge (age band, topic, holiday tag).
 *   2. `<Chip interactive>` — clickable. Hover dim + focus ring.
 *   3. `<Chip active>` — selected state in a filter strip.
 *
 * For the most common "filter strip with icons + counts" use case, prefer
 * the higher-level `<CategoryChip>` from `@/components/ui/category-chip`.
 *
 * IconChip = `<Chip>` with a leading icon child. No separate component
 * needed — just pass the icon as a child element.
 */

const chipVariants = cva(
  [
    "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
    "transition-[background-color,color,box-shadow,transform] duration-150 ease-owl-quick",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-owl-teal/60 focus-visible:ring-offset-1 focus-visible:ring-offset-owl-cream",
  ].join(" "),
  {
    variants: {
      intent: {
        neutral: "bg-owl-cream-deep text-owl-ink",
        teal: "bg-owl-teal/10 text-owl-teal",
        amber: "bg-owl-amber/15 text-owl-amber",
        forest: "bg-owl-forest/10 text-owl-forest",
        rose: "bg-owl-rose/20 text-owl-ink",
      },
      interactive: {
        true: "cursor-pointer hover:-translate-y-px hover:shadow-owl-1",
        false: "",
      },
      active: {
        true: "bg-owl-teal text-white shadow-owl-1",
        false: "",
      },
    },
    compoundVariants: [
      // Active overrides intent regardless of which intent the chip carried.
      { active: true, intent: "neutral", className: "bg-owl-teal text-white" },
      { active: true, intent: "teal", className: "bg-owl-teal text-white" },
      { active: true, intent: "amber", className: "bg-owl-amber text-owl-ink" },
      { active: true, intent: "forest", className: "bg-owl-forest text-white" },
      { active: true, intent: "rose", className: "bg-owl-rose text-owl-ink" },
    ],
    defaultVariants: { intent: "neutral", interactive: false, active: false },
  }
);

type ChipBaseProps = VariantProps<typeof chipVariants> & {
  className?: string;
  children?: React.ReactNode;
};

export type ChipProps =
  | (ChipBaseProps & {
      as?: "span";
    } & Omit<React.HTMLAttributes<HTMLSpanElement>, "children" | "className">)
  | (ChipBaseProps & {
      as: "button";
    } & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children" | "className">);

/**
 * Render as a `<span>` by default. Pass `as="button"` to make it a real
 * button — chips that drive filtering MUST be buttons so keyboard nav and
 * screen readers work.
 */
export const Chip = React.forwardRef<HTMLSpanElement | HTMLButtonElement, ChipProps>(
  ({ className, intent, interactive, active, children, as = "span", ...props }, ref) => {
    const cls = cn(chipVariants({ intent, interactive, active }), className);
    if (as === "button") {
      return (
        <button
          ref={ref as React.Ref<HTMLButtonElement>}
          className={cls}
          aria-pressed={active ? true : undefined}
          {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
        >
          {children}
        </button>
      );
    }
    return (
      <span
        ref={ref as React.Ref<HTMLSpanElement>}
        className={cls}
        {...(props as React.HTMLAttributes<HTMLSpanElement>)}
      >
        {children}
      </span>
    );
  }
);
Chip.displayName = "Chip";

export { chipVariants };

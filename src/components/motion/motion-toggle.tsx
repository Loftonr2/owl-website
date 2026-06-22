"use client";

import { Sparkles, SparklesIcon, Zap, ZapOff } from "lucide-react";
import { useMotionSetting, type MotionSetting } from "./motion-settings";
import { cn } from "@/lib/cn";

/**
 * MotionToggle — small footer control for the site-wide motion setting.
 *
 * Three-state segmented control: System / On / Off.
 * Designed to live in the footer (next to the legal links).
 * Compact + accessible + keyboard-navigable.
 */
const OPTIONS: { value: MotionSetting; label: string; description: string }[] = [
  { value: "system", label: "System", description: "Follow your device's reduce-motion setting" },
  { value: "on", label: "On", description: "Always show animations" },
  { value: "off", label: "Off", description: "Disable all animations" },
];

export function MotionToggle({ className }: { className?: string }) {
  const { setting, setSetting } = useMotionSetting();

  return (
    <fieldset
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-owl-cream-deep bg-owl-white/60 p-1 text-xs",
        className
      )}
      aria-label="Animation setting"
    >
      <legend className="sr-only">Animation setting</legend>
      {OPTIONS.map((opt) => {
        const active = setting === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => setSetting(opt.value)}
            aria-pressed={active}
            title={opt.description}
            className={cn(
              "rounded-full px-3 py-1 font-medium transition-colors duration-150",
              active
                ? "bg-owl-teal text-white shadow-owl-1"
                : "text-owl-ink/70 hover:bg-owl-cream-deep hover:text-owl-ink",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-owl-teal/60 focus-visible:ring-offset-1 focus-visible:ring-offset-owl-cream"
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </fieldset>
  );
}

/** Tiny icon-only version, for the site-header utility row. */
export function MotionToggleCompact({ className }: { className?: string }) {
  const { setting, setSetting, enabled } = useMotionSetting();
  const cycle = () => {
    if (setting === "system") setSetting("on");
    else if (setting === "on") setSetting("off");
    else setSetting("system");
  };
  const Icon = enabled ? Zap : ZapOff;
  return (
    <button
      type="button"
      onClick={cycle}
      title={`Motion: ${setting}`}
      aria-label={`Motion: ${setting}. Click to change.`}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full text-owl-ink/70 transition-colors hover:bg-owl-cream-deep hover:text-owl-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-owl-teal/60",
        className
      )}
    >
      <Icon className="h-4 w-4" aria-hidden />
    </button>
  );
}

// Re-export icons so this file ships its own deps without surprises in tree-shake.
export { Sparkles, SparklesIcon };

"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

/**
 * MotionSettingsProvider — site-wide motion control.
 *
 * Three states:
 *   - "system" (default) → respect OS `prefers-reduced-motion`
 *   - "on"               → force animations on (override OS)
 *   - "off"              → kill all animations (override OS)
 *
 * The setting is persisted to localStorage and reflected as
 * `<html data-motion="system|on|off">`, which the CSS in globals.css
 * (`html[data-motion="off"] *`) reads to neutralize animations.
 *
 * This pairs with the JS hooks in `@/lib/motion/scroll` and `@/lib/motion/gsap`
 * which both read the same `data-motion` attribute.
 *
 * NOTE: This provider only sets the attribute and exposes a toggle. Components
 * that animate should respect either the OS pref (Framer Motion's
 * `useReducedMotion()` already does), or read the toggle via `useMotionSetting()`.
 */

const STORAGE_KEY = "owl-motion-setting";

export type MotionSetting = "system" | "on" | "off";

type MotionContextValue = {
  setting: MotionSetting;
  setSetting: (s: MotionSetting) => void;
  /** Effective state — what the user actually sees right now */
  enabled: boolean;
};

const MotionContext = createContext<MotionContextValue | null>(null);

export function MotionSettingsProvider({ children }: { children: React.ReactNode }) {
  // Default to "system" until hydration finishes — avoids a flash of forced state.
  const [setting, setSettingState] = useState<MotionSetting>("system");
  const [enabled, setEnabled] = useState(true);

  // Hydrate from localStorage on mount.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY) as MotionSetting | null;
      if (stored === "system" || stored === "on" || stored === "off") {
        setSettingState(stored);
      }
    } catch {
      /* localStorage unavailable — fine */
    }
  }, []);

  // Sync setting → <html data-motion> + effective state.
  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute("data-motion", setting);

    const compute = () => {
      if (setting === "off") return false;
      if (setting === "on") return true;
      return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    };
    setEnabled(compute());

    if (setting !== "system") return; // OS pref doesn't apply

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setEnabled(compute());
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, [setting]);

  const setSetting = useCallback((s: MotionSetting) => {
    setSettingState(s);
    try {
      window.localStorage.setItem(STORAGE_KEY, s);
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <MotionContext.Provider value={{ setting, setSetting, enabled }}>
      {children}
    </MotionContext.Provider>
  );
}

export function useMotionSetting(): MotionContextValue {
  const ctx = useContext(MotionContext);
  if (!ctx) {
    // Provider missing — assume "system / enabled" so we don't crash.
    return { setting: "system", setSetting: () => {}, enabled: true };
  }
  return ctx;
}

/** Convenience hook — returns true if motion should run. */
export function useMotionEnabled(): boolean {
  return useMotionSetting().enabled;
}

import type { Config } from "tailwindcss";

/**
 * OWL Sing Together — Tailwind tokens.
 * Source of truth: ../OWL-Obsidian-Brain/09_Design_System/DESIGN_STYLE_GUIDE.md
 *
 * Never inline hex colors in components. Always reference these tokens.
 *
 * v2 (redesign foundation): adds layered-composition z-scale, scroll-linked
 * keyframes, depth shadows, subtle glass utilities, and transition curves.
 */
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        owl: {
          cream: "#FBF6EC",
          "cream-deep": "#F3EBDA",
          teal: "#1A9994",
          "teal-deep": "#137070",
          amber: "#F5A623",
          "amber-soft": "#F8C975",
          forest: "#2D4A3A",
          ink: "#1C2B4A",
          mist: "#7A8794",
          rose: "#E89F8E",
          white: "#FFFFFF",
          success: "#4C9F70",
          error: "#C84B4B",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      fontSize: {
        hero: ["3.5rem", { lineHeight: "1.1", fontWeight: "800" }],
        "hero-mobile": ["2.5rem", { lineHeight: "1.1", fontWeight: "800" }],
      },
      borderRadius: {
        "owl-card": "1rem",
        "owl-btn": "0.75rem",
        "owl-hero": "1.5rem",
        "owl-banner": "2rem",
      },
      maxWidth: {
        prose: "72ch",
      },
      transitionTimingFunction: {
        owl: "cubic-bezier(0.22, 1, 0.36, 1)",
        "owl-quick": "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      transitionDuration: {
        "150": "150ms",
        "250": "250ms",
        "350": "350ms",
        "500": "500ms",
        "700": "700ms",
        "1000": "1000ms",
      },
      // Layered composition: 5 named z-layers per CLAUDE.md non-negotiable.
      // 1 background color · 2 banner · 3 UI · 4 text · 5 ambient accents.
      zIndex: {
        bg: "0",
        banner: "10",
        ui: "20",
        text: "30",
        ambient: "40",
        chrome: "50", // site-header + footer
        overlay: "60",
      },
      boxShadow: {
        // Three-tier depth system. Warm, soft, never cold gray.
        "owl-1": "0 2px 12px -2px rgba(28, 43, 74, 0.06)",
        "owl-2": "0 8px 24px -4px rgba(28, 43, 74, 0.12)",
        "owl-3": "0 24px 64px -12px rgba(28, 43, 74, 0.20)",
        // Soft golden glow for amber CTAs.
        "owl-amber-glow":
          "0 8px 24px -6px rgba(245, 166, 35, 0.35), 0 2px 6px -1px rgba(245, 166, 35, 0.25)",
        // Inner glass highlight — used by GlassCard for the subtle inner stroke.
        "owl-glass": "inset 0 1px 0 0 rgba(255, 255, 255, 0.6)",
      },
      backdropBlur: {
        // Keep blur LOW — DESIGN_STYLE_GUIDE §12 anti-pattern: glass heavy enough
        // to obscure text. Cap at 16px so legibility on cream is preserved.
        "owl-soft": "8px",
        "owl-medium": "12px",
        "owl-strong": "16px",
      },
      keyframes: {
        // Time-based fallbacks. Scroll-linked keyframes live in
        // globals.css under @supports (animation-timeline: scroll()).
        "owl-rise": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "owl-float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "owl-drift": {
          "0%, 100%": { transform: "translate(0, 0)" },
          "33%": { transform: "translate(2px, -4px)" },
          "66%": { transform: "translate(-2px, 2px)" },
        },
        "owl-sparkle": {
          "0%, 100%": { opacity: "0.4", transform: "scale(0.9)" },
          "50%": { opacity: "1", transform: "scale(1.05)" },
        },
        // Scroll-linked progress keyframes — referenced from
        // `animation-timeline: scroll()` in components.
        "owl-banner-parallax": {
          "0%": { transform: "translateY(0) scale(1.05)" },
          "100%": { transform: "translateY(-8%) scale(1.05)" },
        },
        "owl-banner-fade": {
          "0%": { opacity: "1" },
          "100%": { opacity: "0.85" },
        },
        "owl-section-rise": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "30%, 100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        rise: "owl-rise 500ms cubic-bezier(0.22, 1, 0.36, 1) both",
        float: "owl-float 4s cubic-bezier(0.4, 0, 0.2, 1) infinite",
        drift: "owl-drift 8s cubic-bezier(0.4, 0, 0.2, 1) infinite",
        sparkle: "owl-sparkle 3s cubic-bezier(0.4, 0, 0.2, 1) infinite",
      },
    },
  },
  plugins: [],
};

export default config;

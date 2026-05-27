"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Search,
  Mic,
  Play,
  BookOpen,
  Sun,
  HeartHandshake,
  Sparkles,
  Moon,
  Wind,
} from "lucide-react";

/* ─── Theme card definitions ──────────────────────────────────────────────── */
const THEME_CARDS = [
  {
    value: "abcs",
    label: "ABCs",
    subtitle: "Letters & phonics",
    icon: BookOpen,
    gradient: "from-[#f97316] via-[#fbbf24] to-[#ef4444]",
    glow: "hover:shadow-[0_8px_40px_rgba(249,115,22,0.55)]",
  },
  {
    value: "numbers",
    label: "Numbers",
    subtitle: "Count & discover",
    icon: Sun,
    gradient: "from-[#0ea5e9] via-[#22d3ee] to-[#10b981]",
    glow: "hover:shadow-[0_8px_40px_rgba(14,165,233,0.55)]",
  },
  {
    value: "feelings",
    label: "Feelings",
    subtitle: "SEL & emotions",
    icon: HeartHandshake,
    gradient: "from-[#ec4899] via-[#a855f7] to-[#7c3aed]",
    glow: "hover:shadow-[0_8px_40px_rgba(236,72,153,0.55)]",
  },
  {
    value: "holiday",
    label: "Holidays",
    subtitle: "Celebrate the world",
    icon: Sparkles,
    gradient: "from-[#f59e0b] via-[#fde047] to-[#f97316]",
    glow: "hover:shadow-[0_8px_40px_rgba(245,158,11,0.55)]",
  },
  {
    value: "lullaby",
    label: "Lullabies",
    subtitle: "Rest & calm",
    icon: Moon,
    gradient: "from-[#312e81] via-[#6d28d9] to-[#0e7490]",
    glow: "hover:shadow-[0_8px_40px_rgba(109,40,217,0.55)]",
  },
  {
    value: "movement",
    label: "Movement",
    subtitle: "Dance & play",
    icon: Wind,
    gradient: "from-[#059669] via-[#34d399] to-[#06b6d4]",
    glow: "hover:shadow-[0_8px_40px_rgba(5,150,105,0.55)]",
  },
] as const;

/* ─── Age pill definitions ────────────────────────────────────────────────── */
const AGE_PILLS = [
  {
    value: "birth-1",
    label: "Birth–1",
    gradient: "from-[#f7c948] to-[#f59e0b]",
    ring: "ring-[#f7c948]/50",
  },
  {
    value: "1-2",
    label: "1–2",
    gradient: "from-[#4ade80] to-[#16a34a]",
    ring: "ring-[#4ade80]/50",
  },
  {
    value: "2-3",
    label: "2–3",
    gradient: "from-[#38bdf8] to-[#0284c7]",
    ring: "ring-[#38bdf8]/50",
  },
  {
    value: "3-4",
    label: "3–4",
    gradient: "from-[#c084fc] to-[#7e22ce]",
    ring: "ring-[#c084fc]/50",
  },
  {
    value: "4-5",
    label: "4–5",
    gradient: "from-[#fb923c] to-[#ea580c]",
    ring: "ring-[#fb923c]/50",
  },
  {
    value: "5-8",
    label: "5–8",
    gradient: "from-[#60a5fa] to-[#1d4ed8]",
    ring: "ring-[#60a5fa]/50",
  },
] as const;

const SUGGESTED = ["Birthday songs", "ABC song", "Colors", "Feelings"];

/* ─── Component ──────────────────────────────────────────────────────────── */
export function OwlDiscoveryArcade() {
  const [query, setQuery] = useState("");
  const [activeAge, setActiveAge] = useState<string | null>(null);

  return (
    <section
      aria-label="OWL Discovery Arcade"
      className="relative overflow-hidden bg-[#071510] py-16 md:py-24"
    >
      {/* Ambient radial glows */}
      <div aria-hidden className="pointer-events-none absolute inset-0 select-none">
        <div className="absolute left-[20%] top-0 h-[600px] w-[600px] -translate-y-1/2 rounded-full bg-owl-teal/[0.08] blur-[140px]" />
        <div className="absolute bottom-0 right-[15%] h-[500px] w-[500px] translate-y-1/2 rounded-full bg-owl-amber/[0.07] blur-[120px]" />
        <div className="absolute left-[60%] top-[40%] h-[300px] w-[300px] rounded-full bg-purple-500/[0.05] blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* ── Section header ── */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12 text-center"
        >
          <p className="font-display text-xs font-bold uppercase tracking-[0.22em] text-owl-teal">
            Discover
          </p>
          <h2 className="mt-2 font-display text-3xl font-extrabold text-white sm:text-4xl">
            OWL Discovery Arcade
          </h2>
          <p className="mt-3 text-sm text-white/50">
            Find the perfect song for right now
          </p>
        </motion.div>

        {/* ── Floating search panel + trending card ── */}
        <div className="mb-10 grid grid-cols-1 gap-5 md:grid-cols-[1fr_280px]">

          {/* Search glass panel */}
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.04] p-6 shadow-2xl backdrop-blur-xl"
          >
            {/* Top shimmer line */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-owl-teal/50 to-transparent"
            />

            {/* Mascot + prompt */}
            <div className="mb-5 flex items-center gap-3">
              <span
                aria-hidden
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-owl-teal/20 text-xl ring-1 ring-owl-teal/30"
              >
                🦉
              </span>
              <div>
                <p className="font-display text-sm font-bold text-white">
                  What shall we discover today?
                </p>
                <p className="text-xs text-white/40">Search 40+ multicultural videos</p>
              </div>
            </div>

            {/* Input row */}
            <div className="flex items-center gap-2">
              <label className="relative flex-1">
                <span className="sr-only">Search OWL videos</span>
                <Search
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-owl-teal/60"
                  aria-hidden
                />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by title, theme, age band…"
                  className="h-12 w-full rounded-xl border border-white/[0.08] bg-white/[0.06] pl-10 pr-4 text-sm text-white placeholder:text-white/25 transition-all duration-200 focus:border-owl-teal/40 focus:bg-white/[0.09] focus:outline-none focus:ring-2 focus:ring-owl-teal/25"
                />
              </label>

              {/* Search submit */}
              <Link
                href={query ? `/watch?q=${encodeURIComponent(query)}` : "/watch"}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-owl-teal text-white shadow-lg transition-all duration-200 hover:scale-105 hover:bg-owl-teal/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-owl-teal/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#071510]"
                aria-label="Search"
              >
                <Search className="h-4 w-4" />
              </Link>

              {/* Voice search button (decorative/future) */}
              <button
                type="button"
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-white/40 transition-all duration-200 hover:border-owl-rose/40 hover:text-owl-rose focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-owl-rose/40"
                aria-label="Voice search"
              >
                <Mic className="h-4 w-4" />
              </button>
            </div>

            {/* Suggested pills */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wide text-white/25">
                Try:
              </span>
              {SUGGESTED.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setQuery(s)}
                  className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-xs text-white/50 transition-all duration-150 hover:border-owl-teal/40 hover:bg-owl-teal/[0.12] hover:text-owl-teal focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-owl-teal/40"
                >
                  {s}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Trending mini-card */}
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link
              href="/watch/birthday-fun-songs"
              className="group relative flex min-h-[200px] w-full overflow-hidden rounded-2xl shadow-2xl transition-all duration-300 hover:scale-[1.025] hover:shadow-[0_16px_48px_rgba(247,201,72,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-owl-amber/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#071510] md:h-full"
              style={{ minHeight: "200px" }}
            >
              {/* YouTube thumbnail */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://i.ytimg.com/vi/zrtwck76T1I/hqdefault.jpg"
                alt="Birthday Fun Songs"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

              {/* Play button */}
              <div className="absolute left-1/2 top-[40%] -translate-x-1/2 -translate-y-1/2">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-owl-forest shadow-xl transition-transform duration-200 group-hover:scale-110">
                  <Play className="h-6 w-6 fill-current" />
                </span>
              </div>

              {/* Bottom label */}
              <div className="absolute inset-x-0 bottom-0 p-4">
                <span className="mb-2 inline-flex items-center gap-1 rounded-full bg-owl-amber px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow">
                  🔥 Trending
                </span>
                <p className="font-display text-sm font-bold leading-snug text-white">
                  Birthday Fun Songs
                </p>
              </div>
            </Link>
          </motion.div>
        </div>

        {/* ── Age filter capsules ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.08 }}
          className="mb-8 flex flex-wrap items-center gap-3"
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/30">
            Age
          </span>

          {/* All ages */}
          <button
            type="button"
            onClick={() => setActiveAge(null)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 ${
              activeAge === null
                ? "bg-white text-owl-forest shadow-lg"
                : "border border-white/[0.1] bg-white/[0.05] text-white/45 hover:bg-white/[0.1] hover:text-white"
            }`}
          >
            All ages
          </button>

          {AGE_PILLS.map(({ value, label, gradient, ring }) => (
            <Link
              key={value}
              href={`/watch?age=${value}`}
              onClick={() => setActiveAge(value)}
              className={`rounded-full bg-gradient-to-r ${gradient} px-4 py-1.5 text-xs font-bold text-white shadow-md ring-2 ${ring} transition-all duration-200 hover:scale-105 hover:shadow-lg focus-visible:outline-none focus-visible:ring-4 ${
                activeAge === value ? "scale-105 shadow-lg" : "opacity-80 hover:opacity-100"
              }`}
            >
              {label}
            </Link>
          ))}
        </motion.div>

        {/* ── Theme category cards ── */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {THEME_CARDS.map(({ value, label, subtitle, icon: Icon, gradient, glow }, i) => (
            <motion.div
              key={value}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link
                href={`/watch?theme=${value}`}
                className={`group relative flex h-44 flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-4 text-center shadow-lg ${glow} transition-all duration-300 hover:-translate-y-2 hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#071510]`}
              >
                {/* Shine */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.15] via-transparent to-transparent"
                />
                {/* Bottom vignette */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/30 to-transparent"
                />

                {/* Hover play badge */}
                <div
                  aria-hidden
                  className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-black/25 opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100"
                >
                  <Play className="h-3.5 w-3.5 fill-white text-white" />
                </div>

                {/* Icon */}
                <span
                  aria-hidden
                  className="relative flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm ring-1 ring-white/20 transition-transform duration-300 group-hover:scale-110"
                >
                  <Icon className="h-6 w-6 text-white" />
                </span>

                {/* Label */}
                <div className="relative">
                  <p className="font-display text-sm font-extrabold text-white">{label}</p>
                  <p className="mt-0.5 text-[10px] text-white/70">{subtitle}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

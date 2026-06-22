"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, Mic, Play } from "lucide-react";

/* ─── Theme card definitions ──────────────────────────────────────────────── */
const THEME_CARDS = [
  {
    value: "abcs",
    label: "ABCs",
    subtitle: "Letters, phonics & speaking fun!",
    imageSrc: "/images/discovery/theme-abcs.png",
    shadow: "hover:shadow-[0_8px_32px_rgba(236,72,153,0.28)]",
  },
  {
    value: "numbers",
    label: "Numbers",
    subtitle: "Counting, patterns & math songs!",
    imageSrc: "/images/discovery/theme-numbers.png",
    shadow: "hover:shadow-[0_8px_32px_rgba(14,165,233,0.28)]",
  },
  {
    value: "feelings",
    label: "Feelings (SEL)",
    subtitle: "Emotions, kindness & mindfulness!",
    imageSrc: "/images/discovery/theme-feelings.png",
    shadow: "hover:shadow-[0_8px_32px_rgba(236,72,153,0.28)]",
  },
  {
    value: "holiday",
    label: "Holidays",
    subtitle: "Celebrate, explore & learn traditions!",
    imageSrc: "/images/discovery/theme-holidays.png",
    shadow: "hover:shadow-[0_8px_32px_rgba(245,158,11,0.28)]",
  },
  {
    value: "lullaby",
    label: "Lullabies",
    subtitle: "Calm, cozy songs for sweet dreams!",
    imageSrc: "/images/discovery/theme-lullabies.png",
    shadow: "hover:shadow-[0_8px_32px_rgba(109,40,217,0.28)]",
  },
  {
    value: "movement",
    label: "Movement",
    subtitle: "Dance, stretch & move together!",
    imageSrc: "/images/discovery/theme-movement.png",
    shadow: "hover:shadow-[0_8px_32px_rgba(5,150,105,0.28)]",
  },
] as const;

/* ─── Age pill definitions ────────────────────────────────────────────────── */
const AGE_PILLS = [
  { value: "birth-1", label: "Birth–1", emoji: "⭐", bg: "bg-[#f7c948]", text: "text-white", ring: "ring-[#f7c948]/40" },
  { value: "1-2",     label: "1–2",     emoji: "🌱", bg: "bg-[#4caf7d]", text: "text-white", ring: "ring-[#4caf7d]/40" },
  { value: "2-3",     label: "2–3",     emoji: "😊", bg: "bg-[#0ea5c9]", text: "text-white", ring: "ring-[#0ea5c9]/40" },
  { value: "3-4",     label: "3–4",     emoji: "⭐", bg: "bg-[#7c3aed]", text: "text-white", ring: "ring-[#7c3aed]/40" },
  { value: "4-5",     label: "4–5",     emoji: "☀️", bg: "bg-[#f97316]", text: "text-white", ring: "ring-[#f97316]/40" },
  { value: "5-8",     label: "5–8",     emoji: "🚀", bg: "bg-[#1d6fb5]", text: "text-white", ring: "ring-[#1d6fb5]/40" },
] as const;

const SUGGESTED = [
  { label: "Counting songs",    color: "border-owl-teal    text-owl-teal    hover:bg-owl-teal/10"    },
  { label: "Feelings check-in", color: "border-owl-rose    text-owl-rose    hover:bg-owl-rose/10"    },
  { label: "Bedtime lullabies", color: "border-[#7c3aed]   text-[#7c3aed]   hover:bg-[#7c3aed]/10"  },
  { label: "Halloween",         color: "border-owl-amber   text-owl-amber   hover:bg-owl-amber/10"   },
  { label: "Dance party",       color: "border-[#0ea5c9]   text-[#0ea5c9]   hover:bg-[#0ea5c9]/10"  },
];

/* ─── Component ──────────────────────────────────────────────────────────── */
export function OwlDiscoveryArcade() {
  const [query, setQuery] = useState("");
  const [activeAge, setActiveAge] = useState<string | null>(null);

  return (
    <section
      aria-label="What Do You Want To Learn Today"
      className="relative overflow-hidden bg-[#fdf8f0] py-14 md:py-20"
    >
      {/* Subtle warm dot pattern */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 select-none opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(circle, #7c5c2e 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Soft amber blob top-right */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-[360px] w-[360px] rounded-full bg-owl-amber/10 blur-[80px]"
      />
      {/* Soft teal blob bottom-left */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-16 -left-16 h-[300px] w-[300px] rounded-full bg-owl-teal/10 blur-[70px]"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* ── Search panel + trending ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10 grid grid-cols-1 gap-5 md:grid-cols-[1fr_260px]"
        >
          {/* Main search card */}
          <div className="flex flex-col items-center overflow-hidden rounded-2xl border border-owl-cream-deep bg-owl-white p-8 text-center shadow-owl-2">
            <h2 className="mb-6 font-display text-2xl font-extrabold text-owl-ink sm:text-3xl">
              What do you want to learn today?
            </h2>

            {/* Search input row */}
            <div className="flex w-full max-w-lg items-center gap-2">
              <label className="relative flex-1">
                <span className="sr-only">Search OWL videos</span>
                <Search
                  className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-owl-mist"
                  aria-hidden
                />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by title, theme, or age band"
                  className="w-full rounded-full border border-owl-cream-deep bg-owl-cream/50 py-3 pl-12 pr-4 text-sm text-owl-ink shadow-owl-1 placeholder:text-owl-mist transition-all duration-200 focus:border-owl-teal/50 focus:bg-owl-white focus:outline-none focus:ring-2 focus:ring-owl-teal/25"
                />
              </label>
              <Link
                href={query ? `/watch?q=${encodeURIComponent(query)}` : "/watch"}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-owl-teal text-white shadow-owl-1 transition-all duration-200 hover:scale-105 hover:bg-owl-teal/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-owl-teal/60"
                aria-label="Search"
              >
                <Search className="h-4 w-4" />
              </Link>
              <button
                type="button"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-owl-cream-deep bg-owl-cream text-owl-mist transition-all duration-200 hover:border-owl-teal/40 hover:text-owl-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-owl-teal/40"
                aria-label="Voice search"
              >
                <Mic className="h-4 w-4" />
              </button>
            </div>

            {/* Suggested searches — centered + color-coded */}
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <span className="w-full text-xs font-medium text-owl-mist">Try searching:</span>
              {SUGGESTED.map(({ label, color }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setQuery(label)}
                  className={`rounded-full border bg-transparent px-4 py-1.5 text-xs font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 ${color}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Trending mini-card */}
          <div>
            <div className="mb-2 flex items-center gap-1.5">
              <span className="text-base">🔥</span>
              <p className="font-display text-sm font-bold text-owl-ink">Trending Now</p>
            </div>
            <Link
              href="/watch/birthday-fun-songs"
              className="group relative flex h-[180px] w-full overflow-hidden rounded-2xl border border-owl-cream-deep shadow-owl-2 transition-all duration-300 hover:scale-[1.02] hover:shadow-owl-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-owl-amber/60"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://i.ytimg.com/vi/zrtwck76T1I/hqdefault.jpg"
                alt="Birthday Fun Songs"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-owl-forest shadow-lg transition-transform duration-200 group-hover:scale-110">
                  <Play className="h-5 w-5 fill-current" />
                </span>
              </div>
              <div className="absolute inset-x-0 bottom-0 p-3">
                <p className="font-display text-sm font-bold text-white">Birthday Fun Songs</p>
              </div>
            </Link>
            {/* Dot indicators (decorative) */}
            <div className="mt-3 flex justify-center gap-1.5" aria-hidden>
              {[0,1,2,3,4].map((i) => (
                <span key={i} className={`h-1.5 rounded-full transition-all ${i === 1 ? "w-4 bg-owl-teal" : "w-1.5 bg-owl-cream-deep"}`} />
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── Theme category cards ── */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {THEME_CARDS.map(({ value, label, subtitle, imageSrc, shadow }, i) => (
            <motion.div
              key={value}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link
                href={`/watch?theme=${value}`}
                className={`group relative flex h-52 flex-col overflow-hidden rounded-2xl border-2 border-white bg-owl-white shadow-owl-2 ${shadow} transition-all duration-300 hover:-translate-y-1.5 hover:scale-[1.025] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-owl-teal/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fdf8f0]`}
              >
                {/* Card illustration — fills top 70% */}
                <div className="relative flex-1 overflow-hidden">
                  <Image
                    src={imageSrc}
                    alt={label}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(min-width: 1024px) 190px, (min-width: 640px) 33vw, 50vw"
                  />
                  {/* Play badge top-right */}
                  <div
                    aria-hidden
                    className="absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/85 shadow transition-transform duration-200 group-hover:scale-110"
                  >
                    <Play className="h-3 w-3 fill-owl-teal text-owl-teal" />
                  </div>
                </div>

                {/* Label strip */}
                <div className="shrink-0 bg-owl-white px-3 py-2.5">
                  <p className="font-display text-sm font-extrabold leading-tight text-owl-ink">{label}</p>
                  <p className="mt-0.5 text-[10px] leading-tight text-owl-mist">{subtitle}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* ── Age filter capsules ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <span className="font-display text-sm font-bold uppercase tracking-wide text-owl-ink/60">
            AGE
          </span>

          {AGE_PILLS.map(({ value, label, emoji, bg, text, ring }) => (
            <Link
              key={value}
              href={`/watch?age=${value}`}
              onClick={() => setActiveAge(value)}
              className={`flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-bold shadow-owl-1 ring-2 ${bg} ${text} ${ring} transition-all duration-200 hover:scale-105 hover:shadow-owl-2 focus-visible:outline-none focus-visible:ring-4 ${
                activeAge === value ? "scale-105 shadow-owl-2" : ""
              }`}
            >
              <span aria-hidden>{emoji}</span>
              {label}
            </Link>
          ))}
        </motion.div>

      </div>
    </section>
  );
}

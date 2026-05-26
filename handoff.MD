# Handoff — OWL Sing Together Website

**Last updated:** 2026-05-13 (end of Front-of-Site Redesign — Phases 1–7)
**Previous handoff:** end of Phase 6 (build) — 2026-05-11. See git history if needed.
**Repo root:** `C:\Users\Ricko\OneDrive\Documents\Claude\Projects\OWL Website Build\owl-website`
**Obsidian brain:** `..\OWL-Obsidian-Brain\` (source of truth for everything outside this file)

> If you're picking this up — read `CLAUDE.md` at the repo root, then `DESIGN.md`, then this file, then the brain's `13_Claude_Source_Of_Truth/`.

---

## 1. What just happened — Front-of-Site Redesign (May 2026)

Seven-phase redesign of the public-facing front of the website. Same Next.js + Tailwind + Framer Motion stack. Same 22 page routes. Every page now uses a 5-layer composition (background color → banner image → interactive UI → text → ambient accent), with scroll-linked parallax, subtle glassmorphism, scroll-driven CSS animations, and an SVG OWL logo system.

**Non-negotiable design rules preserved:**
- Warm cream + soft teal + amber + forest palette. No primary-color toys, no AI-purple gradients, no Inter/Roboto/Arial, no autoplay video or audio, no dark mode (warm-cream brand).
- WCAG 2.1 AA contrast on body + large text.
- `prefers-reduced-motion` respected + new site-wide motion toggle.
- COPPA-safe: YouTube embeds use youtube-nocookie.com and load only on user interaction.
- No fabricated final art — refined OWL SVG logo is intentionally a system component, not a faked commissioned mark.

---

## 2. Current state

### What works today (no setup beyond `npm install`)
- `npm install` (note: now installs `gsap` + `@gsap/react` in addition to existing deps).
- `npm run dev` boots the site at `http://localhost:3000`.
- Every public page renders with seed data — nothing 404s.
- New: site-wide motion toggle in footer (System/On/Off, persisted via localStorage).
- New: cinematic scroll-progress bar at the top of viewport.
- New: SVG OWL lockup in header + footer (no more raster mascot dependency).
- Newsletter form on every page still POSTs to `/api/newsletter/subscribe`.
- Sitemap + robots + JSON-LD untouched and still working.

### Redesign-specific UX
- **Every page** now uses `<BannerHero>` underneath (`<PageHero>` was rewritten as a thin wrapper, so existing pages picked up the layered system automatically).
- **Homepage hero**: cream-deep band, scroll-linked banner parallax, two SVG owls drifting in opposite directions on scroll, mouse-triggered drift on fine-pointer devices, glass "Free this week" overlay, drifting musical notes + sparkles ambient.
- **Trust strip**: 5 pillar cards with icon discs, blurbs, soft amber wash.
- **Video rails (`/`, `/watch`, related-video sections)**: poster-first cards, scroll-snap horizontal on mobile, 3-col grid on desktop, staggered fade-up reveal.
- **`/watch/[slug]`**: poster-first `<VideoPlayer>` — clicking loads a `youtube-nocookie.com` iframe with autoplay=1. **No autoplay on page load.**
- **Music rails**: tonal ribbon at top of each playlist card, OwlMark watermark, streaming-platform hint reveals on hover/focus.
- **Shop**: every `<ProductCard>` shows a Coming Soon corner ribbon (truthful — commerce isn't live yet). Strikethrough prices. Detail page swaps Add-to-cart for "Notify me when it drops".
- **Per-page ambient mood**: notes (music/watch), sparkles (holidays/newsletter/gallery/shop), leaves (educators/teacher-resources/parent-resources), paper (blog/printables), stars (recommendations/app).

### What's stubbed (carried forward — same as previous handoff)
- Sanity Studio, Supabase auth, Beehiiv/Resend, Stripe/Shopify/Printify/Gumroad — all still soft-fail when env keys are absent.
- Detail pages (`/blog/[slug]`, `/holidays/[slug]`, `/music/[slug]`, `/printables/[slug]`) still use their original custom hero layouts. Their inner cards/rails got the redesign; the hero composition didn't. Targeted refit when desired.

### What's broken / unverified
- **`npm install` hasn't been run from this redesign session.** First action after this handoff is `npm install` to pick up `gsap@^3.12.5` and `@gsap/react@^2.1.1`.
- **`npm run build` has never been executed on this branch.**
- **`npm run lint` / `npm run typecheck` likewise not executed here.** Static analysis showed clean imports + proper "use client" directives, but only the real toolchain will catch typing edge-cases.
- **No Playwright run.** No Lighthouse run. No real perf numbers on the redesigned pages.
- **Safari** does not yet support `animation-timeline: scroll()` — the scroll-progress bar and banner-parallax CSS animations fall back to static state (cosmetic only, no functional impact).

---

## 3. Files in flight (redesign-touched, Phases 1–6)

### New (17 files)
| File | What it is |
|---|---|
| `src/lib/motion/scroll.ts` | `useScrollProgress`, `useScrollLinked` hooks (motion-aware) |
| `src/lib/motion/gsap.ts` | Lazy GSAP + ScrollTrigger loader (returns null when motion off) |
| `src/components/motion/motion-settings.tsx` | `<MotionSettingsProvider>` + `useMotionSetting()` |
| `src/components/motion/motion-toggle.tsx` | `<MotionToggle>` and `<MotionToggleCompact>` |
| `src/components/brand/owl-logo.tsx` | SVG `<OwlMark>`, `<OwlWordmark>`, `<OwlLockup>` |
| `src/components/marketing/banner-hero.tsx` | 5-layer composition primitive — every page uses this |
| `src/components/marketing/ambient-layer.tsx` | `<AmbientLayer pattern="notes\|leaves\|sparkles\|stars\|paper" />` |
| `src/components/marketing/scroll-scene.tsx` | Framer-Motion scroll-linked region |
| `src/components/marketing/home-ambient.tsx` | Homepage ambient preset (notes + sparkles) |
| `src/components/marketing/media-rail.tsx` | Scroll-snap rail (mobile) + grid (desktop) |
| `src/components/marketing/video-poster.tsx` | Tonal poster frame, used by VideoCard and VideoPlayer |
| `src/components/marketing/video-player.tsx` | Poster-first YouTube embed (loads on click) |
| `src/components/marketing/scroll-progress.tsx` | Top-of-viewport gradient bar (CSS scroll-driven) |
| `src/components/ui/glass-card.tsx` | Subtle frosted panel (capped at 12px blur) |
| `src/components/ui/coming-soon-ribbon.tsx` | Corner + pill variants |
| `src/components/ui/play-button.tsx` | Glass play badge primitive |
| `DESIGN.md`, `SETUP_MCP.md`, `.claude/skills/ui-ux-pro-max/SKILL.md` | (created in earlier MCP setup pass) |

### Modified (14 files)
| File | Summary of change |
|---|---|
| `tailwind.config.ts` | New tokens: rose/white/success/error, layered z-scale, depth shadows, glass blur, keyframes, animation durations, `rounded-owl-banner` |
| `src/app/globals.css` | `data-motion="off"` site-wide override, 3 glass classes, scroll-driven utilities, scroll-progress keyframes, hide-scrollbar utility |
| `src/app/layout.tsx` | Wrapped in `<MotionSettingsProvider>` with `data-motion="system"` default |
| `src/app/(marketing)/layout.tsx` | Mounts `<ScrollProgress>` |
| `src/components/ui/button.tsx` | New variants (`inverted`, `destructive`), `xl` size, `loading`, `iconStart/End`, proper transform transitions |
| `src/components/marketing/hero.tsx` | Rewritten on top of `<BannerHero>`, same `<Hero />` no-prop API |
| `src/components/marketing/hero-mascots.tsx` | SVG mascots, scroll + mouse parallax |
| `src/components/marketing/trust-strip.tsx` | 5 icon-disc cards with blurbs |
| `src/components/marketing/site-header.tsx` | `<OwlLockup>` brand link, focus-visible ring, z-chrome |
| `src/components/marketing/site-footer.tsx` | `<OwlLockup>` brand link, `<MotionToggle>` in legal bar |
| `src/components/marketing/page-hero.tsx` | Now delegates to `<BannerHero>` — 12 pages picked up the redesign automatically |
| `src/components/marketing/video-card.tsx` | Uses `<VideoPoster>`, hover lift, focus ring |
| `src/components/marketing/featured-videos.tsx` | `<MediaRail>` + staggered reveal |
| `src/components/marketing/playlist-card.tsx` | Tonal ribbon, OwlMark accent, streaming hint reveal |
| `src/components/marketing/featured-playlists.tsx` | `<MediaRail>`, pulls from seed |
| `src/components/marketing/product-card.tsx` | Layered composition, OwlMark watermark, Coming Soon ribbon, line-through price |
| `src/components/marketing/shop-bestsellers.tsx` | Pulls from `SEED_PRODUCTS` (single source of truth), `<MediaRail>` |
| `src/components/marketing/printable-of-the-week.tsx` | Glass badge, OwlMark watermark, parallax preview, paper ambient |
| `src/components/marketing/newsletter-section.tsx` | Sparkles ambient, parallax banner, OwlMark inline with eyebrow |
| `src/app/(marketing)/shop/page.tsx` | `<BannerHero>` + chip strip + `<MediaRail>` |
| `src/app/(marketing)/shop/[slug]/page.tsx` | Gallery with OwlMark + ribbon, "Notify me when it drops" CTA, JSON-LD `PreOrder` |
| `src/app/(marketing)/watch/[slug]/page.tsx` | Mounts `<VideoPlayer>` |
| 12 marketing page files | Each picked up an `ambient="…"` prop |
| `src/lib/seed/videos.ts` | Added `youtubeId?: string \| null` field, null on every entry (TODO hook) |
| `src/lib/seed/products.ts` | Added `isComingSoon?: boolean` field, true on every entry (TODO hook) |
| `package.json` | `gsap@^3.12.5`, `@gsap/react@^2.1.1` added |

---

## 4. Next steps

### Right now (before any other work)
1. `npm install` — picks up the two GSAP deps.
2. `npm run typecheck` — should pass. If not, share the output and we fix anything the static-analysis pass missed.
3. `npm run lint` — should pass. The seed files (videos, products) had a quick programmatic edit that may leave imperfect indentation — `npm run format` (prettier) will normalize it.
4. `npm run build` — first time this branch attempts a real prod build. Capture any errors.
5. `npm run dev` — visual smoke-test (see Phase 7 QA checklist below).

### After the smoke-test passes
6. Provision Sanity + Supabase live (see prior handoff §6).
7. **Detail-page hero refit** — `/blog/[slug]`, `/holidays/[slug]`, `/music/[slug]`, `/printables/[slug]` still use their original heroes. Worth refitting onto `<BannerHero>` for visual consistency (~30 min of focused work).
8. **Phase 3 of the original build plan** — commerce wake-up (Stripe + Shopify + Printify + Gumroad). When products go live, flip `isComingSoon` to `false` in `src/lib/seed/products.ts` (or query Sanity).
9. **Real YouTube IDs** — paste into `youtubeId` field in `src/lib/seed/videos.ts` as videos publish.
10. **Asset replacements** — Larissa-final OWL mark (replace `src/components/brand/owl-logo.tsx` body keeping the API), Watch + Shop dedicated headers (replace placeholders in `src/lib/images.ts`), 11 per-holiday Larissa illustrations, 6 blog-pillar headers, OG default 1200×630.

---

## 5. Phase 7 — Verification + QA checklist

Run on Windows in the project root.

### Step A — Toolchain checks
```powershell
cd "C:\Users\Ricko\OneDrive\Documents\Claude\Projects\OWL Website Build\owl-website"
npm install                     # picks up gsap + @gsap/react
npm run format                  # normalizes seed-file indentation
npm run typecheck               # MUST pass
npm run lint                    # MUST pass
npm run build                   # first real build attempt
```

### Step B — Boot dev + smoke test
```powershell
npm run dev
# Open http://localhost:3000
```

Visually verify, in order:

1. **Top of viewport**: thin teal→amber→rose gradient bar grows as you scroll the page.
2. **Header**: SVG OWL lockup (mark + wordmark), keyboard-focusable, focus ring visible.
3. **Homepage hero**:
   - Cream-deep background with radial amber + teal washes.
   - Banner image parallaxes ~8% upward on scroll (Chrome / Firefox only; Safari shows static).
   - Two SVG owls drift in opposite directions on scroll, follow pointer with ±6px drift on hover.
   - Glass "Free this week" card sits over the banner.
   - Drifting musical notes + sparkles ambient particles.
4. **Trust strip**: 5 cards with icon discs, blurbs visible on `md+`, hover scales the icon disc.
5. **Featured videos rail**: 3-column grid `lg+`, 2-col `md`, horizontal swipe rail on mobile with snap stops. Cards have hover lift and focus ring. Stagger reveal as section scrolls into view.
6. **Featured playlists rail**: same, 4-up on `lg`. Hover a card → streaming hint ("Spotify · Apple Music · YouTube Music") reveals at the bottom.
7. **Shop bestsellers**: every product card shows the amber corner ribbon and strikethrough price.
8. **Newsletter section**: sparkles ambient behind headline, parallax banner, OwlMark next to eyebrow.
9. **Footer**: SVG lockup, "Motion: System / On / Off" toggle on right side. Toggle to "Off" and reload — every animation freezes (parallax static, mascots still, scroll bar at 0). Toggle to "On" — animations resume even if OS reduce-motion is on.
10. **`/watch/abcs-with-larissa`**: poster has "Coming soon" pill (because `youtubeId: null`). Open `src/lib/seed/videos.ts`, paste a real YouTube ID on one entry (e.g. `youtubeId: "dQw4w9WgXcQ"`), reload — click the poster → iframe replaces it and starts playing. **No autoplay on first load.**
11. **`/shop`**: BannerHero with sparkles, chip strip, bestsellers + full grid with ribbons. Click any product → detail page shows ribbon + "Notify me when it drops" CTA + line-through price + `PreOrder` JSON-LD.
12. **Mobile (DevTools 375px)**: hero stacks (image below copy), CTAs full-width, trust-strip 2-col with blurbs hidden, header collapses to hamburger.
13. **Reduced motion**: System Preferences → Accessibility → Reduce motion (or DevTools → Rendering → Emulate CSS media → `prefers-reduced-motion: reduce`). No parallax, no mascot drift, no stagger reveals, scroll bar frozen.
14. **Keyboard nav**: Tab through hero — focus rings visible on every CTA, logo link, motion toggle, every card.
15. **Per-page ambient moods**:
    - `/music`, `/watch` — drifting musical notes.
    - `/blog`, `/printables` — paper shapes.
    - `/educators`, `/teacher-resources`, `/parent-resources` — drifting leaves.
    - `/holidays`, `/newsletter`, `/shop`, `/gallery` — sparkles.
    - `/recommendations`, `/app` — twinkling stars.

### Step C — When MCPs are installed (`SETUP_MCP.md`)

```
# Playwright MCP
Open Chrome, navigate to http://localhost:3000, screenshot at 375 / 768 / 1280.

# Chrome DevTools MCP
Open http://localhost:3000 with the Performance tab recording.
Confirm: LCP < 2.5s, CLS < 0.1, INP < 200ms, console has no errors.
```

---

## 6. Where things live (updated)

| Concept | Location |
|---|---|
| Foundation tokens | `tailwind.config.ts` (extends) + `src/app/globals.css` (vars + utilities) |
| Motion infrastructure | `src/lib/motion/*` + `src/components/motion/*` |
| Brand SVG logo | `src/components/brand/owl-logo.tsx` |
| Banner-hero primitive | `src/components/marketing/banner-hero.tsx` |
| Ambient particle system | `src/components/marketing/ambient-layer.tsx` |
| Scroll-progress bar | `src/components/marketing/scroll-progress.tsx` + globals.css keyframes |
| Video player (poster-first) | `src/components/marketing/video-player.tsx` |
| Coming-soon ribbon | `src/components/ui/coming-soon-ribbon.tsx` |
| Glass card primitive | `src/components/ui/glass-card.tsx` + globals.css `owl-glass*` classes |
| Media rail (rail/grid) | `src/components/marketing/media-rail.tsx` |
| Per-page ambient mood | `ambient="…"` prop on each `<PageHero>` call |
| Motion toggle | Site footer (full segmented control) — hook via `useMotionSetting()` |
| Source-of-truth (brain) | `..\OWL-Obsidian-Brain\13_Claude_Source_Of_Truth\` |

---

## 7. Open questions for Rick

Carried forward from the previous handoff + redesign-specific additions:

1. **Detail-page hero refit** — refit `/blog/[slug]`, `/holidays/[slug]`, `/music/[slug]`, `/printables/[slug]` heroes onto `<BannerHero>` now, or wait for Phase 7 of the build plan (QA)?
2. **Per-holiday Larissa illustrations** — commission all 11, or use shared `headers.holidays` for now?
3. **Watch + Shop dedicated headers** — still placeholders. Commission?
4. **OG default image** (1200×630) — generate via sharp from `headers.home`, or commission?
5. **Final OWL Mark** — the SVG in `src/components/brand/owl-logo.tsx` is a system stand-in using brand tokens. Want to commission a final vector, or ship with the system mark?
6. **MCP setup** — `SETUP_MCP.md` is ready but I don't know which MCPs (Perplexity / Playwright / Firecrawl / Glif / Chrome DevTools / Higgsfield) are actually installed on your machine. Once installed I can run Playwright + Chrome DevTools verification automatically.

---

## 8. Conversation continuity

The redesign was delivered in 7 phase-bounded turns:
- Phase 1 — Foundation (motion, tokens, logo, primitives, Coming Soon ribbon, glass card)
- Phase 2 — Homepage hero + global chrome
- Phase 3 — Video + music rails (poster-first, on-interaction load)
- Phase 4 — Store + Coming Soon ribbons applied
- Phase 5 — `<PageHero>` refit (12 pages picked up the redesign automatically)
- Phase 6 — Ambient polish + scroll-progress + scrollbar-hide
- Phase 7 — Verification gate + QA checklist + this handoff

Each previous handoff lives in the chat history of the session that produced it. `CURRENT_SPRINT.md` in the brain remains the rolling state for non-redesign work.

— Claude · 2026-05-13

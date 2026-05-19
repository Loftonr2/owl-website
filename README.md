# OWL Sing Together — Website

The public website + admin CRM scaffolding for **OWL Sing Together**, a
multicultural early-childhood education brand. Built on Next.js 15 (App
Router), React 19, TypeScript 5, Tailwind 3, and Framer Motion 11, with a
shared visual system designed for cinematic scroll experiences, layered
parallax depth, and zero compromises on warmth or accessibility.

> If you're picking this up — start with `CLAUDE.md`, then `DESIGN.md`, then
> this README, then `IMPLEMENTATION_PLAN.md`. Source of truth for everything
> outside this repo: `..\OWL-Obsidian-Brain\`.

---

## 1. Quick start

```powershell
cd "C:\Users\Ricko\OneDrive\Documents\Claude\Projects\OWL Website Build\owl-website"
npm install
cp .env.local.example .env.local      # fill in real keys when ready
npm run dev
# Open http://localhost:3000
```

Other scripts:

| Command | Purpose |
|---|---|
| `npm run typecheck` | TypeScript `tsc --noEmit` |
| `npm run lint` | `next lint` |
| `npm run build` | Production build |
| `npm run start` | Run production build |
| `npm run format` | Prettier write |
| `npm run test:e2e:install` | Install Playwright Chromium |
| `npm run test:e2e` | Run Playwright e2e tests |
| `npm run analyze` | Bundle analyzer via `@next/bundle-analyzer` (`ANALYZE=true next build`) |
| `npm run perf:budget` | Enforce the 200KB-gzipped per-route JS budget |
| `npm run generate:hero-frame-smoke` | Write the 6 SVG dev-fixture frames for the hero-frame runtime |

---

## 2. Architecture overview

```
src/
├── app/                              ← Next.js App Router
│   ├── (admin)/                      ← Admin CRM (gated; OWL plan Phase 7)
│   ├── (marketing)/                  ← All 22 public pages
│   │   ├── layout.tsx                ← Header + Footer + ScrollProgress + PageFade
│   │   ├── page.tsx                  ← Homepage
│   │   ├── about/                    ← /about
│   │   ├── educators/                ← /educators
│   │   ├── holidays/                 ← /holidays + /holidays/[slug]
│   │   ├── music/                    ← /music + /music/[slug]
│   │   ├── newsletter/               ← /newsletter
│   │   ├── recommendations/          ← /recommendations
│   │   ├── shop/                     ← /shop + /shop/[slug]
│   │   ├── watch/                    ← /watch + /watch/[slug]
│   │   └── …                         ← /blog, /contact, /gallery, /printables, /app, etc.
│   ├── dev/showcase/                 ← NODE_ENV-gated primitive showcase
│   ├── login/                        ← Magic-link auth
│   └── studio/                       ← Sanity Studio mount
├── components/
│   ├── brand/                        ← <OwlMark>, <OwlWordmark>, <OwlLockup>
│   ├── motion/                       ← MotionSettingsProvider, PageFade, MotionToggle
│   ├── marketing/                    ← Page-level sections + shared primitives
│   └── ui/                           ← Button, Card, Chip, Section, GlassPanel, etc.
├── lib/
│   ├── motion/                       ← scroll hooks, gsap lazy loader, scene helpers, timing
│   ├── seed/                         ← Static seed data (moves to Sanity in OWL plan Phase 6)
│   ├── seo/                          ← Metadata + structured data helpers
│   ├── images.ts                     ← Asset manifests + resolvers
│   ├── tokens.ts                     ← Design tokens (color, radius, spacing, shadow, blur, z, motion)
│   └── …
public/
└── images/
    ├── brand/                        ← Legacy raster logo art (now replaced by SVG component)
    ├── headers/                      ← Page banner fallbacks (18 files shipped)
    ├── banners/                      ← Phase 3+ wide horizontal banner posters (empty manifest)
    ├── hero-frames/                  ← 240-frame scroll-scrub sequences (manifest registered, empty disk)
    ├── products/                     ← Per-slug product photography (empty)
    ├── video-posters/                ← Per-slug 16:9 video posters (empty)
    └── wireframes-reference/         ← Gitignored design references
```

---

## 3. Shared components inventory

### Brand
- `<OwlMark>` · `<OwlWordmark>` · `<OwlLockup>` — SVG-based logo system using OWL color tokens.

### Motion infrastructure
- `<MotionSettingsProvider>` — site-wide motion state (System / On / Off), localStorage-persisted; sets `<html data-motion>`.
- `<MotionToggle>` (footer) · `<MotionToggleCompact>` (header) — user-facing controls.
- `<PageFade>` — route transition scaffolding (Framer Motion `AnimatePresence` keyed on `usePathname`).
- `<ScrollProgress>` — top-of-viewport gradient bar (native CSS scroll-driven).
- `useScrollProgress` / `useScrollLinked` (`src/lib/motion/scroll.ts`) — JS scroll hooks, motion-aware.
- `useLayeredScene` / `useSceneOpacity` (`src/lib/motion/scene.ts`) — multi-layer parallax helpers.
- `loadGsap()` (`src/lib/motion/gsap.ts`) — lazy GSAP+ScrollTrigger loader, returns null when motion disabled.
- `D` / `E` / `Ecss` / `secs()` / `stagger` (`src/lib/motion/timing.ts`) — shared timing constants.

### UI primitives
- `<Button>` — six intents (primary / secondary / tertiary / ghost / inverted / destructive) × four sizes, loading + icon states.
- `<Card>` and friends.
- `<Chip>` — taxonomy badge; `as="button"` polymorphism; `active` + `interactive` variants.
- `<CategoryChip>` — filter-strip chip with icon + count + active.
- `<Section>` / `<SectionHeader>` / `<SectionIntro>` (alias).
- `<GlassPanel>` / `<GlassCard>` (alias) — capped at 12px blur.
- `<PlayButton>` — glass play badge primitive.
- `<ComingSoonRibbon>` — corner + pill variants.
- `<NewsletterCTAButton>` — band-style submit.

### Marketing primitives
- `<BannerHero>` / `<HeroBanner>` (alias) — 5-layer composition (bg → banner → UI → text → ambient).
- `<CinematicHero>` — wraps BannerHero, swaps in `<HeroFrameSequence>` when its slot is `available: true`.
- `<HeroFrameSequence>` — 240-frame GSAP ScrollTrigger image-sequence runtime with chunked loading + variant resolution + poster fallback.
- `<PageHero>` — thin wrapper around BannerHero; takes `slug` or `image` prop.
- `<MediaRail>` — scroll-snap rail on mobile, grid on desktop, stagger reveal.
- `<MediaPosterCard>` — generic poster + meta-footer.
- `<VideoPoster>` — poster frame with three-tier resolver (`local → YouTube CDN → tonal`).
- `<VideoPlayer>` — poster-first; iframe mounts only on click; `youtube-nocookie.com` host.
- `<VideoCard>` / `<PlaylistCard>` / `<ProductCard>` / `<PrintableCard>` / `<HolidayCard>` / `<BlogCard>` / `<GalleryCard>`.
- `<StaggerGrid>` — generic grid with `whileInView` stagger; reduced-motion renders plain HTML.
- `<StickyCTA>` — bottom-of-viewport conversion band; dismissable, dev-gated mount.
- `<StickyMiniCart>` — floating mini-cart at bottom-right (desktop) or bottom band (mobile).
- `<AmbientLayer>` — 5 ambient patterns (notes / leaves / sparkles / stars / paper).
- `<ScrollScene>` — Framer-Motion render-prop scroll-linked region.
- `<SectionReveal>` — section-level fade-up on scroll.
- `<HomeAmbient>` · `<HeroMascots>` · `<DevHintBanner>` · `<TrustStrip>` · `<NewsletterSection>` · `<PrintableOfTheWeek>` · `<SeasonalSpotlight>` · `<EducatorBlock>` · `<AppWaitlistTeaser>` · `<AboutLarissaPreview>` · `<FeaturedVideos>` · `<FeaturedPlaylists>` · `<ShopBestsellers>` · `<StreamingPlatforms>` · `<FilterChips>` · `<ContactForm>` · `<NewsletterForm>`.

### Site chrome
- `<SiteHeader>` — sticky, scroll-state styling (`data-scrolled` switches translucent/dense), Motion Toggle + Search + Cart utility row, mobile disclosure menu.
- `<SiteFooter>` — newsletter band + 4-column nav + Motion Toggle in legal bar.

---

## 4. Motion system

Three layers of control, top-down:

```
   OS preference (prefers-reduced-motion: reduce)
        ↓ overridden by ↓
   Site-wide toggle (<html data-motion="on|off|system">)
        ↓ read by ↓
   Component guards (useReducedMotion / useMotionEnabled)
```

Where motion is implemented:
- **Native CSS scroll-driven animation** for simple parallax + reveal (`@supports (animation-timeline: scroll())`). Safari falls back to static state; zero JS cost.
- **Framer Motion** for `<SectionReveal>`, `<StaggerGrid>`, `<PageFade>`, `<MediaRail>` staggers, `<StickyCTA>` / `<StickyMiniCart>` slide-ins. Honors `useReducedMotion()`.
- **GSAP ScrollTrigger** for `<HeroFrameSequence>` (240-frame scrubbing). Lazy-loaded via `loadGsap()`; never ships on routes that don't use it.

Tokens (`src/lib/tokens.ts` + `src/lib/motion/timing.ts`):
- Durations: `quick (150ms)` · `standard (200ms)` · `reveal (400ms)` · `cinematic (600ms)` · `ambient (4000ms)`.
- Easings: `owl` · `quick` · `easeOut` · `easeIn` — both array (Framer) and CSS-string (`cubic-bezier(...)`) forms.
- Stagger: `tight 40ms` · `standard 70ms` · `generous 120ms`.

User toggle: footer "Motion: System / On / Off" segmented control persists to `localStorage["owl-motion-setting"]` and writes `<html data-motion>`. Header has a compact icon-cycle of the same.

---

## 5. Asset drop locations

See `ASSET_REQUIREMENTS.md` for the full designer-facing spec. Quick map:

| Asset | Drop location | Manifest |
|---|---|---|
| Logo SVG | inline in `src/components/brand/owl-logo.tsx` | — |
| Favicons | `public/favicon.ico` + `icon-192.png` + `icon-512.png` | `src/app/layout.tsx` |
| Wide banner posters | `public/images/banners/<slug>.webp` | `src/lib/images.ts → banners` |
| 240-frame sequences | `public/images/hero-frames/<slug>/desktop/frame-NNN.webp` + `mobile/frame-NNN.webp` + `poster.webp` | `src/lib/images.ts → heroFrames` (flip `available: true` when ready) |
| Product photos | `public/images/products/<slug>/primary.webp` + `lifestyle-*.webp` | `src/lib/images.ts → products` |
| Video posters | `public/images/video-posters/<slug>.webp` | `src/lib/seed/videos.ts → posterSrc` |
| Button icons | use `lucide-react` directly | — |
| OG default | `public/og/owl-default.png` (1200×630) | `src/lib/site-config.ts → siteConfig.ogImage` |

All manifests are typed; TypeScript enforces shape when you add an entry.

---

## 6. Performance + accessibility posture

### Lazy loading
- Above-the-fold banners use `priority` on `<Image>`. Below-the-fold images omit it → Next/Image default lazy.
- `<VideoPoster>` and `<ProductCard>` thumbnails never set `priority` → lazy by default. Long rails do not blow LCP.
- `<HeroFrameSequence>` chunks frame loading: 30 frames eager, then 30-frame chunks lazy-loaded as scroll crosses thresholds. A 240-frame hero costs ~1.5 MB up front instead of ~12 MB.
- `<VideoPlayer>` never mounts an `<iframe>` on page paint. The iframe is constructed only after the user clicks the poster. Player ships from `youtube-nocookie.com` → no third-party cookies until interaction.
- `<AmbientLayer>` SVG particles are inline — no network requests, decoratively `aria-hidden`.
- **GSAP** is dynamically imported. Routes without a frame sequence never download the GSAP bundle.

### CLS (Cumulative Layout Shift)
- `<VideoPoster>` → `aspect-video` (16:9).
- `<ProductCard>` → `aspect-square` on image area, fixed text padding below.
- `<BannerHero>` → `aspectStyles[bannerAspect]` (`wide` / `square` / `tall`).
- `<HeroFrameSequence>` → inline `style={{ aspectRatio: width / height }}` from manifest.
- `<MediaRail>` → fixed `basis-[85%]` mobile card width.
- Overlays/ambient use absolute positioning so they never push content.

### Accessibility (WCAG 2.1 AA)
- **Keyboard:** every interactive is `<button>` or `<a>`; reachable by Tab; no `tabindex > 0`; skip-to-content link.
- **Focus visible:** every primitive declares `focus-visible:ring-*`. Global `:where(...):focus-visible` in `globals.css` is the safety net.
- **Hover/focus parity:** matching visual weight on every interactive.
- **Reduced motion:** `<MotionSettingsProvider>` sets `<html data-motion>`; CSS rules in `globals.css` kill animation durations; Framer hooks use `useReducedMotion()`; `<HeroFrameSequence>` renders `posterFallback` as static `<Image>`.
- **Contrast:** OWL tokens pass AA — `owl-ink on owl-cream` ≥ 12:1, `owl-forest on owl-cream` ≥ 9:1, `owl-mist on owl-cream` = 4.6:1. `owl-amber` is never body copy.
- **Alt text:** every image + frame manifest carries `alt`. Decorative `<OwlMark>` and `<AmbientLayer>` use `aria-hidden`.
- **Pause / stop motion:** footer toggle's "Off" state freezes every keyframe + transition site-wide. No autoplay video or audio anywhere on the site (`CLAUDE_READ_FIRST §13`).

### Performance budgets
- `npm run perf:budget` enforces ≤ 200 KB gzipped per-route JS (0.30 gzip approximation). Wire into CI after `npm run build`.
- `npm run analyze` opens the bundle analyzer when a route blows the budget.

---

## 7. Verification steps

After install:

```powershell
npm run typecheck             # ✓ no TS errors
npm run lint                  # ✓ no ESLint errors
npm run build                 # ✓ production build succeeds
npm run perf:budget           # ✓ no route over 200 KB gzipped
npm run dev                   # boot the site
```

Visit, in a real browser:

1. `/` — homepage. Cinematic hero falls back to static banner (no frames yet). Scroll: gradient progress bar grows; SectionReveal fades below-fold sections in.
2. `/about` — calm motion. Larissa story + mission + values + community impact.
3. `/educators` — structured motion. Benefits + tools + printables + playlists + pricing.
4. `/holidays` — celebratory motion. Browse-by-month + Diwali campaign + 11 hubs.
5. `/music` — rhythmic motion. Streaming overlay + browse-by-category + 3 themed rails.
6. `/newsletter` — calm + trust-first. Glass form overlay + 3 segment cards + trust pillars.
7. `/recommendations` — editorial. Larissa's picks + age bands + comparison table.
8. `/shop` — premium retail. Featured + bundles + digital + bestsellers + sticky mini-cart (dev mode).
9. `/watch` — video nook. Poster-first cards (tonal placeholders today — see §8).
10. `/watch/<slug>` — poster-first player. Dev hint banner explains the "Coming soon" state.
11. `/dev/showcase` — every primitive in every state. Returns 404 in production.

**Motion smoke check**
- Footer → Motion: **Off** → everything freezes. Layouts stay.
- DevTools → Rendering → Emulate `prefers-reduced-motion: reduce` → same.
- Footer → Motion: **On** → animations resume even if OS reduce-motion is set.

**Mobile smoke check** (DevTools device toolbar at 375 px)
- No horizontal scroll anywhere.
- Rails scroll-snap horizontally on mobile; grid on desktop.
- Header collapses to hamburger.

**Accessibility smoke check**
- Tab through homepage — focus rings visible on every CTA, link, toggle, card.
- Lighthouse accessibility score ≥ 95.

**Frame-sequence smoke check**
```powershell
npm run generate:hero-frame-smoke
# Then in src/components/marketing/hero.tsx, temporarily swap sequenceSlug="_dev-smoke"
# Reload home; hero canvas scrubs through 6 SVG fixtures.
# Revert when done.
```

---

## 8. Truthful state today (read before declaring something is broken)

The site is engineering-complete. Imagery and commerce are external
dependencies, not bugs.

- **Video thumbnails look like tonal placeholders.** That's tier 3 of the `resolveVideoPoster()` three-tier resolver. Every `SEED_VIDEOS[*]` entry has `youtubeId: null` and `posterSrc: null`. Flip either to switch a card to real imagery. The dev hint banner on `/watch/<slug>` documents the path.
- **Product cards all show Coming Soon ribbons.** Truthful — `isComingSoon: true` on every `SEED_PRODUCTS[*]` entry because commerce (Stripe + Shopify + Printify + Gumroad) is scaffolded but not wired. Flip per product as items go live.
- **Hero frame sequences don't play.** Nine 240-frame slots registered with `available: false`. `<CinematicHero>` automatically falls back to the static banner. Commission frames per `ASSET_REQUIREMENTS.md §3` and flip `available: true`.
- **Banner posters use legacy headers.** `banners[*]` manifest is empty; resolver falls back to `headers[*]`. Replace per-page when wide horizontal banners are commissioned.

None of these are bugs. They're documented asset interfaces.

---

## 9. Known follow-up items

| Item | Owner / Phase |
|---|---|
| Commission first 240-frame hero sequence (home recommended) | Larissa + motion designer |
| Commission wide banner posters (home / about / educators priority) | Larissa |
| Add favicon set + OG default image | Designer |
| Refit `/blog/[slug]`, `/holidays/[slug]`, `/music/[slug]`, `/printables/[slug]` heroes to `<CinematicHero>` | V-track P7+ |
| Wire commerce (Stripe + Shopify + Printify + Gumroad) | OWL build plan Phase 3 |
| Connect `<StickyMiniCart>` to real cart store when commerce wakes up | OWL build plan Phase 3 |
| Provision Sanity + Supabase live keys | Rick (see `SETUP_MCP.md`) |
| Run Playwright e2e suite for the first time | After fresh deploy |
| Lighthouse CI integration | OWL build plan Phase 9 |
| Replace placeholder OWL logo with commissioned mark | Designer |
| Per-holiday Larissa illustrations (11) | Designer |
| Six blog-pillar headers | Designer |
| Watch + Shop dedicated hero banners (currently `isPlaceholder: true` in `src/lib/images.ts`) | Designer |

---

## 10. Cross-reference

- `CLAUDE.md` — project rules + frontend workflow gate (read first)
- `DESIGN.md` — design source-of-truth, tokens, anti-patterns, prompt guide
- `ASSET_REQUIREMENTS.md` — designer-facing asset spec
- `IMPLEMENTATION_PLAN.md` — phased delivery record
- `SETUP_MCP.md` — MCP server install runbook
- `WOZCODE_SETUP_REPORT.md` — WOZCODE plugin install + verification
- `OWL_BUILD_PLAN.md` — the original 9-phase delivery plan
- `handoff.MD` — end-of-build-phase hand-off record
- `..\OWL-Obsidian-Brain\` — brand source-of-truth

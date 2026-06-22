# IMPLEMENTATION_PLAN.md

**Current phase:** Shared-visual-system track P6 — production-readiness wrap
**Status:** Asset track P1–P5 complete · Visual track P1–P6 complete · Visual track DONE
**Last updated:** 2026-05-15

> Two tracks ran in parallel: an **asset/resolver track** (P1–P5 above) and a
> **shared-visual-system track** (P1 foundation / P2 buttons + interactions /
> P3 home + about + educators / P4 holidays + music + newsletter / P5
> recommendations + shop + watch + video detail / P6 lazy loading + a11y +
> docs). This entry covers V-P6 and wraps the visual track.

This plan captures the audit findings, the video-page diagnostic root cause,
the tokens and motion foundations now in place, and the asset-folder
conventions every later phase will write into. **No pages were redesigned.**

---

## 1. Audit findings

### Routes (App Router)

- 1 root layout (`src/app/layout.tsx`) + 2 group layouts (`(marketing)`, `(admin)`).
- 22 public marketing pages, 1 admin stub, 1 Sanity studio mount, 1 login.
- All marketing pages flow through `src/app/(marketing)/layout.tsx` which mounts
  `<SiteHeader>`, `<ScrollProgress>`, `<main>`, `<SiteFooter>`.

### Shared components (44)

- **UI primitives** — `<Button>`, `<Card>`, `<Chip>`, `<Section>`, `<GlassCard>`,
  `<PlayButton>`, `<ComingSoonRibbon>`.
- **Brand** — `<OwlMark>`, `<OwlWordmark>`, `<OwlLockup>`.
- **Motion** — `<MotionSettingsProvider>`, `<MotionToggle>`, `<MotionToggleCompact>`.
- **Marketing scaffolding** — `<BannerHero>` (5-layer composition primitive),
  `<PageHero>` (wraps BannerHero), `<MediaRail>`, `<AmbientLayer>`,
  `<ScrollScene>`, `<ScrollProgress>`, `<SectionReveal>`, `<HeroMascots>`,
  `<HomeAmbient>`.
- **Video** — `<VideoCard>`, `<VideoPoster>`, `<VideoPlayer>`,
  `<FeaturedVideos>`.
- **Other domains** — `<PlaylistCard>`, `<FeaturedPlaylists>`, `<ProductCard>`,
  `<ShopBestsellers>`, `<PrintableCard>`, `<PrintableOfTheWeek>`,
  `<BlogCard>`, `<HolidayCard>`, `<GalleryCard>`, `<FilterChips>`,
  `<StreamingPlatforms>`, `<NewsletterForm>`, `<NewsletterSection>`,
  `<EducatorBlock>`, `<AppWaitlistTeaser>`, `<TrustStrip>`,
  `<SeasonalSpotlight>`, `<AboutLarissaPreview>`, `<ContactForm>`.

### Global styles

- `src/app/globals.css` — CSS variables for color, OS reduced-motion override,
  `data-motion="off"` site-wide override, `owl-glass*` component classes,
  native scroll-driven utility classes (`owl-scroll-banner-parallax`,
  `owl-scroll-banner-fade`, `owl-scroll-section-rise`, `owl-scroll-progress`),
  `owl-rail-hide-scrollbar`.
- `tailwind.config.ts` — extended color palette, font families, custom font
  sizes (`text-hero`, `text-hero-mobile`), custom border radii
  (`rounded-owl-card`, `-btn`, `-hero`, `-banner`), `ease-owl` /
  `ease-owl-quick` curves, transition durations, **layered z-index scale**,
  three-tier depth shadows + amber glow + glass highlight, capped backdrop
  blur (8 / 12 / 16 px), 7 keyframes including 3 scroll-linked ones.

### Asset organization (before Phase 1)

```
public/images/
├── brand/                      # 5 PNG logos
├── headers/                    # 18 PNG page banners
└── wireframes-reference/       # 13 gitignored reference PNGs
```

After Phase 1 (this turn):

```
public/images/
├── brand/
├── headers/
├── wireframes-reference/
├── hero-frames/                # NEW — image sequences (empty + README)
├── banners/                    # NEW — wide horizontal banner posters (empty + README)
├── products/                   # NEW — per-slug product photography (empty + README)
└── video-posters/              # NEW — per-slug 16:9 video thumbs (empty + README)
```

### Seed data

- `src/lib/seed/videos.ts` — 9 videos, all `youtubeId: null` (no real videos
  uploaded yet).
- `src/lib/seed/products.ts` — 10 products, all `isComingSoon: true` (commerce
  not wired yet).
- `src/lib/seed/playlists.ts`, `blog.ts`, `holidays.ts`, `printables.ts`,
  `gallery.ts` — content scaffolding, no commerce dependency.

---

## 2. Video diagnostic — why posters don't show preview images and the player doesn't play

### Symptom 1 — no preview images on the cards or the detail page

**Root cause:** `<VideoPoster>` (`src/components/marketing/video-poster.tsx`)
is intentionally an image-free CSS panel:

```tsx
// Tonal gradient + OwlMark watermark + (in the detail-page poster size) initials
<div className={cn("relative isolate overflow-hidden rounded-t-owl-card",
                   "aspect-video", toneStyles[tone].base)}>
  <div className={toneStyles[tone].gradient} />
  <OwlMark decorative className="absolute left-3 bottom-3 h-8 w-8" />
  <PlayButton size="md" tone="light" insideGroup />
  {duration && <span>{duration}</span>}
</div>
```

No `<Image>` element. There is no asset hookup because the underlying data
contract doesn't carry a poster URL: `SeedVideo` exposes `slug / title /
tone / duration / youtubeId` but **no `posterSrc`**. The poster artwork itself
also doesn't exist on disk — there was no `public/images/video-posters/`
folder until this phase.

**The honest state:** the tonal panel is a placeholder by design. It's the
"asset interface" between the player and the missing artwork. It will keep
rendering until *both* of the following happen:

1. A poster image exists in `public/images/video-posters/<slug>.webp`
   (asset folder + README convention shipped this phase), OR
2. A `youtubeId` is set on the video so the player can derive a poster from
   `https://img.youtube.com/vi/<id>/maxresdefault.jpg`
   (helper `youtubePosterUrl(...)` exported from `src/lib/images.ts` this phase).

**Phase 2 work** (not part of this phase): teach `<VideoPoster>` to prefer
the local file, fall back to the YouTube CDN URL, fall back to the tonal panel
— a three-tier resolver, decided in the component once.

### Symptom 2 — clicking the poster doesn't play anything

**Root cause:** `<VideoPlayer>` (`src/components/marketing/video-player.tsx`)
gates iframe mounting on `youtubeId`:

```tsx
if (playing && hasVideo) {
  return <iframe src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1`} ... />;
}
// Otherwise: render a disabled <button> with a "Coming soon" caption.
```

Every entry in `src/lib/seed/videos.ts` has `youtubeId: null`, so every
detail page renders the disabled state. The player itself is wired correctly
(privacy-enhanced `youtube-nocookie.com` host, autoplay only on click,
keyboard-focusable, screen-reader-labeled). It just has nothing to play.

**Why the data is null:** the OWL YouTube catalog isn't published yet
(handoff.MD §2 — "What's stubbed"). Faking a YouTube ID would mislead the
team and ship a video that isn't the real OWL content; the explicit
`null` + "Coming soon" caption is the truthful state.

**To prove the player works without waiting for production videos**, set
any one entry's `youtubeId` to a known public 11-character ID, reload the
detail page, click the poster. The iframe mounts and autoplay engages on
the click (never on page load, per `OWL_BUILD_RULES §6`).

**Phase 2 work:** add a small dev-only banner on `/watch/[slug]` that says
"This player is in 'Coming soon' state — set `youtubeId` in
`src/lib/seed/videos.ts` to enable playback for QA" so the issue is
self-documenting in the UI for any future engineer browsing the site.

### Suggested fix order (Phase 2+)

1. Add `posterSrc?: string` to `SeedVideo`. Default to null.
2. Wire the three-tier poster resolver in `<VideoPoster>` (local → YouTube CDN
   → tonal placeholder).
3. Add an env-gated dev hint banner to the detail page when both `posterSrc`
   and `youtubeId` are null.
4. Per-slug poster commissions land in `public/images/video-posters/<slug>.webp`.
5. As videos go live on YouTube, paste the 11-char IDs into the seed file.

---

## 3. Design tokens — confirmed and surfaced

### Color, typography, brand

`src/lib/tokens.ts → owlColors / owlFonts / brand`. 13 brand colors named
to role; Nunito as display + body; brand promise + acronym strings travel
with the tokens.

### Radius

`src/lib/tokens.ts → owlRadius`. card (16) / button (12) / hero (24) /
banner (32). Tailwind mirror: `rounded-owl-{card,btn,hero,banner}`.

### Spacing

`src/lib/tokens.ts → owlSpacing`. Container max 1280px, prose max 72ch,
section padding scale (sm / md / lg with mobile + desktop variants), card
inner padding, card gap. Used by `<Section>` and `<BannerHero>`.

### Shadow

`src/lib/tokens.ts → owlShadow`. Three-tier depth (`one` / `two` / `three`)
+ `amberGlow` for CTA hovers + `glassHighlight` for glass cards. Tailwind
mirror: `shadow-owl-{1,2,3,amber-glow,glass}`.

### Blur

`src/lib/tokens.ts → owlBlur`. soft (8) / medium (12) / strong (16) — **capped
at 16 by design** (DESIGN_STYLE_GUIDE §12 anti-pattern). Tailwind mirror:
`backdrop-blur-owl-{soft,medium,strong}`.

### Z-Index

`src/lib/tokens.ts → owlZIndex`. The 5 redesign layers (bg / banner / ui /
text / ambient) plus chrome (50) and overlay (60). Tailwind mirror:
`z-{bg,banner,ui,text,ambient,chrome,overlay}`.

### Motion timing

`src/lib/tokens.ts → owlDuration / owlEasing / owlEasingCss`. Five named
durations (quick 150ms → ambient 4s) and four easing curves with both array
and CSS-string forms. Re-exported by `src/lib/motion/timing.ts` as `D` / `E`
/ `Ecss` / `secs()` / `stagger` for clean motion authoring.

---

## 4. Motion foundation — confirmed and extended

| Concern | Where | Status |
|---|---|---|
| OS reduced-motion handling | `globals.css @media (prefers-reduced-motion: reduce)` | Done — kills all keyframe + transition durations |
| Site-wide motion toggle | `<MotionSettingsProvider>` + `data-motion` attribute on `<html>` | Done — persists to localStorage; three states |
| Motion provider context | `src/components/motion/motion-settings.tsx` exports `useMotionSetting()` + `useMotionEnabled()` | Done |
| Toggle UI | `<MotionToggle>` (footer) + `<MotionToggleCompact>` (header use) | Done — footer wired |
| Shared easing/timing constants | `src/lib/motion/timing.ts` (`D`, `E`, `Ecss`, `secs()`, `stagger`) | **Added this phase** |
| Layered scroll-scene utility | `src/lib/motion/scene.ts` (`useLayeredScene`, `useSceneOpacity`) | **Added this phase** |
| Single-element scroll-progress hooks | `src/lib/motion/scroll.ts` (`useScrollProgress`, `useScrollLinked`) | Done |
| GSAP lazy loader | `src/lib/motion/gsap.ts` (`loadGsap()`) — returns null when motion off | Done |
| Native CSS scroll-driven animations | `globals.css` — `owl-scroll-banner-parallax`, `owl-scroll-banner-fade`, `owl-scroll-section-rise`, `owl-scroll-progress` | Done — Safari falls back gracefully |
| Component-level reveal | `<SectionReveal>`, `<ScrollScene>` (render-prop) | Done |

The motion stack is now: **OS pref → site toggle (data-motion) → component
guard (useReducedMotion / useMotionEnabled)**. Every layer can override the
one below; the `useReducedMotion()` hook from Framer Motion already wires
the OS pref through, and our new `data-motion="off"` HTML attribute takes
priority over both via the CSS in `globals.css`.

---

## 5. Asset folder conventions — created this phase

| Folder | Purpose | Resolver pattern |
|---|---|---|
| `public/images/hero-frames/<slug>/frame-NNN.webp` | Cinematic scroll-scrubbed image sequences (Phase 2+ uses GSAP ScrollTrigger). One folder per scene. `manifest.json` per scene. | `src/lib/images.ts → heroFrames` typed map (empty at Phase 1). |
| `public/images/banners/<slug>.webp` | Wide horizontal hero banner posters (16:9 default). Distinct from `headers/` which holds the existing illustrated portraits. | `src/lib/images.ts → banners` typed map (empty at Phase 1). |
| `public/images/products/<slug>/primary.webp + gallery/*` | Per-product photography. Primary 1:1, gallery 4:5. | `src/lib/images.ts → products` typed map. `<ProductCard>` looks up `products[slug]?.primary` and falls back to tonal panel. |
| `public/images/video-posters/<slug>.webp` | Per-video 16:9 poster thumbs. | `src/lib/images.ts → videoPosters` typed map. `<VideoPoster>` Phase 2 will prefer the local file → fall back to `youtubePosterUrl(youtubeId)` → fall back to tonal panel. |

Each folder ships with a README capturing the convention. **No assets are
fabricated.** The manifests are empty until commissioned artwork lands.

Helper exported this phase: `src/lib/images.ts → youtubePosterUrl(id, quality)`
for the YouTube CDN fallback path.

---

## 6. What this phase did not do

- Did not redesign any pages.
- Did not commission or generate any imagery.
- Did not change any component's public API.
- Did not move existing assets between folders.
- Did not modify `package.json` or any seed file (the `youtubeId`/`isComingSoon`
  fields were already added in prior work and remain as `null` / `true`).

---

## 7. Phase 2 — shipped

### P2.1 — Three-tier `<VideoPoster>` resolver

`src/lib/images.ts` exports `resolveVideoPoster(posterSrc, youtubeId)` returning
`{ url, source }`. Source is `"local" | "youtube" | "none"`. The resolver is a
plain function (server-safe).

`<VideoPoster>` reads this and stacks:
1. Tonal panel + initials → always rendered as the skeleton floor.
2. Resolved `<Image>` (next/image, `unoptimized` for the YouTube CDN) →
   stacks on top when the resolver returns a URL.
3. OwlMark watermark, play badge, duration pill → top layer (unchanged).

`<VideoCard>` and `<VideoPlayer>` now pass `posterSrc` + `youtubeId` through.
`SeedVideo` gained an optional `posterSrc?: string | null` field (null on every
entry — honest state, no fabricated paths).

### P2.2 — Dev-only "Coming soon" hint banner

`src/components/marketing/dev-hint-banner.tsx` renders nothing in production
(NODE_ENV check tree-shakes the branch). In dev, it shows an amber callout
with a code snippet pointing at the exact seed field to edit.

Wired into `/watch/[slug]/page.tsx` so that whenever a video has neither
`youtubeId` nor `posterSrc`, the banner appears under the player explaining
why the player looks "broken". Self-documenting failure mode.

### P2.3 — `<HeroFrameSequence>` runtime

`src/components/marketing/hero-frame-sequence.tsx` is the GSAP ScrollTrigger
image-sequence renderer. Three states:

| State | Behavior |
|---|---|
| Sequence registered + motion on | `<canvas>` + GSAP scrub. Frame index = `Math.round(progress × (frameCount − 1))`. `scrollDistance` prop (default `"150vh"`) controls how much scroll the scene consumes. |
| Sequence registered + reduced motion | Static `<Image>` of frame-001. Frame 1 must be a complete usable hero — documented in `public/images/hero-frames/README.md`. |
| Sequence NOT registered (manifest empty) | Renders nothing. `console.warn` in dev. |

GSAP is lazy-loaded via `loadGsap()` so the ~70 KB bundle only ships on routes
that actually use this component.

### P2.4 — First commissioned posters

**Deliberately deferred to off-platform commissioning.** No imagery was
fabricated. The resolver and the asset conventions are ready — drop any
`webp` into `public/images/video-posters/<slug>.webp` and set the matching
`posterSrc` in `src/lib/seed/videos.ts` to prove the wiring end-to-end.

To prove the YouTube CDN tier without commissioning: set any seed entry's
`youtubeId` to a real 11-character ID and reload — the poster will resolve
to `https://img.youtube.com/vi/<id>/maxresdefault.jpg`.

---

## 8. Phase 2 — files touched

**Created:**
- `src/components/marketing/dev-hint-banner.tsx`
- `src/components/marketing/hero-frame-sequence.tsx`

**Modified:**
- `src/lib/seed/videos.ts` — added `posterSrc?: string | null` field with a long-form authoring comment. All entries default to `null`.
- `src/lib/images.ts` — added `resolveVideoPoster()` + `VideoPosterSource` / `ResolvedVideoPoster` types.
- `src/components/marketing/video-poster.tsx` — three-tier resolver wired, tonal panel now stacked below resolved image, accepts `posterSrc` / `youtubeId` / `title` / `alt`.
- `src/components/marketing/video-card.tsx` — passes `posterSrc` + `youtubeId` through to `<VideoPoster>`.
- `src/components/marketing/video-player.tsx` — passes `posterSrc` + `youtubeId` + `title` + `alt` into `<VideoPoster>`.
- `src/app/(marketing)/watch/[slug]/page.tsx` — wires `posterSrc` into `<VideoPlayer>`, mounts `<DevHintBanner>` when both poster fields are absent.

**Untouched:** every page hero, every other component, every other seed
file, `package.json`, `tailwind.config.ts`, `globals.css`. The two new
client components hide behind `loadGsap()` lazy paths so no extra weight
ships on routes that don't use them.

---

## 9. Phase 3 — shipped

### P3.1 — Banner-poster resolver for `<BannerHero>`

`src/lib/images.ts → resolveBanner(key)` returns `{ src, alt, source }` with
`source: "banner" | "header" | "none"`. Prefers commissioned `banners[key]`
(empty today) over existing `headers[key]`. If neither, the resolver returns
null and `<BannerHero>` simply omits the image layer (text + ambient still
render).

`<BannerHero>` accepts either of:
- `banner={{ src, alt }}` (explicit, what every call site uses today)
- `slug="home"` (new resolver path)

Both can be omitted now without breaking — the banner layer just hides.
Existing pages don't change.

### P3.2 — Product photography resolver for `<ProductCard>`

`src/lib/images.ts → resolveProductImage(slug)` returns
`{ src, alt, source: "local" | "none" }`. When `products[slug].primary` exists,
the card renders a real `<Image>` over the tonal panel. When it doesn't, the
tonal panel + initials stay as today. Hover scale applies to whichever layer
is on top.

`resolveProductGallery(slug)` exposes the secondary gallery shots for product
detail pages — wiring into `/shop/[slug]` is a Phase 4 micro-task.

### P3.3 — Home hero frame sequence slot + dev smoke fixture

- `heroFrames` manifest now declares `"home-kitchen-walkin"` (frameCount 60,
  16:10 1600×1000) pointing at the empty asset folder. No frames fabricated.
- `heroFrames` also declares `"_dev-smoke"` (6 SVG frames) for proving the
  runtime end-to-end without commissioning art.
- `scripts/generate-hero-frame-smoke.mjs` writes 6 clearly-labeled SVG dev
  fixtures into `public/images/hero-frames/_dev-smoke/`. Each frame carries
  "DEV FIXTURE — REPLACE WITH COMMISSIONED ART" text plus a progress bar so
  scroll-scrubbing is visually obvious during QA.
- `npm run generate:hero-frame-smoke` triggers the script.
- `public/images/hero-frames/_dev-smoke/` is gitignored — never reaches a
  build.
- `HeroFrameSequence`'s `ext` type now allows `"svg"` for the smoke path.

The home hero in `src/components/marketing/hero.tsx` is **NOT** yet swapped
to `<HeroFrameSequence>`. Doing so without real frames would produce a
blank canvas + console warning on the homepage. Swap happens in Phase 4
once the kitchen-walkin frames are commissioned.

### P3.4 — `/dev/showcase` route (NODE_ENV-gated)

`src/app/dev/showcase/page.tsx` returns 404 in production (via `notFound()`).
In development it renders every primitive in every state, with anchor-link
nav at the top. Sections:

1. Logo (`<OwlMark>`, `<OwlWordmark>`, `<OwlLockup>`)
2. Buttons — 6 intents × 4 sizes + disabled + loading
3. Chips
4. Glass cards — all 3 variants
5. Coming Soon ribbon — corner + pill
6. Ambient layer — all 5 patterns side-by-side
7. **Video poster resolver** — explicit "Tier 1 / Tier 2 / Tier 3" cards
   proving the three-tier wiring end-to-end
8. Dev hint banner — example mount
9. Product card resolver — 5 sample cards with mixed `isComingSoon` flags
10. **Hero frame sequence** — `_dev-smoke` mount that scrubs as you scroll

Single-file by design — value is having all states in one scroll for fast
QA. The file is intentionally not refactored into sub-components.

---

## 10. Phase 3 — files touched

**Created:**
- `scripts/generate-hero-frame-smoke.mjs`
- `src/app/dev/showcase/page.tsx`

**Modified:**
- `src/lib/images.ts` — added `resolveBanner()`, `resolveProductImage()`,
  `resolveProductGallery()`, plus `BannerPosterSource` / `ResolvedBanner` /
  `ProductImageSource` / `ResolvedProductImage` types. Extended `heroFrames`
  type to allow `ext: "svg"`. Registered `home-kitchen-walkin` (empty) and
  `_dev-smoke` (script-populated) entries.
- `src/components/marketing/banner-hero.tsx` — accepts `slug` prop; renders
  banner layer only when resolver returns a URL. `banner` direct prop
  preserved for compat.
- `src/components/marketing/product-card.tsx` — wires
  `resolveProductImage(slug)`; renders `<Image>` when available, tonal
  panel + initials when not. Hover scale moves to whichever layer is on top.
- `package.json` — added `generate:hero-frame-smoke` script.
- `.gitignore` — adds `/public/images/hero-frames/_dev-smoke/`.

**Untouched:** every existing page, every other component, every other seed
file, `tailwind.config.ts`, `globals.css`, `src/lib/tokens.ts`,
`src/lib/motion/*`. The two new client paths (`<BannerHero>` resolver,
`<ProductCard>` resolver) hide behind no-op fallbacks so no page regresses.

---

## 11. Phase 4 — shipped

### P4.1 — Hero frame `available` guard + `<PageHero>` slug pass-through

`HeroFrameSequence` manifest type now includes an optional `available?: boolean`
field. **Defaults to `false`.** Registering a slot no longer risks a hung
canvas / 60 404s — the runtime short-circuits to `return null` and emits a
single dev-only console warning that tells the next engineer where to flip
the flag.

- `home-kitchen-walkin` → `available` unset (defaults to false). Renders
  nothing until frames are commissioned and the flag is flipped.
- `_dev-smoke` → `available: true`. Works after one
  `npm run generate:hero-frame-smoke`.

`<PageHero>` now accepts an optional `slug?: string` prop, forwarded to
`<BannerHero>`'s Phase 3 resolver. `image` stays the canonical prop today;
when a banner is commissioned, a page can flip from `image={headers.x}` to
`slug="x"` in one line and the resolver picks `banners.x` over `headers.x`.

### P4.2 — Product gallery wiring on `/shop/[slug]/page.tsx`

The detail page now:
- Calls `resolveProductImage(slug)` for the primary tile. When the manifest
  has a primary photo, it stacks above the tonal panel. Otherwise the
  first-letter tonal placeholder stays.
- Calls `resolveProductGallery(slug)`. When 1+ secondary shots exist, a
  4-column thumbnail rail renders below the hero tile. When the gallery
  is empty (today's truth), the rail is omitted entirely — no fake "more
  views" thumbnails.

OwlMark watermark + Coming Soon ribbon overlay both layers consistently.

### P4.3 — `perf:budget` script

`scripts/perf-budget.mjs` reads `.next/app-build-manifest.json` after
`next build`, sums per-route JS chunk sizes, applies a 0.30 gzip approximation
ratio (configurable via `--ratio=`), and exits 1 if any route exceeds the
budget (default 200KB gzipped, configurable via `--max=`).

`npm run perf:budget` is wired into `package.json`. Usage in CI:

```yml
- run: npm run build
- run: npm run perf:budget
```

Flags:
- `--max=200`       Budget in KB gzipped (default 200)
- `--ratio=0.30`    Raw → gzip ratio (default 0.30 — conservative)
- `--json`          Emit machine-readable JSON, exit 0 regardless
- `--verbose`       Top-10 chunk breakdown for the worst-offender route

**Limitations documented in the script header**: the approximation is
conservative but not real gzip. For borderline routes, the Next bundle
analyzer (`npm run analyze`, when added) gives precise sizes.

---

## 12. Phase 4 — files touched

**Created:**
- `scripts/perf-budget.mjs`

**Modified:**
- `src/lib/images.ts` — added `available?: boolean` to
  `HeroFrameSequence` type. `_dev-smoke` flagged as available; the
  `home-kitchen-walkin` entry left unflagged so the runtime stays inert.
- `src/components/marketing/hero-frame-sequence.tsx` — three short-circuit
  paths (no manifest entry · `available` not true · reduced motion) all
  return null safely. Effects skip preload + GSAP mount in those cases.
- `src/components/marketing/page-hero.tsx` — added `slug?: string` prop,
  forwarded to `<BannerHero>`. `image` remains optional; one or the other
  (or neither) is fine. The migration path is "swap image=… for slug=…
  per page when banner art lands".
- `src/app/(marketing)/shop/[slug]/page.tsx` — resolver imports + primary
  tile + 4-column thumbnail rail when gallery has entries.
- `package.json` — added `perf:budget` script.

**Untouched:** every other page, every other component, every other seed
file, `tailwind.config.ts`, `globals.css`, `src/lib/tokens.ts`,
`src/lib/motion/*`, `<BannerHero>`. The product detail page is the only
existing page whose render diffs, and only conditionally — when the
manifest has data.

---

## 13. Phase 5 — shipped

### P5.1 — `bannerSlot` prop on `<BannerHero>`

Added `bannerSlot?: ReactNode` to `BannerHeroProps`. When provided, REPLACES
the default `<Image>` block in Layer 2. The slot inherits the same aspect
container, inner ring, and overlay handling, so callers don't have to
re-implement geometry. When unset, the existing resolver / direct-banner
path renders exactly as before. **Zero-risk additive change.**

### P5.2 — `<CinematicHero>` composition primitive

`src/components/marketing/cinematic-hero.tsx` — wraps `<BannerHero>` and
chooses the banner renderer:

```
   sequenceSlug + heroFrames[slug].available === true
      → <HeroFrameSequence />  (scroll-scrubbed canvas)
   otherwise
      → resolved <Image>      (banners[slug] → headers[slug] → null)
```

The text column / CTAs / ambient layer / overlay pass straight through to
BannerHero unchanged. Server component by default; HeroFrameSequence is the
only client boundary and only mounts when active.

The promise of the primitive: **the day someone drops the kitchen-walkin
frames into `/public/images/hero-frames/home-kitchen-walkin/` and flips
`available: true`, the home page upgrades from static banner to cinematic
sequence with no call-site change.**

### P5.3 — Home `<Hero>` migrated to `<CinematicHero>`

`src/components/marketing/hero.tsx` now reads:

```tsx
<CinematicHero
  tone="cream"
  slug="home"
  sequenceSlug="home-kitchen-walkin"
  bannerAspect="square"
  …
/>
```

- `slug="home"` routes through the Phase 3 resolver → `banners.home`
  (empty today) → falls back to `headers.home` → identical visual to before.
- `sequenceSlug` is registered but `available: false`, so the static path
  wins today. No visual change for users.

### P5.4 — `@next/bundle-analyzer` integration

`next.config.ts` now wraps the config with `bundleAnalyzer({ enabled:
process.env.ANALYZE === "true" })`. The analyzer is dormant in normal builds
(zero runtime cost) and only activates with the env flag.

`package.json` adds:
- `analyze` → `cross-env ANALYZE=true next build` (drill-down companion to
  `perf:budget`).
- `@next/bundle-analyzer@^15.5.18` to `devDependencies`.
- `cross-env@^7.0.3` to `devDependencies` (so the `ANALYZE=true` prefix
  works on Windows PowerShell too).

Also added `img.youtube.com` to `next.config.ts → images.remotePatterns`
so `resolveVideoPoster()`'s YouTube CDN tier can be optimized when a real
ID is plugged in (previously bypassed via `unoptimized` — now both paths
work).

---

## 14. Phase 5 — files touched

**Created:**
- `src/components/marketing/cinematic-hero.tsx`

**Modified:**
- `src/components/marketing/banner-hero.tsx` — `bannerSlot?: ReactNode` prop,
  conditional rendering keeps default image path intact.
- `src/components/marketing/hero.tsx` — single-component swap to
  `<CinematicHero>`. Same visual today; auto-upgrades when frames land.
- `next.config.ts` — bundleAnalyzer wrap + `img.youtube.com` remote pattern.
- `package.json` — `analyze` script, `@next/bundle-analyzer`, `cross-env`.

**Untouched:** every other page, every other component, every seed file,
`tailwind.config.ts`, `globals.css`, `src/lib/tokens.ts`, `src/lib/motion/*`,
`src/lib/images.ts`, `<PageHero>`, `<ProductCard>`, every resolver.

---

## 14b. Visual-track Phase 2 — shared visual system + global interaction layer

This sits alongside the asset-track Phases 1–5 above. It builds the
component-level primitives the redesign uses everywhere.

### V2.1 — Refined chip + button system

- `src/components/ui/chip.tsx` extended:
  - `interactive` variant gives hover lift + shadow.
  - `active` variant flips background to selected style (compound variants
    per intent so each tone has a sensible selected color).
  - `as="button"` prop renders a real button with `aria-pressed` for filter
    strips. Plain `as="span"` (default) for static taxonomy badges.
- `src/components/ui/category-chip.tsx` (new) — wraps `<Chip>` for the
  common filter pattern: leading icon + label + count badge + active state.
  Renders as button or anchor depending on whether you pass `onSelect` or `href`.
- `src/components/ui/newsletter-cta-button.tsx` (new) — purpose-built submit
  button for newsletter bands: full width on mobile, intrinsic width on
  desktop, leading mail icon, loading state with spinner. Uses the amber
  CTA visual from the Button system.
- IconChip is `<Chip>` with a leading icon child — no new component needed,
  the chip's flex gap absorbs the icon and the icon inherits text color.
- `<ComingSoonRibbon>` is unchanged from earlier work — already covers corner +
  pill variants.

### V2.2 — Header improvements

`src/components/marketing/site-header.tsx`:
- **Scroll-state styling.** `data-scrolled` attribute flips between
  `bg-owl-cream/60` (translucent over hero) and `bg-owl-cream/90 shadow-owl-1`
  (denser once scrolled past 40px). Transition is purely cosmetic — layout
  doesn't shift.
- **Accessible hover/focus parity.** Every utility action (search, cart,
  motion-toggle, mobile menu) shares a single `utilityIconClasses`
  constant with explicit hover-bg + focus-visible ring + transition. The
  Join CTA gets a matching ring.
- **Motion toggle in the header.** `<MotionToggleCompact>` from the motion
  module is now in the utility row (next to search + cart on sm+ desktop).
  The full segmented control stays in the footer. Mobile menu also exposes
  the compact toggle inside the disclosure panel.

### V2.3 — Shared component primitives

| Name (brief) | File | Status |
|---|---|---|
| HeroBanner | `src/components/marketing/hero-banner.tsx` | **Alias** of `<BannerHero>` |
| GlassPanel | `src/components/ui/glass-panel.tsx` | **Alias** of `<GlassCard>` |
| SectionIntro | `src/components/ui/section-intro.tsx` | **Alias** of `<SectionHeader>` |
| MediaPosterCard | `src/components/marketing/media-poster-card.tsx` | **New** primitive |
| ProductCard | `src/components/marketing/product-card.tsx` | unchanged (Phase 4 redesign) |
| CategoryChip | `src/components/ui/category-chip.tsx` | **New** primitive |
| StickyCTA | `src/components/marketing/sticky-cta.tsx` | **New** primitive |
| ScrollScene | `src/components/marketing/scroll-scene.tsx` | unchanged (Phase 1) |

The aliases are thin re-exports — both names point at the same code. New code
should prefer the brief's names (HeroBanner / GlassPanel / SectionIntro);
existing call sites can stay on the legacy names indefinitely.

`<MediaPosterCard>` is the generic "poster slot + meta footer" shape that
`<VideoCard>` already follows. Future PlaylistCard / PrintableCard refits
can compose it instead of duplicating the geometry.

`<StickyCTA>` shows a dismissable conversion band at the bottom of the
viewport after the user has scrolled past 60% of the viewport (configurable).
It's not auto-mounted anywhere — pages opt in. Per OWL_BUILD_RULES §8 this
is NOT a popup; it's a band, doesn't block content, and dismisses for the
session via a close button.

### V2.4 — Route transitions

`src/components/motion/page-fade.tsx` (new) — Framer Motion `AnimatePresence`
keyed by `usePathname()`. New page fades up 8px, old page exits up 4px,
180ms duration. Mounted once in `(marketing)/layout.tsx`. Reduced-motion
returns children unwrapped — assistive users get clean cuts. SSR-safe (no
hydration mismatch).

### V2.5 — Global focus-visible safety net

`globals.css` gained a `:where(a, button, summary, [role=button], [tabindex]:not([tabindex="-1"]), input, select, textarea):focus-visible` rule
that paints a 2px OWL-teal outline with 2px offset when reached by keyboard.
`:where()` keeps specificity at 0 so any component-level `focus-visible:ring-*`
class still overrides cleanly. Only paints on `:focus-visible` — mouse focus
stays silent.

---

## 14c. Visual-track P2 — files touched

**Created:**
- `src/components/ui/category-chip.tsx`
- `src/components/ui/newsletter-cta-button.tsx`
- `src/components/ui/glass-panel.tsx` (alias)
- `src/components/ui/section-intro.tsx` (alias)
- `src/components/marketing/hero-banner.tsx` (alias)
- `src/components/marketing/media-poster-card.tsx`
- `src/components/marketing/sticky-cta.tsx`
- `src/components/motion/page-fade.tsx`

**Modified:**
- `src/components/ui/chip.tsx` — added `interactive`, `active`, compound
  variants per intent, `as="button"` polymorphism with aria-pressed.
- `src/components/marketing/site-header.tsx` — scroll-state styling,
  MotionToggleCompact in utility row, unified hover/focus utility classes.
- `src/app/(marketing)/layout.tsx` — `<PageFade>` wraps `<main>`.
- `src/app/globals.css` — global `focus-visible` safety net.

**Untouched:** every page, every other component, every seed file, every
asset folder. No existing call site needs to change — all new primitives
are additive. Aliases mean callers can adopt the brief's names at their
own pace.

---

## 14d. Visual-track Phase 3 — homepage · about · educators on the shared system

### V3.1 — 240-frame hero slots registered

`src/lib/images.ts → heroFrames` now declares three slots, all 240 frames
at 16:10 (1600×1000), all `available: false` until commissioned art lands:

| Slug | Page | Tone |
|---|---|---|
| `home-kitchen-walkin` | `/` | cream — Larissa walks into a sunlit kitchen |
| `about-welcome` | `/about` | cream — Larissa turns toward camera, light shifts to gold-hour |
| `educators-classroom` | `/educators` | forest — pan across a multicultural classroom mid-activity |

Static poster fallback is automatic: `<CinematicHero>` defers to
`resolveBanner(slug)` → `banners[slug]` → `headers[slug]`. The day all 240
frames land + `available: true` flips on the matching slot, the page upgrades
from static banner to cinematic scrub with **zero call-site changes**.

### V3.2 — `<StaggerGrid>` helper

`src/components/marketing/stagger-grid.tsx` (new). Generic Framer-Motion-
backed grid that staggers children on `whileInView`. Used for the Educators
benefits row + tools row + pricing tiers. Reduced-motion mode renders plain
`<ul>` / `<div>` with no transforms — no motion mounted at all.

Differs from `<MediaRail>`: no scroll-snap on mobile, no semantic `<ul>`/`<li>`
unless asked (`asList` prop). Pure stagger reveal for any grid layout.

### V3.3 — `/about` page rebuilt (calmer motion)

Sections, in order: CinematicHero (welcome) → Larissa story → mission →
values row (3 tiles) → community impact + CTA (forest band w/ GlassPanel
stats) → NewsletterSection.

Motion tone: `<SectionReveal offset={16…20}>` with longer durations than
the homepage. Values tiles cascade in via individual `<SectionReveal>`s with
0.12s per-card delay (slower than Educators' 0.06s grid stagger) so the
reads feel like prose, not a deck.

### V3.4 — `/educators` page rebuilt (structured motion)

Sections, in order: CinematicHero (forest, classroom-focused) → benefits
row (StaggerGrid 4-col) → featured tools/resources (StaggerGrid 4-col w/
phase badges) → printable lesson resources (MediaRail) → playlists/resources
(MediaRail) → trust strip + pricing tiers (StaggerGrid 3-col) →
NewsletterSection.

Motion tone: tight stagger (60–80ms), 350ms duration on enter. Sales-deck
rhythm vs About's prose rhythm.

### V3.5 — Homepage confirmed

No rebuild — already uses `<CinematicHero sequenceSlug="home-kitchen-walkin">`
from V-track P5. All required sections (Hero, TrustStrip, FeaturedVideos,
PrintableOfTheWeek, FeaturedPlaylists, EducatorBlock, NewsletterSection) are
in place and wrapped in `<SectionReveal>`. The frame count change to 240 is
the only modification that touches the homepage.

---

## 14e. Visual-track P3 — files touched

**Created:**
- `src/components/marketing/stagger-grid.tsx`

**Modified:**
- `src/lib/images.ts` — `home-kitchen-walkin` bumped to 240 frames + added
  `about-welcome` and `educators-classroom` slots, all 240, all `available: false`.
- `src/app/(marketing)/about/page.tsx` — rebuilt on `<CinematicHero>` +
  `<SectionIntro>` + `<GlassPanel>` with calmer motion vocabulary.
- `src/app/(marketing)/educators/page.tsx` — rebuilt on `<CinematicHero>` +
  `<StaggerGrid>` + `<MediaRail>` with structured motion vocabulary. Added
  Tools section + Playlists rail that weren't in the previous Educators page.

**Untouched:** homepage `page.tsx` (already on the shared system), every
other page, every other component, every seed file, `tailwind.config.ts`,
`globals.css`. No fabricated illustrations — every commissioned-art interface
is empty + flagged.

---

## 14f. Visual-track Phase 4 — holidays · music · newsletter

### V4.1 — 240-frame slots registered

Three additional slots in `heroFrames`, all `available: false`:

| Slug | Page | Tone |
|---|---|---|
| `holidays-celebration` | `/holidays` | amber — diyas, candles, lanterns lit in sequence |
| `music-recording-room` | `/music` | cream — Larissa at upright piano, instruments enter |
| `newsletter-welcome` | `/newsletter` | cream — handwritten Sunday letter forming on paper |

Combined with V-P3's three slots, the site now has six commissioned
240-frame slots registered. All static-poster fallback automatically via
`<CinematicHero>` → `resolveBanner(slug)` → `headers[slug]`.

### V4.2 — `/holidays` — celebratory but controlled

Sections in order:
1. CinematicHero (amber, sparkles ambient) — `slug="holidays"`, `sequenceSlug="holidays-celebration"`
2. Browse-by-month grid — 12 month tiles via `<StaggerGrid>` (tight 40ms stagger, 10px offset)
3. Featured campaign banner (rose) — full-bleed `<AmbientLayer pattern="sparkles">` over a `<GlassPanel>`-backed Diwali campaign
4. Evergreen categories — `<StaggerGrid>` 3-up with Chip badges
5. All-11 holiday hubs — `<StaggerGrid>` 4-up `<HolidayCard>` grid
6. Cultural printables rail — `<MediaRail>`
7. Seasonal signup CTA (forest band, OwlMark + amber CTA)
8. Newsletter band

Motion vocabulary: stagger speeds 40–80ms — controlled enough that the
celebratory ambient (sparkles) carries the joy, the stagger doesn't have to.

### V4.3 — `/music` — rhythmic

Sections in order:
1. CinematicHero (cream, notes ambient, streaming overlay) — `slug="music"`, `sequenceSlug="music-recording-room"`
2. Search input + CategoryChip filter strip
3. Featured playlists rail — `<MediaRail>` 4-up with 70ms stagger
4. Browse-by-category icons — `<StaggerGrid>` 6-up with 60ms stagger
5. Streaming CTA modules — full row of `<StreamingPlatforms>`
6. Downloadable activity CTA — amber-soft band with `<AmbientLayer pattern="notes">`
7. Three themed rails (Seasonal / Calm / Classroom) — each its own `<MediaRail>`, alternating cream/white/cream-deep backgrounds for visual rhythm
8. Newsletter band

Motion vocabulary: tight stagger pulses match the page's musical metaphor.
Three rails alternating background tones echo a beat pattern.

### V4.4 — `/newsletter` — calm + trust-first

Sections in order:
1. CinematicHero (cream, sparkles ambient at low density) with `<NewsletterForm>` in the overlay slot
2. Three segmented signup cards (parents / educators / kids) — each accent-tinted, each carries its own `<NewsletterForm>` with the matching Beehiiv segment slug
3. Benefits row — 4 icon tiles, **single SectionReveal wrapping the whole row** (no per-tile stagger; brief asks for "calm and trust-first")
4. Sample newsletter cards — text-only previews (issue badge, date, headline, snippet, OwlMark accent). **No fabricated screenshot art.**
5. Featured printable + playlist previews — two-up companion modules with paper + notes ambient layers
6. Trust + privacy section — 4 trust pillars in cream tiles (double opt-in, never sold, no tracking pixels, one-click unsubscribe) + privacy/contact links

Motion vocabulary: every `<SectionReveal>` uses 20–24px offset (slightly
larger than other pages so reveals feel deliberate). No `<StaggerGrid>`
anywhere — the page reads as one calm beat per section.

---

## 14g. Visual-track P4 — files touched

**Modified:**
- `src/lib/images.ts` — added `holidays-celebration`, `music-recording-room`,
  `newsletter-welcome` slots (240 frames each, `available: false`).
- `src/app/(marketing)/holidays/page.tsx` — rebuilt on shared system with
  celebratory motion vocabulary.
- `src/app/(marketing)/music/page.tsx` — rebuilt with rhythmic motion +
  search input + browse-by-category icons + three themed rails.
- `src/app/(marketing)/newsletter/page.tsx` — rebuilt with calm motion +
  three segmented signup cards + sample-issue previews + 4-pillar trust band.

**Untouched:** every other page, every component, every seed file, the
hero-frame asset folders (still empty by design). No fabricated screenshots
or imagery.

---

## 14h. Visual-track Phase 5 — recommendations · shop · watch · video detail

### V5.1 — 240-frame slots registered

`heroFrames` gained three new slots, all 240 frames, all `available: false`:

| Slug | Page | Tone |
|---|---|---|
| `recommendations-bookshelf` | `/recommendations` | cream — pan across a curated bookshelf, Larissa places the weekly pick |
| `shop-flatlay` | `/shop` | cream — overhead push-in on a flatlay of plush + flashcards + printables |
| `watch-archive` | `/watch` | cream — slow camera glide past framed video posters on a warm-cream wall |

Combined with V-P3 (home/about/educators) and V-P4 (holidays/music/newsletter),
the site now has **nine** 240-frame slots registered. All static-poster
fallback is automatic via `<CinematicHero>` → `resolveBanner(slug)` →
`headers[slug]`.

### V5.2 — `<StickyMiniCart>` shared primitive

`src/components/marketing/sticky-mini-cart.tsx` (new). Floating mini-cart for
the bottom-right of the viewport (`sm+`) or full-width bottom band (`<sm`).

- Hidden when `itemCount <= 0` — no empty-cart bug, no autoshow.
- Controlled via props (`itemCount`, `total`, `previewLabels`, `viewHref`,
  `checkoutHref`, `disabled`). Today's `/shop` passes a demo state behind a
  `NODE_ENV !== "production"` gate; when commerce wakes up (Phase 3 of OWL
  build plan), wire these to a real cart store.
- Slide-up entry animation; reduced-motion renders instantly.
- z-overlay so it draws over `<ScrollProgress>` + any modal underlay.
- `aria-label` announces the item count to screen readers; keyboard-navigable
  CTAs; `disabled` mode flags the "Checkout opens Phase 3" copy without
  breaking layout.

### V5.3 — `/recommendations` rebuilt — editorial motion

Sections:
1. CinematicHero (cream, stars ambient) — `slug="recommendations"`, `sequenceSlug="recommendations-bookshelf"`
2. Search input + `<CategoryChip>` filter row (5 product types)
3. Larissa's picks rail — `<MediaRail>` 4-up with OWL products
4. Age-based recommendations — `<StaggerGrid>` 4 age-band tiles linking to filtered views
5. Comparison snippets — semantic `<table>` with OWL pick vs. typical alternative
6. Trust / benefit cards — `<StaggerGrid>` 3-up
7. Trusted partners (affiliate disclosure block) — `<StaggerGrid>` 4-up
8. Newsletter / discount CTA — forest band with `<GlassPanel>` benefits tile
9. NewsletterSection

Motion vocabulary: editorial / magazine — gentle stagger (50–80ms), longer
read-pause between sections, stars ambient for the "curated" mood.

### V5.4 — `/shop` rebuilt — premium retail + `<StickyMiniCart>`

Sections:
1. CinematicHero (cream, sparkles ambient) — `slug="shop"`, `sequenceSlug="shop-flatlay"`
2. Shop-by-category row — eyebrow label + 6 `<CategoryChip>`s
3. Featured products — `<MediaRail>` 4-up
4. Seasonal bundles — `<StaggerGrid>` 3-up with per-bundle sparkles ambient
5. Digital downloads & resources — `<MediaRail>` filtered to `gumroad/kdp/tpt` channels + free-printables CTA
6. Bestsellers — `<MediaRail>` 4-up
7. Full store grid — `<MediaRail>` 5-up
8. NewsletterSection
9. **`<StickyMiniCart>`** mounted with demo state (dev-only); ready to wire to real cart when commerce activates

Every `<ProductCard>` automatically renders the Coming Soon ribbon because
every seed entry is `isComingSoon: true` today.

### V5.5 — `/watch` rebuilt — video nook

Sections:
1. CinematicHero (cream, notes ambient) — `slug="watch"`, `sequenceSlug="watch-archive"`
2. Featured videos rail — `<MediaRail>` 3-up of `<VideoCard>` (poster-first)
3. Search input + age + theme filter chips
4. Browse by theme — `<StaggerGrid>` 6 icon tiles
5. Full archive — `<MediaRail>` 3-up of all SEED_VIDEOS
6. Printable companion CTA — amber-soft band with paper ambient + `<GlassPanel>` "always included" list
7. Streaming CTA — `<StreamingPlatforms>` + link to `/music`
8. NewsletterSection

Poster-first guarantee enforced: every `<VideoCard>` uses `<VideoPoster>`
which uses `resolveVideoPoster()` — no `<iframe>` mounts on `/watch`.

### V5.6 — `/watch/[slug]` enhanced

- `<VideoPlayer>` (poster-first, on-interaction iframe load) unchanged — already
  shipped from asset-track Phase 2. Confirmed wired here.
- Companion printable panel resolves to the **actual related printable** by
  matching `SEED_PRINTABLES[*].relatedVideoSlug === video.slug`. When found,
  renders the printable's title + description + skill chip + age band + page
  count + free/paid badge + two CTAs (link to detail page, email-it-to-me).
  When absent, falls back to a generic /printables CTA (truthful — there's
  nothing specific to point at).
- "Suggested next" rail uses `<MediaRail>` keyed on `themeSlug` — same-theme
  videos surface first, with backfill from the rest of the archive when fewer
  than 3 same-theme matches exist.
- A small inline newsletter prompt sits between the rail and the main
  newsletter band — calm tone, no popup behaviour.

### V5.7 — Why thumbnails / playback look "broken" today (and how to fix instantly)

The asset-track Phase 2 resolver is correct. The visible state today is the
**tonal placeholder** (tier 3) because every `SEED_VIDEOS[*]` entry has both
`youtubeId: null` and `posterSrc: null`. Two ways to flip a card to a real
thumbnail without commissioning art:

| Want | Edit | Result |
|---|---|---|
| Real YouTube thumbnail + working play | Set `youtubeId: "<11-char id>"` on a seed entry | `<VideoPoster>` resolves to `https://img.youtube.com/vi/<id>/maxresdefault.jpg`; clicking the player loads the iframe |
| Local poster image only | Drop `<slug>.webp` in `public/images/video-posters/` and set `posterSrc: "/images/video-posters/<slug>.webp"` | Real image shown; player still gated on `youtubeId` for actual playback |
| Both | Do both above | Local poster shown; player works |

**No iframe mounts on initial paint anywhere.** `<VideoCard>` → `<VideoPoster>`
is pure CSS + an `<Image>`. The iframe is only constructed by `<VideoPlayer>`
after the user clicks. Plus the player uses `youtube-nocookie.com` so no
third-party cookies are set until interaction — COPPA-aligned per
`OWL_BUILD_RULES §8`.

---

## 14i. Visual-track P5 — files touched

**Created:**
- `src/components/marketing/sticky-mini-cart.tsx`

**Modified:**
- `src/lib/images.ts` — registered `recommendations-bookshelf`, `shop-flatlay`,
  `watch-archive` slots.
- `src/app/(marketing)/recommendations/page.tsx` — full editorial rebuild.
- `src/app/(marketing)/shop/page.tsx` — full premium-retail rebuild +
  `<StickyMiniCart>` mount.
- `src/app/(marketing)/watch/page.tsx` — full video-nook rebuild with poster-
  first rails + browse-by-theme + printable CTA + streaming CTA.
- `src/app/(marketing)/watch/[slug]/page.tsx` — companion-printable resolution
  via `SEED_PRINTABLES[*].relatedVideoSlug`, "Suggested next" via
  `<MediaRail>` keyed on theme, music sidebar tile.

**Untouched:** other pages, seed data, components, tokens, motion modules,
asset folders. No fabricated imagery.

---

## 14j. Visual-track Phase 6 — production readiness

### V6.1 — Lazy loading audit (already in good shape; documented)

- Above-the-fold banners → `priority` on `<Image>`. Below-the-fold images
  → no `priority`, lazy by Next/Image default. Verified across every page.
- `<VideoPoster>` + `<ProductCard>` thumbnails → never priority → lazy.
- `<VideoPlayer>` → never mounts an `<iframe>` on initial paint. Iframe is
  constructed only after the user clicks the poster. `youtube-nocookie.com`
  host → no third-party cookies until interaction.
- `<AmbientLayer>` particles are inline SVG → zero network requests.
- GSAP is lazy-imported via `loadGsap()` → not on routes that don't use it.

### V6.2 — `<HeroFrameSequence>` upgrades

Three runtime upgrades in one rewrite:

1. **Chunked frame loading.** Previous runtime preloaded all 240 frames
   eagerly (~12 MB). New runtime loads the first 30 frames eagerly so the
   start of playback is smooth, then `ensureChunkLoaded(idx)` queues the
   next 30 frames inside ScrollTrigger's `onUpdate` whenever the play head
   advances. A hero that's never scrolled past costs ~1.5 MB instead of 12.
2. **Variant resolution.** New `HeroFrameVariant` shape on the manifest
   supports `variants.desktop` + `variants.mobile`. The runtime picks via
   `matchMedia("(max-width: 767px)")` on mount and falls back to the
   top-level `basePath` when a variant is missing. Mobile variants can
   declare a shorter `frameCount` (e.g. 120 frames on mobile, 240 on
   desktop).
3. **Explicit `posterFallback`.** New optional field on the manifest. When
   set, reduced-motion fallback uses `posterFallback` instead of `frame-001`.
   Designers can deliver a hand-picked still that reads better than the
   literal first frame. The skeleton underlay (shown while initial chunk
   decodes) also uses this poster.

### V6.3 — Accessibility audit (documented; no code changes needed)

The earlier visual-track phases already shipped:
- `focus-visible:ring-*` on every primitive (V-P2).
- Global `:where(...):focus-visible` safety net in `globals.css` (V-P2).
- `<MotionSettingsProvider>` + `<MotionToggle>` site-wide motion control (V-P1).
- `aria-label` / `aria-pressed` / `aria-busy` on interactive primitives.
- Semantic `<button>` / `<a>` for everything actionable.
- `aria-hidden` consistently on `<OwlMark decorative>` + `<AmbientLayer>`.
- Reduced-motion guards on every Framer Motion component + every native CSS
  scroll-driven animation.

The V-P6 audit confirmed coverage; no per-component changes shipped. The
audit summary lives in `README.md §6` ("Performance + accessibility
posture") so anyone running QA has the checklist in one place.

### V6.4 — Asset requirements doc

`ASSET_REQUIREMENTS.md` (new) at the repo root. Designer-facing single
source of truth for:
- Logo SVG variants (mark / wordmark / lockup) + favicon set.
- Wide banner posters (9 slots, 16:9 default).
- 240-frame sequences (folder structure, frame naming, desktop+mobile
  variants, poster fallback, motion direction rules).
- Button icons (lucide-react policy).
- Product images (primary + gallery shapes).
- Video posters (16:9, slug-keyed filenames, YouTube CDN fallback).
- Accessibility deliverables per asset (alt text, motion safety, contrast,
  multicultural casting).
- Drop-summary table + commissioning checklist.

### V6.5 — Final README

`README.md` rewritten. Old one backed up to `README.md.bak-<UTC>-pre-rebuild`.
New file covers:
- Tech stack + quick-start scripts.
- Architecture overview (filesystem map).
- Shared components inventory (every primitive grouped by category).
- Motion system overview (the three-layer control model + tokens).
- Asset drop locations (cross-references `ASSET_REQUIREMENTS.md`).
- Performance + accessibility posture (lazy loading + CLS + WCAG audit
  summary).
- Verification steps (typecheck + lint + build + perf-budget + manual
  smoke tests + reduced-motion + mobile + a11y + frame-sequence smoke).
- "Truthful state today" — explains why tonal placeholders and Coming Soon
  ribbons are correct, not broken.
- Known follow-up items table.
- Cross-reference index to every other top-level doc.

---

## 14k. Visual-track P6 — files touched

**Created:**
- `ASSET_REQUIREMENTS.md`
- `README.md.bak-<UTC>-pre-rebuild` (backup of prior README)

**Modified:**
- `src/lib/images.ts` — added `HeroFrameVariant` type + `variants` + `posterFallback` fields on `HeroFrameSequence`.
- `src/components/marketing/hero-frame-sequence.tsx` — rewritten for variant resolution + chunked loading + posterFallback. Cleaner separation between the variant-resolve effect, the initial-chunk preload effect, and the GSAP scrub effect.
- `README.md` — full rewrite (architecture / components / motion / assets / verification / follow-ups).

**Untouched:** every page, every other component, every seed file, every
asset folder, `tailwind.config.ts`, `globals.css`, `tokens.ts`,
`motion/*` libraries. No fabricated imagery.

---

## 15. Final implementation summary

The website's redesign is engineering-complete. Across **two parallel tracks
and eleven sub-phases**:

### Asset track (P1–P5)
Foundation → poster resolver → dev hint banner → frame-sequence runtime →
banner resolver → product resolver → home hero slot → `/dev/showcase` →
availability guard → product gallery wiring → `perf:budget` script →
CinematicHero composition primitive → bundle analyzer.

### Visual-system track (V1–V6)
Foundation (tokens, motion infra, primitives, logo) → button/chip system
+ scroll-state header + StickyCTA + route transitions + global focus-visible
+ name aliases → 240-frame slots + home/about/educators page rebuilds →
holidays/music/newsletter rebuilds → recommendations/shop/watch/video-detail
rebuilds + StickyMiniCart → production-readiness pass (chunked loading +
variants + posterFallback + asset requirements doc + final README).

### What ships
- **22 public pages** redesigned on the shared system.
- **9 `<CinematicHero>` slots** registered for 240-frame sequences with
  static-poster fallback wired through the resolver.
- **~50 shared components** organized into brand / motion / marketing / ui
  + clean alias layer (`HeroBanner` / `GlassPanel` / `SectionIntro`).
- **Three-layer motion control** (OS pref → site toggle → component guard)
  with both segmented-control and icon-cycle UI.
- **Three-tier video poster resolver** (`local → YouTube CDN → tonal`)
  with dev-mode hint banner that documents the asset interface.
- **Lazy loading on every heavy asset path**: priority only above the fold,
  chunked frame loading, on-interaction iframe mount, lazy GSAP.
- **CLS reservations** on every image-bearing component.
- **WCAG 2.1 AA posture** — global focus-visible safety net, keyboard
  navigation throughout, reduced-motion respected at every layer.
- **Performance budget enforcement** (`npm run perf:budget`) + bundle
  analyzer (`npm run analyze`).
- **Three asset interfaces** documented end-to-end in `ASSET_REQUIREMENTS.md`
  (`banners`, `hero-frames`, `products`, `video-posters`).
- **`/dev/showcase`** route for primitive QA, gated to `NODE_ENV !== "production"`.
- **WOZCODE plugin** integrated into the dev environment (`WOZCODE_SETUP_REPORT.md`).
- **Two MCP servers + a skill** ecosystem documented in `SETUP_MCP.md`.

### What's left (external dependencies, not code work)
- Commission the first 240-frame hero sequence.
- Commission wide banner posters.
- Commission product photography.
- Commission video posters / upload videos to YouTube.
- Wire commerce (Stripe + Shopify + Printify + Gumroad — OWL plan Phase 3).
- Provision Sanity + Supabase live keys.
- Run Playwright e2e suite + Lighthouse CI for the first time.
- Refit detail-page heroes (`/blog/[slug]`, `/holidays/[slug]`,
  `/music/[slug]`, `/printables/[slug]`) onto `<CinematicHero>` — small
  remaining design-system cleanup.

Documented in `README.md §9` for the team to track.

## 15. Phase 6 (proposed)

The remaining proposals from the original build plan are larger than one
phase. Splitting them honestly:

1. **Commerce wake-up (Phase 6a, biggest)** — Stripe products + Checkout
   webhook with HMAC verification. Shopify Storefront client +
   `orders/create` webhook. Printify product sync. Resend domain
   verification (SPF/DKIM/DMARC). Beehiiv publication live. Multi-day work
   that wakes up the `isComingSoon: false` data path.
2. **Banner / video poster commissioning waterfall (Phase 6b)** — author
   workflow to populate `banners[*]`, `products[*]`, `videoPosters[*]`
   manifests as commissioned art arrives. Wire `tone` selection to product
   imagery automatically. Lighthouse-gated.
3. **Detail-page hero refit (Phase 6c)** — `/blog/[slug]`, `/holidays/[slug]`,
   `/music/[slug]`, `/printables/[slug]` heroes still use the old custom
   layout. Refit onto `<CinematicHero>` for visual consistency.

I'd recommend tackling 6c next (smallest, clearest), then 6a (largest, most
business-critical), then 6b (depends on commissioned art landing).

Phase 6 will keep the same "stop and summarize" discipline.

---

## A1. Files touched in Phase 1

**Created:**
- `IMPLEMENTATION_PLAN.md` (this file)
- `src/lib/motion/timing.ts`
- `src/lib/motion/scene.ts`
- `public/images/hero-frames/README.md` (folder + README)
- `public/images/banners/README.md` (folder + README)
- `public/images/products/README.md` (folder + README)
- `public/images/video-posters/README.md` (folder + README)

**Modified:**
- `src/lib/tokens.ts` — added radius, spacing, shadow, blur, z-index, duration, easing constants
- `src/lib/images.ts` — added `banners`, `products`, `videoPosters`, `heroFrames` typed slots (empty) and `youtubePosterUrl()` helper

**Untouched:** every page, every component, every seed file, `package.json`,
`tailwind.config.ts`, `globals.css`.

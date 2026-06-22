# ASSET_REQUIREMENTS.md

**Audience:** designers and asset producers (Larissa, illustrators, photographers, motion artists)
**Last updated:** 2026-05-15

This document tells you exactly what to deliver, where the files go, and what
the build expects. The site code is already wired for everything below — when
files land in the documented locations, they activate automatically.

If anything here is unclear, the source-of-truth for the brand is
[DESIGN.md](./DESIGN.md) at the repo root and
`..\OWL-Obsidian-Brain\09_Design_System\DESIGN_STYLE_GUIDE.md`.

---

## 1. Logo system (SVG)

The site ships with a placeholder vector OWL logo built from brand tokens
(`src/components/brand/owl-logo.tsx`). Final commissioned art replaces the
inside of that file but keeps the export names: `<OwlMark>`, `<OwlWordmark>`,
`<OwlLockup>`.

| Variant | Where it's used | Required deliverable |
|---|---|---|
| Mark | Header, video posters, watermarks | Square SVG, viewBox 48×48, transparent background |
| Wordmark | Side-by-side header lockup, footer | SVG, viewBox 240×56, transparent, type-on-baseline |
| Lockup | Header brand link | Composition of mark + wordmark, padded |
| Favicon | Browser tab + iOS / Android launcher | `.ico` + 192×192 + 512×512 PNG (separate from the SVG mark) |

**Color rules:**
- Use OWL CSS variables, not hard-coded hex: `var(--owl-teal)`, `var(--owl-amber)`, `var(--owl-ink)`, `var(--owl-cream)`. Files that hard-code hex will need a refactor; SVG that references the tokens swaps cleanly between light/dark contexts.
- Stroke widths consistent across variants (recommend `1.2`–`1.6` for outlines).

**Drop location:** replace the SVG paths inside `src/components/brand/owl-logo.tsx`. Do not commit raster PNG/JPG copies of the logo into `public/images/brand/` for the marks — only the favicon set.

---

## 2. Hero posters (static fallback for every page)

Every page is banner-led via `<CinematicHero>`. When a 240-frame sequence
isn't available, the component falls back to a static `<Image>` resolved
through `resolveBanner(slug)` → `banners[slug]` → `headers[slug]` → null.

### 2.1 Banner posters (preferred, wide horizontal)

The Phase 1 manifest is at `src/lib/images.ts → banners`. Drop wide horizontal
posters here when commissioned. **Aspect ratio:** 16:9 (default), 21:9
(cinematic), or 5:4 (square-leaning). The page tells the runtime which aspect
via the `<CinematicHero bannerAspect="…">` prop, so plan the crop accordingly.

| Slug | Page | Tone | Required |
|---|---|---|---|
| `home` | `/` | cream | 1600×900 wide; OR sequence (see §3) |
| `about` | `/about` | cream | 1600×900 wide |
| `educators` | `/educators` | forest | 1600×900 wide (darker palette) |
| `holidays` | `/holidays` | amber | 1600×900 wide |
| `music` | `/music` | cream | 1600×900 wide |
| `newsletter` | `/newsletter` | cream | 1600×900 wide |
| `recommendations` | `/recommendations` | cream | 1600×900 wide |
| `shop` | `/shop` | cream | 1600×900 wide |
| `watch` | `/watch` | cream | 1600×900 wide |
| `app` | `/app` | cream | 1600×900 wide |
| `blog` | `/blog` | cream | 1600×900 wide |
| `contact` | `/contact` | cream | 1600×900 wide |
| `gallery` | `/gallery` | cream | 1600×900 wide |
| `printables` | `/printables` | cream | 1600×900 wide |

**File format:** WebP first, PNG only if transparency is required.
**Compression target:** ≤ 350 KB at 1600px wide. Next/Image handles per-request resizing.
**Drop location:** `public/images/banners/<slug>.webp`
**Manifest:** add an entry to `src/lib/images.ts → banners`, e.g.

```ts
banners = {
  home: { src: "/images/banners/home.webp", alt: "Larissa welcomes children…" },
  // ...
}
```

### 2.2 Legacy headers (fallback layer)

The existing portrait imagery in `public/images/headers/*.png` continues to
work as the fallback. When `banners[slug]` is unset, the resolver picks up
`headers[slug]` automatically. No designer work required to keep current art
visible — only when you want to **replace** with the new wide banner format.

---

## 3. Cinematic 240-frame sequences

Per the redesign brief, every page's hero is "ready for 240-frame scroll-scrub
sequences plus static poster fallback." Nine slots are registered today, all
`available: false`:

| Slug | Page | Tone | Vibe (per manifest) |
|---|---|---|---|
| `home-kitchen-walkin` | `/` | cream | Larissa walks into a sunlit kitchen while children settle in |
| `about-welcome` | `/about` | cream | Larissa turns toward camera, light shifts to gold-hour |
| `educators-classroom` | `/educators` | forest | Pan across multicultural classroom, Larissa at the back |
| `holidays-celebration` | `/holidays` | amber | Diyas/candles/lanterns lit in sequence on cultural table |
| `music-recording-room` | `/music` | cream | Larissa at upright piano, instruments enter frame |
| `newsletter-welcome` | `/newsletter` | cream | Handwritten Sunday letter forming on cream paper |
| `recommendations-bookshelf` | `/recommendations` | cream | Curated bookshelf pan, Larissa places weekly pick |
| `shop-flatlay` | `/shop` | cream | Overhead push-in on flatlay of plush + flashcards + printables |
| `watch-archive` | `/watch` | cream | Slow camera glide past framed video posters on cream wall |

### 3.1 Folder structure (mandatory)

```
public/images/hero-frames/
└── <slug>/
    ├── desktop/
    │   ├── frame-001.webp
    │   ├── frame-002.webp
    │   ├── ...
    │   └── frame-240.webp
    ├── mobile/
    │   ├── frame-001.webp
    │   ├── ...
    │   └── frame-240.webp     ← can be shorter, e.g. 120 frames
    └── poster.webp             ← static fallback for reduced-motion + skeleton
```

Or simpler form (no variants — runtime falls back gracefully):

```
public/images/hero-frames/
└── <slug>/
    ├── frame-001.webp
    ├── ...
    └── frame-240.webp
```

### 3.2 Frame naming convention

- **Filename:** `frame-NNN.<ext>` where `NNN` is **zero-padded to 3 digits** (`001` through `240`).
- **Extension:** `webp` strongly preferred. `png` accepted when transparency is required (rare for heroes). `jpg` accepted for photographic sequences. `svg` reserved for dev smoke fixtures only.
- **Dimensions per variant:**
  - Desktop: 1920×1080 (16:9) or 1600×1000 (16:10) as registered in the manifest.
  - Mobile: 750×1000 (3:4) or whatever the manifest declares.
- **Compression target:** ≤ 50 KB per frame. 240 × 50 KB = 12 MB total, of which only the first 30 frames load eagerly.
- **Frame count flexibility:** Mobile can be shorter than desktop (e.g. desktop 240 / mobile 120). Register the override in the manifest's `variants.mobile.frameCount`.

### 3.3 Manifest entry (after frames land)

```ts
// src/lib/images.ts → heroFrames["<slug>"]
{
  basePath: "/images/hero-frames/<slug>/desktop",
  frameCount: 240,
  ext: "webp",
  width: 1920,
  height: 1080,
  alt: "Larissa walks into a sunlit kitchen…",
  available: true,                                 // ← flip this when frames land
  variants: {
    desktop: { basePath: "/images/hero-frames/<slug>/desktop", width: 1920, height: 1080 },
    mobile:  { basePath: "/images/hero-frames/<slug>/mobile",  width: 750,  height: 1000, frameCount: 120 },
  },
  posterFallback: "/images/hero-frames/<slug>/poster.webp",
}
```

### 3.4 Static poster (mandatory companion)

**Every commissioned sequence MUST ship with a `poster.webp`** — the runtime
renders it under three conditions:
- The user has `prefers-reduced-motion: reduce`.
- The site-wide motion toggle is OFF.
- Initial frames haven't decoded yet (skeleton layer behind the canvas).

The poster does NOT have to be `frame-001`. Pick whichever frame reads best
as a still — often a frame from the middle of the sequence where lighting +
composition are most resolved.

### 3.5 Motion direction rules

- **No abrupt cuts.** Linear interpolation between frames.
- **No flashing lights.** Photosensitive-friendly.
- **Slow pace.** Each frame represents ~0.5%–1.0% of a calm beat. The whole
  sequence consumes one full scroll viewport (~150vh by default).
- **Frame 1 must be a usable still on its own.** Reduced-motion users see it.
- **No on-frame text overlays.** Text is the layer-4 responsibility (HTML on top).

---

## 4. Button icons (lucide-react)

**Policy:** All icons come from `lucide-react`. **Do not** commission custom
icon art unless the design system needs a brand-specific symbol not covered
by Lucide.

If you need a Lucide icon swapped, the substitution is a single-line edit
in the consuming component — no asset delivery required.

**Custom icons (rare):**
- Place SVGs in `src/components/icons/<name>.tsx` as inline-SVG React components.
- Use `currentColor` for stroke/fill so the icon inherits surrounding text color.
- Single-color only — multi-color icons should be raster images, not SVG icons.

---

## 5. Product images

The Phase 2 product resolver (`resolveProductImage(slug)`) reads from
`src/lib/images.ts → products` and stacks a real `<Image>` over the tonal
placeholder when files exist.

### 5.1 Folder structure

```
public/images/products/
└── <product-slug>/
    ├── primary.webp       ← 1:1 hero tile, used in <ProductCard>
    ├── lifestyle-1.webp   ← 4:5 lifestyle/context shot
    ├── lifestyle-2.webp   ← alternate angle
    └── back.webp          ← back / variant view
```

### 5.2 Aspect ratios + sizes

- **Primary (card thumb):** 1:1 ratio, 1200×1200 baseline. Compressed ≤ 250 KB.
- **Gallery (detail page):** 4:5 ratio, 1200×1500 baseline. Compressed ≤ 250 KB.

### 5.3 Manifest entry

```ts
// src/lib/images.ts → products["<slug>"]
{
  primary: { src: "/images/products/<slug>/primary.webp", alt: "Larissa plush set on cream blanket" },
  gallery: [
    { src: "/images/products/<slug>/lifestyle-1.webp", alt: "Child hugging the OWL plush" },
    { src: "/images/products/<slug>/lifestyle-2.webp", alt: "Detail of the embroidered face" },
    { src: "/images/products/<slug>/back.webp",        alt: "Reverse view showing label" },
  ],
}
```

### 5.4 Photography rules

- Backgrounds: cream (`#FBF6EC`) or cream-deep (`#F3EBDA`). No pure white.
- Multicultural casting required in lifestyle shots.
- No pre-stamped prices, badges, or "Coming Soon" overlays. UI handles that.

---

## 6. Video posters

The Phase 2 three-tier resolver (`resolveVideoPoster(posterSrc, youtubeId)`)
picks: local poster → YouTube CDN → tonal placeholder.

### 6.1 Folder structure

```
public/images/video-posters/
├── <video-slug-1>.webp
├── <video-slug-2>.webp
├── ...
```

One poster per video slug. **Filename === slug + `.webp`.**

### 6.2 Aspect ratio + sizing

- **16:9, 1600×900 baseline.** Matches YouTube's native poster ratio + `<VideoPoster>`'s `aspect-video` frame.
- Avoid 4:3 or square — they'll letterbox inside the player.
- Compressed ≤ 200 KB.

### 6.3 Poster content rules

- A single, **calm** representative frame from the video. Soft-lit children's faces, no exaggerated expressions.
- **No on-poster play buttons, duration overlays, or text.** All UI layers (play badge, duration pill, OwlMark) are drawn by the component.
- Single frame only. No animated WebP. No video clip.
- Multicultural cast visible in every poster.

### 6.4 Seed-file wiring

```ts
// src/lib/seed/videos.ts → SEED_VIDEOS[…]
{
  slug: "abcs-with-larissa",
  // ...
  posterSrc: "/images/video-posters/abcs-with-larissa.webp",
  // Optional: also set youtubeId for working playback
  youtubeId: "<11-char ID from YouTube URL>",
}
```

### 6.5 YouTube CDN fallback (no work for designers)

When `posterSrc` is null but `youtubeId` is set, the resolver auto-renders
`https://img.youtube.com/vi/<id>/maxresdefault.jpg`. **Designers don't need
to manually crop YouTube thumbnails** — they're served by YouTube's CDN at
publish time.

---

## 7. Accessibility — what designers must include with every asset delivery

Every asset above ships with metadata. Designers are responsible for:

- **Alt text** for every image and frame. Descriptive of the scene, not the action ("Children sitting in a sunlit circle reading together" not "kids reading"). For decorative-only ornaments, alt can be empty.
- **Motion safety.** No fast-cut, no strobing, no flashes brighter than 3 Hz. Photosensitive-friendly per WCAG 2.1.
- **Contrast.** When art is intended to sit behind text, ensure ≥ 4.5:1 contrast for the foreground text — or design a darker corner where text will be overlaid.
- **Multicultural casting.** Per `OWL_BUILD_RULES §13` and `CLAUDE_READ_FIRST §5` — non-negotiable across illustration, photography, and frame sequences.

---

## 8. Drop summary — at a glance

| Asset class | Drop location | Manifest to update | Status |
|---|---|---|---|
| Logo SVG | `src/components/brand/owl-logo.tsx` (inline) | — | Placeholder shipped |
| Favicons | `public/favicon.ico` + `public/icon-192.png` + `public/icon-512.png` | `src/app/layout.tsx` metadata | Not shipped |
| Wide banners | `public/images/banners/<slug>.webp` | `src/lib/images.ts → banners` | Manifest empty (9 slots ready) |
| Hero frame sequences | `public/images/hero-frames/<slug>/desktop/frame-NNN.webp` + `mobile/frame-NNN.webp` + `poster.webp` | `src/lib/images.ts → heroFrames` (`available: true` when ready) | 9 slots registered, all `available: false` |
| Button icons | n/a — use lucide-react | — | Working |
| Product primary photos | `public/images/products/<slug>/primary.webp` | `src/lib/images.ts → products` | Manifest empty (10 slots ready) |
| Product gallery photos | `public/images/products/<slug>/lifestyle-*.webp` | `src/lib/images.ts → products[*].gallery` | Manifest empty |
| Video posters | `public/images/video-posters/<slug>.webp` | `src/lib/seed/videos.ts → posterSrc` | Manifest empty (9 slots ready) |
| OG default image | `public/og/owl-default.png` (1200×630) | `src/lib/site-config.ts → siteConfig.ogImage` | Not shipped |

---

## 9. Hand-off checklist — fill in when commissioning

Use this when commissioning a designer or content producer:

```text
Asset class       :  ☐ banner   ☐ frame sequence   ☐ product photo   ☐ video poster   ☐ logo SVG
Slug              :  ____________________________________________
Page(s) it serves :  ____________________________________________
Aspect / dims     :  ____________________________________________
File format       :  ____________________________________________
Compression target:  ≤ ______ KB
Deliverable count :  ______ files
Drop location     :  public/images/____________________
Manifest entry    :  src/lib/images.ts → ____________________
Alt text          :  ____________________________________________
Multicultural cast:  ☐ verified
Motion-safe       :  ☐ verified (no strobe, no fast cuts)
Static fallback   :  ☐ included (for frame sequences only)
Notes             :  ____________________________________________
```

---

## 10. What designers should NOT do

- Do not embed text in images. Headlines, eyebrows, captions are HTML.
- Do not include the OWL logo as a watermark in product/video photography. The components draw it on top.
- Do not pre-stamp "Coming Soon" or pricing onto product images. The UI handles state.
- Do not use Comic Sans, Bubblegum, or any "children's font" tropes. Nunito only.
- Do not deliver assets in folders named differently from the slugs registered in `src/lib/images.ts`. The runtime is slug-keyed.

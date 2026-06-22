# `public/images/banners/`

**Purpose:** horizontal rectangular hero banner posters — the layer-2 image
in the redesign's 5-layer composition. One per page (or per section that
warrants its own banner).

## Difference from `public/images/headers/`

- `headers/` holds the existing Larissa illustrated portrait imagery (mostly
  square or 4:5). These are imported by `src/lib/images.ts → headers`.
- `banners/` holds **wide horizontal banner posters** designed for the
  rectangular hero band per the redesign brief ("horizontal rectangular hero
  banner layer"). 16:9 or 21:9 typical.

A banner is allowed to *crop from* a header image but should not be the same
file — banners are cropped/composed for the cinematic hero band.

## Convention

```
public/images/banners/
├── manifest.ts                # typed map; mirror in src/lib/images.ts → banners
├── home.webp                  # 1600×900 (16:9) or wider
├── home@1x.webp               # optional retina control
├── home@2x.webp
├── watch.webp
├── shop.webp
├── ...
```

### Aspect ratios

- **16:9** default banner. (1600×900 baseline, 3200×1800 for retina.)
- **21:9 ultrawide** for storybook/cinematic feel — use sparingly.
- Always include `alt` text in `src/lib/images.ts → banners` even if the banner
  is decorative on a given page.

## Asset rules

- WebP first, PNG fallback only if transparency required.
- Compressed to ≤ 350 KB at 1600px wide. Next.js `<Image>` handles further
  per-request resizing.
- Soft gold lighting, multicultural casting, no sterile stock imagery.
- Do NOT include text overlays — text is the layer-4 responsibility.

## Status

**EMPTY at Phase 1.** No banner posters exist yet. Phase 2+ commissions the
first set (home / watch / shop priority).

Until banners exist, every page sources its banner from `headers/*` via
`src/lib/images.ts → headers` and re-uses it inside `<BannerHero>`. Phase 2
introduces a parallel `banners` slot in `src/lib/images.ts` so callers can
prefer `banners.home` over `headers.home` when commissioned.

# `public/images/products/`

**Purpose:** product photography / illustration for the OWL Shop. Consumed by
`<ProductCard>` and the `/shop/[slug]` detail page galleries.

## Convention

One folder per product slug. Files named for the product slug to make
manifest authoring obvious.

```
public/images/products/
├── manifest.ts                # typed map; mirror in src/lib/images.ts → products
├── larissa-plush/
│   ├── primary.webp           # square (1:1) primary tile
│   ├── lifestyle-1.webp       # 4:5 lifestyle/context shot
│   ├── lifestyle-2.webp       # alternate angle
│   └── back.webp              # back / variant view
├── abc-flash-cards/
│   ├── primary.webp
│   ├── ...
```

### `manifest.ts` schema

```ts
export const products = {
  "larissa-plush": {
    primary: { src: "/images/products/larissa-plush/primary.webp", alt: "..." },
    gallery: [
      { src: "/images/products/larissa-plush/lifestyle-1.webp", alt: "..." },
      { src: "/images/products/larissa-plush/lifestyle-2.webp", alt: "..." },
      { src: "/images/products/larissa-plush/back.webp", alt: "..." },
    ],
  },
  // ...
} satisfies Record<string, ProductImages>;
```

The `<ProductCard>` reads `products[slug]?.primary` and falls back to the
tonal placeholder panel when absent.

## Aspect ratios

- **Primary (card thumb):** 1:1 (1200×1200 baseline).
- **Gallery (detail page):** 4:5 (1200×1500 baseline).

## Asset rules

- WebP first. PNG only if transparency needed (cutouts on cream).
- Compressed to ≤ 250 KB at 1200px wide.
- Multicultural casting required in any lifestyle shot.
- Backgrounds must be cream-toned (`#FBF6EC`) or soft cream-deep
  (`#F3EBDA`) so the product reads as part of the OWL brand world.
- Do NOT pre-stamp prices, badges, or "Coming Soon" — those are UI overlays.

## Status

**EMPTY at Phase 1.** All 10 products in `src/lib/seed/products.ts` are
currently `isComingSoon: true` and render as tonal placeholder panels with
the product's initials inside the `<ProductCard>`. When real photography
exists, drop files into the per-slug subfolders and extend
`src/lib/images.ts → products`. The `<ProductCard>` will read the manifest
automatically.

This is the **asset interface** — no photography is fabricated.

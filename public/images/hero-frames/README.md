# `public/images/hero-frames/`

**Purpose:** image sequences used by cinematic scroll-linked hero scenes (GSAP
ScrollTrigger image sequence pattern). The page's hero "scrubs" through a frame
sequence as the user scrolls.

## Convention

Each scene lives in its own subfolder. Frames are zero-padded sequential PNGs
or WebPs:

```
public/images/hero-frames/
└── <scene-slug>/
    ├── manifest.json         # { frameCount, ext, width, height, alt }
    ├── frame-001.webp
    ├── frame-002.webp
    ├── ...
    └── frame-NNN.webp
```

### `manifest.json` schema

```json
{
  "frameCount": 60,
  "ext": "webp",
  "width": 1600,
  "height": 1000,
  "alt": "Larissa walks into a sunlit classroom while children settle in.",
  "fps": 30
}
```

The OWL frame-sequence runtime (Phase 2+) will read this manifest, preload the
frames, and bind frame index to scroll position via GSAP ScrollTrigger.

## Asset rules

- **Max 60 frames per scene** at launch. Phase 2 of the redesign will tune the
  upper bound based on Lighthouse perf measurements.
- **WebP preferred** (smaller, better quality at scale). Fall back to PNG only
  when transparency is required.
- **One scene per page hero, max.** Frame sequences are expensive — never two
  on the same page.
- **No autoplay; scroll-driven only.** Per OWL non-negotiable: no overstimulation.
- **Reduced motion fallback:** when `data-motion="off"`, the runtime renders
  `frame-001` as a static `<Image>`. Make sure frame 1 is a complete, usable
  hero image on its own.

## Status

**EMPTY at Phase 1.** No frame sequences exist yet. Phase 2+ will commission
the first one (home hero "kitchen-light walk-in" sequence is the candidate).

Until then, the codebase uses `<BannerHero>` with a single static banner image
from `public/images/headers/`.

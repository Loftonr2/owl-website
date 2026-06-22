# `public/images/video-posters/`

**Purpose:** per-video preview/poster images used by `<VideoPoster>` (and
therefore `<VideoCard>` + `<VideoPlayer>`) before the user opts in to playback.

## Why this folder exists

The current `<VideoPoster>` renders a tonal CSS panel (gradient + OwlMark
watermark + first letters of the title) because **no per-video poster art
exists today**. This folder is the asset interface where commissioned video
poster images will live, so the player can show a real preview frame.

## Convention

```
public/images/video-posters/
├── manifest.ts                # typed map; mirror in src/lib/images.ts → videoPosters
├── abcs-with-larissa.webp     # 16:9, 1600×900 baseline
├── feelings-are-okay.webp
├── diwali-lights.webp
├── ...
```

Filename = video slug from `src/lib/seed/videos.ts`. One poster per video.

## Aspect ratio

- **16:9 (1600×900 baseline)** — matches YouTube's native poster ratio and
  `<VideoPoster>`'s `aspect-video` frame.
- **Avoid 4:3 or square.** They'll letterbox inside the player.

## YouTube-derived fallback (Phase 2)

When `youtubeId` is set on a `SeedVideo` and no local poster file exists,
the runtime can synthesize a poster from YouTube's CDN:

```
https://img.youtube.com/vi/<youtubeId>/maxresdefault.jpg
```

Phase 2 wires this fallback into `<VideoPoster>`. Until then, only local
poster files in this folder show real imagery; everything else renders the
tonal placeholder.

## Asset rules

- WebP first. JPEG fallback is acceptable for photographic frames.
- Compressed to ≤ 200 KB.
- The poster MUST be a single, calm representative frame from the video.
  Children's faces should be soft-lit, no exaggerated expressions.
- No on-poster play buttons or duration overlays — those are UI layers.
- No autoplay teasers, no animated WebP. Single frame only.

## Status

**EMPTY at Phase 1.** All 9 seed videos in `src/lib/seed/videos.ts` have
`youtubeId: null` and no local poster file. The result: `<VideoPlayer>` shows
the tonal placeholder + "Coming soon" caption.

To activate a single video for visual testing in Phase 2:
1. Drop a `<slug>.webp` poster file in this folder.
2. Set `youtubeId: "<11-char id>"` on the matching entry in
   `src/lib/seed/videos.ts`.
3. Reload — the poster should appear and a click loads the
   `youtube-nocookie.com` iframe with autoplay=1.

This is the **asset interface** — no posters are fabricated.

# YOUTUBE_WIRING.md

**Goal:** Every `<VideoCard>` and `<VideoPlayer>` on the site automatically
shows the real YouTube thumbnail of the corresponding video on
[Owl Sing Together Channel](https://www.youtube.com/@Owlsingtogetherchannel)
once you run one command.

**Status:** Engineering wiring complete. Awaiting one command from you to
populate `youtubeId` values into the seed file.

---

## How the wiring works

Three pieces, all already shipped in the repo:

1. **`scripts/fetch-youtube-videos.mjs`** — Node script that fetches the
   channel's public RSS feed (no API key needed), parses every entry, and
   either writes a JSON manifest you can review or auto-patches
   `src/lib/seed/videos.ts` directly.

2. **`SEED_VIDEOS[*].youtubeId`** — every seed entry already has a
   `youtubeId?: string | null` field. Currently null on all 9 entries.

3. **Three-tier resolver in `src/lib/images.ts → resolveVideoPoster`** —
   picks:
   1. local poster file at `/public/images/video-posters/<slug>.webp`, else
   2. `https://img.youtube.com/vi/<youtubeId>/maxresdefault.jpg`, else
   3. tonal placeholder + initials (the truthful "no asset yet" state).

   Every `<VideoCard>` (rails, archive grid, suggested-next) and the
   `<VideoPlayer>` on the detail page use this resolver. As soon as
   `youtubeId` is set on a seed entry, that video's poster automatically
   pulls the real thumbnail from YouTube's CDN — no further code change
   required.

---

## Finish the wiring (one command)

On Windows in the project root:

```powershell
cd "C:\Users\Ricko\OneDrive\Documents\Claude\Projects\OWL Website Build\owl-website"

# Option A — review-first workflow (recommended)
npm run fetch:youtube
# → writes scripts/.youtube-channel-videos.json (gitignored)
# → review the file, see which seed slugs to map to which video IDs
# → manually edit src/lib/seed/videos.ts → set youtubeId per entry

# Option B — auto-patch by best-fit title match
npm run fetch:youtube:write
# → runs Option A first, then patches videos.ts in place
# → only patches on STRONG title matches (substring containment).
#    Weak matches still print as "review" in the console for manual mapping.
```

After either option:

```powershell
npm run dev
# Visit /watch — every video with a youtubeId now shows its real
# YouTube thumbnail. No "Coming Soon" caption.
```

---

## What the script does — in detail

```
1. GET https://www.youtube.com/feeds/videos.xml?channel_id=UCPeDZMf79CEO7dgpwJeCmMg
2. Parse every <entry> for <yt:videoId>, <title>, <published>
3. Write scripts/.youtube-channel-videos.json (gitignored)
4. If --write:
   a. Read src/lib/seed/videos.ts
   b. For each SEED_VIDEOS entry, find the channel video whose title best
      matches the seed title. Score:
         4 = identical
         3 = substring containment either direction          ← auto-write
         2 = three or more common words
         1 = one or more common word
         0 = no overlap                                       → no write
   c. Replace `youtubeId: null` (or existing `"…"`) with the matched ID.
5. Print a manual-paste reference table for any seeds the script chose not
   to auto-write.
```

**No API key needed.** YouTube's RSS feed is public + anonymous + free.

---

## Per-slug expected mapping

When the script runs, here's what it should produce. If your channel has
videos that closely match these titles, the matching is automatic; if not,
edit `src/lib/seed/videos.ts` manually.

| Seed slug | Seed title | Expected YouTube candidate |
|---|---|---|
| `abcs-with-larissa` | The ABCs with Larissa | Any "ABC" / "Alphabet" song |
| `feelings-are-okay` | Feelings Are Okay | Any "Feelings" SEL song |
| `diwali-lights` | Diwali Lights Are Shining | Any Diwali-themed song |
| `lets-count-to-10` | Let's Count 1 to 10! | Any counting song |
| `head-shoulders-knees` | Head, Shoulders, Knees — OWL Edition | The classic movement song |
| `the-gratitude-song` | The Gratitude Song | Any gratitude song |
| `lullaby-collection` | OWL Lullaby Collection | Any lullaby compilation |
| `shapes-all-around-us` | Shapes All Around Us | Any shapes song |
| `family-is-everything` | Family Is Everything | Any family / belonging song |

---

## When new videos publish

The pipeline is idempotent. Each time you upload a new video to YouTube:

1. Add a new entry to `SEED_VIDEOS` in `src/lib/seed/videos.ts` with the
   slug, title, age, tone, etc.
2. Re-run `npm run fetch:youtube:write`.
3. The new entry picks up its YouTube ID by title match.

Long-term, this seed file moves to Sanity (OWL build plan Phase 6) so
editors can author videos directly without a code change.

---

## Why this can't auto-run from the dev sandbox

The Cowork sandbox where I work doesn't have network access to youtube.com
(allowlist restriction). The RSS fetch works fine from any normal machine
with internet — including your Windows dev machine. The script is in the
repo; one command from you closes the loop.

---

## Cross-reference

- `scripts/fetch-youtube-videos.mjs` — the script
- `src/lib/seed/videos.ts` — `youtubeId` field on every `SeedVideo`
- `src/lib/images.ts` → `resolveVideoPoster` — the three-tier resolver
- `src/components/marketing/video-poster.tsx` — the component that consumes the resolver
- `next.config.ts` → `images.remotePatterns` — `img.youtube.com` already allowlisted
- `ASSET_REQUIREMENTS.md §6` — video poster conventions (local file path)

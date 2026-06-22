# WIREFRAME_REBUILD_PLAN.md

**Goal:** Rebuild every public page to match the 13 wireframes at
`C:\Users\Ricko\OneDrive\Desktop\OWL Sing Together\OWL Wireframes` while
preserving the cinematic OWL design language (cream-warm palette, Nunito
type, soft gold lighting, illustration-led heroes, ambient layers,
scroll-linked motion, layered z-system).

**Cadence:** One page per turn. Each turn ends with a commit-ready diff +
visual acceptance criteria you can check on `localhost:3000`. Per the
"stop and summarize" discipline, no two pages get rebuilt in the same
turn unless they're trivially adjacent (same primitive set, same layout).

**Status legend**
- 🔴 **Blocker** — flagged by user as not loading
- 🟡 **Recent rebuild** — already on the shared system; needs wireframe alignment pass
- 🟢 **Original layout** — predates shared-system work; needs full refit
- ⚪ **Detail page** — wireframe doesn't cover; compose to spec

---

## Wireframe inventory (13 files)

| # | Wireframe file | Route(s) | Status |
|---|---|---|---|
| 1 | `OWL Home Page.png` | `/` | 🟡 Recent rebuild (V-track P3) |
| 2 | `OWL About Us Page.png` | `/about` | 🟡 Recent rebuild (V-track P3) |
| 3 | `OWL Video Library Page.png` | `/watch` + `/watch/[slug]` ⚪ | 🔴 Recent rebuild (V-track P5), flagged broken |
| 4 | `OWL Music Playlist Page.png` | `/music` + `/music/[slug]` ⚪ | 🔴 Recent rebuild (V-track P4), flagged broken |
| 5 | `OWL Store Page.png` | `/shop` + `/shop/[slug]` ⚪ | 🔴 Recent rebuild (V-track P5), flagged broken |
| 6 | `OWL Recomended Products Page.png` | `/recommendations` | 🟡 Recent rebuild (V-track P5) |
| 7 | `OWL Image Gallery.png` | `/gallery` | 🟢 Original layout |
| 8 | `OWL Blog Page.png` | `/blog` + `/blog/[slug]` ⚪ | 🟢 Original layout |
| 9 | `OWL Holiday Hub Page.png` | `/holidays` + `/holidays/[slug]` ⚪ | 🟡 Recent rebuild (V-track P4) |
| 10 | `OWL Educators Page.png` | `/educators` | 🟡 Recent rebuild (V-track P3) |
| 11 | `OWL News Letter.png` | `/newsletter` | 🟡 Recent rebuild (V-track P4) |
| 12 | `OWL Contact Page.png` | `/contact` | 🟢 Original layout |
| 13 | `OWL App Waitlist Page.png` | `/app` | 🟢 Original layout |

---

## Per-page rebuild contract — what every turn produces

For each page, every turn delivers all of:

1. **Wireframe section inventory** — every section box in the wireframe
   transcribed as a numbered list with copy notes.
2. **Diff vs current** — which sections are missing, present-but-wrong,
   present-and-correct.
3. **Section-by-section rebuild** — using the shared primitives
   (`<CinematicHero>`, `<BannerHero>`, `<HeroBanner>`, `<MediaRail>`,
   `<StaggerGrid>`, `<GlassPanel>`, `<CategoryChip>`, `<NewsletterCTAButton>`,
   `<ProductCard>`, `<VideoCard>`, `<PlaylistCard>`, etc.).
4. **Motion intent** — explicit per-page motion vocabulary (e.g. "calm
   prose" / "structured deck" / "rhythmic" / "celebratory").
5. **Visual acceptance checklist** — items to verify on `localhost:3000`.
6. **Files changed report** — every path I touched + why.

### Things every page rebuild preserves (non-negotiable)

- Cream-warm palette (`owl-cream` / `owl-cream-deep` / `owl-teal` / `owl-amber` / `owl-forest` / `owl-ink` / `owl-rose`).
- Nunito font system (display + body).
- `<CinematicHero>` with sequence slot + `slug` resolver as the page-1 element.
- `<ScrollProgress>` top bar.
- `<SiteHeader>` with motion toggle.
- `<SiteFooter>` with motion toggle + newsletter band.
- Reduced-motion respect at every layer.
- `<NewsletterSection>` as the closing band on every marketing page.
- Coming Soon ribbon on products only — never on videos, never on cards in general.

### Things every page rebuild can adjust

- Section order, count, and visual rhythm.
- Per-section primitives (Rail vs Grid vs StaggerGrid).
- Ambient pattern selection (notes / leaves / sparkles / stars / paper).
- Tone routing (cream / amber / teal / forest backgrounds).
- Per-page CTA copy.

---

## Turn order — proposed sequence

Priority = (a) user flagged as broken first, then (b) traffic-weighted, then
(c) detail pages last.

### Phase A — broken pages (3 turns)

| Turn | Page | Why first |
|---|---|---|
| W1 | `/watch` | User flagged broken. Most-likely fastest hit-the-ground page (videos are the brand). Pull YouTube IDs into video poster cards. |
| W2 | `/music` | User flagged broken. Wireframe is detailed; streaming CTAs need polish. |
| W3 | `/shop` | User flagged broken. Includes seasonal bundles, mini-cart, digital downloads. |

### Phase B — high-traffic top-of-funnel (4 turns)

| Turn | Page | Why second |
|---|---|---|
| W4 | `/` | Homepage. Already on shared system but worth a wireframe-precise pass. |
| W5 | `/holidays` | Cultural hub gains 6 new holidays this phase; verify layout. |
| W6 | `/about` | Larissa trust page — most-clicked secondary route. |
| W7 | `/educators` | High-value, standards/compliance-heavy. |

### Phase C — content surfaces (3 turns)

| Turn | Page | Why third |
|---|---|---|
| W8 | `/blog` | Currently still on the original layout. Editorial card grid. |
| W9 | `/newsletter` | Recent rebuild; wireframe-align the segmented signup cards. |
| W10 | `/recommendations` | Editorial pass + comparison table polish. |

### Phase D — niche surfaces (3 turns)

| Turn | Page | Why last |
|---|---|---|
| W11 | `/gallery` | Originally just a header + grid. Wireframe shows masonry. |
| W12 | `/contact` | Form polish, segment cards. |
| W13 | `/app` | App waitlist landing. |

### Phase E — detail pages (separate turns or batched)

Detail pages (`/watch/[slug]`, `/music/[slug]`, `/shop/[slug]`, `/blog/[slug]`,
`/holidays/[slug]`, `/printables/[slug]`) don't have dedicated wireframes.
Compose to spec from `..\OWL-Obsidian-Brain\03_Website_Build\WEBSITE_REQUIREMENTS.md`.
These can batch — three detail templates per turn since they share heavy structure.

### Phase F — Cleanup turn

| Turn | Scope |
|---|---|
| W14 | Sweep pass: lint, typecheck, dead-code removal, screenshot pass, perf-budget check, README + IMPLEMENTATION_PLAN updates. |

**Total estimated turns:** 14 minimum (could compress to ~10 if detail pages batch heavily).

---

## Per-page section maps — wireframe transcription (priority pages)

### W1 · `/watch` (broken — first up)

Wireframe sections in order (from the OWL Video Library Page.png mockup):

1. **Sticky nav** — logo, primary nav, search + cart + Join CTA
2. **Hero banner** — warm cream illustration of Larissa + multicultural children + owl mascots ON the right; headline "Explore & Sing Together in Our Video Nook!" + sub-headline + integrated **search input**
3. **Featured Videos row** — 4 video poster cards with title + age chip; **REAL YouTube thumbnails** (this is the bug fix moment)
4. **Browse by Theme** — large color tiles (ABCs / Numbers / Feelings / Holidays / Lullabies / Movement)
5. **Side Companion Material Downloads** — printable CTA module
6. **Newsletter band** — slim signup
7. **Footer**

**Diff vs current state**
- Featured Videos row: **NO real YouTube thumbnails today** (root cause = `youtubeId: null` everywhere). Wire after `fetch:youtube:write` runs.
- Search input is present in current rebuild but not integrated into hero — needs to move INTO hero overlay slot.
- Theme tiles: currently small icon tiles; wireframe shows large color tiles. Tighten.
- Companion Material section: today an amber-soft band w/ glass list; wireframe shows it as a smaller download CTA module.

**Acceptance criteria (W1 end-of-turn)**
- [ ] Hero has the integrated search input (in the overlay slot).
- [ ] Featured Videos row shows real YouTube thumbnails (after `youtubeId` is set).
- [ ] Browse by Theme is large color tiles, not small icon tiles.
- [ ] Companion download CTA is the standalone module-style, not the big band.
- [ ] No "Coming Soon" caption anywhere on videos.
- [ ] Newsletter band closes the page.

### W2 · `/music`

Wireframe sections (from the Music Playlist Page.png mockup):

1. Sticky nav
2. **Hero banner** — Larissa + children illustration, headline "Explore Our Sing-Along Playlists!" + sub-headline + search input
3. **Featured Playlists row** — 4 playlist cards (with album-art-style thumbs)
4. **Browse by Category** — round category badges (Alphabet / Feelings / Holidays / Bedtime / Movement / Counting)
5. **Streaming CTA module** — Spotify / Apple Music / YouTube Music / Amazon
6. **Classroom Activity Sheets module** — printable downloads
7. **Newsletter band**
8. **Footer**

**Diff vs current state**
- Three themed rails (Seasonal/Calm/Classroom) are currently present; wireframe shows them collapsed into 1 featured row + 1 category strip. Simplify.
- Streaming module: currently lives twice (overlay + standalone band). Wireframe shows once.

### W3 · `/shop`

Wireframe sections (from the Store Page.png mockup):

1. Sticky nav
2. **Hero banner** — Larissa with products illustration, headline "Shop OWLsome Sing-Along Goods!"
3. **Shop-by-Category strip** — pill chips
4. **Featured Products row** — 4 product cards with Coming Soon ribbons today
5. **Seasonal Bundles** — 3 large bundle cards
6. **Digital Downloads** — separate section
7. **Bestsellers row**
8. **Newsletter band**
9. **Footer**
10. **Sticky mini-cart** (overlays bottom-right)

**Diff vs current state**
- Already on shared system. Mostly alignment pass — confirm bundle visuals, simplify digital downloads block to wireframe rhythm.

### W4 · `/` (home)

Wireframe sections (from the OWL Home Page.png mockup):

1. Sticky nav
2. **Hero** — Larissa + multicultural children + owl mascots, "Every Child Belongs Here" + dual CTAs (Watch / Get Printables)
3. **Featured Videos row** — 4–6 video poster cards
4. **Free Printable of the Week** — email-gated download band
5. **Music Playlists row** — 4 playlist cards
6. **Cultural Celebrations** — holiday hub cards
7. **Shop Bestsellers row** — small product cards
8. **About Larissa preview** — small portrait + intro
9. **Newsletter Block**
10. **Educator block**
11. **Schedule / "Our Schedule"** — calendar/programming module (currently MISSING — needs to be built)
12. **Footer**

**Diff vs current state**
- "Schedule" module is in the wireframe but not currently built. Add `<ScheduleBlock>` (could be a programming calendar showing upcoming holiday hubs / video releases).
- About Larissa preview is currently full-width; wireframe shows it small.

### W5 · `/holidays`

Wireframe sections (from the Holiday Hub Page.png mockup):

1. Sticky nav
2. **Celebration hero** — colorful illustration of multiple holidays
3. **Browse by Month** — calendar grid
4. **Featured Campaign banner** — current month's spotlight
5. **All Hubs** — grid of 17 hubs (now that we've added Passover / Rosh Hashanah / Yom Kippur / AAPI / Mid-Autumn / Tết)
6. **Companion Printables row**
7. **Seasonal Signup CTA**
8. **Newsletter band**
9. **Footer**

**Diff vs current state**
- Already on shared system. Verify all 17 hubs render. Add featured campaign banner (rotating monthly).

(Remaining pages — W6 through W13 — get their section maps when their turn arrives.)

---

## Engineering deliverables that ride along

These ship across the turns as needed:

- **`<ScheduleBlock>`** — new homepage component (W4).
- **`<HeroSearchBar>`** — search input that fits inside `<BannerHero>`'s overlay slot. Used by W1 (`/watch`), W2 (`/music`), W3 (`/shop`).
- **`<BrowseTile>`** — large color tile primitive used by W1 and W2 for "Browse by Theme" / "Browse by Category".
- **`<FeaturedCampaignBanner>`** — large rotating campaign band used by W5 (`/holidays`).
- **`<DownloadCTAModule>`** — compact download module replacing the big band on W1.

---

## Risk + dependency notes

- **`/watch` rebuild depends on YouTube IDs.** Without `youtubeId` populated, the Featured Videos row will still show tonal placeholders. **First action of W1:** run `npm run fetch:youtube:write` and commit the patched seed file.
- **`<CinematicHero>` sequence slot is unchanged** — all pages will still fall back to the static banner image until commissioned 240-frame sequences land. Wireframe rebuild does NOT depend on the sequences.
- **Cursor-magnet hover already wired on Button, MediaPosterCard, CategoryChip.** No per-page work needed.
- **Reduced-motion path stays correct** through all rebuilds — every primitive used in this plan already honours `useReducedMotion()` and `data-motion="off"`.

---

## What to send back to start W1

When you say "go W1", paste:
1. The output of `npm run fetch:youtube` (so I know the channel actually has videos — if it's brand-new I'll know to skip the YouTube-ID step).
2. Either the actual error from `npm run dev` on `/watch`, **or** confirm "it loads now after the last typecheck fixes — proceed to the wireframe pass".

That gives me the data + the diagnostic to do the rebuild correctly.

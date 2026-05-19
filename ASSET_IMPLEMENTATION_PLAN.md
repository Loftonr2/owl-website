# ASSET_IMPLEMENTATION_PLAN.md

**Audit date:** 2026-05-11
**Asset sources (Desktop):**
- Wireframes: `C:\Users\Ricko\OneDrive\Desktop\OWL Sing Together\OWL Wireframes`
- Header images: `C:\Users\Ricko\OneDrive\Desktop\OWL Sing Together\OWL Website Header Images`

**Shipped into repo:**
- Header images: `public/images/headers/` (18 files)
- Brand assets: `public/images/brand/` (5 files)
- Wireframes (reference-only, gitignored): `public/images/wireframes-reference/` (13 files)
- Typed manifest: `src/lib/images.ts`

---

## 1. Wireframes — Inventory (13)

Each wireframe shows a low-fi layout (annotated sections) on the left and a full-color visual mockup on the right. The design language is consistent: warm cream backgrounds, soft amber/teal/forest palette, Larissa as illustrated host with multicultural children + owl mascots, rounded cards, generous spacing, story-book aesthetic.

| # | Wireframe filename | Maps to route(s) | Phase to build |
|---|---|---|---|
| 1 | `OWL Home Page.png` | `/` | 4 |
| 2 | `OWL About Us Page.png` | `/about` | 4 |
| 3 | `OWL Video Library Page.png` | `/watch` (+ template for `/watch/[slug]`) | 5 |
| 4 | `OWL Music Playlist Page.png` | `/music` (+ template for `/music/[slug]`) | 5 |
| 5 | `OWL Store Page.png` | `/shop` (+ template for `/shop/[slug]`) | 5 |
| 6 | `OWL Recomended Products Page.png` *(sic — typo in source)* | `/recommendations` | 5 |
| 7 | `OWL Image Gallery.png` | `/gallery` | 5 |
| 8 | `OWL Blog Page.png` | `/blog` (+ template for `/blog/[slug]` + 6 pillar hubs) | 6 |
| 9 | `OWL Holiday Hub Page.png` | `/holidays` (+ template for `/holidays/[slug]` ×11) | 6 |
| 10 | `OWL Educators Page.png` | `/educators` | 6 |
| 11 | `OWL News Letter.png` | `/newsletter` | 4 |
| 12 | `OWL Contact Page.png` | `/contact` | 6 |
| 13 | `OWL App Waitlist Page.png` | `/app` | 6 |

### Wireframe-confirmed page sections (recurring patterns)

From the Home + Holiday Hub wireframes (viewed) and inferred for the rest:

- **Top sticky nav** with logo on left, primary nav center, search + cart + Join CTA on right
- **Hero** — full-bleed warm-toned illustration (Larissa + multicultural children + owl mascot) with headline, sub-head, and 2–3 CTAs
- **Feature row** — 3–6 cards in a horizontal grid (videos, products, playlists, holidays)
- **Email-gated lead-magnet block** mid-page (free printable of the week)
- **Cultural celebrations grid** with month/holiday cards
- **Shop bestsellers** row of product cards
- **Newsletter signup band** as a recurring full-width module near the footer
- **Footer** — secondary nav, social, legal, privacy

### Pages with wireframes (13)

`/` · `/about` · `/watch` · `/music` · `/shop` · `/recommendations` · `/gallery` · `/blog` · `/holidays` · `/educators` · `/newsletter` · `/contact` · `/app`

---

## 2. Missing Wireframes

The Obsidian spec (`WEBSITE_REQUIREMENTS.md`) calls for these pages — **no wireframe exists yet**. We'll build from spec until/unless Larissa or Rick adds a wireframe.

| Route | Required by Phase | Workaround until wireframe arrives |
|---|---|---|
| `/watch/[slug]` (video detail) | 5 | Compose using Watch wireframe's video card pattern; spec in `WEBSITE_REQUIREMENTS.md § Video Detail` |
| `/music/[slug]` (playlist detail) | 5 | Use Music wireframe's structure for playlists |
| `/shop/[slug]` (product detail) | 5 | Spec in `WEBSITE_REQUIREMENTS.md § Product Detail` + `STORE_REQUIREMENTS.md § 5` |
| `/printables` (hub) | 5 | Spec in `WEBSITE_REQUIREMENTS.md § Printables Hub` |
| `/printables/[slug]` (detail + email gate) | 5 | Spec in `WEBSITE_REQUIREMENTS.md § Printable Detail` |
| `/blog/[slug]` (article) | 6 | Use the Blog wireframe article-card structure for the hub; article template from `WEBSITE_REQUIREMENTS.md § Article Detail` |
| `/blog/[category]` (6 pillar hubs) | 6 | Each pillar uses the Blog wireframe; only the hero copy + featured posts swap |
| `/curriculum` (public curriculum) | 5 | Use Educators wireframe as starting layout; adapt for Birth–5 tier grid |
| `/programs` | 5 | Use Educators or Holiday Hub layout; spec TBD |
| `/parent-resources` | 6 | Compose from Blog-style article-grid + recommended-products module |
| `/teacher-resources` | 6 | Compose from Educators wireframe |
| `/privacy`, `/terms` | 9 | Long-form legal — no design needed; use About Larissa typography |
| `/login` | (done in P2) | Already shipped — simple centered card |
| `/admin/*` (11 admin surfaces) | 7 | No public design; build to `ADMIN_CRM_REQUIREMENTS.md` |
| `/studio/[[...tool]]` | (done in P2) | Sanity Studio defaults — no wireframe needed |

---

## 3. Header Images — Inventory (23 current)

The `OWL Website Header Images` folder contains 23 current images plus a `Old Website Header Images/` subfolder (24 archived files). We use the current set only.

### Current header images (23) — shipped to `public/images/`

| Original filename | Used as | Repo path |
|---|---|---|
| `OWL Landing Page 2.png` | Home hero | `headers/home-hero.png` |
| `OWL Sing Together With Larissa Logo 3.png` | About hero | `headers/about-hero.png` |
| `OWL App Page.png` | App waitlist hero | `headers/app-hero.png` |
| `OWL App.png` | App alt / variant | `headers/app-alt-hero.png` |
| `OWL Reading.png` | Blog hero | `headers/blog-hero.png` |
| `OWL Community.png` | Contact hero | `headers/contact-hero.png` |
| `OWL Classroom.png` | Educators hero | `headers/educators-hero.png` |
| `OWL Classroom 2.png` | Teacher Resources hero | `headers/teacher-resources-hero.png` |
| `OWL Classroom 3.png` | Programs hero | `headers/programs-hero.png` |
| `OWL Multi- Cultural.png` | Holidays hub hero | `headers/holidays-hero.png` |
| `OWL Arts & Crafts.png` | Gallery hero | `headers/gallery-hero.png` |
| `OWL Music.png` | Music hero | `headers/music-hero.png` |
| `OWL Music 2.png` | Watch hero (**placeholder** — wants its own image) | `headers/watch-hero.png` |
| `OWL Newsletter.png` | Newsletter hero | `headers/newsletter-hero.png` |
| `OWL Entertainment.png` | Recommendations hero | `headers/recommendations-hero.png` |
| `OWL Curriculum.png` | Curriculum hero | `headers/curriculum-hero.png` |
| `OWL Learning.png` | Printables hero | `headers/printables-hero.png` |
| `OWL Sing Together With Larissa Logo 2.png` | Shop hero (**placeholder** — wants commerce-focused image) | `headers/shop-hero.png` |
| `OWL Circular Logo.png` | Brand: circular logo | `brand/circular-logo.png` |
| `OWL Circular Logo 2.png` | Brand: circular logo alt | `brand/circular-logo-alt.png` |
| `OWL Mascot Owl.png` | Brand: mascot spot art | `brand/mascot.png` |
| `OWL Song Together With Larissa Logo.png` | Brand: full lockup | `brand/full-logo-larissa.png` |
| `OWL Sing Together YouTube Header Image.png` | Brand: YouTube banner (also usable as nav strip) | `brand/youtube-header.png` |

### Archived header images (`Old Website Header Images/`)

The 24 files in the `Old` subfolder are explicitly archived. **Not copied into the repo.** Source is preserved; if a deprecated visual is ever needed, the path is `C:\Users\Ricko\OneDrive\Desktop\OWL Sing Together\OWL Website Header Images\Old Website Header Images\`.

---

## 4. Recommended Page-to-Header Mapping

The typed manifest in [`src/lib/images.ts`](src/lib/images.ts) encodes the canonical mapping. Components import it like:

```tsx
import Image from "next/image";
import { headers } from "@/lib/images";

<Image
  src={headers.home.src}
  alt={headers.home.alt}
  priority
  fill
  sizes="100vw"
/>;
```

| Page | Header constant | Source |
|---|---|---|
| `/` Home | `headers.home` | OWL Landing Page 2 |
| `/about` | `headers.about` | OWL Sing Together With Larissa Logo 3 |
| `/app` | `headers.app` | OWL App Page |
| `/blog` | `headers.blog` | OWL Reading |
| `/contact` | `headers.contact` | OWL Community |
| `/educators` | `headers.educators` | OWL Classroom |
| `/teacher-resources` | `headers.teacherResources` | OWL Classroom 2 |
| `/programs` | `headers.programs` | OWL Classroom 3 |
| `/holidays` (+ each `/holidays/[slug]` defaults to this if no per-hub hero) | `headers.holidays` | OWL Multi- Cultural |
| `/gallery` | `headers.gallery` | OWL Arts & Crafts |
| `/music` | `headers.music` | OWL Music |
| `/watch` | `headers.watch` ⚠ placeholder | OWL Music 2 (recommend custom) |
| `/newsletter` | `headers.newsletter` | OWL Newsletter |
| `/recommendations` | `headers.recommendations` | OWL Entertainment |
| `/curriculum` | `headers.curriculum` | OWL Curriculum |
| `/printables` | `headers.printables` | OWL Learning |
| `/shop` | `headers.shop` ⚠ placeholder | OWL Sing Together With Larissa Logo 2 (recommend custom) |
| `/parent-resources` | (no header yet — use brand block) | — |
| `/blog/[category]` (6 hubs) | Each hub uses `headers.blog` until per-pillar hero is commissioned | — |

### Headers we'd ideally commission (gaps to flag for Larissa/Rick)

1. **Watch / Video Library** — current placeholder is `OWL Music 2`. A dedicated video-archive hero (Larissa + a play-button motif or video screens) would convert better.
2. **Shop** — current placeholder is a brand-lockup image. A commerce-leaning hero (Larissa with products / a "Shop OWLsome Goods" treatment) would tell the right story.
3. **Six blog pillar hubs** — `/blog/cultural-holidays`, `/blog/early-learning`, `/blog/sel-for-kids`, `/blog/educational-gifts`, `/blog/educator-resources`, `/blog/music-child-development` each warrant their own pillar header for visual differentiation. Currently they all share `headers.blog`.
4. **Per-holiday hero** — 11 holiday-specific Larissa illustrations (Black History Month, Hispanic Heritage, Diwali, Hanukkah, Kwanzaa, Ramadan/Eid, Lunar New Year, Juneteenth, Holi, Native American Heritage, Global Christmas). The OWL business plan already calls for these (Phase 4 wireframes assume per-hub Larissa variants).
5. **Parent Resources** — needs an image that emphasizes "parenting" specifically (not "reading" or "classroom").
6. **Open Graph default** — `public/images/og/owl-default.png` referenced by `siteConfig.ogImage` doesn't yet exist; a 1200×630 social card.

---

## 5. Implementation Order (build sequence)

Phases 4–6 work through these pages. Build order within each phase follows wireframe availability + funnel priority:

### Phase 4 — Homepage + brand-trust pages

1. `/` (Home Page wireframe + `headers.home`) — primary CTA, trust strip, video featured row, free printable of the week, shop bestsellers, newsletter band, footer
2. `/newsletter` (News Letter wireframe + `headers.newsletter`)
3. `/about` (About Us wireframe + `headers.about`)

### Phase 5 — Public funnel pages

4. `/watch` (Video Library wireframe + `headers.watch`)
5. `/watch/[slug]` (no wireframe; build to spec)
6. `/music` (Music Playlist wireframe + `headers.music`)
7. `/music/[slug]` (reuse Music wireframe pattern)
8. `/printables` (no wireframe; build to spec + `headers.printables`)
9. `/printables/[slug]` (no wireframe; build to spec)
10. `/shop` (Store Page wireframe + `headers.shop` placeholder)
11. `/shop/[slug]` (no wireframe; build to `STORE_REQUIREMENTS.md`)
12. `/gallery` (Image Gallery wireframe + `headers.gallery`)
13. `/recommendations` (Recommended Products wireframe + `headers.recommendations`)

### Phase 6 — SEO content surfaces

14. `/blog` (Blog Page wireframe + `headers.blog`)
15. `/blog/[category]` × 6 pillar hubs (reuse Blog wireframe)
16. `/blog/[slug]` (build to `BLOG_NEWSLETTER_SYSTEM.md § Article template`)
17. `/holidays` (Holiday Hub wireframe + `headers.holidays`)
18. `/holidays/[slug]` × 11 hubs (reuse Holiday Hub wireframe)
19. `/educators` (Educators wireframe + `headers.educators`)
20. `/contact` (Contact wireframe + `headers.contact`)
21. `/app` (App Waitlist wireframe + `headers.app`)
22. `/parent-resources` (no wireframe; build to spec)
23. `/teacher-resources` (no wireframe; build to spec + `headers.teacherResources`)

---

## 6. Asset Optimization Notes

### Sizes today
- Headers: 1.7–2.7 MB each (PNG, original render export)
- Brand: 1.7–2.5 MB each
- **Total `public/images/` payload: ~50 MB** (originals only)

### Strategy

We do **not** pre-compress these images. Next.js's `<Image />` component handles per-request optimization:

- **WebP / AVIF conversion** — automatic, browser-negotiated
- **Responsive resizing** — server-side, on first request, cached at the edge
- **Lazy loading** below the fold, `priority` on hero

So shipping the 2 MB PNG to `public/` is fine — only a small WebP gets delivered to the browser. Required code pattern:

```tsx
<Image
  src={headers.home.src}
  alt={headers.home.alt}
  priority           // homepage hero only
  fill               // or width/height for known dimensions
  sizes="(min-width: 1024px) 1280px, 100vw"
  className="object-cover"
/>
```

### Optional cleanup later (Phase 9)

- Generate WebP fallbacks in CI for older runtimes (sharp + a tiny build script)
- Generate 1200×630 OG-card crops via `sharp` for `seo.ogImage`
- Add a build-time check that warns when an image is > 3 MB

### File-size policy

If we ever add header images directly to the repo manually, the limit is **3 MB per file** (current set is under). Larger assets should be deferred to Sanity (Cloudinary CDN) or Cloudflare R2.

---

## 7. Renaming / Conflicts

- **Source folder typo** preserved: `OWL Recomended Products Page.png` (should be "Recommended"). We didn't rename the source; in the repo this maps to `headers.recommendations` (the route is `/recommendations`).
- **Music 2** repurposed as `watch-hero.png` because no Watch-specific image exists. Source filename is preserved in the manifest (`source: "OWL Music 2.png"`) for traceability.
- **Sing Together With Larissa Logo 2** repurposed as `shop-hero.png` (also a placeholder).
- No source assets were renamed, moved, or deleted. Only copies entered the repo.

---

## 8. What Was Copied

| Destination | Count | Total size |
|---|---|---|
| `public/images/headers/` | 18 PNG | ~42 MB |
| `public/images/brand/` | 5 PNG | ~10 MB |
| `public/images/wireframes-reference/` (gitignored) | 13 PNG | ~21 MB |

The wireframe reference folder is gitignored — devs can view it locally while building, but it does not ship to production.

---

## 9. Standing Rule (added to CLAUDE.md)

> Before building any page, review the matching wireframe from `C:\Users\Ricko\OneDrive\Desktop\OWL Sing Together\OWL Wireframes` (or the gitignored copy at `public/images/wireframes-reference/`) and use the matching header image from `C:\Users\Ricko\OneDrive\Desktop\OWL Sing Together\OWL Website Header Images` (via the typed manifest at `src/lib/images.ts`).

---

## 10. Open Questions for Rick

1. Want me to commission per-hub Larissa hero illustrations for the 11 holidays in Phase 6, or use the single `headers.holidays` for all 11?
2. Should I generate a 1200×630 OG-card crop now (from the home hero) so social shares look right when the site goes live? Quick to script with `sharp`.
3. Is there an editorial source for the **Watch** and **Shop** dedicated headers, or should I add them to the asset commission list?

---

*Source of truth for everything outside this audit:* `..\OWL-Obsidian-Brain\`.

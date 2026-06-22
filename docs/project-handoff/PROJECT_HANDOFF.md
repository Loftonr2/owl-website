# OWL Sing Together — Project Handoff Document
**Generated:** June 10, 2026  
**Current commit:** `6525711`  
**Branch:** `main`  
**Repo:** https://github.com/Loftonr2/owl-website  
**Live site:** https://owlsingtogether.com

---

## 1. PROJECT OVERVIEW

**Project name:** OWL Sing Together Website  
**Owner:** Rick (rickoflv@gmail.com)  
**Purpose:** Full-stack Next.js 14 marketing + commerce website for OWL Sing Together — a multicultural children's educational music brand featuring Larissa and the OWL mascot. Sells physical merch via Printful/Etsy and digital products.

**Current completion: ~70%**

### Major Goals
- ✅ Public marketing website (all pages live)
- ✅ Shop with Printful fulfillment pipeline
- ✅ Etsy store published (42 live listings)
- ✅ Product images showing correctly on website
- ⏳ PayPal → Printful auto-fulfillment (code written, needs env vars in Vercel)
- ⏳ Sanity CMS wiring (schemas built, not fully content-populated)
- ⏳ Supabase auth + orders DB (migrations written, not activated in production)
- ⏳ YouTube channel auto-wiring (script exists, needs run)
- ⏳ AI-generated updated product images (prompts written, generation pending)

---

## 2. CURRENT STATE

### ✅ Working & Deployed
- All 13 marketing pages live at owlsingtogether.com
- Shop page: 7 categories (Coloring, Stickers, Apparel, Flashcards, Home, Drinkware, Digital)
- Category nav buttons centered with correct icons
- Product images: Apparel, Home, Drinkware, Digital all showing real mockups
- Larissa album covers in Digital section (4 albums)
- OWL Cotton Kids T-Shirt image updated (smiling Black boy, white tee)
- OWL Flat Ball Cap title corrected (was "Flat Bill")
- Shop hero video with real frame poster (not the logo placeholder)
- 42 Etsy listings live at etsy.com/shop/OwlSingTogetherStore
- Printful store connected, product images downloaded locally
- PayPal checkout on product detail pages
- Admin CRM at /admin/products (password-protected)
- VideoHeroBanner component on all major pages

### ⚠️ Partially Complete
- PayPal → Printful auto-fulfillment: webhook code is live but `PAYPAL_CLIENT_SECRET` and `PAYPAL_WEBHOOK_ID` need to be added to Vercel env vars
- Supabase: migrations written but production DB not configured
- Sanity CMS: schemas built, Studio accessible at /studio, content not populated
- YouTube video wiring: `npm run fetch:youtube:write` script exists, not yet run against live channel

### ❌ Known Issues / Gaps
- `owl-cotton-kids-t-shirt` seed still shows category "Apparel" but image is now correct
- No t-shirt image existed in OWL Products initially — now fixed with white tee mockup
- Backup file `owl-cotton-kids-t-shirt.BACKUP.png` sitting in products folder (safe to delete)
- `owl-eco-tote-bag.png` is a duplicate/legacy file (different from `owl-tote-bag.png`)
- `generated-image (33).png` in OWL Products folder — unidentified, needs review
- Stickers category: holographic stickers removed, replaced with owl-emotions-stickers
- AI-generated product image prompts written but 0 images generated yet (pending Midjourney/DALL-E work)

---

## 3. FILES CREATED OR MODIFIED

### Core App Pages
| File | Purpose | Status | Last Changes |
|---|---|---|---|
| `src/app/(marketing)/shop/page.tsx` | Main shop landing — 7 category sections | ✅ Complete | Reordered to 7 cats, centered nav, fixed featured slugs |
| `src/app/(marketing)/shop/[category]/page.tsx` | Category browse pages | ✅ Complete | Built from scratch |
| `src/app/(marketing)/shop/all-products/page.tsx` | All products grid | ✅ Complete | Built from scratch |
| `src/app/(marketing)/shop/[slug]/page.tsx` | Product detail + PayPal | ✅ Complete | PayPal checkout added |
| `src/app/(marketing)/watch/page.tsx` | Watch page with OWL Discovery Arcade | ✅ Complete | Full redesign |
| `src/app/(marketing)/educators/page.tsx` | Educators hub | ✅ Complete | Workbooks + educator tools |
| `src/app/(marketing)/printables/page.tsx` | Printables hub | ✅ Complete | Bundle packs added |
| `src/app/(admin)/admin/products/page.tsx` | Admin CRM — product manager | ✅ Complete | Printify ID editor, fulfillment badges |

### Components
| File | Purpose | Status |
|---|---|---|
| `src/components/marketing/video-hero-banner.tsx` | Full-width video hero for all pages | ✅ Complete |
| `src/components/marketing/product-card.tsx` | Product card with real image support | ✅ Complete |
| `src/components/marketing/owl-discovery-arcade.tsx` | Watch page theme browsing UI | ✅ Complete |
| `src/components/marketing/browse-videos-section.tsx` | Video browse with modal popup | ✅ Complete |
| `src/components/marketing/printable-card.tsx` | PDF printable cards | ✅ Complete |

### Data / Seed
| File | Purpose | Status | Last Changes |
|---|---|---|---|
| `src/lib/seed/products.ts` | ~90 products — physical + digital | ✅ Complete | Album cats → Digital; Flat Ball Cap rename |
| `src/lib/seed/printables.ts` | Printable cards + bundle packs | ✅ Complete | Bundle packs added |
| `src/lib/images.ts` | Image registry — `resolveProductImage(slug)` | ✅ Complete | All product images registered |
| `src/lib/printful-variants.ts` | Printful variant ID map for 34 products | ✅ Complete | Built for fulfillment |

### API Routes
| File | Purpose | Status |
|---|---|---|
| `src/app/api/webhooks/paypal/route.ts` | PayPal webhook → Printful order creation | ✅ Code complete, needs env vars |
| `src/app/api/admin/products/[slug]/route.ts` | PATCH Printify IDs to Supabase | ✅ Complete |
| `src/app/api/admin/sync-printful-images/route.ts` | Sync Printful product images | ✅ Complete |
| `src/app/api/printify/route.ts` | Printify product sync | ✅ Complete |

### Public Assets
| Path | Contents | Status |
|---|---|---|
| `public/images/products/` | 71 product images (1–4MB each) | ✅ Updated |
| `public/images/headers/` | 17 page header images + shop-hero.png (now real video frame) | ✅ Updated |
| `public/images/brand/` | Logo, mascot, circular logo variants | ✅ Complete |
| `public/videos/` | Hero MP4 videos for all major pages | ✅ Complete |
| `public/printables/` | 4 PDF workbooks for download | ✅ Complete |

### Scripts
| File | Purpose |
|---|---|
| `scripts/fetch-youtube-videos.mjs` | Pulls YouTube video IDs from RSS → SEED_VIDEOS |
| `scripts/download-printful-images.js` | Downloads Printful product images locally |
| `scripts/fetch-printful-variant-ids.js` | Maps Printful variant IDs for fulfillment |
| `scripts/reset-etsy-listings.js` | Clears stale Etsy external_ids from Printful |
| `scripts/verify-etsy-listings.js` | Checks all Etsy listing statuses |
| `scripts/recover-printful-products.js` | Full Printful store product recovery |

### Documentation
| File | Purpose |
|---|---|
| `STORE_SETUP.md` | Fulfillment setup checklist (PayPal + Printful) |
| `ASSET_IMPLEMENTATION_PLAN.md` | Wireframe → route → header image canonical mapping |
| `WIREFRAME_REBUILD_PLAN.md` | 14-turn pixel-for-pixel page redesign plan |
| `YOUTUBE_WIRING.md` | Instructions for wiring YouTube channel |
| `WOZCODE_SETUP_REPORT.md` | WozCode plugin token savings report |
| `C:\Users\Ricko\OneDrive\Desktop\OWL Sing Together\OWL Products\OWL_Product_Image_Update_Report.md` | 89 AI image prompts + backup report |

---

## 4. PROJECT DIRECTORY MAP

```
C:\Users\Ricko\owl-website\              ← Git repo root
├── src/
│   ├── app/
│   │   ├── (marketing)/
│   │   │   ├── page.tsx                 ← Homepage
│   │   │   ├── about/page.tsx
│   │   │   ├── watch/page.tsx           ← OWL Discovery Arcade
│   │   │   ├── music/page.tsx
│   │   │   ├── shop/
│   │   │   │   ├── page.tsx             ← 7-category shop landing ⭐
│   │   │   │   ├── [category]/page.tsx
│   │   │   │   ├── [slug]/page.tsx      ← Product detail + PayPal
│   │   │   │   └── all-products/page.tsx
│   │   │   ├── educators/page.tsx
│   │   │   ├── printables/page.tsx
│   │   │   ├── blog/page.tsx
│   │   │   ├── gallery/page.tsx
│   │   │   ├── holidays/page.tsx
│   │   │   ├── contact/page.tsx
│   │   │   └── newsletter/page.tsx
│   │   ├── (admin)/
│   │   │   └── admin/products/page.tsx  ← CRM dashboard
│   │   ├── api/
│   │   │   ├── webhooks/paypal/route.ts ← Fulfillment webhook ⭐
│   │   │   ├── admin/products/[slug]/route.ts
│   │   │   └── admin/sync-printful-images/route.ts
│   │   └── layout.tsx
│   ├── components/
│   │   ├── marketing/
│   │   │   ├── video-hero-banner.tsx    ⭐
│   │   │   ├── product-card.tsx         ⭐
│   │   │   ├── owl-discovery-arcade.tsx ⭐
│   │   │   ├── printable-card.tsx
│   │   │   └── newsletter-section.tsx
│   │   ├── brand/
│   │   │   ├── owl-logo.tsx
│   │   │   └── owl-lockup.tsx
│   │   └── ui/
│   │       ├── button.tsx
│   │       ├── section.tsx
│   │       └── section-intro.tsx
│   ├── lib/
│   │   ├── images.ts                    ← resolveProductImage() ⭐
│   │   ├── printful-variants.ts         ← Fulfillment variant map ⭐
│   │   ├── seed/
│   │   │   ├── products.ts              ← ~90 products ⭐
│   │   │   ├── printables.ts
│   │   │   ├── videos.ts
│   │   │   ├── blog.ts
│   │   │   └── holidays.ts
│   │   └── seo/
│   ├── sanity/                          ← CMS schemas (not yet live)
│   └── types/index.ts
├── public/
│   ├── images/
│   │   ├── products/                    ← 71 product images ⭐
│   │   ├── headers/                     ← 17 page headers
│   │   ├── brand/
│   │   ├── bundles/
│   │   ├── discovery/
│   │   └── educators/
│   ├── videos/                          ← Hero MP4s for all pages
│   └── printables/                      ← 4 downloadable PDFs
├── scripts/                             ← Utility scripts
├── supabase/migrations/                 ← DB migration SQL files
├── docs/project-handoff/                ← THIS FOLDER
├── ASSET_IMPLEMENTATION_PLAN.md
├── STORE_SETUP.md
├── WIREFRAME_REBUILD_PLAN.md
├── YOUTUBE_WIRING.md
└── CLAUDE.md                            ← Session startup rules

C:\Users\Ricko\OneDrive\Desktop\OWL Sing Together\
├── OWL Products/                        ← Source product images
│   ├── _original_backup/                ← 104 originals backed up
│   ├── Updated Product Images/          ← Output for AI-generated images
│   ├── product_image_update_prompts.md  ← 89 Midjourney/DALL-E prompts
│   └── OWL_Product_Image_Update_Report.md
├── OWL Wireframes/                      ← 13 Figma wireframe PNGs
└── OWL Website Header Images/           ← 23 production header images

C:\Users\Ricko\OneDrive\Documents\Claude\Projects\OWL Website Build\
└── OWL-Obsidian-Brain/
    ├── 13_Claude_Source_Of_Truth/
    │   ├── CLAUDE_READ_FIRST.md         ← READ EVERY SESSION
    │   ├── OWL_BUILD_RULES.md
    │   └── PROJECT_CONTEXT.md
    ├── 09_Design_System/
    │   └── DESIGN_STYLE_GUIDE.md
    └── 11_Tech_Requirements/
        └── TECH_STACK.md
```

---

## 5. DEPENDENCIES & SERVICES

| Service | Purpose | Status |
|---|---|---|
| **Vercel** | Hosting + deployment | ✅ Live |
| **GitHub** | `Loftonr2/owl-website` | ✅ Active |
| **Printful** | Physical merch fulfillment | ✅ Connected (Store ID: 18286248 is Etsy store) |
| **Etsy** | Storefront — `OwlSingTogetherStore` | ✅ 42 live listings |
| **PayPal** | Checkout + webhook | ⚠️ Code live, needs `PAYPAL_CLIENT_SECRET` + `PAYPAL_WEBHOOK_ID` in Vercel |
| **Supabase** | Auth + orders DB | ⚠️ Migrations written, not activated |
| **Sanity** | CMS for blog/gallery/video content | ⚠️ Schemas built, content empty |
| **Resend** | Transactional email | ⚠️ Wired, needs `RESEND_API_KEY` |
| **Beehiiv** | Newsletter | ⚠️ Wired, needs API key |
| **YouTube** | `@Owlsingtogetherchannel` | ⚠️ Script ready, not run |

---

## 6. DATABASE STRUCTURE (Supabase)

Migrations in `supabase/migrations/`:

**`0001_init.sql`** — Base tables  
**`0002_products_extended.sql`** — Products table with Printify IDs  
**`0003_add_printify_variant_id.sql`** — Adds `printify_variant_id` column

Key tables:
- `products` — slug, printify_product_id, printify_variant_id, price
- `orders` — PayPal order ID, status, fulfillment_status, idempotency key
- `newsletter_subscribers` — email, created_at

Auth: Supabase email/password (admin only, for /admin routes)

---

## 7. ENVIRONMENT VARIABLES

| Variable | Purpose | Required |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL | Y |
| `NEXT_PUBLIC_PAYPAL_CLIENT_ID` | PayPal checkout client | Y for payments |
| `PAYPAL_CLIENT_SECRET` | PayPal webhook verification | ⚠️ MISSING from Vercel |
| `PAYPAL_WEBHOOK_ID` | PayPal webhook signature check | ⚠️ MISSING from Vercel |
| `PRINTFUL_API_KEY` | Printful orders + sync | Y |
| `PRINTIFY_API_KEY` | Printify product sync | Y |
| `PRINTIFY_SHOP_ID` | Printify store ID | Y |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Y for DB |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase public key | Y for DB |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase admin operations | Y for DB |
| `SUPABASE_URL` | Server-side Supabase URL | Y for DB |
| `SUPABASE_ANON_KEY` | Server-side anon key | Y for DB |
| `SANITY_PROJECT_ID` | Sanity CMS project | Y for CMS |
| `SANITY_API_TOKEN` | Sanity write access | Y for CMS |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Sanity browser client | Y for CMS |
| `NEXT_PUBLIC_SANITY_DATASET` | Sanity dataset name | Y for CMS |
| `RESEND_API_KEY` | Email sending | Y for email |
| `BEEHIIV_API_KEY` | Newsletter subscribe | Y for newsletter |
| `BEEHIIV_PUBLICATION_ID` | Beehiiv publication ID | Y for newsletter |
| `STRIPE_SECRET_KEY` | Stripe payments (future) | N (not yet used) |
| `SYNC_SECRET` | Protects sync API routes | Y |

---

## 8. DEPLOYMENT STATUS

| Item | Value |
|---|---|
| **GitHub repo** | `https://github.com/Loftonr2/owl-website` |
| **Branch** | `main` |
| **Hosting** | Vercel (auto-deploy on push to main) |
| **Domain** | `owlsingtogether.com` |
| **Build command** | `next build` |
| **Install command** | `npm install` |
| **Current commit** | `6525711` |
| **Admin panel** | `https://owlsingtogether.com/admin` |
| **Sanity Studio** | `https://owlsingtogether.com/studio` |
| **Etsy store** | `https://www.etsy.com/shop/OwlSingTogetherStore` |

**Deploy:** Push to `main` → Vercel auto-deploys. No manual steps needed.

---

## 9. WORKFLOW HISTORY (This Chat + Prior Sessions)

| Session | Task | Result |
|---|---|---|
| Prior | Publish 42 Etsy listings | ✅ All 42 live, $8.40 fee paid |
| Prior | Download Printful product images locally | ✅ 21+ images downloaded |
| Prior | Build fulfillment pipeline (PayPal → Printful) | ✅ Code complete |
| Prior | Build Admin CRM | ✅ Live at /admin/products |
| Prior | Scan OWL Products folder (104 images) | ✅ Backup created, 89 AI prompts written |
| This | Copy Larissa album images to website | ✅ 5 albums at ~2.5MB each |
| This | Restructure shop: 7 categories, Digital section | ✅ Deployed |
| This | Fix product images (Apparel/Home/Drinkware) | ✅ Real mockups deployed |
| This | Fix shop hero poster (was OWL logo, now video frame) | ✅ Deployed |
| This | Center category nav buttons | ✅ Deployed |
| This | Remove Holographic Sticker from featured, add Emotions | ✅ Deployed |
| This | Replace OWL Cotton Kids T-Shirt image | ✅ White tee deployed |
| This | Rename "Flat Bill Cap" → "Flat Ball Cap" | ✅ Deployed |

---

## 10. REMAINING TASKS

### HIGH PRIORITY
1. **Add missing Vercel env vars** — `PAYPAL_CLIENT_SECRET`, `PAYPAL_WEBHOOK_ID` → enables auto-fulfillment
2. **Test PayPal → Printful pipeline** — Place a test order, verify Printful receives it
3. **Wire YouTube videos** — Run `npm run fetch:youtube:write` to populate SEED_VIDEOS with real YouTube IDs
4. **Generate updated product images** — Use `OWL Products/product_image_update_prompts.md` with Midjourney/DALL-E, save to `Updated Product Images/`, then copy to `public/images/products/`

### MEDIUM PRIORITY
5. **Supabase production setup** — Apply migrations to production Supabase project, add env vars to Vercel
6. **Populate Sanity CMS** — Add blog posts, gallery items, video content via /studio
7. **OWL Cotton Kids T-Shirt category fix** — Seed still says "Apparel" which is correct, but double-check display label
8. **Delete backup file** — `public/images/products/owl-cotton-kids-t-shirt.BACKUP.png` (safe to delete)
9. **Clean up OWL Products duplicates** — 11 duplicate files identified in `OWL_Product_Image_Update_Report.md`
10. **Fix unknown file** — Rename `OWL Products/generated-image (33).png` after identifying content

### LOW PRIORITY
11. **Wireframe pixel-for-pixel rebuild** — `/watch`, `/music`, `/shop` flagged in `WIREFRAME_REBUILD_PLAN.md`
12. **Shop hero image** — `shop-hero.png` is now a video frame; consider commissioning a commerce-focused still
13. **Add Beehiiv/Resend API keys** — Newsletter subscribe form needs these to actually send emails
14. **Add Stripe** — Future subscription/educator tier (not yet implemented)
15. **SEO audit** — Structured data, sitemap, og:images per page
16. **Remove eco-tote duplicate** — `owl-eco-tote-bag.png` is a legacy file alongside `owl-tote-bag.png`

---

## 11. NEXT CHAT STARTER

Paste this into a new Claude Code session:

```
I'm continuing work on the OWL Sing Together website.
Repo: C:\Users\Ricko\owl-website
Live site: https://owlsingtogether.com
Read CLAUDE.md in the repo root before doing anything — it has mandatory startup instructions.
The handoff doc is at docs/project-handoff/PROJECT_HANDOFF.md
Current commit: 6525711 (all changes pushed and deployed)
```

---

## 12. CLAUDE RECOVERY PROMPT

See `PROJECT_RECOVERY_PROMPT.md` in this folder.

---

## 13. COMMAND HISTORY

```bash
# Development
npm run dev                          # Start dev server
npm run build                        # Production build
npm run typecheck                    # tsc --noEmit (run before every commit)
npm run lint                         # ESLint

# YouTube wiring
npm run fetch:youtube:write          # Pulls video IDs from RSS → SEED_VIDEOS

# Printful image sync
node scripts/download-printful-images.js
node scripts/fetch-printful-variant-ids.js
node scripts/recover-printful-products.js

# Etsy management
node scripts/verify-etsy-listings.js
node scripts/reset-etsy-listings.js

# Git workflow (always from C:\Users\Ricko\owl-website)
git add .
git commit -m "descriptive message"
git push
# If HEAD.lock error: del "C:\Users\Ricko\owl-website\.git\HEAD.lock"
```

---

## 14. LESSONS LEARNED

### Failed Approaches
- **Printful PATCH API (405 errors)** — Printful does not allow clearing `external_id` via API. Solution: used Etsy Shop Manager UI to publish directly.
- **Sandbox git push** — The Linux sandbox cannot push to GitHub (proxy 403). Always use PowerShell on Windows machine.
- **Bash `rm` on git lock files** — Cannot delete Windows filesystem lock files from the Linux sandbox. Use `del` in PowerShell.
- **Bulk file copy in bash** — 45s timeout kills large `find -exec cp` operations. Fix: use Python loops or small batches.

### Bugs Fixed
- **Null bytes in shop/page.tsx** — Edit tool appended null bytes on large file writes. Fixed with `python3 data.rstrip(b'\x00')` before each typecheck.
- **Broken Printful images (3–24KB)** — Printful CDN URLs returned tiny placeholder images. Fixed by copying real mockup PNGs from `OWL Products/` folder.
- **`owl-t-shirt` missing** — Slug had no image and no PNG file. Replaced in Apparel featured with `owl-flat-bill-cap`.
- **False "missing image" detection** — Script checked for `{slug}.png` but actual files use `owl-{slug}.png` prefix. Fixed by parsing images.ts for actual src paths.

### Critical Rules — Do NOT Change
- Never expose or log `PRINTFUL_API_KEY`
- Never delete Etsy listings, change prices, modify descriptions, or disconnect Printful
- Never alter shipping profiles
- Always read `CLAUDE_READ_FIRST.md` at session start
- Always run `npm run typecheck` before `git commit`
- Shop page slug for "Home" category is `"Home & Accessories"` (value) but `"Home"` (label) — must match `SECTION_ORDER` array exactly
- `resolveProductImage(slug)` in `images.ts` is the single source of truth for product image paths
- Album product slugs use `category: "Digital"` (not "Music") as of this session

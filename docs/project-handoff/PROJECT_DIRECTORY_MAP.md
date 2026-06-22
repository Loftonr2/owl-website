# OWL Sing Together — Project Directory Map
**Last updated:** June 10, 2026 | Commit `6525711`

---

## Website Repo: `C:\Users\Ricko\owl-website\`

```
owl-website/
├── CLAUDE.md                            ← MANDATORY: Read every session
├── ASSET_IMPLEMENTATION_PLAN.md         ← Wireframe → route → header mapping
├── STORE_SETUP.md                       ← Fulfillment setup checklist
├── WIREFRAME_REBUILD_PLAN.md            ← Page rebuild priority list
├── YOUTUBE_WIRING.md                    ← YouTube channel wiring guide
├── WOZCODE_SETUP_REPORT.md              ← WozCode plugin setup
├── DESIGN.md                            ← Design tokens + rules for agents
│
├── src/
│   ├── app/
│   │   ├── layout.tsx                   ← Root layout (fonts, global nav)
│   │   ├── robots.ts
│   │   ├── sitemap.ts
│   │   │
│   │   ├── (marketing)/                 ← Public-facing pages
│   │   │   ├── layout.tsx               ← Nav + footer wrapper
│   │   │   ├── page.tsx                 ← Homepage /
│   │   │   ├── about/page.tsx           ← /about
│   │   │   ├── watch/
│   │   │   │   ├── page.tsx             ← /watch (OWL Discovery Arcade)
│   │   │   │   └── [slug]/page.tsx      ← /watch/[video]
│   │   │   ├── music/
│   │   │   │   ├── page.tsx             ← /music
│   │   │   │   └── [slug]/page.tsx
│   │   │   ├── shop/
│   │   │   │   ├── page.tsx             ← /shop (7-category landing) ⭐
│   │   │   │   ├── [category]/page.tsx  ← /shop/apparel etc.
│   │   │   │   ├── [slug]/page.tsx      ← /shop/owl-sweatshirt etc.
│   │   │   │   └── all-products/page.tsx← /shop/all-products
│   │   │   ├── educators/page.tsx       ← /educators
│   │   │   ├── printables/
│   │   │   │   ├── page.tsx             ← /printables
│   │   │   │   └── [slug]/page.tsx
│   │   │   ├── blog/
│   │   │   │   ├── page.tsx             ← /blog
│   │   │   │   └── [slug]/page.tsx
│   │   │   ├── gallery/page.tsx         ← /gallery
│   │   │   ├── holidays/
│   │   │   │   ├── page.tsx             ← /holidays
│   │   │   │   └── [slug]/page.tsx
│   │   │   ├── contact/page.tsx         ← /contact
│   │   │   ├── newsletter/page.tsx      ← /newsletter
│   │   │   ├── recommendations/page.tsx ← /recommendations
│   │   │   ├── parent-resources/page.tsx
│   │   │   └── teacher-resources/page.tsx
│   │   │
│   │   ├── (admin)/                     ← Password-protected admin
│   │   │   ├── layout.tsx
│   │   │   ├── admin/page.tsx           ← /admin dashboard
│   │   │   └── admin/products/page.tsx  ← /admin/products (CRM) ⭐
│   │   │
│   │   ├── api/
│   │   │   ├── webhooks/
│   │   │   │   └── paypal/route.ts      ← Fulfillment webhook ⭐
│   │   │   ├── admin/
│   │   │   │   ├── products/[slug]/route.ts
│   │   │   │   ├── sync-printful-images/route.ts
│   │   │   │   └── sync-printify/route.ts
│   │   │   ├── contact/route.ts
│   │   │   ├── health/route.ts
│   │   │   ├── newsletter/subscribe/route.ts
│   │   │   └── printify/route.ts
│   │   │
│   │   ├── auth/
│   │   │   ├── callback/route.ts
│   │   │   └── sign-out/route.ts
│   │   ├── login/
│   │   │   ├── actions.ts
│   │   │   └── page.tsx
│   │   └── studio/[[...tool]]/          ← Sanity CMS Studio
│   │
│   ├── components/
│   │   ├── brand/
│   │   │   ├── owl-logo.tsx             ← OwlMark watermark
│   │   │   └── owl-lockup.tsx
│   │   ├── marketing/
│   │   │   ├── video-hero-banner.tsx    ← Full-width video hero ⭐
│   │   │   ├── product-card.tsx         ← Shop product card ⭐
│   │   │   ├── owl-discovery-arcade.tsx ← Watch page theme browser ⭐
│   │   │   ├── browse-videos-section.tsx
│   │   │   ├── printable-card.tsx
│   │   │   ├── newsletter-section.tsx
│   │   │   ├── streaming-platforms.tsx
│   │   │   ├── section-reveal.tsx
│   │   │   ├── contact-form.tsx
│   │   │   ├── featured-playlists.tsx
│   │   │   ├── featured-videos.tsx
│   │   │   └── [15 more components...]
│   │   └── ui/
│   │       ├── button.tsx
│   │       ├── section.tsx
│   │       ├── section-intro.tsx
│   │       ├── chip.tsx
│   │       ├── coming-soon-ribbon.tsx
│   │       └── [more ui primitives...]
│   │
│   ├── lib/
│   │   ├── images.ts                    ← resolveProductImage() registry ⭐
│   │   ├── printful-variants.ts         ← Variant ID map for 34 products ⭐
│   │   ├── cn.ts                        ← Tailwind class merger
│   │   ├── tokens.ts                    ← Design tokens
│   │   ├── site-config.ts
│   │   ├── seed/
│   │   │   ├── products.ts              ← ~90 products (source of truth) ⭐
│   │   │   ├── printables.ts            ← PDFs + bundle packs
│   │   │   ├── videos.ts                ← YouTube video seed
│   │   │   ├── playlists.ts
│   │   │   ├── blog.ts
│   │   │   ├── gallery.ts
│   │   │   └── holidays.ts
│   │   ├── seo/
│   │   │   ├── metadata.ts
│   │   │   └── structured-data.ts
│   │   ├── motion/
│   │   │   └── [gsap, scroll, timing...]
│   │   ├── email/welcome.tsx
│   │   └── validation/
│   │       ├── contact.ts
│   │       └── newsletter.ts
│   │
│   ├── sanity/                          ← CMS schemas (not yet content-live)
│   │   ├── schemas/
│   │   │   ├── blogArticle.ts
│   │   │   ├── video.ts
│   │   │   ├── galleryItem.ts
│   │   │   ├── product.ts
│   │   │   ├── playlist.ts
│   │   │   ├── printable.ts
│   │   │   ├── holidayHub.ts
│   │   │   └── [more schemas...]
│   │   ├── queries.ts
│   │   ├── structure.ts
│   │   └── env.ts
│   │
│   ├── types/index.ts
│   └── middleware.ts                    ← Auth middleware (admin routes)
│
├── public/
│   ├── images/
│   │   ├── products/                    ← 71 product images (PNG, 1–4MB) ⭐
│   │   │   ├── owl-sweatshirt.png
│   │   │   ├── owl-cotton-kids-t-shirt.png  ← Updated June 10 ⭐
│   │   │   ├── owl-infant-bodysuit.png
│   │   │   ├── owl-flat-bill-cap.png    ← Title: "Flat Ball Cap" ⭐
│   │   │   ├── owl-backpack.png
│   │   │   ├── owl-water-bottle.png
│   │   │   ├── owl-tote-bag.png
│   │   │   ├── owl-throw-blanket.png
│   │   │   ├── owl-enamel-mug.png
│   │   │   ├── owl-wine-tumbler.png
│   │   │   ├── owl-insulated-tumbler.png
│   │   │   ├── owl-glossy-mug.png
│   │   │   ├── owl-counting-math-album.png  ← Larissa album ⭐
│   │   │   ├── owl-abc-adventure-album.png  ← Larissa album ⭐
│   │   │   ├── owl-around-world-album.png   ← Larissa album ⭐
│   │   │   ├── owl-calm-down-album.png      ← Larissa album ⭐
│   │   │   ├── owl-lullaby-album.png        ← Larissa album ⭐
│   │   │   └── [54 more sticker/coloring/flashcard images...]
│   │   ├── headers/                     ← 17 page header images
│   │   │   ├── shop-hero.png            ← Now a real video frame ⭐
│   │   │   ├── home-hero.png
│   │   │   ├── about-hero.png
│   │   │   └── [14 more...]
│   │   ├── brand/
│   │   │   ├── circular-logo.png
│   │   │   ├── circular-logo-alt.png
│   │   │   └── mascot.png
│   │   ├── bundles/                     ← 4 bundle pack images
│   │   ├── discovery/                   ← Watch page theme card images
│   │   ├── educators/                   ← Educator tool images
│   │   └── video-posters/
│   ├── videos/                          ← Hero MP4s for all pages (~30MB each)
│   │   ├── shop-hero.mp4
│   │   ├── home-hero.mp4
│   │   └── [more page hero videos...]
│   └── printables/                      ← 4 downloadable PDF workbooks
│
├── scripts/
│   ├── fetch-youtube-videos.mjs         ← Run: npm run fetch:youtube:write
│   ├── download-printful-images.js
│   ├── fetch-printful-variant-ids.js
│   ├── recover-printful-products.js
│   ├── reset-etsy-listings.js
│   ├── verify-etsy-listings.js
│   └── [more utility scripts...]
│
├── supabase/
│   └── migrations/
│       ├── 0001_init.sql
│       ├── 0002_products_extended.sql
│       └── 0003_add_printify_variant_id.sql
│
└── docs/
    └── project-handoff/                 ← THIS FOLDER
        ├── PROJECT_HANDOFF.md
        ├── PROJECT_RECOVERY_PROMPT.md
        ├── PROJECT_DIRECTORY_MAP.md     ← This file
        └── PROJECT_TASKS.md
```

---

## Source Assets: `C:\Users\Ricko\OneDrive\Desktop\OWL Sing Together\`

```
OWL Sing Together/
├── OWL Products/                        ← Master source for all product images
│   ├── _original_backup/                ← 104 originals backed up (DO NOT DELETE)
│   ├── Updated Product Images/          ← Output folder for AI-generated images
│   ├── product_image_update_prompts.md  ← 89 prompts for Midjourney/DALL-E
│   ├── OWL_Product_Image_Update_Report.md
│   ├── OWL Sweatshirt.png
│   ├── OWL Cotton Kids T-Shirt.png      ← Updated June 10
│   ├── OWL Onesie.png
│   ├── OWL Flat Bill Cap.png
│   ├── OWL Backpack.png
│   ├── OWL Eco-Friendly Tote Bag.png
│   ├── OWL Stainless Steel Water Bottle.png
│   ├── OWL Throw Blanket.png
│   ├── Enamel Mug.png
│   ├── OWL Teal Wine Tumbler.png
│   ├── OWL Teal Insulated Tumbler With Straw.png
│   ├── White OWL Glossy Mug.png
│   ├── Latte Mug.png
│   ├── Larissa Counting & Math Album.png
│   ├── Larissa's ABC Adventures Album.png
│   ├── Larissa's Around The World Album.png
│   ├── Larissa's Calm Down Album.png
│   ├── Larissa's Lullaby Album.png
│   └── [70+ more digital product images...]
│
├── OWL Wireframes/                      ← 13 Figma wireframe PNGs
│   ├── OWL Store Page.png               ← /shop wireframe
│   ├── OWL Homepage.png
│   └── [11 more wireframes...]
│
└── OWL Website Header Images/           ← 23 production header photos
    └── [all header images used in public/images/headers/]
```

---

## Obsidian Brain: `C:\Users\Ricko\OneDrive\Documents\Claude\Projects\OWL Website Build\OWL-Obsidian-Brain\`

```
OWL-Obsidian-Brain/
├── 13_Claude_Source_Of_Truth/           ← READ EVERY SESSION
│   ├── CLAUDE_READ_FIRST.md             ← MANDATORY
│   ├── OWL_BUILD_RULES.md
│   └── PROJECT_CONTEXT.md
├── 09_Design_System/
│   └── DESIGN_STYLE_GUIDE.md
├── 11_Tech_Requirements/
│   ├── TECH_STACK.md
│   ├── ADMIN_CRM_REQUIREMENTS.md
│   └── WEBSITE_REQUIREMENTS.md
└── [other strategy/curriculum/CRM folders...]
```

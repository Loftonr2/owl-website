# OWL Sing Together — Claude Recovery Prompt
**Paste this entire block into a new Claude Code session to restore full context.**

---

## RECOVERY PROMPT (copy everything below this line)

---

You are continuing work on the **OWL Sing Together website** — a Next.js 14 marketing + e-commerce site for a multicultural children's educational music brand.

### MANDATORY FIRST STEPS (do these before anything else)
1. Read `C:\Users\Ricko\owl-website\CLAUDE.md`
2. Read `C:\Users\Ricko\OneDrive\Documents\Claude\Projects\OWL Website Build\OWL-Obsidian-Brain\13_Claude_Source_Of_Truth\CLAUDE_READ_FIRST.md`
3. Read `C:\Users\Ricko\OneDrive\Documents\Claude\Projects\OWL Website Build\OWL-Obsidian-Brain\13_Claude_Source_Of_Truth\PROJECT_CONTEXT.md`
4. Read `C:\Users\Ricko\owl-website\docs\project-handoff\PROJECT_HANDOFF.md` for full session history

### PROJECT BASICS
- **Repo:** `C:\Users\Ricko\owl-website` → GitHub: `Loftonr2/owl-website`
- **Live site:** https://owlsingtogether.com
- **Current commit:** `6525711` (all pushed, Vercel deployed)
- **Framework:** Next.js 14 App Router, TypeScript, Tailwind CSS
- **Owner email:** rickoflv@gmail.com

### WHAT IS COMPLETE
- All 13 marketing pages live and deployed
- Shop page: 7 categories (Coloring, Stickers, Apparel, Flashcards, Home, Drinkware, Digital)
- 42 Etsy listings live at etsy.com/shop/OwlSingTogetherStore
- Printful connected as fulfillment provider
- Product images: all Apparel/Home/Drinkware/Digital showing real mockups
- Larissa album covers in Digital section (Counting & Math, ABC Adventure, Around the World, Calm Down)
- PayPal checkout on product detail pages
- Admin CRM at /admin/products
- VideoHeroBanner component on all major pages
- OWL Cotton Kids T-Shirt: white tee with smiling Black boy (updated June 10)
- OWL Flat Ball Cap: title corrected (was "Flat Bill")

### WHAT NEEDS WORK NEXT (in priority order)
1. **Vercel env vars** — Add `PAYPAL_CLIENT_SECRET` + `PAYPAL_WEBHOOK_ID` to Vercel dashboard to enable auto-fulfillment
2. **YouTube wiring** — Run `npm run fetch:youtube:write` from `C:\Users\Ricko\owl-website`
3. **AI product images** — Generate images from prompts in `C:\Users\Ricko\OneDrive\Desktop\OWL Sing Together\OWL Products\product_image_update_prompts.md` using Midjourney or DALL-E
4. **Supabase production** — Apply migrations + add env vars
5. **Sanity CMS** — Populate content via /studio

### KEY FILES TO KNOW
- `src/lib/seed/products.ts` — All ~90 products defined here (source of truth for shop)
- `src/lib/images.ts` — `resolveProductImage(slug)` — must register every product image here
- `src/app/(marketing)/shop/page.tsx` — SHOP_CATEGORIES + SECTION_ORDER arrays control shop layout
- `src/lib/printful-variants.ts` — Variant ID map for fulfillment
- `src/app/api/webhooks/paypal/route.ts` — Auto-fulfillment webhook

### ARCHITECTURE
- **Images:** Local files in `public/images/products/` registered in `src/lib/images.ts`
- **Products:** TypeScript seed in `src/lib/seed/products.ts` (no DB needed for browsing)
- **Fulfillment:** PayPal webhook → Printful API → Etsy store ships order
- **CMS:** Sanity (not yet content-populated)
- **Auth:** Supabase (admin routes only)
- **Email:** Resend + Beehiiv

### CRITICAL RULES — NEVER VIOLATE
- Always run `npm run typecheck` before `git commit`
- Never expose or log `PRINTFUL_API_KEY`
- Never delete Etsy listings, change prices, modify product descriptions
- After editing `shop/page.tsx`, strip null bytes: `python3 -c "data=open(f,'rb').read(); open(f,'wb').write(data.rstrip(b'\x00'))"`
- If git HEAD.lock error: `del "C:\Users\Ricko\owl-website\.git\HEAD.lock"` then retry
- Git push must be done from Windows PowerShell — sandbox cannot reach GitHub

### SOURCE ASSET FOLDERS (on Windows machine)
- Product images: `C:\Users\Ricko\OneDrive\Desktop\OWL Sing Together\OWL Products\`
- Wireframes: `C:\Users\Ricko\OneDrive\Desktop\OWL Sing Together\OWL Wireframes\`
- Header images: `C:\Users\Ricko\OneDrive\Desktop\OWL Sing Together\OWL Website Header Images\`
- Obsidian brain: `C:\Users\Ricko\OneDrive\Documents\Claude\Projects\OWL Website Build\OWL-Obsidian-Brain\`

### DESIGN LANGUAGE
OWL brand = warm, premium, cinematic, child-friendly, multicultural education. Colors: `owl-teal`, `owl-amber`, `owl-rose`, `owl-forest`, `owl-ink`, `owl-cream`. Font: display font (Nunito/rounded). NO purple gradients, NO glass cards on dark, NO Inter/Arial, NO pure white backgrounds, NO emoji icons, NO dark mode.

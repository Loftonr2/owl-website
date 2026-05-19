# DESIGN.md — OWL Sing Together

**Format:** Single-file design brief for AI design agents (Claude Design, Stitch, UI UX Pro Max).
**Pairs with:** `CLAUDE.md` (project rules), `.claude/skills/ui-ux-pro-max/SKILL.md` (workflow), `tailwind.config.ts` (token implementation), `..\OWL-Obsidian-Brain\09_Design_System\DESIGN_STYLE_GUIDE.md` (canonical source).
**Last updated:** 2026-05-12

This file is the agent-facing source of truth for OWL's visual language. Every frontend task must read it before producing code.

---

## 1. Visual theme and atmosphere

**Brand essence:** warm, premium, cinematic, multicultural, child-friendly, parent-respected, educator-trusted. Never generic-AI-looking. Never cold. Never aggressive.

**Mood keywords:** Saturday-morning kitchen light. Picture books. Hand-drawn but polished. Slow pacing. Generous whitespace. Soft edges. Music heard from another room.

**Density:** Spacious. Hero blocks breathe. Editorial-style rhythm on long-form pages. Never crammed.

**Reference vibes:** Studio Ghibli backgrounds × Nordic children's book illustration × Apple's early iPad keynotes × the calm sections of Sesame Workshop's site. Avoid: SaaS-purple, fintech-glass, brutalist-Gen-Z, dark-mode-by-default.

**Style chosen for OWL:** "Soft UI Evolution" with editorial structure. Gentle shadows, organic radii, warm cream surfaces. Illustration-led on heroes, content-led on listing pages.

---

## 2. Color palette and roles

Implementation: `tailwind.config.ts` → `theme.extend.colors.owl.*`. Never inline hex in components — reference tokens.

| Token | Hex | Role |
|---|---|---|
| `owl-cream` | `#FBF6EC` | Primary canvas background (warm off-white) |
| `owl-cream-deep` | `#F3EBDA` | Secondary surfaces, card backgrounds, alternating bands |
| `owl-teal` | `#1A9994` | Primary brand accent — links, secondary CTAs, nav active |
| `owl-teal-deep` | `#137070` | Hover/focus state for teal elements, deeper accents |
| `owl-amber` | `#F5A623` | Primary CTA, key highlights, "play" affordances |
| `owl-amber-soft` | `#F8C975` | CTA hover background, soft amber surfaces |
| `owl-forest` | `#2D4A3A` | Secondary text, deep-contrast surfaces (footer, hero overlays) |
| `owl-ink` | `#1C2B4A` | Primary body text — high-contrast on cream |
| `owl-mist` | `#7A8794` | Supporting text, captions, metadata |
| `owl-rose` | `#E89F8E` | Accent for warmth, used sparingly on cards and badges |
| `owl-success` | `#4C9F70` | Success states, "in stock", confirmations |
| `owl-error` | `#C84B4B` | Errors, destructive actions, validation |

**Contrast pairs (WCAG AA verified):**
- `owl-ink` on `owl-cream` → primary body text, contrast ~12:1
- `owl-forest` on `owl-cream` → secondary headings, contrast ~9:1
- `owl-mist` on `owl-cream` → captions only, contrast 4.6:1 (passes AA for normal text)
- `owl-teal` on `owl-cream` → links and small accents
- `owl-cream` on `owl-teal-deep` → buttons with teal background
- `owl-ink` on `owl-amber` → amber CTAs use ink text, not white

**Forbidden color choices:**
- Pure white (`#FFFFFF`) backgrounds. Always use `owl-cream`.
- Pure black (`#000000`) text. Always use `owl-ink`.
- Purple-to-pink gradients of any kind ("AI-native" cliché).
- Dark mode unless a future product decision explicitly requires it.

---

## 3. Typography

**Family:** Nunito (display + body). Single-family system — clarity over variety. Substitute fallback: `system-ui, -apple-system, sans-serif`.

**Loading:** `next/font/google` with `display: 'swap'`, subsets `latin` + `latin-ext`.

**Type scale:**

| Token | Size / line-height / weight | Use |
|---|---|---|
| `text-hero` (custom) | `3.5rem / 1.1 / 800` | Homepage and flagship landing hero H1 |
| `text-5xl md:text-6xl` | scaled hero | Standard page H1 |
| `text-4xl md:text-5xl` | | Section headings (H2) |
| `text-2xl md:text-3xl` | | Sub-section headings (H3) |
| `text-xl` | | Card titles, sidebar headings |
| `text-base md:text-lg` | | Body copy |
| `text-sm` | | Captions, badges, metadata |
| `text-xs` | | Footer fine print, legal |

**Rules:**
- One `<h1>` per page. Headings descend in order; no skipping levels.
- Body line-height ≥ 1.6. Headings 1.1–1.25.
- Letter-spacing: default for body. `tracking-tight` for hero. Never `tracking-widest` on body.
- Hero copy max-width `max-w-[20ch]` to `max-w-prose`.
- Body copy max-width `max-w-prose` (72ch).
- Bold = `font-bold` (700) or `font-extrabold` (800). Avoid 900.
- Numbers in metadata: `tabular-nums`.

---

## 4. Component stylings

**Buttons** (`src/components/ui/button.tsx`):

- Primary CTA: `bg-owl-amber text-owl-ink hover:bg-owl-amber-soft active:translate-y-px shadow-sm hover:shadow transition-all duration-200 ease-owl rounded-owl-btn px-6 py-3 font-bold focus-visible:ring-2 focus-visible:ring-owl-amber/60 focus-visible:ring-offset-2`
- Secondary: `bg-owl-teal text-owl-cream hover:bg-owl-teal-deep` (same other props)
- Ghost: `bg-transparent text-owl-ink hover:bg-owl-cream-deep`
- Destructive: `bg-owl-error text-owl-cream hover:bg-owl-error/90`
- Disabled: `opacity-50 cursor-not-allowed pointer-events-none`

All buttons: `cursor-pointer`, `rounded-owl-btn` (12px), `transition-all duration-200 ease-owl`, focus-visible ring.

**Cards** (`src/components/ui/card.tsx`):

- Base: `bg-owl-cream-deep rounded-owl-card p-6 md:p-8 shadow-[0_2px_12px_-2px_rgba(28,43,74,0.06)]`
- Hover (when interactive): `hover:shadow-[0_8px_24px_-4px_rgba(28,43,74,0.12)] hover:-translate-y-0.5 transition-all duration-250 ease-owl`
- Featured cards on hero: `rounded-owl-hero` (24px)
- Inner spacing: `space-y-3 md:space-y-4`

**Inputs:**

- `bg-owl-cream border border-owl-mist/30 rounded-owl-btn px-4 py-3 text-owl-ink focus:border-owl-teal focus:ring-2 focus:ring-owl-teal/30 focus:outline-none transition-colors`
- Label always present, `text-sm font-semibold text-owl-forest mb-1.5`.
- Error state: `border-owl-error focus:ring-owl-error/30`.

**Chips / tags:**

- `bg-owl-cream-deep text-owl-forest text-xs font-semibold uppercase tracking-wide px-3 py-1 rounded-full`
- Active: `bg-owl-teal text-owl-cream`.

**Navigation:**

- Sticky, backdrop-blurred, semi-transparent cream: `bg-owl-cream/85 backdrop-blur-md border-b border-owl-cream-deep`.
- Nav links: `text-owl-ink hover:text-owl-teal transition-colors duration-150`, with active underline animation.
- Mobile menu: full-screen overlay with staggered link reveal (60ms).

---

## 5. Layout principles

**Spacing scale** (Tailwind defaults, OWL conventions):

- Component padding: `p-6 md:p-8`.
- Section vertical rhythm: `py-16 md:py-24 lg:py-32`. Heroes: `py-20 md:py-32 lg:py-40`.
- Container: `max-w-7xl mx-auto px-5 md:px-8 lg:px-12`.
- Stack rhythm inside a section: `space-y-6 md:space-y-8`.
- Grid gaps: `gap-6 md:gap-8`. Hero feature grids: `gap-8 md:gap-10 lg:gap-12`.

**Grid system:**

- Mobile: 1 column.
- `md:` (768px+): 2 columns for card lists, 3 for compact tiles.
- `lg:` (1024px+): 3 columns standard, 4 for dense tile grids.
- Bento layouts on `/watch`, `/music`, `/shop`: use `grid-cols-12` with explicit `col-span-*` for varied tile sizes.

**Whitespace rhythm:**

- Hero → first content section: 96–128px gap.
- Section → section: 64–96px gap.
- Content card → card: 24–32px gap.
- Never let two adjacent sections touch — there is always breathing room.

**Asymmetry:**

- Heroes prefer 60/40 or 55/45 splits (illustration vs. copy), never dead-center 50/50.
- Cards in a row can vary in height when content is real. Don't force uniform clamps.

---

## 6. Depth and elevation

OWL uses three elevation tiers. Shadows are warm and soft — never cold gray.

| Tier | Use | Shadow |
|---|---|---|
| 0 (flat) | Default surfaces, hero cards on cream | `shadow-none` |
| 1 (resting) | Content cards, nav, footer | `shadow-[0_2px_12px_-2px_rgba(28,43,74,0.06)]` |
| 2 (hover/lifted) | Card hover state, dropdowns | `shadow-[0_8px_24px_-4px_rgba(28,43,74,0.12)]` |
| 3 (modal/dialog) | Dialogs, large overlays | `shadow-[0_24px_64px_-12px_rgba(28,43,74,0.25)]` |

Use `border` sparingly. Prefer shadow + background contrast to define surfaces.

---

## 7. Do's and don'ts

**Do:**
- Use Larissa's illustration system on every hero. The illustration is the hook.
- Lead with photography or illustration above any text on landing pages.
- Use animation to reveal hierarchy, not to entertain.
- Keep the cream canvas. It's the brand.
- Use amber for the single most important CTA on a screen. One amber per fold.
- Test every screen at 375px first.
- Use `next/image` for every image. `priority` only above the fold.

**Don't:**
- Don't use emojis as functional icons. Use Lucide icons.
- Don't use AI-purple gradients or mesh gradients.
- Don't autoplay video or audio. Ever.
- Don't add mouse-trail particles, sparkles, or cursor confetti.
- Don't use Inter, Roboto, or Arial. We use Nunito.
- Don't use pure white backgrounds. Use `owl-cream`.
- Don't use pure black text. Use `owl-ink`.
- Don't put more than one bold CTA in a single fold.
- Don't write copy in ALL CAPS for body text. Caps are reserved for chips/badges.
- Don't ship a screen without a focus-visible state on every interactive.

---

## 8. Responsive behavior

**Tested breakpoints (must verify before declaring done):**

| Width | Device | What to check |
|---|---|---|
| 375 | iPhone SE | Hero readable, nav collapses, touch targets ≥ 44px |
| 414 | iPhone Pro Max | Hero balance |
| 768 | iPad portrait | Two-col layouts engage |
| 1024 | iPad landscape | Three-col grids engage |
| 1280 | Standard desktop | Final composition |
| 1536 | Wide desktop | Max-width caps don't strand content |

**Behavior rules:**

- Mobile-first authoring. Add `md:`/`lg:` modifiers only when behavior changes.
- Navigation: hamburger ≤ `md`, horizontal menu ≥ `md`.
- Hero: stack illustration above copy ≤ `md`, side-by-side ≥ `md`.
- Cards: 1 col ≤ `md`, 2 col `md`–`lg`, 3+ col ≥ `lg`.
- Touch targets ≥ 44×44px mobile, ≥ 36×36px desktop.
- No horizontal scroll at any width. Verify with Playwright MCP.

---

## 9. Motion and interaction

OWL motion library:

| Pattern | Where | Spec |
|---|---|---|
| Fade-on-scroll | Every section below the fold | 0.4s fade + 8–16px Y. `whileInView`, `once: true`, margin `-10% 0px`. |
| Hero illustration drift | `<HeroMascots>` and equivalents | Slow 4s loop, ±6px Y/X, paused under `prefers-reduced-motion`. |
| Card hover lift | Interactive cards | 200–300ms ease-owl, translateY(-2px), shadow tier 1 → 2. |
| Button hover | All buttons | 150ms ease-owl, bg + 1px lift, no scale. |
| Underline grow | Nav + inline links | `after:scale-x-0 hover:after:scale-x-100 origin-left transition-transform duration-300`. |
| Stagger reveal | Card lists | 60–80ms between siblings. Container variants, child variants. |
| Page transitions | Route changes | None in v1. Use `<SectionReveal>` instead. |
| Cursor-driven parallax | Hero illustrations (optional) | Max 8px offset. Disabled under reduced-motion. |
| Magnetic CTA | Hero amber button (optional) | Max 4px pull. Disabled under reduced-motion. |

**Required for every animation:**

- Check `useReducedMotion()` (Framer Motion hook). Degrade to instant or 0.1s fade.
- Wrap raw CSS transforms in Tailwind `motion-safe:` variants.
- Never animate `width` or `height` — animate `transform` and `opacity`.
- Avoid layout-thrash properties (`top`, `left`, `padding`).

---

## 10. Accessibility (WCAG 2.1 AA)

Non-negotiable. Every screen passes axe before merge.

- **Contrast:** Body 4.5:1, large (18pt or 14pt bold) 3:1, UI components 3:1.
- **Keyboard:** Every interactive reachable by Tab in DOM order. Skip-link to main on every page.
- **Focus:** Visible 2px ring, 2px offset, in `owl-teal` or matching brand color (`focus-visible:ring-2 focus-visible:ring-owl-teal/60 focus-visible:ring-offset-2`).
- **Semantics:** `<button>` for actions, `<a>` for navigation, `<h1>` once, proper landmark roles via native elements (`<header>`, `<nav>`, `<main>`, `<footer>`).
- **Alt text:** Every meaningful image has descriptive alt. Decorative images: `alt=""`. Larissa illustrations describe the scene briefly (e.g. "Two owl friends reading a picture book together on a cream background").
- **Forms:** Every input has a visible `<label>` or `aria-label`. Error messages linked via `aria-describedby`.
- **Motion:** `prefers-reduced-motion: reduce` respected everywhere.
- **Language:** `<html lang="en">` set; future i18n will add locale handling.
- **Color is never the only signal.** Use icon + text in addition to color for status.

---

## 11. Anti-patterns (the "no generic AI UI" list)

If you see any of these in a generated screen, reject the design and regenerate:

1. Purple-to-pink mesh gradients.
2. Floating glass card on neon gradient hero.
3. Three centered feature cards in a row with identical icons (e.g., Lightning/Shield/Rocket).
4. AI-generated stock photo of a person looking at a laptop.
5. Inter/Roboto/Arial as the only typeface.
6. Headlines like "Supercharge your X" or "AI-powered Y".
7. Section labels in caps that say "FEATURES" / "TESTIMONIALS" with no design intent.
8. Centered-everything single-column landing page.
9. Buttons with no transition.
10. Cards with no hover state.
11. Emoji as functional icons.
12. Pure-white backgrounds with low-contrast gray text.
13. Mouse-trail particles, sparkles, cursor confetti.
14. Dark mode applied to a warm-cream brand.
15. Autoplaying video or audio.

---

## 12. Agent prompt guide

When asking an agent (Claude Code, Claude Design, Stitch) to produce a screen for OWL, frame the prompt like this:

```
Use UI UX Pro Max. Read DESIGN.md.

Build the [page name] for OWL Sing Together.

Audience: [parents / educators / both].
Goal of the page: [one sentence].
Primary CTA: [text + destination].
Reference: wireframe at public/images/wireframes-reference/[file].png.
Hero asset: [headers.X from src/lib/images.ts].
Style: Soft UI Evolution, editorial structure.

Tokens: tailwind owl-* tokens only. No inline hex.
Stack: Next.js 15 server component by default, "use client" islands only where needed. Framer Motion for reveals + hovers. lucide-react for icons. shadcn/ui patterns from src/components/ui.

After building, run the Pre-delivery checklist from .claude/skills/ui-ux-pro-max/SKILL.md and verify with Playwright MCP + Chrome DevTools MCP at 375 / 768 / 1280.
```

---

## 13. Implementation checklist (per screen)

Before declaring a screen done:

- [ ] DESIGN.md and UI UX Pro Max skill read at session start
- [ ] One Style picked from the catalogue and justified
- [ ] Wireframe reviewed (if a route has one)
- [ ] OWL tokens used, no inline hex
- [ ] Nunito loaded via `next/font/google`
- [ ] Hero illustration sourced from `src/lib/images.ts`
- [ ] All buttons have hover + focus-visible + active states
- [ ] All cards have hover + focus-visible states
- [ ] Reveal animation respects `prefers-reduced-motion`
- [ ] Contrast verified at AA on body and large text
- [ ] Keyboard navigation flows naturally
- [ ] Responsive verified at 375 / 768 / 1024 / 1280
- [ ] No console errors (Chrome DevTools MCP)
- [ ] LCP < 2.5s, CLS < 0.1, INP < 200ms (Chrome DevTools MCP performance)
- [ ] Playwright MCP screenshot at desktop + mobile

---

## 14. References

- Tailwind tokens: `tailwind.config.ts`
- UI primitives: `src/components/ui/`
- Asset manifest: `src/lib/images.ts`
- Asset implementation plan: `ASSET_IMPLEMENTATION_PLAN.md`
- Skill: `.claude/skills/ui-ux-pro-max/SKILL.md`
- Project rules: `CLAUDE.md`
- Canonical design system (Obsidian brain): `..\OWL-Obsidian-Brain\09_Design_System\DESIGN_STYLE_GUIDE.md`
- Source-of-truth files: `..\OWL-Obsidian-Brain\13_Claude_Source_Of_Truth\`
- Awesome Claude Design inspiration: https://github.com/VoltAgent/awesome-claude-design
- UI UX Pro Max upstream: https://github.com/nextlevelbuilder/ui-ux-pro-max-skill

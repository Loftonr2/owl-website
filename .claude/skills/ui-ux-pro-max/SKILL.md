---
name: ui-ux-pro-max
description: Design intelligence for building professional UI/UX. Use whenever the user requests UI/UX work (build, design, create, implement, review, fix, improve). Generates a complete design system (pattern + style + colors + typography + effects + anti-patterns + pre-delivery checklist) tailored to the product type before writing any code.
---

# UI UX Pro Max — Manual Fallback Skill (OWL Website)

> **Canonical install:** This is a thin local fallback. The full skill (161 reasoning rules, 67 styles, 161 color palettes, 57 font pairings, 25 chart types, 15 stacks, 99 UX guidelines, plus a Python design-system generator) lives at `nextlevelbuilder/ui-ux-pro-max-skill`.
>
> Install the full version in Claude Code:
> ```
> /plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill
> /plugin install ui-ux-pro-max@ui-ux-pro-max-skill
> ```
> Or via CLI: `npm install -g uipro-cli && uipro init --ai claude` (run from the project root).

## When this skill activates

Any user request involving: **build / design / create / implement / review / fix / improve** a UI; landing pages, dashboards, marketing sites, mobile UIs, redesigns, hero sections, components, design systems.

## The required workflow

When this skill activates, do these five steps **before writing component code**:

1. **Identify product type and audience.** For OWL: multicultural early-childhood education brand, parents + educators, premium but child-friendly.
2. **Pick a pattern and style.** Match the audience to one of the styles in the catalogue below. Justify the choice in one sentence.
3. **Generate the design system block.** Colors, typography, effects, anti-patterns. Use the OWL brand tokens as defaults (see "OWL design tokens" below). Deviate only with a written reason.
4. **Apply the pre-delivery checklist** (below) to every screen before declaring done.
5. **Implement** with stack-specific best practices (Next.js 15 + React 19 + Tailwind 3 + Framer Motion + shadcn/ui patterns for this repo).

## OWL design tokens (the brand we never break)

Defined in `tailwind.config.ts` and `src/lib/images.ts`. Treat these as non-negotiable unless redesigning the entire system:

- **Cream** — primary canvas background, warm off-white.
- **Soft teal** — primary brand accent, used for nav, links, CTAs in supporting roles.
- **Amber** — primary CTA, secondary highlights.
- **Forest** — secondary text, deep contrast surfaces.
- **Typography** — Nunito (display + body). No second font unless approved.
- **Voice** — warm, premium, cinematic, parent-friendly, child-focused. Never generic-AI-looking.

## Style catalogue (pick one per surface)

Choose deliberately. The wrong style on the wrong product type is the #1 cause of generic-AI-looking output.

| Style | Best for | Use on OWL? |
|---|---|---|
| Soft UI Evolution | Wellness, premium services, lifestyle | **Default for OWL marketing pages.** Calming, gentle shadows, smooth 200–300ms transitions, organic shapes. Matches OWL's "warm + premium + child-friendly". |
| Organic / Biophilic | Wellness, sustainability, education | Strong secondary option for OWL — leaves room for illustration-led hero blocks. |
| Editorial Grid / Magazine | Blogs, long-form content, holidays | Use for `/blog`, `/blog/[slug]`, `/holidays/[slug]`. |
| Bento Box Grid | Feature pages, dashboards, product showcases | Good fit for `/watch`, `/music`, `/printables`, `/shop` index pages. |
| Hero-Centric | Home + flagship landing pages | Use on `/` and the educator/app waitlist landing pages. |
| Storytelling-Driven | Brands, mission pages | Use on `/about` (Larissa story). |
| Trust & Authority | B2B, enterprise, educator licensing | Use on `/educators` and admin-facing surfaces. |
| Glassmorphism | Modern SaaS, fintech dashboards | **Avoid on OWL public site** — too cold. Acceptable on admin CRM if it doesn't break the warm brand. |
| Neubrutalism / Y2K / Cyberpunk / Memphis | Gen-Z brands, music platforms, gaming | **Anti-pattern for OWL.** Do not use. |
| AI-Native UI (purple/pink gradients) | AI products | **Anti-pattern for OWL.** Hard ban. |

## Anti-patterns (the "no generic AI UI" guardrails)

Never ship a screen that contains any of these:

- Generic AI-purple or pink-to-blue mesh gradients (the "ChatGPT clone" look).
- Inter / Roboto / Arial as the only display font.
- "Floating glass card on gradient" hero with no real photography or illustration.
- Emoji as functional icons. Use Lucide / Heroicons SVGs only.
- Cards with no hover state, no focus state, no transition.
- Buttons that change color on hover without a transition (instant flip = cheap).
- `border-radius: 4px` everywhere. OWL leans **softer** — 8–16px on small surfaces, 24px+ on hero cards.
- Centered single-column landing page with three feature cards underneath. Lazy.
- Dark mode without the brand asking for it. OWL is a warm-cream brand. Don't invert.
- Autoplay video or audio. OWL is explicitly a no-autoplay-audio brand.
- Mouse-trail particles. Never.

## Motion and interaction rules

OWL already uses Framer Motion with `prefers-reduced-motion` respected (see `<SectionReveal>` and `<HeroMascots>` in `src/components/marketing/`). When adding new motion:

- **Page enter:** 0.4–0.6s fade + 8–16px Y translate. One-shot. `whileInView` with `viewport={{ once: true, margin: "-10% 0px" }}`.
- **Hover (cards):** 200–300ms ease-out. Lift by 2–4px (`translateY(-2px)`) + slight shadow bump. Never scale > 1.02 on content cards.
- **Hover (buttons):** 150ms ease-out. Background darkens 5–8%, optional 1px lift. Cursor: pointer.
- **Focus:** Visible 2px ring in `--ring` color, offset 2px. Required on every interactive element.
- **Mouse-triggered:** Subtle parallax on hero illustrations (max 8px offset). Magnetic buttons OK on CTAs only, never on nav. Cursor-driven gradients allowed only on a single hero per page.
- **Reduced motion:** Every animation must check `useReducedMotion()` and degrade to instant or 0.1s fade.
- **Stagger:** Children stagger 60–80ms inside one section. Don't stagger across sections.

## Tailwind state utilities — required vocabulary

Every interactive element must specify these Tailwind state variants:

```
hover:          color shift, shadow, transform
focus-visible:  ring offset 2, ring-2, ring-[color]/50
active:         translate-y-px or scale-[0.98]
disabled:       opacity-50, cursor-not-allowed, pointer-events-none
group-hover:    for card -> child reveals (icon slide, underline grow)
peer-focus:     for linked label states
motion-safe:    wrap any transform/translate that should respect reduced-motion
motion-reduce:  instant fallback
```

Use `transition-colors`, `transition-transform`, `transition-shadow`, or composite `transition-all duration-200 ease-out`.

## Responsive — mobile-first, always

Breakpoints (Tailwind defaults are fine):

- **375px** — iPhone SE baseline. Test here.
- **390px / 414px** — modern phones.
- **768px** — iPad portrait.
- **1024px** — iPad landscape / small laptops.
- **1280px** — desktop.
- **1536px** — wide desktop.

Rules:
- Mobile gets a one-column stack by default. Two-column only above `md:`.
- Touch targets at least 44x44px on mobile.
- Type scales: `text-4xl md:text-5xl lg:text-6xl` for hero headings, `text-base md:text-lg` for body.
- Container padding: `px-5 md:px-8 lg:px-12`.
- Never set a fixed pixel width on a layout container. Use `max-w-*` + `mx-auto`.
- Test horizontal scroll at every breakpoint with Playwright MCP and Chrome DevTools MCP before shipping.

## Accessibility (WCAG 2.1 AA — non-negotiable)

- **Contrast 4.5:1 minimum** for body text against background. 3:1 for large text (18pt+ or 14pt bold).
- **Keyboard navigation** — every interactive element reachable by Tab in DOM order. No `tabindex > 0`.
- **Focus visible** — see "Tailwind state utilities" above.
- **Semantic HTML** — `<button>` for actions, `<a>` for navigation, `<h1>` once per page, headings in order.
- **Alt text** — every `<Image>` has `alt`. Decorative images get `alt=""`.
- **ARIA only when necessary.** Native HTML first.
- **prefers-reduced-motion** — wrap all transforms in `motion-safe:` or check `useReducedMotion()`.
- **Form labels** — every input has an associated `<label>` or `aria-label`.
- Run Lighthouse + axe before declaring a redesign done.

## Stack-specific guidance for this repo

- **Next.js 15 App Router + React 19** — server components by default. Add `"use client"` only for interactivity. Co-locate small client islands.
- **Tailwind 3 + class-variance-authority** — extend `<Button>` and `<Card>` variants in `src/components/ui/`. Do not duplicate variant logic.
- **Framer Motion 11** — import from `framer-motion`. Use `motion.div` for primitives, `<AnimatePresence>` for mount/unmount.
- **shadcn/ui patterns** — copy individual components into `src/components/ui/` rather than installing as a package. Use Radix primitives for accessible disclosure, dialog, dropdown, etc.
- **Images** — `next/image` with `priority` on above-the-fold hero. Use the manifest in `src/lib/images.ts`.
- **Fonts** — use `next/font/google` with `Nunito`, swap display, subset latin + latin-ext.
- **Icons** — `lucide-react` only. No emojis as icons.
- **Type safety** — `tsc --noEmit` must pass before any commit.

## Pre-delivery checklist (run on every redesigned screen)

Copy this into the PR description or session summary:

- [ ] One identified style chosen and justified in one sentence
- [ ] OWL brand tokens used (cream / teal / amber / forest / Nunito)
- [ ] No emojis as icons — Lucide / Heroicons only
- [ ] `cursor-pointer` on every clickable element
- [ ] Hover states with 150–300ms ease-out transitions
- [ ] Focus-visible 2px ring on every interactive element
- [ ] Body text contrast >= 4.5:1; large text >= 3:1
- [ ] `prefers-reduced-motion` respected (manual check + Playwright)
- [ ] Responsive at 375 / 414 / 768 / 1024 / 1280 / 1536
- [ ] No horizontal scroll at any breakpoint
- [ ] No anti-patterns from the list above
- [ ] Playwright MCP screenshot at desktop + mobile
- [ ] Chrome DevTools MCP: console clean, no layout shift > 0.1, LCP < 2.5s
- [ ] DESIGN.md rules applied (see repo root)

## Cross-references

- Brand source of truth: `..\OWL-Obsidian-Brain\13_Claude_Source_Of_Truth\`
- Repo design rules: `DESIGN.md` (repo root)
- Asset manifest: `src/lib/images.ts` + `ASSET_IMPLEMENTATION_PLAN.md`
- Project rules: `CLAUDE.md` (repo root)

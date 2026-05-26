import type { ProductCardProps } from "@/components/marketing/product-card";

export type SeedProduct = ProductCardProps & {
  channel: "shopify" | "printify" | "gumroad" | "etsy" | "kdp" | "tpt";
  ageBand: "0-1" | "1-2" | "2-3" | "3-4" | "4-5" | "5-8";
  story: string;
  supportsLearningIn: string[];
  featured?: boolean;
  /**
   * **STORE STATE FLAG.** Every product in this seed is currently `isComingSoon: true`
   * because the Stripe/Shopify/Printify/Gumroad pipelines exist in scaffold form
   * only (see handoff.MD § "What's stubbed" — Phase 3 wakes them up).
   *
   * When a product goes live in commerce, flip this to `false`. The
   * <ProductCard> renders a corner ribbon and the detail page swaps the
   * Add-to-cart CTA for "Notify me when it drops" when this is true.
   *
   * Do NOT fabricate `isComingSoon: false` to make the design look livelier —
   * the truthful state IS that we are pre-launch on commerce. Ribbon-on-every-card
   * matches the redesign brief exactly: "All product cards in the store that are
   * not yet live must show a visible Coming Soon ribbon."
   */
  isComingSoon?: boolean;
};

export const SEED_PRODUCTS: SeedProduct[] = [
  // ── NEW (May 2026 spec): four featured products from the master prompt ──
  // The "Babies Complete Learning Bundle" has no commissioned image yet —
  // tonal placeholder is the honest skeleton. The other three have real
  // photos registered in src/lib/images.ts → products.
  {
    slug: "owl-babies-bundle",
    title: "OWL Babies Complete Learning Bundle",
    price: "$129",
    ageRange: "0–2",
    ageBand: "0-1",
    category: "Digital",
    tone: "amber",
    channel: "gumroad",
    story:
      "A starter bundle for a baby's first OWL year — plush companion, bilingual flash cards, movement activity pack, and Larissa's lullaby album. Built for sensory exploration, attachment routines, and slow-paced bedtime learning.",
    supportsLearningIn: [
      "Plush owl",
      "Bilingual flash cards",
      "Movement activity pack",
      "Lullaby album",
      "Sensory learning",
      "Educational bundle",
    ],
    featured: true,
    isComingSoon: true,
  },
  {
    slug: "larissa-plush",
    title: "Larissa Plush Set — 6 Ethnicities",
    price: "$34.99",
    ageRange: "0–5",
    ageBand: "0-1",
    category: "Plush",
    tone: "amber",
    channel: "printify",
    story:
      "Six 10-inch Larissa plush companions — Black/African American, Latina, Asian, White, Middle Eastern, and Native American — each soft, huggable, and dressed in OWL's signature jacket. Removable outfits for pretend-play.",
    supportsLearningIn: [
      "Diverse representation",
      "Removable outfits",
      "Educational",
      "Safe for all ages",
    ],
    featured: true,
    isComingSoon: true,
  },
  {
    slug: "rhyme-time-game",
    title: "OWL Rhyme Time Card Game",
    price: "$12.99",
    ageRange: "4–5",
    ageBand: "4-5",
    category: "Flashcards",
    tone: "rose",
    channel: "printify",
    story:
      "48 thick rhyming cards with four ways to play (Go Fish · Rhyme Match · Memory Match · Rhyme Snap). Builds early literacy through rhyming patterns kids love.",
    supportsLearningIn: [
      "Literacy building",
      "Rhyming skills",
      "Memory games",
      "Ages 4–5",
    ],
    featured: true,
    isComingSoon: true,
  },
  // ── EXTRA: actual uploaded image was "Big Feelings Poster Set" ($18.99),
  //    not the bundle from the prompt. Adding both — bundle gets the slot,
  //    posters get the actual image so nothing is wasted.
  {
    slug: "big-feelings-posters",
    title: "OWL Big Feelings Poster Set",
    price: "$18.99",
    ageRange: "3–4",
    ageBand: "3-4",
    category: "Flashcards",
    tone: "teal",
    channel: "printify",
    story:
      "Three large 11×17 laminated SEL posters designed for PreK classrooms — How Am I Feeling, What To Do When I Feel, and Daily Mood Check-In. Multicultural face photography. Reinforces emotion vocabulary and self-regulation routines.",
    supportsLearningIn: [
      "Social-emotional learning",
      "Emotion vocabulary",
      "Daily check-in routine",
      "Classroom-ready",
    ],
    featured: true,
    isComingSoon: true,
  },
  {
    slug: "bilingual-word-cards",
    title: "OWL Toddler Word Cards",
    price: "$12.99",
    ageRange: "1–4",
    ageBand: "1-2",
    category: "Flashcards",
    tone: "amber",
    channel: "printify",
    story:
      "50 large 4×4 inch bilingual EN/ES flash cards organized into five categories (People · Food · Animals · Actions · Objects). Toddler-safe construction, easy to wipe.",
    supportsLearningIn: [
      "Bilingual learning",
      "Early vocabulary",
      "Categories",
      "Toddler safe",
    ],
    featured: true,
    isComingSoon: true,
  },
  {
    slug: "abc-flash-cards",
    title: "ABC flash cards",
    price: "$19.99",
    ageRange: "2–5",
    ageBand: "2-3",
    category: "Flashcards",
    tone: "teal",
    channel: "printify",
    story: "26 illustrated multicultural character cards. One letter, one face, one story.",
    supportsLearningIn: ["Letter recognition", "Letter-sound", "Vocabulary"],
    featured: true,
  isComingSoon: true,
  },
  {
    slug: "feelings-coloring",
    title: "Feelings coloring book",
    price: "$12.99",
    ageRange: "2–5",
    ageBand: "3-4",
    category: "Coloring",
    tone: "rose",
    channel: "kdp",
    story: "32 pages of feelings-named scenes children can color while talking through their day.",
    supportsLearningIn: ["Emotion vocabulary", "Fine motor", "SEL"],
    featured: true,
  isComingSoon: true,
  },
  {
    slug: "sticker-reward-chart",
    title: "Sticker reward chart",
    price: "$13.99",
    ageRange: "3–7",
    ageBand: "3-4",
    category: "Stickers",
    tone: "forest",
    channel: "printify",
    story: "OWL character stickers on a six-week chart. Build routines without shame-based rewards.",
    supportsLearningIn: ["Routine building", "Goal tracking", "Self-efficacy"],
  isComingSoon: true,
  },
  {
    slug: "homeschool-starter",
    title: "Homeschool starter bundle",
    price: "$34.99",
    ageRange: "2–5",
    ageBand: "3-4",
    category: "Digital",
    tone: "cream",
    channel: "gumroad",
    story: "A digital starter pack with twelve printable activities, a parent guide, and access to four OWL videos.",
    supportsLearningIn: ["Early literacy", "Counting", "SEL", "Cultural awareness"],
  isComingSoon: true,
  },
  {
    slug: "lullaby-album",
    title: "Larissa's lullaby album",
    price: "$7.99",
    ageRange: "0–3",
    ageBand: "0-1",
    category: "Music",
    tone: "mist",
    channel: "gumroad",
    story: "Eleven original lullabies — recorded at 432 Hz for a calmer bedtime.",
    supportsLearningIn: ["Sleep routines", "Emotional regulation"],
  isComingSoon: true,
  },
  {
    slug: "owl-counting-mat",
    title: "OWL counting mat 1–20",
    price: "$8.99",
    ageRange: "2–5",
    ageBand: "2-3",
    category: "Flashcards",
    tone: "amber",
    channel: "printify",
    story: "A laminated, wipe-clean mat with number 1–20 and one-to-one counting practice spaces.",
    supportsLearningIn: ["Counting", "Numeral recognition", "1:1 correspondence"],
  isComingSoon: true,
  },
  {
    slug: "emotion-tiles",
    title: "OWL emotion tiles",
    price: "$13.99",
    ageRange: "2–5",
    ageBand: "2-3",
    category: "Flashcards",
    tone: "rose",
    channel: "printify",
    story: "Twelve double-sided tiles with multicultural faces showing big feelings — perfect for circle time.",
    supportsLearningIn: ["Emotion vocabulary", "Empathy", "Storytelling"],
  isComingSoon: true,
  },
  {
    slug: "kreadiness-checklist",
    title: "K-readiness checklist",
    price: "$5.99",
    ageRange: "4–5",
    ageBand: "4-5",
    category: "Flashcards",
    tone: "teal",
    channel: "printify",
    story: "A 3-page laminated checklist tied to Common Core kindergarten standards and ELOF 60-month indicators.",
    supportsLearningIn: ["K-readiness", "Parent communication", "Standards alignment"],
  isComingSoon: true,
  },
];

export const PRODUCT_CATEGORY_OPTIONS = [
  { value: "Plush", label: "Plush" },
  { value: "Flashcards", label: "Flashcards" },
  { value: "Coloring", label: "Coloring" },
  { value: "Stickers", label: "Stickers" },
  { value: "Digital", label: "Digital" },
  { value: "Music", label: "Music" },
] as const;

export function findProductBySlug(slug: string) {
  return SEED_PRODUCTS.find((p) => p.slug === slug);
}

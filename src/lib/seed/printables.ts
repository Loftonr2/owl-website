import type { PrintableCardProps } from "@/components/marketing/printable-card";

export type SeedPrintable = PrintableCardProps & {
  ageBand: "0-1" | "1-2" | "2-3" | "3-4" | "4-5";
  description: string;
  learningOutcomes: string[];
  relatedVideoSlug?: string;
  relatedProductSlug?: string;
};

export const SEED_PRINTABLES: SeedPrintable[] = [
  {
    slug: "welcome-pack",
    title: "OWL ABC welcome pack",
    ageRange: "2–5",
    ageBand: "2-3",
    pages: 3,
    freeOrPaid: "free",
    skill: "Alphabet",
    tone: "amber",
    description: "Three pages, multicultural alphabet illustrations, tracing-ready.",
    learningOutcomes: ["Letter recognition A–Z", "Tracing fine motor", "Multicultural exposure"],
    relatedVideoSlug: "learning-the-abcs",
    relatedProductSlug: "abc-flash-cards",
  },
  {
    slug: "feelings-face-wheel",
    title: "Feelings face wheel",
    ageRange: "2–5",
    ageBand: "2-3",
    pages: 1,
    freeOrPaid: "free",
    skill: "SEL",
    tone: "rose",
    description: "A spinnable wheel to name and check in on big feelings.",
    learningOutcomes: ["Emotion vocabulary", "Daily check-in routine"],
    relatedVideoSlug: "this-little-light-of-mine",
    relatedProductSlug: "emotion-tiles",
  },
  {
    slug: "diwali-coloring",
    title: "Diwali coloring page",
    ageRange: "3–7",
    ageBand: "3-4",
    pages: 4,
    freeOrPaid: "free",
    skill: "Cultural",
    tone: "amber",
    description: "Four diya and rangoli scenes to color while talking about Diwali.",
    learningOutcomes: ["Diwali vocabulary", "Cultural respect", "Fine motor"],
    relatedVideoSlug: "lchaim-we-love-life",
  },
  {
    slug: "counting-mat-1-10",
    title: "Counting mat 1–10",
    ageRange: "2–4",
    ageBand: "2-3",
    pages: 1,
    freeOrPaid: "free",
    skill: "Numbers",
    tone: "teal",
    description: "Lay it on the kitchen table. Count, point, learn.",
    learningOutcomes: ["1:1 correspondence", "Counting to 10"],
    relatedVideoSlug: "letter-sound-song",
    relatedProductSlug: "owl-counting-mat",
  },
  {
    slug: "k-readiness-bundle",
    title: "K-readiness activity bundle",
    ageRange: "4–5",
    ageBand: "4-5",
    pages: 24,
    freeOrPaid: "paid",
    price: "$19.99",
    skill: "K-readiness",
    tone: "forest",
    description: "Twenty-four pages aligned to Common Core K and ELOF 60-month indicators.",
    learningOutcomes: ["Pre-reading", "Pre-writing", "Number sense"],
    relatedProductSlug: "kreadiness-checklist",
  },
  {
    slug: "homeschool-week-1",
    title: "Homeschool Week 1 (PreK 4)",
    ageRange: "4–5",
    ageBand: "4-5",
    pages: 12,
    freeOrPaid: "free",
    skill: "Homeschool",
    tone: "cream",
    description: "A complete homeschool week sample — five daily plans plus printables.",
    learningOutcomes: ["Daily structure", "K-readiness preview"],
  },
  {
    slug: "cultural-celebrations",
    title: "Cultural celebrations printable pack",
    ageRange: "3–7",
    ageBand: "3-4",
    pages: 16,
    freeOrPaid: "paid",
    price: "$14.99",
    skill: "Cultural",
    tone: "amber",
    description: "Twelve cultural celebration activities — one per month.",
    learningOutcomes: ["Cultural awareness", "Calendar literacy", "Vocabulary"],
  },
  {
    slug: "bilingual-flashcards",
    title: "Bilingual EN/ES flashcards",
    ageRange: "1–4",
    ageBand: "1-2",
    pages: 6,
    freeOrPaid: "free",
    skill: "Bilingual",
    tone: "teal",
    description: "Twenty-five common-word flashcards in English and Spanish.",
    learningOutcomes: ["Bilingual vocabulary", "Word-image association"],
    relatedProductSlug: "bilingual-word-cards",
  },
];

export const PRINTABLE_SKILL_OPTIONS = [
  { value: "Alphabet", label: "Alphabet" },
  { value: "Numbers", label: "Numbers" },
  { value: "SEL", label: "Feelings (SEL)" },
  { value: "Cultural", label: "Cultural" },
  { value: "Bilingual", label: "Bilingual" },
  { value: "K-readiness", label: "K-readiness" },
  { value: "Homeschool", label: "Homeschool" },
] as const;

export function findPrintableBySlug(slug: string) {
  return SEED_PRINTABLES.find((p) => p.slug === slug);
}

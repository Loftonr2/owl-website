/**
 * news-categories.ts
 * Central configuration for the 10 OWL News UI topic categories.
 *
 * The CRM stores legacy slugs ("resources", "events", "community", "press").
 * This module maps articles to the 10 new UI categories via:
 *   1. Explicit article-slug -> UI-category map (handles slug/title mismatches)
 *   2. Keyword patterns in the slug
 *   3. CRM category fallback
 *   4. Default: "parenting"
 *
 * Do NOT scatter hardcoded color/icon logic across components.
 * All category configuration lives here and is imported where needed.
 */
import type { LucideIcon } from "lucide-react";
import {
  Baby,
  Heart,
  Moon,
  Smile,
  Users,
  Apple,
  Star,
  Brain,
  Home,
  GraduationCap,
} from "lucide-react";

export type UINewsCategorySlug =
  | "pregnancy"
  | "newborn-care"
  | "baby-sleep"
  | "toddler-tips"
  | "parenting"
  | "nutrition"
  | "activities"
  | "mental-health"
  | "family-life"
  | "education";

export interface UINewsCategory {
  slug: UINewsCategorySlug;
  label: string;
  /** Background color for the compact category pill on article cards */
  pillBg: string;
  /** Text color for the compact category pill on article cards */
  pillText: string;
  /** Background color for the topic tile in "Browse Popular Topics" */
  tileBg: string;
  /** Icon color for the topic tile */
  tileIconColor: string;
  /** Lucide icon component for the topic tile */
  Icon: LucideIcon;
  /** Modal heading shown when user browses this topic */
  modalTitle: string;
}

/** Ordered list — determines display order in the topic tile row. */
export const UI_NEWS_CATEGORIES: UINewsCategory[] = [
  {
    slug: "pregnancy",
    label: "Pregnancy",
    pillBg: "#EDE9FE",
    pillText: "#6D28D9",
    tileBg: "#EDE9FE",
    tileIconColor: "#7C3AED",
    Icon: Baby,
    modalTitle: "Pregnancy",
  },
  {
    slug: "newborn-care",
    label: "Newborn Care",
    pillBg: "#FCE7F3",
    pillText: "#BE185D",
    tileBg: "#FCE7F3",
    tileIconColor: "#DB2777",
    Icon: Heart,
    modalTitle: "Newborn Care",
  },
  {
    slug: "baby-sleep",
    label: "Baby Sleep",
    pillBg: "#FEF3C7",
    pillText: "#B45309",
    tileBg: "#FEF3C7",
    tileIconColor: "#D97706",
    Icon: Moon,
    modalTitle: "Baby Sleep",
  },
  {
    slug: "toddler-tips",
    label: "Toddler Tips",
    pillBg: "#FFEDD5",
    pillText: "#C2410C",
    tileBg: "#FFEDD5",
    tileIconColor: "#EA580C",
    Icon: Smile,
    modalTitle: "Toddler Tips",
  },
  {
    slug: "parenting",
    label: "Parenting",
    pillBg: "#CCFBF1",
    pillText: "#0F766E",
    tileBg: "#CCFBF1",
    tileIconColor: "#0D9488",
    Icon: Users,
    modalTitle: "Parenting",
  },
  {
    slug: "nutrition",
    label: "Nutrition",
    pillBg: "#DCFCE7",
    pillText: "#15803D",
    tileBg: "#DCFCE7",
    tileIconColor: "#16A34A",
    Icon: Apple,
    modalTitle: "Nutrition",
  },
  {
    slug: "activities",
    label: "Activities",
    pillBg: "#E0F2FE",
    pillText: "#0369A1",
    tileBg: "#E0F2FE",
    tileIconColor: "#0284C7",
    Icon: Star,
    modalTitle: "Activities",
  },
  {
    slug: "mental-health",
    label: "Mental Health",
    pillBg: "#DDD6FE",
    pillText: "#6D28D9",
    tileBg: "#DDD6FE",
    tileIconColor: "#7C3AED",
    Icon: Brain,
    modalTitle: "Mental Health",
  },
  {
    slug: "family-life",
    label: "Family Life",
    pillBg: "#FEF9C3",
    pillText: "#A16207",
    tileBg: "#FEF9C3",
    tileIconColor: "#CA8A04",
    Icon: Home,
    modalTitle: "Family Life",
  },
  {
    slug: "education",
    label: "Education",
    pillBg: "#CFFAFE",
    pillText: "#0E7490",
    tileBg: "#CFFAFE",
    tileIconColor: "#0891B2",
    Icon: GraduationCap,
    modalTitle: "Education",
  },
];

/** Quick lookup: UI category slug -> config */
const CATEGORY_BY_SLUG = new Map<UINewsCategorySlug, UINewsCategory>(
  UI_NEWS_CATEGORIES.map((c) => [c.slug, c])
);

/** Fallback when nothing else matches */
const DEFAULT_CATEGORY = UI_NEWS_CATEGORIES.find((c) => c.slug === "parenting")!;

/**
 * Explicit article-slug overrides.
 * Priority #1 — handles CRM slug/title mismatches from docx filename imports.
 */
const ARTICLE_SLUG_MAP: Record<string, UINewsCategorySlug> = {
  // Published news articles
  "developmental-red-flags":                              "toddler-tips",
  "baby-reflux-spitup":                                   "parenting",
  "baby-teething-guide":                                  "newborn-care",
  "baby-fever-guide":                                     "newborn-care",
  "baby-formula-guide":                                   "nutrition",
  "baby-sleep-training-guide":                            "baby-sleep",
  "why-is-my-baby-crying":                                "newborn-care",
  "owl-live-family-music-session-july-2026":              "activities",
  "owl-family-spotlight-july-2026":                       "family-life",
  "owl-featured-in-early-childhood-educator-guide":       "education",
  // Scheduled / future news articles
  "baby-sleep-regressions":                               "baby-sleep",
  "potty-training-regression":                            "toddler-tips",
  "autism-signs":                                         "parenting",
  "40-indoor-activities-for-toddlers":                    "activities",
  "age-appropriate-chores-for-children-ages-25":          "parenting",
  "baby-fever-when-to-worry-and-when-to-wait":            "newborn-care",
  "baby-language-development":                            "newborn-care",
  "baby-poop-color-consistency-and-what-it-all-means":    "newborn-care",
  "baby-rashes-and-skin-conditions-a-visual-guide-for-new-parents": "newborn-care",
  "baby-sleep-regressions-what-they-are-and-how-to-survive-them": "baby-sleep",
  "baby-spitting-up-and-reflux-whats-normal-and-whats-not": "newborn-care",
  "babyproofing-your-home-room-by-room-safety-guide":     "newborn-care",
  "bonding-with-your-baby-the-science-of-secure-attachment": "newborn-care",
  "daycare-costs":                                        "education",
  "developmental-red-flags-when-to-talk-to-your-pediatrician": "parenting",
  "early-signs-of-autism-in-babies-and-toddlers-what-parents-should-know": "parenting",
  "educational-toys-apps":                                "activities",
  "is-my-child-addicted-to-screens-signs-science-and-solutions": "mental-health",
  "is-my-child-ready-for-preschool-signs-ages-and-what-to-expect": "education",
  "moving-from-crib-to-toddler-bed":                      "baby-sleep",
  "my-toddler-only-eats-5-foods-the-picky-eater-survival-guide": "nutrition",
  "newborn-101-the-first-two-weeks-survival-guide":        "newborn-care",
  "night-terrors-vs-nightmares":                          "baby-sleep",
  "parenting-a-strong-willed-child-strategies-that-actually-work": "toddler-tips",
  "potty-training-regression-why-it-happens-and-how-to-handle-it": "toddler-tips",
  "separation-anxiety-in-toddlers-and-preschoolers-a-parents-complete-guide": "mental-health",
  "tantrum-vs-meltdown-whats-the-difference-and-why-it-matters": "toddler-tips",
  "teaching-toddlers-to-share-and-take-turns-what-the-research-says": "toddler-tips",
  "the-best-educational-toys-and-apps-for-children-ages-05-and-what-to-skip": "education",
  "the-complete-guide-to-baby-sleep-training-for-new-parents": "baby-sleep",
  "the-real-cost-of-daycare-and-preschool-in-2026-a-guide-for-new-parents": "education",
  "toddler-biting-and-hitting-why-it-happens-and-how-to-stop-it": "toddler-tips",
  "toddler-tantrums-what-they-are-why-they-happen-and-how-to-survive-them": "toddler-tips",
  "traveling-with-toddlers-and-young-children-the-complete-survival-guide": "activities",
  "tummy-time-why-it-matters-and-how-to-make-it-work":    "newborn-care",
  "understanding-baby-and-toddler-growth-charts":          "newborn-care",
  "vaccines-in-the-first-year-your-complete-immunization-guide": "newborn-care",
  "when-do-toddlers-stop-napping":                         "baby-sleep",
  "why-wont-my-toddler-listen-strategies-that-actually-work": "toddler-tips",
};

/** CRM category -> UI category fallback (priority #3) */
const CRM_CATEGORY_MAP: Record<string, UINewsCategorySlug> = {
  announcements: "family-life",
  events:        "activities",
  resources:     "parenting",
  community:     "family-life",
  press:         "education",
};

/** Priority #2: infer UI category from slug keywords. */
function inferFromSlugKeywords(slug: string): UINewsCategorySlug | null {
  if (/pregnan|prenatal/.test(slug))                             return "pregnancy";
  if (/sleep|nap|night.terror|bedtime|crib-to-bed/.test(slug))  return "baby-sleep";
  if (/toddler|tantrum|biting|potty|strong.will|meltdown|picky.eat|chore|share/.test(slug))
                                                                  return "toddler-tips";
  if (/newborn|infant|teething|reflux|spit.?up|tummy.time|babyproof|vaccine|immuniz|growth.chart|red.flag|formula|bottle|baby.cry|fever/.test(slug))
                                                                  return "newborn-care";
  if (/nutrition|food|eat|snack/.test(slug))                     return "nutrition";
  if (/activit|travel|outdoor|play|toy|arts|indoor/.test(slug))  return "activities";
  if (/mental|anxiety|stress|screen|depress|separat/.test(slug)) return "mental-health";
  if (/school|education|preschool|daycare|learn|literacy/.test(slug)) return "education";
  if (/family|community|spotlight|togeth/.test(slug))            return "family-life";
  if (/baby/.test(slug))                                         return "newborn-care";
  return null;
}

/**
 * Resolve the UI category for a news article.
 *
 * Priority:
 *   1. Explicit article-slug override (handles CRM slug/title mismatches)
 *   2. Slug keyword inference
 *   3. CRM category map
 *   4. Default: "parenting"
 */
export function getNewsUICategory(
  articleSlug: string,
  crmCategory: string
): UINewsCategory {
  const explicit = ARTICLE_SLUG_MAP[articleSlug] as UINewsCategorySlug | undefined;
  if (explicit) return CATEGORY_BY_SLUG.get(explicit) ?? DEFAULT_CATEGORY;

  const keyword = inferFromSlugKeywords(articleSlug);
  if (keyword) return CATEGORY_BY_SLUG.get(keyword) ?? DEFAULT_CATEGORY;

  const crmMapped = CRM_CATEGORY_MAP[crmCategory] as UINewsCategorySlug | undefined;
  if (crmMapped) return CATEGORY_BY_SLUG.get(crmMapped) ?? DEFAULT_CATEGORY;

  return DEFAULT_CATEGORY;
}

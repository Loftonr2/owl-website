/**
 * Holiday hub seed data — the 11 cultural celebrations per CLAUDE_READ_FIRST §5
 * and WEBSITE_REQUIREMENTS.md § Holidays.
 */

export type HolidaySlug =
  | "black-history-month"
  | "hispanic-heritage"
  | "diwali"
  | "hanukkah"
  | "kwanzaa"
  | "ramadan-eid"
  | "lunar-new-year"
  | "juneteenth"
  | "holi"
  | "native-american-heritage"
  | "global-christmas"
  // Jewish observances added Phase 7 — Larissa note: family-friendly tone,
  // gentle storytelling, no doctrinal framing.
  | "passover"
  | "rosh-hashanah"
  | "yom-kippur"
  // Additional Asian American + AAPI observances. Lunar New Year + Diwali
  // + Holi are already covered above; these fill remaining gaps.
  | "aapi-heritage-month"
  | "mid-autumn-festival"
  | "tet";

export type SeedHoliday = {
  slug: HolidaySlug;
  name: string;
  shortName: string;
  month: string;
  dateRange: string;
  intro: string;
  ageRange: string;
  relatedVideoSlugs: string[];
  relatedPrintableSlugs: string[];
  relatedProductSlugs: string[];
  tone: "amber" | "teal" | "forest" | "rose" | "mist" | "cream";
  emoji: string;
};

export const SEED_HOLIDAYS: SeedHoliday[] = [
  {
    slug: "black-history-month",
    name: "Black History Month",
    shortName: "Black History Month",
    month: "February",
    dateRange: "Feb 1 – Feb 28",
    intro: "Black history is American history — and world history. Daily celebrations of figures, music, food, and the long arc of liberation.",
    ageRange: "All",
    relatedVideoSlugs: ["this-little-light-of-mine"],
    relatedPrintableSlugs: ["cultural-celebrations"],
    relatedProductSlugs: ["abc-flash-cards", "homeschool-starter"],
    tone: "forest",
    emoji: "✊🏾",
  },
  {
    slug: "hispanic-heritage",
    name: "Hispanic Heritage Month",
    shortName: "Hispanic Heritage",
    month: "Sept 15 – Oct 15",
    dateRange: "Sep 15 – Oct 15",
    intro: "Stories, music, and food from across the Spanish-speaking world. Bilingual EN/ES resources throughout.",
    ageRange: "All",
    relatedVideoSlugs: ["this-little-light-of-mine"],
    relatedPrintableSlugs: ["bilingual-flashcards"],
    relatedProductSlugs: ["bilingual-word-cards"],
    tone: "amber",
    emoji: "🌶️",
  },
  {
    slug: "diwali",
    name: "Diwali",
    shortName: "Diwali",
    month: "October / November",
    dateRange: "Variable — five days centered on the new moon",
    intro: "The festival of lights. Diyas, rangoli, sweets, and a story about welcoming neighbors home.",
    ageRange: "3–10",
    relatedVideoSlugs: ["lchaim-we-love-life"],
    relatedPrintableSlugs: ["diwali-coloring"],
    relatedProductSlugs: ["cultural-celebrations" as never].slice(0, 0),
    tone: "amber",
    emoji: "🪔",
  },
  {
    slug: "hanukkah",
    name: "Hanukkah",
    shortName: "Hanukkah",
    month: "November / December",
    dateRange: "Variable — eight days starting on 25 Kislev",
    intro: "Eight nights, eight candles, one small miracle. Latkes, dreidels, and gentle stories of light in the darkest months.",
    ageRange: "3–10",
    relatedVideoSlugs: [],
    relatedPrintableSlugs: [],
    relatedProductSlugs: [],
    tone: "amber",
    emoji: "🕎",
  },
  {
    slug: "kwanzaa",
    name: "Kwanzaa",
    shortName: "Kwanzaa",
    month: "December / January",
    dateRange: "Dec 26 – Jan 1",
    intro: "Seven principles (Nguzo Saba), one per day. A Pan-African celebration of family, community, and the year ahead.",
    ageRange: "3–10",
    relatedVideoSlugs: [],
    relatedPrintableSlugs: ["cultural-celebrations"],
    relatedProductSlugs: [],
    tone: "forest",
    emoji: "🕯️",
  },
  {
    slug: "ramadan-eid",
    name: "Ramadan & Eid",
    shortName: "Ramadan & Eid",
    month: "Variable",
    dateRange: "29–30 days following the new moon",
    intro: "A month of fasting, charity, and prayer — closing with Eid al-Fitr, the celebration of the breaking of the fast.",
    ageRange: "4–10",
    relatedVideoSlugs: [],
    relatedPrintableSlugs: [],
    relatedProductSlugs: [],
    tone: "teal",
    emoji: "🌙",
  },
  {
    slug: "lunar-new-year",
    name: "Lunar New Year",
    shortName: "Lunar New Year",
    month: "January / February",
    dateRange: "Variable — second new moon after winter solstice",
    intro: "Red lanterns, dumplings, dragon dances, and a wish for a sweet year — celebrated across East and Southeast Asia.",
    ageRange: "3–10",
    relatedVideoSlugs: [],
    relatedPrintableSlugs: [],
    relatedProductSlugs: [],
    tone: "rose",
    emoji: "🐉",
  },
  {
    slug: "juneteenth",
    name: "Juneteenth",
    shortName: "Juneteenth",
    month: "June",
    dateRange: "June 19",
    intro: "The day enslaved people in Galveston, Texas finally learned they were free — two and a half years after the Emancipation Proclamation.",
    ageRange: "5–10",
    relatedVideoSlugs: [],
    relatedPrintableSlugs: [],
    relatedProductSlugs: [],
    tone: "forest",
    emoji: "🔴",
  },
  {
    slug: "holi",
    name: "Holi",
    shortName: "Holi",
    month: "March",
    dateRange: "Variable — full moon of Phalguna",
    intro: "The festival of colors. A celebration of spring, love, and the triumph of good — celebrated with bright powders and water.",
    ageRange: "4–10",
    relatedVideoSlugs: [],
    relatedPrintableSlugs: [],
    relatedProductSlugs: [],
    tone: "rose",
    emoji: "🎨",
  },
  {
    slug: "native-american-heritage",
    name: "Native American Heritage Month",
    shortName: "Native American Heritage",
    month: "November",
    dateRange: "Nov 1 – Nov 30",
    intro: "Stories, music, and contemporary voices from Indigenous Peoples of the Americas — past and present.",
    ageRange: "All",
    relatedVideoSlugs: [],
    relatedPrintableSlugs: [],
    relatedProductSlugs: [],
    tone: "forest",
    emoji: "🪶",
  },
  {
    slug: "global-christmas",
    name: "Global Christmas Traditions",
    shortName: "Global Christmas",
    month: "December",
    dateRange: "Variable — Dec 6 (Sinterklaas) through Jan 6 (Epiphany)",
    intro: "Christmas isn't one tradition — it's hundreds. Las Posadas, Sinterklaas, La Befana, Three Kings Day, and more.",
    ageRange: "All",
    relatedVideoSlugs: [],
    relatedPrintableSlugs: [],
    relatedProductSlugs: [],
    tone: "amber",
    emoji: "🎄",
  },
  /* ── Jewish observances ────────────────────────────────────────────────── */
  {
    slug: "passover",
    name: "Passover · Pesach",
    shortName: "Passover",
    month: "March / April",
    dateRange: "Variable — 15–22 Nisan, eight days",
    intro:
      "A spring story of liberation. Seders, matzah, and the four questions — told slowly and with room for every child's curiosity.",
    ageRange: "4–10",
    relatedVideoSlugs: [],
    relatedPrintableSlugs: [],
    relatedProductSlugs: [],
    tone: "teal",
    emoji: "🍷",
  },
  {
    slug: "rosh-hashanah",
    name: "Rosh Hashanah",
    shortName: "Rosh Hashanah",
    month: "September / October",
    dateRange: "Variable — 1–2 Tishrei",
    intro:
      "The Jewish New Year. Apples and honey, the shofar, and a wish for a sweet year ahead. Two days of warm reflection.",
    ageRange: "3–10",
    relatedVideoSlugs: [],
    relatedPrintableSlugs: [],
    relatedProductSlugs: [],
    tone: "amber",
    emoji: "🍎",
  },
  {
    slug: "yom-kippur",
    name: "Yom Kippur",
    shortName: "Yom Kippur",
    month: "September / October",
    dateRange: "Variable — 10 Tishrei, one day",
    intro:
      "The Day of Atonement. A holy day of reflection, kindness, and starting again. Family-friendly framing of repair and forgiveness.",
    ageRange: "5–10",
    relatedVideoSlugs: [],
    relatedPrintableSlugs: [],
    relatedProductSlugs: [],
    tone: "forest",
    emoji: "🕊️",
  },
  /* ── AAPI + Asian American observances ────────────────────────────────── */
  {
    slug: "aapi-heritage-month",
    name: "AAPI Heritage Month",
    shortName: "AAPI Heritage",
    month: "May",
    dateRange: "May 1 – May 31",
    intro:
      "Asian American + Pacific Islander stories, music, and voices — past and present. Daily highlights across many cultures.",
    ageRange: "All",
    relatedVideoSlugs: [],
    relatedPrintableSlugs: [],
    relatedProductSlugs: [],
    tone: "rose",
    emoji: "🌸",
  },
  {
    slug: "mid-autumn-festival",
    name: "Mid-Autumn Festival",
    shortName: "Mid-Autumn",
    month: "September / October",
    dateRange: "Variable — 15th day of the 8th lunar month",
    intro:
      "Lanterns, mooncakes, and a full harvest moon. Celebrated across East and Southeast Asia — a quiet festival of family togetherness.",
    ageRange: "3–10",
    relatedVideoSlugs: [],
    relatedPrintableSlugs: [],
    relatedProductSlugs: [],
    tone: "amber",
    emoji: "🥮",
  },
  {
    slug: "tet",
    name: "Tết · Vietnamese Lunar New Year",
    shortName: "Tết",
    month: "January / February",
    dateRange: "Variable — first day of the lunar new year",
    intro:
      "Bánh chưng, lì xì red envelopes, and a fresh start for the family. Vietnamese New Year traditions told with warmth.",
    ageRange: "3–10",
    relatedVideoSlugs: [],
    relatedPrintableSlugs: [],
    relatedProductSlugs: [],
    tone: "rose",
    emoji: "🧧",
  },
];

export function findHolidayBySlug(slug: string) {
  return SEED_HOLIDAYS.find((h) => h.slug === slug);
}

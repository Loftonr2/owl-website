/**
 * Blog seed data. Phase 6 ships these as the article archive + category hubs.
 * Phase 7 swaps to Sanity `blogArticle` and `blogCategory` documents.
 */

export type BlogCategorySlug =
  | "cultural-holidays"
  | "early-learning"
  | "sel-for-kids"
  | "educational-gifts"
  | "educator-resources"
  | "music-child-development";

export type SeedBlogCategory = {
  slug: BlogCategorySlug;
  name: string;
  description: string;
  hero: string;
};

export type SeedBlogArticle = {
  slug: string;
  title: string;
  category: BlogCategorySlug;
  summary: string;
  body: string;
  author: string;
  publishedAt: string;
  tone: "teal" | "amber" | "forest" | "rose" | "mist" | "cream";
};

export const SEED_BLOG_CATEGORIES: SeedBlogCategory[] = [
  { slug: "cultural-holidays",       name: "Cultural Holidays",        description: "Heritage celebrations from around the world for parents and educators.", hero: "Cultural holidays" },
  { slug: "early-learning",          name: "Early Learning",           description: "ABCs, counting, shapes, colors — the foundational years.",               hero: "Early learning" },
  { slug: "sel-for-kids",            name: "SEL for Kids",             description: "Naming feelings, building empathy, calm parenting tools.",              hero: "Social-emotional learning" },
  { slug: "educational-gifts",       name: "Educational Gifts",        description: "Gift guides that actually support learning.",                            hero: "Educational gifts" },
  { slug: "educator-resources",      name: "Educator Resources",       description: "Standards-aligned, culturally responsive classroom tools.",              hero: "Educator resources" },
  { slug: "music-child-development", name: "Music & Child Development", description: "Why music + repetition build little brains.",                            hero: "Music & development" },
];

export const SEED_BLOG_ARTICLES: SeedBlogArticle[] = [
  {
    slug: "how-to-explain-diwali-to-a-3-year-old",
    title: "How to Explain Diwali to a 3-Year-Old",
    category: "cultural-holidays",
    summary: "A 100-word framework for telling a small child about light, family, and welcoming neighbors during Diwali — without overwhelming them.",
    body: "Diwali is the festival of lights — a five-day celebration shared by Hindus, Sikhs, Jains, and Buddhists across the world. When a three-year-old asks 'what is Diwali?', the best answer is a small one. Say: 'It's a time when families light little lamps called diyas and welcome each other home.' Then point at a candle. Sing a song. Make a paper diya together. Children don't need theology at three — they need a sensory memory and a kind feeling. That's how a holiday becomes part of their internal map.",
    author: "Larissa",
    publishedAt: "2026-05-04",
    tone: "amber",
  },
  {
    slug: "kwanzaa-activities-for-preschool",
    title: "Kwanzaa Activities for Preschool Classrooms",
    category: "cultural-holidays",
    summary: "Seven hands-on Kwanzaa activities calibrated for ages 3–5 — no special materials required.",
    body: "Kwanzaa is observed Dec 26–Jan 1 and centers seven principles (Nguzo Saba): unity, self-determination, collective work, cooperative economics, purpose, creativity, and faith. For preschoolers, focus on one principle per day. Day 1 (umoja / unity): make a community handprint mural. Day 2 (kujichagulia / self-determination): each child shares one thing they did themselves this week. Day 3 (ujima / collective work): a group cleanup activity. The point is participation, not perfection — these are introductions, not lectures.",
    author: "Larissa",
    publishedAt: "2026-04-29",
    tone: "forest",
  },
  {
    slug: "when-should-my-child-know-the-alphabet",
    title: "When Should My Child Know the Alphabet?",
    category: "early-learning",
    summary: "Pediatric benchmarks, parent anxieties, and what 'knowing the alphabet' actually means.",
    body: "Most pediatric guidelines (CDC, AAP) suggest children recognize about ten letters by age four, and write some letters of their name by age five. That is a benchmark, not a deadline. Children who don't know letters at three are not behind — children who don't *enjoy* literacy at five are at higher risk. Read together. Sing the alphabet, but sing it slowly. Point to letters in the world. The relationship to print, formed early, predicts reading more than letter-knowledge speed.",
    author: "Larissa",
    publishedAt: "2026-04-26",
    tone: "teal",
  },
  {
    slug: "why-repetitive-songs-help-children-learn",
    title: "Why Repetitive Songs Help Children Learn",
    category: "music-child-development",
    summary: "The neuroscience of repetition: why your toddler asks for the same song forty times — and why that's perfect.",
    body: "Repetition strengthens myelination — the insulating layer around neural pathways. A song heard forty times isn't a song heard forty times; it's the same song laid down in forty slightly different brain states, building robust recall. Children don't ask for repetition because they're stuck. They're asking because the song is doing exactly what their brain needs. Sing it again. Sing it the way they like it. The repetition is the lesson.",
    author: "Larissa",
    publishedAt: "2026-04-22",
    tone: "rose",
  },
  {
    slug: "free-hanukkah-coloring-page",
    title: "Free Hanukkah Coloring Page for Kids",
    category: "cultural-holidays",
    summary: "A free, printable Hanukkah coloring page with a menorah, dreidel, and a brief story.",
    body: "Download our free Hanukkah coloring page (ages 3–7). The page includes a hand-drawn menorah, a dreidel, a small Star of David, and four lines of plain-language explanation that you can read together. Print on regular paper. Use the conversation prompts on the back to talk about light, history, and family. No religious instruction — just a gentle, factual introduction.",
    author: "Larissa",
    publishedAt: "2026-04-15",
    tone: "amber",
  },
  {
    slug: "multicultural-education-resources-for-k3-teachers",
    title: "Multicultural Education Resources for K-3 Teachers",
    category: "educator-resources",
    summary: "A curated list of free + low-cost multicultural resources for K–3 classrooms.",
    body: "Multicultural classrooms aren't built from a single book — they're built from dozens of small daily choices: who's on the wall, whose names are pronounced correctly, what music plays during transitions. This list groups free resources by subject: literacy, math, history, music, and SEL. Most are free; the rest are under $20. Standards alignments noted where applicable.",
    author: "Larissa",
    publishedAt: "2026-04-10",
    tone: "teal",
  },
  {
    slug: "best-multicultural-abc-songs-on-youtube",
    title: "Best Multicultural ABC Songs on YouTube",
    category: "music-child-development",
    summary: "Eight ABC songs that go beyond white-default casting and primary-color tropes.",
    body: "Most ABC songs on YouTube default to white children and primary-color animations. These eight don't. They feature multicultural casts, varied music styles (Afrobeat, mariachi, lullaby, classical), and pacing slower than the algorithm rewards. We've listed each one with age range, runtime, and a one-line note. Use them as alternatives or supplements to your usual rotation.",
    author: "Larissa",
    publishedAt: "2026-04-05",
    tone: "rose",
  },
  {
    slug: "feelings-activities-for-preschoolers",
    title: "Feelings Activities for Preschoolers: SEL at Home",
    category: "sel-for-kids",
    summary: "Five SEL activities you can do at home, today, with stuff you already have.",
    body: "Social-emotional learning at home doesn't require a curriculum. It requires a vocabulary. Try these five activities this week. (1) The feelings-face mirror: look in a mirror together, name what you see. (2) Color check-in: 'what color is your feeling today?' (3) Big-feeling stretching: when a tantrum starts, stretch arms wide. (4) Storybook pause: stop mid-page and ask 'how is she feeling?'. (5) Bedtime gratitude: name one thing you're glad about.",
    author: "Larissa",
    publishedAt: "2026-04-01",
    tone: "rose",
  },
];

export function findArticleBySlug(slug: string) {
  return SEED_BLOG_ARTICLES.find((a) => a.slug === slug);
}

export function findCategoryBySlug(slug: string) {
  return SEED_BLOG_CATEGORIES.find((c) => c.slug === slug);
}

export function isCategorySlug(slug: string): slug is BlogCategorySlug {
  return SEED_BLOG_CATEGORIES.some((c) => c.slug === slug);
}

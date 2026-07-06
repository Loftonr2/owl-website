/**
 * Blog seed data - category definitions and article archive.
 * Categories updated to match OWL wireframe (July 2026).
 *
 * NOTE: No emoji icons stored here. Category chips use lucide-react icons
 * directly in the page component to avoid encoding issues.
 */

export type BlogCategorySlug =
  | "homeschooling"
  | "parenting-tips"
  | "child-development"
  | "music-and-learning"
  | "activities"
  | "safety-wellness";

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
  {
    slug: "homeschooling",
    name: "Homeschooling",
    description: "Curriculum guides, daily routines, and educator resources for families learning at home.",
    hero: "Homeschooling",
  },
  {
    slug: "parenting-tips",
    name: "Parenting Tips",
    description: "Practical, research-backed guidance for navigating the joys and challenges of raising children.",
    hero: "Parenting tips",
  },
  {
    slug: "child-development",
    name: "Child Development",
    description: "Milestones, neuroscience, and what the research says about how children grow and learn.",
    hero: "Child development",
  },
  {
    slug: "music-and-learning",
    name: "Music & Learning",
    description: "Why music is the most powerful early-learning tool - and how to use it every day.",
    hero: "Music & learning",
  },
  {
    slug: "activities",
    name: "Activities",
    description: "Hands-on activities, crafts, cultural celebrations, and sensory play for curious kids.",
    hero: "Activities",
  },
  {
    slug: "safety-wellness",
    name: "Safety & Wellness",
    description: "Keeping children safe, healthy, and emotionally well - body, mind, and spirit.",
    hero: "Safety & wellness",
  },
];

export const SEED_BLOG_ARTICLES: SeedBlogArticle[] = [
  {
    slug: "how-to-explain-diwali-to-a-3-year-old",
    title: "How to Explain Diwali to a 3-Year-Old",
    category: "activities",
    summary: "A 100-word framework for telling a small child about light, family, and welcoming neighbors during Diwali - without overwhelming them.",
    body: "Diwali is the festival of lights - a five-day celebration shared by Hindus, Sikhs, Jains, and Buddhists across the world. When a three-year-old asks 'what is Diwali?', the best answer is a small one. Say: 'It is a time when families light little lamps called diyas and welcome each other home.' Then point at a candle. Sing a song. Make a paper diya together. Children don't need theology at three - they need a sensory memory and a kind feeling. That's how a holiday becomes part of their internal map.",
    author: "Larissa",
    publishedAt: "2026-05-04",
    tone: "amber",
  },
  {
    slug: "kwanzaa-activities-for-preschool",
    title: "Kwanzaa Activities for Preschool Classrooms",
    category: "activities",
    summary: "Seven hands-on Kwanzaa activities calibrated for ages 3-5 - no special materials required.",
    body: "Kwanzaa is observed Dec 26 to Jan 1 and centers seven principles (Nguzo Saba): unity, self-determination, collective work, cooperative economics, purpose, creativity, and faith. For preschoolers, focus on one principle per day. Day 1 (umoja / unity): make a community handprint mural. Day 2 (kujichagulia / self-determination): each child shares one thing they did themselves this week. Day 3 (ujima / collective work): a group cleanup activity. The point is participation, not perfection - these are introductions, not lectures.",
    author: "Larissa",
    publishedAt: "2026-04-29",
    tone: "forest",
  },
  {
    slug: "when-should-my-child-know-the-alphabet",
    title: "When Should My Child Know the Alphabet?",
    category: "child-development",
    summary: "Pediatric benchmarks, parent anxieties, and what 'knowing the alphabet' actually means.",
    body: "Most pediatric guidelines (CDC, AAP) suggest children recognize about ten letters by age four, and write some letters of their name by age five. That is a benchmark, not a deadline. Children who don't know letters at three are not behind - children who don't enjoy literacy at five are at higher risk. Read together. Sing the alphabet, but sing it slowly. Point to letters in the world. The relationship to print, formed early, predicts reading more than letter-knowledge speed.",
    author: "Larissa",
    publishedAt: "2026-04-26",
    tone: "teal",
  },
  {
    slug: "why-repetitive-songs-help-children-learn",
    title: "Why Repetitive Songs Help Children Learn",
    category: "music-and-learning",
    summary: "The neuroscience of repetition: why your toddler asks for the same song forty times - and why that is perfect.",
    body: "Repetition strengthens myelination - the insulating layer around neural pathways. A song heard forty times isn't a song heard forty times; it's the same song laid down in forty slightly different brain states, building robust recall. Children don't ask for repetition because they're stuck. They're asking because the song is doing exactly what their brain needs. Sing it again. Sing it the way they like it. The repetition is the lesson.",
    author: "Larissa",
    publishedAt: "2026-04-22",
    tone: "rose",
  },
  {
    slug: "feelings-activities-for-preschoolers",
    title: "Feelings Activities for Preschoolers: SEL at Home",
    category: "parenting-tips",
    summary: "Five SEL activities you can do at home, today, with stuff you already have.",
    body: "Social-emotional learning at home doesn't require a curriculum. It requires a vocabulary. Try these five activities this week. (1) The feelings-face mirror: look in a mirror together, name what you see. (2) Color check-in: what color is your feeling today? (3) Big-feeling stretching: when a tantrum starts, stretch arms wide. (4) Storybook pause: stop mid-page and ask how is she feeling? (5) Bedtime gratitude: name one thing you're glad about.",
    author: "Larissa",
    publishedAt: "2026-04-15",
    tone: "rose",
  },
  {
    slug: "multicultural-education-resources-for-k3-teachers",
    title: "Multicultural Education Resources for K-3 Teachers",
    category: "homeschooling",
    summary: "A curated list of free and low-cost multicultural resources for K-3 classrooms.",
    body: "Multicultural classrooms aren't built from a single book - they're built from dozens of small daily choices: who's on the wall, whose names are pronounced correctly, what music plays during transitions. This list groups free resources by subject: literacy, math, history, music, and SEL. Most are free; the rest are under $20. Standards alignments noted where applicable.",
    author: "Larissa",
    publishedAt: "2026-04-10",
    tone: "teal",
  },
];

export function findArticleBySlug(slug: string) {
  return SEED_BLOG_ARTICLES.find((a) => a.slug === slug);
}

export function findCategoryBySlug(slug: string): SeedBlogCategory | undefined {
  return SEED_BLOG_CATEGORIES.find((c) => c.slug === slug);
}

export function isCategorySlug(slug: string): slug is BlogCategorySlug {
  return SEED_BLOG_CATEGORIES.some((c) => c.slug === slug);
}

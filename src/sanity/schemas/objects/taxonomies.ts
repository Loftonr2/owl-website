/**
 * Shared taxonomy option lists. Stored as string slugs so they're trivial to
 * filter on, link via Next.js routes, and migrate later if we promote them
 * into referenced documents.
 */
export const ageBandOptions = [
  { title: "Birth–1", value: "0-1" },
  { title: "1–2", value: "1-2" },
  { title: "2–3", value: "2-3" },
  { title: "3–4", value: "3-4" },
  { title: "4–5", value: "4-5" },
  { title: "5–8", value: "5-8" },
  { title: "8–11", value: "8-11" },
  { title: "11–14", value: "11-14" },
];

export const subjectOptions = [
  { title: "ABCs", value: "abcs" },
  { title: "Numbers", value: "numbers" },
  { title: "Colors", value: "colors" },
  { title: "Feelings (SEL)", value: "feelings" },
  { title: "STEM", value: "stem" },
  { title: "History", value: "history" },
  { title: "Life skills", value: "life-skills" },
  { title: "Music", value: "music" },
];

export const culturalThemeOptions = [
  { title: "Black History Month", value: "black-history-month" },
  { title: "Hispanic Heritage", value: "hispanic-heritage" },
  { title: "Diwali", value: "diwali" },
  { title: "Hanukkah", value: "hanukkah" },
  { title: "Kwanzaa", value: "kwanzaa" },
  { title: "Ramadan / Eid", value: "ramadan-eid" },
  { title: "Lunar New Year", value: "lunar-new-year" },
  { title: "Juneteenth", value: "juneteenth" },
  { title: "Holi", value: "holi" },
  { title: "Native American Heritage", value: "native-american-heritage" },
  { title: "Global Christmas", value: "global-christmas" },
];

export const formatOptions = [
  { title: "Song", value: "song" },
  { title: "Story", value: "story" },
  { title: "Direct-to-camera", value: "d2c" },
  { title: "Classroom-ready", value: "classroom-ready" },
  { title: "Shorts compilation", value: "shorts" },
];

export const audienceOptions = [
  { title: "Parent", value: "parent" },
  { title: "Child", value: "child" },
  { title: "Educator", value: "educator" },
];

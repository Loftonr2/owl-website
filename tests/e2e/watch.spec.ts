import { expect, test } from "@playwright/test";

/**
 * /watch QA — verifies the 10 real OWL videos render with auto-resolved
 * YouTube thumbnails.
 *
 * Run locally:
 *   npm run test:e2e -- watch
 *
 * Thumbnails resolve via resolveVideoPoster() → youtubePosterUrl() →
 * https://img.youtube.com/vi/<id>/maxresdefault.jpg. The test confirms each
 * card's <img> sources from img.youtube.com and that the image loads
 * (naturalWidth > 0).
 */

const VIDEOS = [
  { slug: "owl-sing-together-greatest-hits", youtubeId: "zrtwck76T1I", title: /OWL Sing Together — Greatest Hits/i },
  { slug: "learning-the-abcs",               youtubeId: "TzcY0JR6P5M", title: /Learning the ABCs/i },
  { slug: "the-radish-song",                 youtubeId: "X4xms5ABYMg", title: /The Radish Song/i },
  { slug: "old-folks-at-home-swanee-river",  youtubeId: "hsSMHqCJvq0", title: /Old Folks at Home/i },
  { slug: "this-little-light-of-mine",       youtubeId: "4iMd4xf5vVk", title: /This Little Light of Mine/i },
  { slug: "lchaim-we-love-life",             youtubeId: "fhLxOnxTiNg", title: /L'Chaim/i },
  { slug: "when-the-saints-go-marching-in",  youtubeId: "ytOiLv0DKqw", title: /When the Saints Go Marching In/i },
  { slug: "were-in-the-money",               youtubeId: "MRt-WGWarV8", title: /We'?re in the Money/i },
  { slug: "letter-sound-song",               youtubeId: "VbbuY2za7M4", title: /Letter-Sound Song/i },
  { slug: "shell-be-comin-round-the-mountain", youtubeId: "FFIG9Jb5zGo", title: /She'?ll Be Comin' Round the Mountain/i },
] as const;

test.describe("Watch page", () => {
  test("renders the 10 OWL videos", async ({ page }) => {
    await page.goto("/watch");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    for (const v of VIDEOS) {
      await expect(page.getByText(v.title).first()).toBeVisible();
    }
  });

  test("each video card has a working YouTube thumbnail", async ({ page }) => {
    await page.goto("/watch");
    await page.waitForLoadState("networkidle");

    for (const v of VIDEOS) {
      // The poster image src includes the video's YouTube ID.
      const img = page.locator(`img[src*="${v.youtubeId}"]`).first();
      await expect(img, `thumbnail for ${v.slug} should exist in the DOM`).toBeAttached();

      const naturalWidth = await img.evaluate((el) => (el as HTMLImageElement).naturalWidth);
      expect(
        naturalWidth,
        `thumbnail for ${v.slug} (${v.youtubeId}) should load (naturalWidth > 0)`
      ).toBeGreaterThan(0);
    }
  });

  test("clicking a video card navigates to its detail page", async ({ page }) => {
    await page.goto("/watch");
    await page.getByRole("link", { name: /Learning the ABCs/i }).first().click();
    await expect(page).toHaveURL(/\/watch\/learning-the-abcs/);
  });

  test("no console errors on /watch", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => msg.type() === "error" && errors.push(msg.text()));
    await page.goto("/watch");
    await page.waitForLoadState("networkidle");
    expect(errors, `console errors: ${errors.join("\n")}`).toHaveLength(0);
  });
});

test.describe("Video detail page", () => {
  test("poster shows on first load; iframe loads only after click", async ({ page }) => {
    await page.goto("/watch/learning-the-abcs");

    // On first paint: poster button is present, no iframe yet.
    await expect(page.getByRole("button", { name: /Play "Learning the ABCs"/i })).toBeVisible();
    await expect(page.locator("iframe[src*='youtube-nocookie.com']")).toHaveCount(0);

    // After click: iframe mounts, autoplay=1, youtube-nocookie host.
    await page.getByRole("button", { name: /Play "Learning the ABCs"/i }).click();
    const iframe = page.locator("iframe[src*='youtube-nocookie.com']");
    await expect(iframe).toBeVisible();
    await expect(iframe).toHaveAttribute("src", /youtube-nocookie\.com\/embed\/TzcY0JR6P5M\?autoplay=1/);
  });
});

test.describe("Watch — mobile viewport", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("videos render in mobile rail", async ({ page }) => {
    await page.goto("/watch");
    await expect(page.getByText(/Learning the ABCs/i).first()).toBeVisible();
    await expect(page.getByText(/L'Chaim/i).first()).toBeVisible();
  });
});

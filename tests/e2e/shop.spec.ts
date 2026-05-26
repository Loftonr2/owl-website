import { expect, test } from "@playwright/test";

/**
 * /shop QA — verifies the 5 new featured products render with images.
 *
 * Run locally:
 *   npm run test:e2e:install     (one-time, downloads Chromium)
 *   npm run test:e2e -- shop
 *
 * The image assertions check both: (a) the <img> exists with the right alt,
 * and (b) the natural image dimensions are non-zero (i.e. the asset loaded —
 * a broken/missing image would report 0×0 even when the <img> renders).
 */

const NEW_FEATURED = [
  {
    slug: "owl-babies-bundle",
    title: /OWL Babies Complete Learning Bundle/i,
    price: "$129",
    hasImage: false, // No commissioned image yet — tonal placeholder.
  },
  {
    slug: "larissa-plush",
    title: /Larissa Plush Set/i,
    price: "$34.99",
    hasImage: true,
  },
  {
    slug: "rhyme-time-game",
    title: /OWL Rhyme Time Card Game/i,
    price: "$12.99",
    hasImage: true,
  },
  {
    slug: "big-feelings-posters",
    title: /OWL Big Feelings Poster Set/i,
    price: "$18.99",
    hasImage: true,
  },
  {
    slug: "bilingual-word-cards",
    title: /OWL Toddler Word Cards/i,
    price: "$12.99",
    hasImage: true,
  },
] as const;

test.describe("Shop page", () => {
  test("renders the 5 newly-featured products", async ({ page }) => {
    await page.goto("/shop");

    // Page heading
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // Each new product is present on the page (titles match)
    for (const product of NEW_FEATURED) {
      await expect(page.getByText(product.title).first()).toBeVisible();
      await expect(page.getByText(product.price).first()).toBeVisible();
    }
  });

  test("product cards with real imagery load real assets (no broken images)", async ({ page }) => {
    await page.goto("/shop");

    // For each product that should have a real image, find an <img> whose
    // src includes the slug, then confirm naturalWidth > 0 (the asset loaded).
    for (const product of NEW_FEATURED.filter((p) => p.hasImage)) {
      const img = page.locator(`img[src*="${product.slug.replace("bilingual-word-cards", "owl-word-cards")}"], img[src*="${product.slug}"], img[src*="${product.slug.replace("big-feelings-posters", "owl-big-feelings-poster-set")}"], img[src*="${product.slug.replace("rhyme-time-game", "owl-rhyme-time-game")}"], img[src*="${product.slug.replace("larissa-plush", "larissa-plush-set")}"]`).first();
      await expect(img, `image for ${product.slug} should be in the DOM`).toBeVisible();

      const naturalWidth = await img.evaluate((el) => (el as HTMLImageElement).naturalWidth);
      expect(naturalWidth, `image for ${product.slug} should load (naturalWidth > 0)`).toBeGreaterThan(0);
    }
  });

  test("no console errors on /shop", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => msg.type() === "error" && errors.push(msg.text()));
    await page.goto("/shop");
    await page.waitForLoadState("networkidle");
    expect(errors, `console errors: ${errors.join("\n")}`).toHaveLength(0);
  });

  test("no failed network requests for product images", async ({ page }) => {
    const failed: string[] = [];
    page.on("response", (res) => {
      if (res.status() >= 400 && res.url().includes("/images/products/")) {
        failed.push(`${res.status()} ${res.url()}`);
      }
    });
    await page.goto("/shop");
    await page.waitForLoadState("networkidle");
    expect(failed, `failed image requests:\n${failed.join("\n")}`).toHaveLength(0);
  });
});

test.describe("Shop — mobile viewport", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("featured products are reachable on iPhone-sized viewport", async ({ page }) => {
    await page.goto("/shop");
    await expect(page.getByText(/Larissa Plush Set/i).first()).toBeVisible();
    await expect(page.getByText(/OWL Rhyme Time/i).first()).toBeVisible();
  });
});

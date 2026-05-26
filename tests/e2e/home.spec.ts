import { expect, test } from "@playwright/test";

test.describe("Homepage", () => {
  test("hero renders headline + dual CTA + structured data", async ({ page }) => {
    await page.goto("/");

    // Headline (the "Belongs Here." span is the wrap; full heading reads "Every Child Belongs Here.")
    await expect(
      page.getByRole("heading", { name: /Every Child Belongs Here/i, level: 1 })
    ).toBeVisible();

    // Dual CTAs
    await expect(page.getByRole("link", { name: /Watch free videos/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /Get free printables/i }).first()).toBeVisible();

    // Structured data injected
    const orgLd = await page.locator("#ld-organization").textContent();
    expect(orgLd).toContain("OWL Sing Together");
    const siteLd = await page.locator("#ld-website").textContent();
    expect(siteLd).toContain("WebSite");
  });

  test("trust strip renders all 5 pillars", async ({ page }) => {
    await page.goto("/");
    for (const label of [
      "Inclusive learning",
      "Calm pacing",
      "Multicultural",
      "Parent-friendly",
      "Educator-ready",
    ]) {
      await expect(page.getByText(label, { exact: true })).toBeVisible();
    }
  });

  test("featured videos + playlists + bestsellers all render", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /Sing-along learning/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Featured playlists/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Family favorites/i })).toBeVisible();
  });

  test("printable email gate accepts a valid email", async ({ page }) => {
    await page.goto("/");
    // The printable-of-the-week newsletter form
    const form = page.getByLabel(/Email address/i).first();
    await form.fill("test+homepage@example.com");
    // Don't actually submit (no Beehiiv env). Just confirm the field is wired.
    await expect(form).toHaveValue("test+homepage@example.com");
  });

  test("sticky header + footer render", async ({ page }) => {
    await page.goto("/");
    // Logo link
    await expect(page.getByRole("link", { name: /OWL Sing Together home/i })).toBeVisible();
    // Footer brand description
    await expect(
      page
        .locator("footer")
        .getByText(/Warm, multicultural music, videos, printables/i)
    ).toBeVisible();
  });

  test("/api/health returns 200", async ({ request }) => {
    const res = await request.get("/api/health");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("ok");
  });
});

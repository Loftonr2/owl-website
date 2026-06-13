/**
 * Playwright config for PayPal sandbox checkout tests.
 * Targets the LIVE site — no local dev server needed.
 *
 * Usage:
 *   npx playwright test tests/e2e/paypal-sandbox-checkout.spec.ts \
 *     --config playwright.sandbox.config.ts --headed
 */

import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: ["**/paypal-sandbox-checkout.spec.ts"],

  // Point at the live site by default; override with PAYPAL_TEST_BASE_URL
  use: {
    baseURL:
      process.env.PAYPAL_TEST_BASE_URL ?? "https://www.owlsingtogether.com",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    // Allow PayPal popups
    hasTouch: false,
    javaScriptEnabled: true,
  },

  // No webServer block — tests run against the deployed Vercel site
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // Viewport PayPal renders its button at — wide enough for all 3 buttons
        viewport: { width: 1280, height: 900 },
      },
    },
  ],

  // Generous timeouts for PayPal's network calls
  timeout: 60_000,
  expect: { timeout: 15_000 },

  // Don't retry flaky PayPal tests automatically — we want deterministic output
  retries: 0,
  reporter: [["list"], ["html", { open: "never" }]],
});

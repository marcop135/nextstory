import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 2,
  timeout: 90_000,
  expect: { timeout: 10_000 },
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://localhost:3502",
    channel: process.env.BROWSER_CHANNEL || "chrome",
    reducedMotion: "reduce",
    trace: process.env.CI ? "on-first-retry" : "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "Desktop Chrome", use: { ...devices["Desktop Chrome"] } },
    { name: "Pixel 7", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: process.env.CI ? "npm start -- --port 3502" : "npm run dev -- --port 3502",
    url: "http://localhost:3502",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      STORYBLOK_DELIVERY_API_TOKEN: "",
      HUBSPOT_PORTAL_ID: "",
      HUBSPOT_FORM_ID: "",
      TURNSTILE_SECRET_KEY: "",
      NEXT_PUBLIC_TURNSTILE_SITE_KEY: "",
      CAMPAIGN_DRAFT_SECRET: "local-e2e-draft-signing-key-not-for-deployment",
    },
  },
});

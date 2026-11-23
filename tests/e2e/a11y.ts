import AxeBuilder from "@axe-core/playwright";
import { test as base, expect, type Page } from "@playwright/test";

export const test = base.extend({
  page: async ({ page }, runTest) => {
    await page.route("https://mt.marcopontili.com/**", (route) => route.abort());
    await page.route("https://challenges.cloudflare.com/**", (route) => route.abort());
    await page.route("https://*.hubspot.com/**", (route) => route.abort());
    // A test must explicitly mock lead responses; never forward a submission.
    await page.route("**/api/lead", (route) => route.fulfill({ status: 503, json: { error: "test_not_stubbed" } }));
    await runTest(page);
  },
});
export { expect };

export async function a11yViolations(page: Page): Promise<string[]> {
  // Client navigation can expose the new content before its stylesheet finishes loading.
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => document.fonts.ready);
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  return result.violations.map((violation) =>
    `${violation.id}: ${violation.nodes.map((node) => node.target.join(" ")).join(", ")}`);
}

export async function expectAccessible(page: Page) {
  expect(await a11yViolations(page)).toEqual([]);
}

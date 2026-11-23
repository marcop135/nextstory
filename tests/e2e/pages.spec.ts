import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { test, expect, expectAccessible } from "./a11y";

const directory = resolve("storyblok/stories");
const slugs = readdirSync(directory).filter((name) => name.endsWith(".json"))
  .map((name) => JSON.parse(readFileSync(resolve(directory, name), "utf8")))
  .filter((story) => ["page", "learning_note"].includes(story.content.component))
  .map((story: { slug: string }) => story.slug);
const pages = [
  ...["en", "de"].flatMap((locale) => slugs.map((slug) => ({
    locale,
    path: `${locale === "de" ? "/de" : ""}${slug === "home" ? "" : `/${slug}`}` || "/",
  }))),
  { locale: "en", path: "/for-agents" },
  { locale: "en", path: "/privacy" },
];

for (const { locale, path } of pages) {
  test(`${path} serves accessible ${locale} content`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    await expectAccessible(page);
  });
}

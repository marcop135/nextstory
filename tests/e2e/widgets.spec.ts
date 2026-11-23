import type { Locator } from "@playwright/test";
import { test, expect, expectAccessible } from "./a11y";
import { widgetMessages } from "../../src/lib/messages";

async function activate(control: Locator, mode: "mouse" | "keyboard") {
  if (mode === "mouse") await control.click();
  else { await control.focus(); await control.press("Enter"); }
}

for (const locale of ["en", "de"] as const) {
  const prefix = locale === "de" ? "/de" : "";
  const copy = widgetMessages[locale];
  test(`${locale}: home blocks highlight their page sections`, async ({ page }) => {
    await page.goto(`${prefix}/`);
    const proof = page.locator('.proof--home');
    const choices = proof.locator('.proof__home-picker button');
    for (let index = 0; index < 3; index++) {
      await activate(choices.nth(index), 'keyboard');
      await expect(choices.nth(index)).toHaveAttribute('aria-pressed', 'true');
      await expect(proof.locator('.proof__home-block').nth(index)).toHaveAttribute('data-active', 'true');
    }
    await expectAccessible(page);
  });
  for (const route of ["/how-it-works"]) {
    test(`${locale} ${route || "home"}: edit and publish the hero preview`, async ({ page }) => {
      await page.goto(`${prefix}${route || "/"}`);
      const proof = page.locator(".proof");
      const change = proof.locator(".proof__change");
      const preview = proof.locator(".proof__animated-headline");
      const initial = await preview.innerText();
      await change.click();
      await expect(preview).not.toHaveText(initial);
      const updated = await preview.innerText();
      await activate(proof.locator(".proof__publish"), "keyboard");
      await expect(preview).toHaveText(updated);
      await expect(proof.locator(".proof__publish")).toHaveAttribute("aria-disabled", "true");
      const headlines = new Set([initial, updated]);
      for (let index = 0; index < 4; index++) {
        await change.click();
        headlines.add(await preview.innerText());
      }
      expect(headlines.size).toBe(6);
      await change.click();
      await expect(preview).toHaveText(initial);
      await expectAccessible(page);
      await proof.locator(".proof__reset").click();
      await expect(preview).toHaveText(initial);
    });
  }
  test(`${locale}: build a page from the hero block palette`, async ({ page }) => {
    await page.goto(`${prefix}/blocks`);
    const proof = page.locator(".proof");
    const features = proof.getByRole("button", { name: locale === "de" ? "Merkmale" : "Features", exact: false });
    await activate(features, "keyboard");
    await expect(features).toHaveAttribute("aria-pressed", "true");
    await expect(proof.locator(".proof-page__features")).toBeVisible();
    await expectAccessible(page);
    const selected = proof.locator('.proof__choices button[aria-pressed="true"]');
    while (await selected.count()) await selected.first().click();
    await expect(proof.locator(".proof-page__block")).toHaveCount(0);
    await proof.locator(".proof__reset").click();
    await expect(proof.locator(".proof-page__block")).toHaveCount(2);
  });
  test(`${locale}: campaign choices update the preview without submitting`, async ({ page }) => {
    await page.goto(`${prefix}/campaign-workshop`);
    const posts: string[] = [];
    page.on("request", (request) => { if (request.method() === "POST") posts.push(request.url()); });
    const proof = page.locator(".proof");
    const initial = await proof.locator(".proof__campaign strong").innerText();
    await activate(proof.getByRole("button", { name: locale === "de" ? "Entwicklerteams" : "Developers", exact: true }), "keyboard");
    await expect(proof.locator(".proof__campaign strong")).not.toHaveText(initial);
    await proof.getByRole("button", { name: locale === "de" ? "Checkliste" : "Checklist", exact: true }).click();
    await expect(proof.locator(".proof__badge")).toContainText(locale === "de" ? "Checkliste" : "Checklist");
    await expectAccessible(page);
    await expect(proof.locator(".proof-page__cta")).toContainText(locale === "de" ? "Checkliste herunterladen" : "Get the checklist");
    expect(posts).toEqual([]);
  });
  for (const mode of ["mouse", "keyboard"] as const) {
    test(`${locale} ${mode}: draft, publish, boundaries, reset`, async ({ page }) => {
      await page.goto(`${prefix}/how-it-works`);
      const widget = page.locator('[data-widget="draft_publish"]');
      const draft = widget.locator(".app-widget__order li > span");
      const preview = widget.locator(".app-widget__preview li b");
      const initial = [copy.hero, copy.features, copy.action];
      await expect(preview).toHaveText(initial);
      await expectAccessible(page);
      const heroDown = widget.getByRole("button", { name: `${copy.down}: ${copy.hero}`, exact: true });
      // A reset makes retries idempotent if the first click precedes hydration.
      await expect(async () => {
        await activate(widget.getByRole("button", { name: copy.reset, exact: true }), mode);
        await activate(heroDown, mode);
        await expect(draft).toHaveText([copy.features, copy.hero, copy.action]);
      }).toPass();
      await expect(preview).toHaveText([copy.features, copy.hero, copy.action]);
      await expect(widget.getByRole("status")).toContainText(copy.changed);
      await expectAccessible(page);
      const boundary = widget.getByRole("button", { name: `${copy.up}: ${copy.features}`, exact: true });
      await expect(boundary).toHaveAttribute("aria-disabled", "true");
      if (mode === "mouse") await boundary.click({ force: true });
      else await activate(boundary, mode);
      await expect(draft).toHaveText([copy.features, copy.hero, copy.action]);
      await activate(widget.getByRole("button", { name: copy.publish, exact: true }), mode);
      await expect(preview).toHaveText([copy.features, copy.hero, copy.action]);
      await expect(widget.getByRole("status")).toContainText(copy.publishedStatus);
      await expectAccessible(page);
      await activate(widget.getByRole("button", { name: copy.reset, exact: true }), mode);
      await expect(draft).toHaveText(initial);
      await expect(preview).toHaveText(initial);
      await expectAccessible(page);
    });

    test(`${locale} ${mode}: block fields and translations`, async ({ page }) => {
      await page.goto(`${prefix}/blocks`);
      const widget = page.locator('[data-widget="block_anatomy"]');
      await expectAccessible(page);
      await expect(async () => {
        await activate(widget.getByRole("button", { name: copy.inspect, exact: true }), mode);
        await expect(widget.locator(".app-widget__fields dt").first()).toBeVisible();
      }).toPass();
      await expect(widget).toContainText("Every block on this site");
      await expect(widget).toContainText("Jeder Block dieser Site");
      await expectAccessible(page);
      const choices = widget.locator(".app-widget__choices button");
      for (let index = 0; index < await choices.count(); index++) {
        await activate(choices.nth(index), mode);
        await expect(choices.nth(index)).toHaveAttribute("aria-pressed", "true");
        await expect(widget.getByRole("status")).toContainText(`${index + 1}`);
        if (mode === "keyboard" && await choices.nth(index).innerText() === "feature_grid") {
          const field = widget.getByRole("region", { name: "features: EN", exact: true });
          await field.focus();
          await field.press("ArrowDown");
          await expect.poll(() => field.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
          await expect(field).toBeFocused();
          await field.screenshot({ path: test.info().outputPath("block-field-focus.png") });
        }
        await expectAccessible(page);
      }
    });

    test(`${locale} ${mode}: attribution remains local`, async ({ page }) => {
      await page.goto(`${prefix}/campaign-workshop?utm_source=e2e&utm_campaign=proof`);
      const widget = page.locator('[data-widget="attribution_inspector"]');
      const posts: string[] = [];
      page.on("request", (request) => { if (request.method() === "POST") posts.push(request.url()); });
      await expectAccessible(page);
      const refresh = widget.getByRole("button", { name: copy.refresh, exact: true });
      await expect(async () => {
        await activate(refresh, mode);
        await expect(widget.locator("dd").filter({ hasText: /^e2e$/ })).toHaveCount(1);
      }).toPass();
      await expect(widget.locator("dd").filter({ hasText: /^proof$/ })).toHaveCount(1);
      await expectAccessible(page);
      await page.evaluate(() => history.replaceState(null, "", "?utm_source=changed"));
      await activate(refresh, mode);
      await expect(widget.locator("dd").filter({ hasText: /^changed$/ })).toHaveCount(1);
      await expect(widget.locator("dd").filter({ hasText: /^proof$/ })).toHaveCount(0);
      await expectAccessible(page);
      expect(posts).toEqual([]);
    });

    test(`${locale} ${mode}: bounded HEAD history and page selection`, async ({ page }) => {
      await page.goto(`${prefix}/cache-invalidation`);
      const widget = page.locator('[data-widget="cache_inspector"]');
      await expectAccessible(page);
      const methods: string[] = [];
      page.on("request", (request) => {
        if (new URL(request.url()).pathname.startsWith("/content/")) methods.push(request.method());
      });
      const request = widget.getByRole("button", { name: copy.request, exact: true });
      await expect(async () => {
        await activate(request, mode);
        await expect(widget.locator(".app-widget__timings li")).toHaveCount(1);
      }).toPass();
      await expect(widget).toContainText(copy.unavailable);
      await expectAccessible(page);
      for (let count = 2; count <= 6; count++) {
        await activate(request, mode);
        await expect(request).toHaveAttribute("aria-disabled", "false");
        await expect(widget.locator(".app-widget__timings li")).toHaveCount(Math.min(count, 5));
      }
      expect(methods).toEqual(Array(6).fill("HEAD"));
      await activate(widget.locator("summary"), mode);
      await expect(widget.locator("details")).toHaveAttribute("open", "");
      await expectAccessible(page);
      await activate(widget.getByRole("button", { name: "blocks", exact: true }), mode);
      await expect(widget.locator(".app-widget__timings li")).toHaveCount(0);
      await expectAccessible(page);
      await activate(widget.getByRole("button", { name: "home", exact: true }), mode);
      await expect(widget.locator(".app-widget__timings li")).toHaveCount(5);
    });
  }

  for (const kind of ["block_anatomy", "cache_inspector"] as const) {
    test(`${locale} ${kind}: loading, failure, and retry`, async ({ page }) => {
      const anatomy = kind === "block_anatomy";
      const endpoint = anatomy ? "**/content/blocks.json?examples=blocks" : "**/content/**/*.md";
      let release: () => void = () => {};
      const pending = new Promise<void>((resolve) => { release = resolve; });
      await page.route(endpoint, async (route) => {
        await pending;
        await route.fulfill({ status: 503, body: "unavailable" });
      });
      await page.goto(`${prefix}/${anatomy ? "blocks" : "cache-invalidation"}`);
      const widget = page.locator(`[data-widget="${kind}"]`);
      const button = widget.locator(".btn");
      await expect(async () => {
        await button.click();
        await expect(button).toHaveAttribute("aria-disabled", "true");
      }).toPass();
      try { await expectAccessible(page); } finally { release(); }
      await expect(widget.getByRole("status")).toHaveText(copy.failed);
      await expectAccessible(page);
      await page.unroute(endpoint);
      await button.click();
      if (anatomy) await expect(widget.locator(".app-widget__fields dt").first()).toBeVisible();
      else await expect(widget.locator(".app-widget__timings li")).toHaveCount(1);
      await expectAccessible(page);
    });
  }
}

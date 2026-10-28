/** Browser regression checks against a running token-free build. */
import assert from "node:assert/strict";
import { mkdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "playwright";

const base = (process.argv[2] || "http://localhost:3000").replace(/\/$/, "");
const output = process.env.BROWSER_ARTIFACT_DIR || ".next/review";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || "chrome", headless: true });
const errors = [];

async function context(options) {
  const instance = await browser.newContext(options);
  instance.on("page", (page) => page.on("pageerror", (error) => errors.push(error.message)));
  await instance.route("https://mt.marcopontili.com/**", (route) => route.abort());
  return instance;
}

try {
  const mobile = await context({ viewport: { width: 390, height: 667 }, reducedMotion: "no-preference" });
  const page = await mobile.newPage();
  await page.goto(base, { waitUntil: "networkidle" });
  const visual = page.locator(".publishing-visual");
  const state = (value) => page.waitForFunction((expected) =>
    document.querySelector(".publishing-visual")?.getAttribute("data-motion") === expected, value);
  const time = () => visual.evaluate((el) =>
    el.querySelector(".publishing-visual__track span").getAnimations()[0]?.currentTime ?? 0);
  await state("paused");
  assert.deepEqual(await visual.locator(".publishing-visual__stage").evaluateAll((stages) =>
    stages.map((stage) => getComputedStyle(stage).animationDelay)), ["0s", "0.25s", "0.5s", "0.75s"]);
  await page.waitForTimeout(5100);
  assert.equal(await time(), 0, "Offscreen sequence must wait for the reader");
  await visual.scrollIntoViewIfNeeded();
  await state("running");
  await page.waitForTimeout(350);
  assert.ok(await time() > 0, "Visible sequence must advance");

  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { configurable: true, value: true });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await state("paused");
  const hiddenTime = await time();
  await page.waitForTimeout(200);
  assert.ok(Math.abs(await time() - hiddenTime) < 40, "Hidden-tab event must pause progress");
  await page.evaluate(() => {
    delete document.hidden;
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await state("running");
  await page.locator("footer").scrollIntoViewIfNeeded();
  await state("paused");
  const pausedTime = await time();
  await page.waitForTimeout(250);
  assert.ok(Math.abs(await time() - pausedTime) < 40, "Offscreen sequence must retain progress");
  await visual.scrollIntoViewIfNeeded();
  await state("running");
  assert.ok(await time() >= pausedTime, "Returning to the illustration must not restart it");
  await state("static");
  await page.locator("footer").scrollIntoViewIfNeeded();
  await visual.scrollIntoViewIfNeeded();
  assert.equal(await visual.getAttribute("data-motion"), "static", "Completed sequence must not replay");

  await page.goto(`${base}/de`, { waitUntil: "networkidle" });
  const menu = page.getByRole("button", { name: "Menü" });
  await menu.focus();
  await page.keyboard.press("Space");
  assert.equal(await menu.getAttribute("aria-expanded"), "true");
  await page.keyboard.press("Escape");
  assert.equal(await menu.getAttribute("aria-expanded"), "false");
  await menu.click();
  await page.locator("#site-nav").getByRole("link", { name: "Blöcke", exact: true }).click();
  await page.waitForURL("**/de/blocks");
  assert.equal(await menu.getAttribute("aria-expanded"), "false");
  assert.match(await page.locator("footer").innerText(), /Entdecken[\s\S]*Projekt[\s\S]*Datenschutz/);
  await page.locator("footer").getByRole("link", { name: "So funktioniert es", exact: true }).click();
  await page.waitForURL("**/de/how-it-works");
  assert.equal(await page.locator("html").getAttribute("lang"), "de");
  assert.ok(await page.locator(".related-content a").count() > 0, "Localized related stories must resolve");
  await page.locator(".related-content a").first().click();
  await page.waitForURL("**/de/content-relationships");
  assert.equal(await page.locator("main h1").innerText(), "Inhalte verknüpfen");
  assert.ok(await page.locator("main .code-example a").count() > 0, "Learning notes must link to their implementation");
  await page.getByRole("button", { name: "Menü" }).click();
  await page.locator(".lang-switch").getByRole("link", { name: "EN", exact: true }).click();
  await page.waitForURL("**/content-relationships");
  await page.waitForFunction(() => document.documentElement.lang === "en");
  assert.equal(await page.locator("main h1").innerText(), "Content relationships");
  assert.match(await page.locator("footer").innerText(), /Explore[\s\S]*Project[\s\S]*Privacy/);
  await mobile.close();

  const animated = await context({ viewport: { width: 1440, height: 1000 }, reducedMotion: "no-preference" });
  const sequencePage = await animated.newPage();
  for (const route of ["how-it-works", "blocks", "content-relationships", "cache-invalidation", "for-agents", "privacy"]) {
    await sequencePage.goto(`${base}/${route}`, { waitUntil: "networkidle" });
    await sequencePage.locator('h1[data-copy-motion="visible"]').waitFor();
    const illustration = sequencePage.locator(".publishing-visual");
    assert.equal(await illustration.count(), 1, `${route}: one illustration`);
    await illustration.scrollIntoViewIfNeeded();
    await sequencePage.waitForFunction(() => document.querySelector(".publishing-visual")?.dataset.motion === "running");
    assert.ok(await illustration.locator(".publishing-visual__track span").evaluate((el) => el.getAnimations().length) > 0);
    assert.equal(await sequencePage.locator("h1").evaluate((el) => getComputedStyle(el).animationDuration), "1.4s");
    const delays = await sequencePage.locator('main [data-copy-motion="visible"]').evaluateAll((els) =>
      els.slice(0, 3).map((el) => parseFloat(getComputedStyle(el).animationDelay)));
    assert.ok(delays.length >= 2 && delays[1] > delays[0], `${route}: stagger copy in reading order`);
    if (await sequencePage.locator(".hero__layout").count()) {
      assert.equal(await sequencePage.locator(".hero__layout").evaluate((el) => getComputedStyle(el).alignItems), "start");
    }
    assert.equal(await sequencePage.locator('#page-content ~ * [data-copy-motion], h2#page-content[data-copy-motion]').count(), 0, `${route}: body stays static`);
    await sequencePage.getByRole("link", { name: "Discover more", exact: true }).click();
    await sequencePage.waitForURL((url) => url.hash === "#page-content");
    await sequencePage.waitForFunction(() => scrollY > 200);
  }
  await animated.close();

  for (const colorScheme of ["light", "dark"]) {
    const instance = await context({ viewport: { width: 1440, height: 1000 }, colorScheme, reducedMotion: "reduce" });
    const screen = await instance.newPage();
    await screen.goto(base, { waitUntil: "networkidle" });
    assert.equal(await screen.getByText("source: mock", { exact: true }).count(), 0);
    assert.equal(await screen.locator(".footer-mark").getAttribute("href"), "/");
    for (const [name, selector] of [["primary", ".hero .btn:not(.btn--secondary)"], ["secondary", ".hero .btn--secondary"], ["band", ".cta-band .btn"]]) {
      const button = screen.locator(selector).first();
      await button.scrollIntoViewIfNeeded();
      await screen.mouse.move(0, 0);
      const background = () => button.evaluate((el) => getComputedStyle(el).backgroundColor);
      const normal = await background();
      await button.hover();
      await screen.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))));
      assert.notEqual(await background(), normal, `${name} ${colorScheme}: hover feedback`);
      await button.screenshot({ path: `${output}/cta-${name}-${colorScheme}-hover.png` });
      await screen.mouse.move(0, 0);
      await screen.keyboard.press("Tab");
      await button.focus();
      assert.equal(await button.evaluate((el) => el.matches(":focus-visible")), true);
      assert.equal(await button.evaluate((el) => getComputedStyle(el).outlineStyle), "solid");
      await button.screenshot({ path: `${output}/cta-${name}-${colorScheme}-focus.png` });
      await button.evaluate((el) => el.blur());
      await button.hover();
      const hovered = await background();
      await screen.mouse.down();
      await screen.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))));
      assert.notEqual(await background(), hovered, `${name} ${colorScheme}: active feedback`);
      await button.screenshot({ path: `${output}/cta-${name}-${colorScheme}-active.png` });
      await screen.mouse.move(0, 0);
      await screen.mouse.up();
    }
    await screen.goto(`${base}/blocks`, { waitUntil: "networkidle" });
    assert.equal(await screen.locator('#site-nav a[aria-current="page"]').getAttribute("href"), "/blocks");
    assert.equal(await screen.locator(".lang-switch span").evaluate((el) => getComputedStyle(el).borderBottomWidth), "0px");
    assert.equal(await screen.locator(".cta-band .btn").getAttribute("href"), "https://github.com/marcop135/nextstory");
    assert.equal(await screen.locator(".block-label").filter({ hasText: /^hero$/ }).count(), 0);
    await screen.locator(".footer-mark").click();
    await screen.waitForURL(`${base}/`);
    await screen.goto(`${base}/de/blocks`, { waitUntil: "networkidle" });
    assert.equal(await screen.locator(".footer-mark").getAttribute("href"), "/de");
    await screen.locator(".footer-mark").click();
    await screen.waitForURL(`${base}/de`);
    await instance.close();
  }

  const banner = (await readFile("README.md", "utf8")).split("</p>")[0] + "</p>";
  for (const colorScheme of ["light", "dark"]) {
    const instance = await context({ viewport: { width: 1000, height: 600 }, colorScheme });
    await instance.route("http://readme.test/**", (route) => route.fulfill({ path: resolve(new URL(route.request().url()).pathname.slice(1)) }));
    const readme = await instance.newPage();
    await readme.setContent(`<base href="http://readme.test/"><style>body{margin:0}</style>${banner}`);
    await readme.locator("img").evaluate((el) => el.decode());
    assert.equal(await readme.locator("img").count(), 1, "README must render one banner");
    assert.ok((await readme.locator("img").evaluate((el) => el.currentSrc)).endsWith(`readme-${colorScheme}.png`));
    await readme.screenshot({ path: `${output}/readme-${colorScheme}.png` });
    await instance.close();
  }

  for (const width of [320, 390, 768, 1440]) {
    for (const colorScheme of ["light", "dark"]) {
      const instance = await context({ viewport: { width, height: 900 }, colorScheme, reducedMotion: "reduce" });
      const screen = await instance.newPage();
      await screen.goto(`${base}/de/how-it-works`, { waitUntil: "networkidle" });
      assert.ok(await screen.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${width}px ${colorScheme}: horizontal overflow`);
      if (width === 390 || width === 1440) {
        await screen.screenshot({ path: `${output}/how-it-works-${width}-${colorScheme}.png`, fullPage: true });
        await screen.locator("footer").screenshot({ path: `${output}/footer-${width}-${colorScheme}.png` });
        await screen.goto(base, { waitUntil: "networkidle" });
        assert.equal(await screen.locator(".publishing-visual").evaluate((el) => el.getAnimations({ subtree: true }).length), 0);
        await screen.screenshot({ path: `${output}/home-${width}-${colorScheme}.png`, fullPage: true });
        for (const route of ["blocks", "content-relationships", "cache-invalidation", "for-agents", "privacy"]) {
          await screen.goto(`${base}/${route}`, { waitUntil: "networkidle" });
          assert.ok(await screen.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${route} ${width}px: overflow`);
          assert.equal(await screen.locator(".publishing-visual").evaluate((el) => el.getAnimations({ subtree: true }).length), 0);
          await screen.screenshot({ path: `${output}/${route}-${width}-${colorScheme}.png`, fullPage: true });
        }
      }
      await instance.close();
    }
  }

  const noScript = await context({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const staticPage = await noScript.newPage();
  await staticPage.goto(base, { waitUntil: "networkidle" });
  assert.equal(await staticPage.locator(".publishing-visual").getAttribute("data-motion"), "static");
  assert.equal(await staticPage.locator(".publishing-visual").evaluate((el) => el.getAnimations({ subtree: true }).length), 0);
  assert.equal(await staticPage.locator(".publishing-visual__stage").count(), 4);
  await noScript.close();
  assert.deepEqual(errors, [], "Browser runtime errors");
  console.log(`ok browser: viewport motion, tab events, localization, keyboard, 4 widths, light/dark, no-JS; screenshots in ${output}`);
} finally {
  await browser.close();
}

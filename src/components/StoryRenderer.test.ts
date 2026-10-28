import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import Hero from "@/components/Hero";
import type { HeroBlok } from "@/components/types";

import StoryRenderer from "@/components/StoryRenderer";
import { mockHomeStory, mockPageSlugs, mockStoryForSlug } from "@/lib/mock-story";

const { usePathname } = vi.hoisted(() => ({ usePathname: vi.fn(() => "/") }));
vi.mock("next/navigation", () => ({ usePathname }));

function render(slug: string, language?: string) {
  usePathname.mockReturnValue(`${language === "de" ? "/de" : ""}/${slug === "home" ? "" : slug}`);
  return renderToStaticMarkup(createElement(StoryRenderer, {
    story: mockStoryForSlug(slug, language)!,
    source: "mock",
  }));
}

it("renders CMS blocks on the server without a client provider or delivery token", () => {
  vi.stubEnv("STORYBLOK_DELIVERY_API_TOKEN", "");
  const html = renderToStaticMarkup(createElement(StoryRenderer, {
    story: mockHomeStory,
    source: "storyblok",
  }));
  expect(html).toContain("<h1>Ship every market from one content model</h1>");
  expect(html).toContain("Editors own the page");
  expect(html).toContain("See how this page is built");
  expect(html).toContain('class="wrap hero__layout"');
  expect(html).toContain('class="publishing-visual"');
  expect(html).not.toContain("Domenico Loia / Unsplash");
  expect(html).not.toContain("photo-1520588451467-4c904eb6d035");
  expect(html).toContain('href="https://unsplash.com/photos/watercolor-wireframe-sketches-of-website-layouts-tZc3vjPCk-Q"');
  expect(html).toContain("Hal Gatewood / Unsplash");
  expect(html).not.toContain("next-story-blocks.png");
});

it.each(mockPageSlugs)("renders the %s seed story in both languages", (slug) => {
  const en = render(slug);
  const de = render(slug, "de");
  expect(en).toContain("<h1>");
  expect(de).toContain("<h1>");
  expect(de).not.toBe(en);
  expect(de).not.toContain("__i18n__");
  expect(en).toContain('class="publishing-visual"');
  expect(de).toContain('class="publishing-visual"');
  if (slug !== "home") {
    expect(en).toContain(`nextstory / ${slug}`);
    expect(de).not.toContain("An edit becomes a preview");
  }
});

it("renders steps, rich text, and block labels from the seed content", () => {
  const html = render("blocks");
  expect(html).not.toContain('<p class="block-label">hero</p>');
  for (const name of ["feature_grid", "steps", "rich_text", "image_text", "accordion", "pull_quote", "cta_band", "comparison_table", "code_example"]) {
    expect(html).toContain(`<p class="block-label">${name}</p>`);
  }
  expect(html).toContain('<ol class="steps__list">');
  expect(html).toContain("<code>StoryblokServerRichText</code>");
  expect(html).toContain("<strong>bold</strong>");
});

it("renders new block content, image alternatives, and native accordion controls in both languages", () => {
  const en = render("blocks");
  const de = render("blocks", "de");
  expect(en).toContain('alt="Watercolor wireframe sketches showing reusable sections in website layouts"');
  expect(de).toContain('alt="Aquarellierte Website-Skizzen mit wiederverwendbaren Seitenabschnitten"');
  expect(en).toContain("Hal Gatewood / Unsplash");
  expect(de).toContain("Hal Gatewood / Unsplash");
  expect(en).toContain("<summary>What can an editor change?</summary>");
  expect(de).toContain("<summary>Was kann die Redaktion ändern?</summary>");
  expect(de).toContain("Die Redaktion kann Abschnitte umsortieren");
  expect(en).toContain("One block at a time. Each with a concrete example.");
  expect(de).toContain("Ein Block nach dem anderen. Jeder mit einem konkreten Beispiel.");
  expect(de).toContain('href="/de/how-it-works"');
  expect(de).not.toContain("What can an editor change?");
});

it("serves German copy and German links from field-level translations", () => {
  const html = render("home", "de");
  expect(html).toContain("Jeden Markt aus einem Content-Modell bedienen");
  expect(html).toContain("Modellieren");
  expect(html).toContain("Veröffentlichen");
  expect(html).toContain("Texte und Übersetzungen");
  expect(html).toContain('alt="Aquarellierte Website-Skizzen mit wiederverwendbaren Seitenabschnitten"');
  expect(html).toContain('href="/de/how-it-works"');
});

it("keeps the animated layout without an image and preserves the non-animated image mode", () => {
  const blok = structuredClone(mockHomeStory.content.body[0]) as HeroBlok;
  delete blok.image;
  expect(renderToStaticMarkup(createElement(Hero, { blok }))).toContain('class="wrap hero__layout"');
  blok.animated_visual = false;
  blok.image = { filename: "https://images.unsplash.com/photo-test" };
  blok.image_alt = "Fallback photo";
  const html = renderToStaticMarkup(createElement(Hero, { blok }));
  expect(html).toContain('alt="Fallback photo"');
  expect(html).not.toContain('class="publishing-visual"');
});

it("shows translated table cells and code linked to a real source excerpt", () => {
  const html = render("blocks", "de");
  expect(html).toContain('scope="col"');
  expect(html).toContain('scope="row"');
  expect(html).toContain("Erlaubte Blöcke im Schema festlegen");
  expect(html).toContain("Registrierungsfunktion");
  const example = mockStoryForSlug("how-it-works")!.content.body.find((b: { component: string }) => b.component === "code_example");
  expect(readFileSync(example.source_path, "utf8").replaceAll("\r\n", "\n")).toContain(example.code);
});

it("does not consume another editor's bridge cache when rendering a public story", () => {
  const editorStory = structuredClone(mockHomeStory);
  editorStory.content.body[0].headline = "Unpublished editor headline";
  const cache = (globalThis as typeof globalThis & {
    storyCache: Map<string, typeof mockHomeStory>;
  }).storyCache;
  cache.set(mockHomeStory.uuid, editorStory);
  try {
    const html = renderToStaticMarkup(createElement(StoryRenderer, {
      story: mockHomeStory,
      source: "storyblok",
    }));
    expect(html).toContain("Ship every market from one content model");
    expect(html).not.toContain("Unpublished editor headline");
  } finally {
    cache.delete(mockHomeStory.uuid);
  }
});

import { expect, it, vi } from "vitest";
import { renderToStaticMarkup, renderToReadableStream } from "react-dom/server";
import { createElement } from "react";
import RelatedContent from "@/components/RelatedContent";
import { attachRelatedNotes, relatedUuids } from "@/lib/related-content";
import { mockStoryForSlug } from "@/lib/mock-story";
import { storyMarkdown } from "@/lib/story-markdown";
import { fetchRelatedStories } from "@/lib/fetch-story";
import { readFileSync } from "node:fs";

vi.mock("@/lib/fetch-story", () => ({ fetchRelatedStories: vi.fn() }));
vi.mock("@/lib/site-config", () => ({ requestLocale: async () => "de" }));

it("resolves raw live-editor UUIDs server-side after an input event", async () => {
  const note = mockStoryForSlug("content-relationships", "de")!;
  vi.mocked(fetchRelatedStories).mockResolvedValueOnce([note]);
  const stream = await renderToReadableStream(createElement(RelatedContent, { blok: { component: "related_content", _uid: "live", stories: [note.uuid] } }));
  const html = await new Response(stream).text();
  expect(html).toContain("/de/content-relationships");
  expect(html).toContain("Inhalte verknüpfen");
  expect(fetchRelatedStories).toHaveBeenCalledWith([note.uuid], "de");
});

it("preserves editorial order and omits missing and non-note references", () => {
  const note = mockStoryForSlug("content-relationships")!;
  const page = mockStoryForSlug("home")!;
  const content = { body: [{ component: "related_content", stories: ["missing", page.uuid, note.uuid] }] };
  const result = attachRelatedNotes(content, [page, note]);
  expect((result.body as { resolved_notes: unknown[] }[])[0].resolved_notes).toEqual([
    expect.objectContaining({ title: "Content relationships", href: "/content-relationships" }),
  ]);
  expect(relatedUuids(content)).toEqual([page.uuid, note.uuid]);
});

it("renders localized references consistently in HTML and Markdown", () => {
  const story = mockStoryForSlug("blocks", "de")!;
  const blok = story.content.body.find((b: { component: string }) => b.component === "related_content");
  const html = renderToStaticMarkup(createElement(RelatedContent, { blok }));
  const md = storyMarkdown(story.content, "/de/blocks", "mock");
  for (const representation of [html, md]) {
    expect(representation).toContain("Inhalte verknüpfen");
    expect(representation).toContain("/de/content-relationships");
    expect(representation).toContain("/de/cache-invalidation");
  }
});

it("omits empty related sections and publishes learning-note bodies as Markdown", () => {
  expect(renderToStaticMarkup(createElement(RelatedContent, { blok: { _uid: "empty", component: "related_content", stories: [] } }))).toBe("");
  const story = mockStoryForSlug("content-relationships", "de")!;
  expect(storyMarkdown(story.content, "/de/content-relationships", "mock")).toContain("Story-Referenzen statt kopierter Texte");
});

it.each(["content-relationships", "cache-invalidation"])("keeps %s examples equal to their implementation source", (slug) => {
  for (const language of [undefined, "de"]) {
    const story = mockStoryForSlug(slug, language)!;
    const example = story.content.body.find((block: { component: string }) => block.component === "code_example");
    expect(readFileSync(example.source_path, "utf8").replaceAll("\r\n", "\n")).toContain(example.code);
    const markdown = storyMarkdown(story.content, "/" + slug, "mock");
    expect(markdown).toContain(example.code);
    expect(markdown).toContain("/blob/main/" + example.source_path);
  }
});

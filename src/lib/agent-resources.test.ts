import { readFileSync, existsSync } from "node:fs";
import { expect, it } from "vitest";
import { agentResources, apiCatalog, blockCatalog, openApi, portalMarkdown, skillsIndex } from "@/lib/agent-resources";
import { markdownPathForPage, parseMarkdownPath } from "@/lib/agent-paths";
import { storyblokComponents } from "@/lib/storyblok";
import { mockPageSlugs, mockStoryForSlug } from "@/lib/mock-story";
import { blockMarkdown, codeFence, storyMarkdown } from "@/lib/story-markdown";

it.each([ ["/", "/content/index.md"], ["/de", "/content/de/index.md"], ["/blocks", "/content/blocks.md"], ["/de/team/example", "/content/de/team/example.md"] ])("maps %s to its explicit resource", (page, resource) => {
  expect(markdownPathForPage(page)).toBe(resource);
  expect(parseMarkdownPath(resource.replace("/content/", "").split("/"))).toMatchObject({ canonical: page });
});

it.each(["/config", "/de/config", "/api/preview", "/privacy", "//evil.com", "/foo/../config", "/%2e%2e/config", "/openapi.json", "/fr/blocks"]) ("does not map non-public page route %s", (path) => {
  expect(markdownPathForPage(path)).toBeNull();
});

it.each(["config.md", "de/config.md", "api/preview.md", "../index.md", "blocks.json", "fr/index.md", "%2e%2e/config.md"])("rejects unsafe or non-Markdown resource %s", (path) => {
  expect(parseMarkdownPath(path.split("/"))).toBeNull();
});

it("keeps the block catalog consistent with schema and source files", () => {
  for (const block of blockCatalog().blocks) {
    expect(storyblokComponents).toHaveProperty(block.name);
    expect(existsSync(block.component_path)).toBe(true);
    expect(existsSync(block.schema_path)).toBe(true);
  }
  const comparison = blockCatalog().blocks.find((b) => b.name === "comparison_table")!;
  expect(comparison.fields).toContainEqual({ name: "table", type: "table", translatable: true });
  expect(readFileSync("src/types/storyblok.generated.ts", "utf8")).toContain("fieldtype: 'table'");
});

it("uses the same inventory in catalogs, portal, and workflows", () => {
  const paths = Object.keys(openApi().paths);
  for (const resource of agentResources) {
    expect(paths).toContain(resource.path);
    expect(portalMarkdown()).toContain(resource.path);
    expect(apiCatalog().linkset[0].item.map((i) => i.href)).toContain("https://nextstory.marcopontili.com" + resource.path);
  }
  expect(skillsIndex().skills).toHaveLength(3);
});

it.each(mockPageSlugs)("serializes the whole %s seed in both languages", (slug) => {
  for (const language of [undefined, "de"]) {
    const story = mockStoryForSlug(slug, language)!;
    const md = storyMarkdown(story.content, "https://example.com/", "mock");
    expect(md).toContain("# " + (story.content.component === "learning_note" ? story.content.title : story.content.body[0].headline));
    expect(md).not.toContain("__i18n__");
    expect(md).not.toContain("publishing-visual__");
  }
});

it("preserves accordion body, German table cells, code, and source links", () => {
  const md = storyMarkdown(mockStoryForSlug("blocks", "de")!.content, "https://example.com/de/blocks", "mock");
  expect(md).toContain("Was kann die Redaktion ändern?");
  expect(md).toContain("Die Redaktion kann Abschnitte umsortieren");
  expect(md).toContain("Erlaubte Blöcke im Schema festlegen");
  expect(md).toContain("setComponents(storyblokComponents)");
  expect(md).toContain("/blob/main/src/lib/storyblok.ts");
});

it("fences code safely, escapes table pipes, and omits unsafe links", () => {
  expect(codeFence("before\n```\nafter", "ts\n<script>")).toBe("````tsscript\nbefore\n```\nafter\n````");
  expect(blockMarkdown({ component: "comparison_table", headline: "Table", table: { thead: [{ value: "a|b" }], tbody: [] } })).toContain("a\\|b");
  expect(blockMarkdown({ component: "cta_band", headline: "Example", cta_label: "Bad", cta_href: "javascript:alert(1)" })).not.toContain("javascript");
  expect(() => storyMarkdown({ component: "config" }, "/", "mock")).toThrow("Only page stories");
});

import { beforeEach, expect, it, vi } from "vitest";

import { mockPageSlugs } from "@/lib/mock-story";
import { publishedPageSlugs } from "@/lib/published-slugs";

vi.mock("next/headers", () => ({ draftMode: vi.fn() }));

beforeEach(() => {
  vi.stubEnv("STORYBLOK_DELIVERY_API_TOKEN", "test-token");
});

it("lists published page stories and skips folders, drafts, and the config story", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({
    links: {
      a: { slug: "home", is_folder: false, published: true },
      b: { slug: "blocks", is_folder: false, published: true },
      c: { slug: "config", is_folder: false, published: true },
      d: { slug: "docs", is_folder: true, published: true },
      e: { slug: "draft-only", is_folder: false, published: false },
      f: { slug: "pricing", is_folder: false, published: true },
    },
  })));
  expect(await publishedPageSlugs()).toEqual(["home", "blocks"]);
  const [url] = vi.mocked(fetch).mock.calls[0];
  expect(new URL(String(url)).searchParams.get("version")).toBe("published");
});

it("falls back to the seed stories when Storyblok is unavailable or no token is set", async () => {
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));
  expect(await publishedPageSlugs()).toEqual(mockPageSlugs);
  vi.stubEnv("STORYBLOK_DELIVERY_API_TOKEN", "");
  expect(await publishedPageSlugs()).toEqual(mockPageSlugs);
});

it("keeps the published page list empty when every CMS page is unpublished", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({
    links: {
      config: { slug: "config", is_folder: false, published: true },
      home: { slug: "home", is_folder: false, published: false },
    },
  })));
  expect(await publishedPageSlugs()).toEqual([]);
});

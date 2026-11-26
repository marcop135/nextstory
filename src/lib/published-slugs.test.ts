import { beforeEach, expect, it, vi } from "vitest";

import { mockPageSlugs } from "@/lib/mock-story";
import { publishedPageSlugs, publishedPages } from "@/lib/published-slugs";

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

it("keeps each page's Storyblok publication date for the sitemap", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({
    links: {
      a: { slug: "home", is_folder: false, published: true, published_at: "2026-11-01T10:00:00.000Z" },
      b: { slug: "blocks", is_folder: false, published: true, published_at: null },
    },
  })));
  expect(await publishedPages()).toEqual([
    { slug: "home", publishedAt: "2026-11-01T10:00:00.000Z" },
    { slug: "blocks" },
  ]);
  const [url] = vi.mocked(fetch).mock.calls[0];
  expect(new URL(String(url)).searchParams.get("include_dates")).toBe("1");
});

it("pages through the Links API until the total header is covered", async () => {
  const link = (slug: string) => ({ slug, is_folder: false, published: true });
  const page = (slug: string) => new Response(JSON.stringify({ links: { [slug]: link(slug) } }), { headers: { total: "1001" } });
  vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce(page("home")).mockResolvedValueOnce(page("blocks")));
  expect(await publishedPageSlugs()).toEqual(["home", "blocks"]);
  expect(vi.mocked(fetch).mock.calls.map(([url]) => new URL(String(url)).searchParams.get("page"))).toEqual(["1", "2"]);
});

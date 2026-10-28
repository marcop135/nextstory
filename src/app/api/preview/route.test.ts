import { NextRequest } from "next/server";
import { beforeEach, expect, it, vi } from "vitest";

import { GET } from "./route";

const { enable, fetchStory } = vi.hoisted(() => ({ enable: vi.fn(), fetchStory: vi.fn() }));
vi.mock("next/headers", () => ({ draftMode: async () => ({ enable }) }));
vi.mock("next/navigation", () => ({ redirect: (path: string) => { throw new Error(`redirect:${path}`); } }));
vi.mock("@/lib/fetch-story", () => ({ fetchStory }));

function request(slug = "home", secret = "preview-secret", lang = "en") {
  const query = new URLSearchParams({ slug, secret, lang });
  return new NextRequest(`https://northline.test/api/preview?${query}`);
}

beforeEach(() => {
  vi.stubEnv("STORYBLOK_PREVIEW_SECRET", "preview-secret");
  fetchStory.mockResolvedValue({ story: { full_slug: "home" }, source: "storyblok" });
});

it("authenticates before reading content or enabling draft mode", async () => {
  expect((await GET(request("home", "wrong"))).status).toBe(401);
  expect(fetchStory).not.toHaveBeenCalled();
  expect(enable).not.toHaveBeenCalled();
});

it("fails closed when the preview secret is unconfigured", async () => {
  vi.stubEnv("STORYBLOK_PREVIEW_SECRET", "");
  expect((await GET(request())).status).toBe(401);
  expect(enable).not.toHaveBeenCalled();
});

it.each(["//example.com", "../blocks", "blocks?token=x", "blocks#test", "\\example.com", "%2f%2fexample.com"])("rejects unsafe story slug %s", async (slug) => {
  expect((await GET(request(slug))).status).toBe(400);
  expect(enable).not.toHaveBeenCalled();
});

it("does not create a preview session for a missing story", async () => {
  fetchStory.mockResolvedValue(null);
  expect((await GET(request("missing"))).status).toBe(404);
  expect(enable).not.toHaveBeenCalled();
});

it("rejects unsupported preview languages", async () => {
  expect((await GET(request("home", "preview-secret", "fr"))).status).toBe(400);
  expect(fetchStory).not.toHaveBeenCalled();
  expect(enable).not.toHaveBeenCalled();
});

it("rejects an unsafe path returned by the CMS before enabling the cookie", async () => {
  fetchStory.mockResolvedValue({ story: { full_slug: "//example.com" } });
  expect((await GET(request())).status).toBe(502);
  expect(enable).not.toHaveBeenCalled();
});

it("reports unavailable content without creating a preview session", async () => {
  fetchStory.mockRejectedValue(new Error("upstream unavailable"));
  expect((await GET(request())).status).toBe(503);
  expect(enable).not.toHaveBeenCalled();
});

it("verifies draft content and redirects to the localized CMS story path", async () => {
  fetchStory.mockResolvedValue({ story: { full_slug: "campaigns/launch" } });
  await expect(GET(request("campaigns/launch", "preview-secret", "de"))).rejects.toThrow("redirect:/de/campaigns/launch");
  expect(fetchStory).toHaveBeenCalledWith("campaigns/launch", "de", { version: "draft" });
  expect(enable).toHaveBeenCalledOnce();
});

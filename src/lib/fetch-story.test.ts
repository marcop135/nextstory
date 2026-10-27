import { beforeEach, describe, expect, it, vi } from "vitest";

import { fetchStory, fetchRelatedStories } from "@/lib/fetch-story";
import { mockHomeStory } from "@/lib/mock-story";
import { mockStoryForSlug } from "@/lib/mock-story";

const { draftMode } = vi.hoisted(() => ({ draftMode: vi.fn() }));
vi.mock("next/headers", () => ({ draftMode }));
vi.mock("@/lib/storyblok", () => ({
  hasStoryblokToken: () => Boolean(process.env.STORYBLOK_DELIVERY_API_TOKEN?.trim()),
}));

beforeEach(() => {
  vi.stubEnv("STORYBLOK_DELIVERY_API_TOKEN", "test-token");
  vi.stubEnv("STORYBLOK_REGION", "eu");
  vi.stubEnv("NODE_ENV", "production");
  vi.stubEnv("STORYBLOK_VERSION", "draft");
  draftMode.mockResolvedValue({ isEnabled: false });
  vi.stubGlobal("fetch", vi.fn().mockImplementation(async () => Response.json({ story: mockHomeStory })));
});

describe("content delivery", () => {
  it("batches distinct references by input count even when early batches contain missing stories", async () => {
    const uuids = Array.from({ length: 205 }, (_, i) => `00000000-0000-4000-8000-${String(i + 1).padStart(12, "0")}`);
    const note = mockStoryForSlug("content-relationships", "de")!;
    const laterNote = { ...note, uuid: uuids[204] };
    vi.mocked(fetch).mockResolvedValueOnce(Response.json({ stories: [] }))
      .mockResolvedValueOnce(Response.json({ stories: [] }))
      .mockResolvedValueOnce(Response.json({ stories: [laterNote] }));
    expect(await fetchRelatedStories([...uuids, uuids[0]], "de", "published")).toEqual([laterNote]);
    const batches = vi.mocked(fetch).mock.calls.map(([url, options]) => {
      const params = new URL(String(url)).searchParams;
      expect(params.get("version")).toBe("published");
      expect(params.get("language")).toBe("de");
      expect(options?.next?.tags).toContain("storyblok:related-content");
      return params.get("by_uuids")!.split(",");
    });
    expect(batches.map((batch) => batch.length)).toEqual([100, 100, 5]);
    expect(batches.flat()).toEqual(uuids);
  });

  it("rejects malformed relation entries rather than failing while rendering", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(Response.json({ stories: [null] }));
    await expect(fetchRelatedStories(["00000000-0000-4000-8000-000000000001"], undefined, "published")).rejects.toThrow("Invalid Storyblok related-content response");
  });
  it("loads published related notes with a separate dependency tag and preserves editorial order", async () => {
    const story = mockStoryForSlug("blocks")!;
    const note = mockStoryForSlug("cache-invalidation", "de")!;
    vi.mocked(fetch).mockResolvedValueOnce(Response.json({ story })).mockResolvedValueOnce(Response.json({ stories: [note] }));
    const result = await fetchStory("blocks", "de", { version: "published" });
    const [url, options] = vi.mocked(fetch).mock.calls[1];
    expect(new URL(String(url)).searchParams.get("by_uuids")).toContain(note.uuid);
    expect(new URL(String(url)).searchParams.get("version")).toBe("published");
    expect(new URL(String(url)).searchParams.get("language")).toBe("de");
    expect(options?.next?.tags).toEqual(["storyblok", "storyblok:related-content"]);
    expect(vi.mocked(fetch).mock.calls[0][1]?.next?.tags).not.toContain("storyblok:related-content");
    const blok = result!.story.content.body.find((b: { component: string }) => b.component === "related_content");
    expect(blok.resolved_notes).toEqual([expect.objectContaining({ href: "/de/cache-invalidation" })]);
  });

  it("resolves authenticated draft relationships without caching and omits unpublished public references", async () => {
    const story = mockStoryForSlug("blocks")!;
    draftMode.mockResolvedValue({ isEnabled: true });
    vi.mocked(fetch).mockResolvedValueOnce(Response.json({ story })).mockResolvedValueOnce(Response.json({ stories: [] }));
    const result = await fetchStory("blocks");
    const [url, options] = vi.mocked(fetch).mock.calls[1];
    expect(new URL(String(url)).searchParams.get("version")).toBe("draft");
    expect(options?.cache).toBe("no-store");
    expect(options?.next).toBeUndefined();
    expect(result!.story.content.body.find((b: { component: string }) => b.component === "related_content").resolved_notes).toEqual([]);
  });

  it("does not hide reference outages as empty related content or leak delivery tokens", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(Response.json({ story: mockStoryForSlug("blocks") })).mockRejectedValueOnce(new Error("token=test-token"));
    await expect(fetchStory("blocks")).rejects.toThrow("Storyblok related-content request failed");
  });
  it("can explicitly read published content despite preview cookies and draft development settings", async () => {
    vi.stubEnv("NODE_ENV", "development");
    draftMode.mockResolvedValue({ isEnabled: true });
    await fetchStory("home", "de", { version: "published" });
    const [url, options] = vi.mocked(fetch).mock.calls[0];
    expect(new URL(String(url)).searchParams.get("version")).toBe("published");
    expect(options).toMatchObject({ cache: "force-cache", next: { tags: expect.arrayContaining(["storyblok"]) } });
    expect(draftMode).not.toHaveBeenCalled();
  });
  it("never serves drafts to public production requests, even with a draft env setting", async () => {
    await fetchStory("home");
    const [url, options] = vi.mocked(fetch).mock.calls[0];
    expect(new URL(String(url)).searchParams.get("version")).toBe("published");
    expect(options).toMatchObject({ cache: "force-cache", next: { tags: expect.arrayContaining(["storyblok"]) } });
  });

  it("bypasses the cache for authenticated preview and preserves the locale", async () => {
    draftMode.mockResolvedValue({ isEnabled: true });
    await fetchStory("pricing", "de");
    const [url, options] = vi.mocked(fetch).mock.calls[0];
    expect(new URL(String(url)).searchParams.get("version")).toBe("draft");
    expect(new URL(String(url)).searchParams.get("language")).toBe("de");
    expect(options).toMatchObject({ cache: "no-store" });
    expect(options?.next).toBeUndefined();
  });

  it("can verify an unpublished story before enabling the preview cookie", async () => {
    await fetchStory("home", undefined, { version: "draft" });
    expect(new URL(String(vi.mocked(fetch).mock.calls[0][0])).searchParams.get("version")).toBe("draft");
  });

  it("uses the same story tag for every language and a different tag for another story", async () => {
    await fetchStory("home");
    await fetchStory("home", "de");
    await fetchStory("pricing");
    const tags = vi.mocked(fetch).mock.calls.map(([, options]) => options?.next?.tags);
    expect(tags[0]).toEqual(tags[1]);
    expect(tags[0]).not.toEqual(tags[2]);
  });

  it("uses offline fixtures only when no token is configured", async () => {
    vi.stubEnv("STORYBLOK_DELIVERY_API_TOKEN", "");
    expect(await fetchStory("home")).toMatchObject({ source: "mock" });
    expect(await fetchStory("missing")).toBeNull();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("distinguishes an absent story from a CMS outage", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 404 }));
    expect(await fetchStory("missing")).toBeNull();
    vi.mocked(fetch).mockResolvedValueOnce(new Response("upstream failure", { status: 503 }));
    await expect(fetchStory("home")).rejects.toThrow("503");
  });

  it("does not turn a network failure into a missing page or leak the token", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("https://api.storyblok.com?token=test-token"));
    await expect(fetchStory("home")).rejects.toThrow("Storyblok request failed");
    await expect(fetchStory("home")).rejects.not.toThrow("test-token");
  });

  it("rejects malformed delivery responses", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(Response.json({ story: null }));
    await expect(fetchStory("home")).rejects.toThrow("Invalid Storyblok response");
  });
});

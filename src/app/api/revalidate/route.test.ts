import { NextRequest } from "next/server";
import { beforeEach, expect, it, vi } from "vitest";

import { POST } from "./route";

const { revalidatePath, revalidateTag } = vi.hoisted(() => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath, revalidateTag }));

function request(body: unknown, secret = "webhook-secret") {
  return new NextRequest("https://northline.test/api/revalidate", {
    method: "POST",
    headers: { "x-revalidate-secret": secret, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => { vi.stubEnv("STORYBLOK_REVALIDATE_SECRET", "webhook-secret"); });

it("rejects unauthenticated webhooks without touching the cache", async () => {
  expect((await POST(request({ full_slug: "pricing" }, "wrong"))).status).toBe(401);
  expect(revalidatePath).not.toHaveBeenCalled();
  expect(revalidateTag).not.toHaveBeenCalled();
});

it.each([
  { body: null },
  { body: [] },
  { body: {} },
  { body: { full_slug: 42 } },
  { body: { full_slug: null, story_id: 123 } },
  { body: { full_slug: "../pricing" } },
  { body: { old_full_slug: "old", story_id: 123 } },
  { body: { story_id: -1 } },
])("rejects invalid payloads without invalidating content: $body", async ({ body }) => {
  expect((await POST(request(body))).status).toBe(400);
  expect(revalidatePath).not.toHaveBeenCalled();
  expect(revalidateTag).not.toHaveBeenCalled();
});

it("fails closed when no webhook secret is configured", async () => {
  vi.stubEnv("STORYBLOK_REVALIDATE_SECRET", "");
  expect((await POST(request({ full_slug: "pricing" }))).status).toBe(401);
  expect(revalidateTag).not.toHaveBeenCalled();
});

it("rejects malformed JSON", async () => {
  const req = new NextRequest("https://northline.test/api/revalidate?secret=webhook-secret", { method: "POST", body: "{" });
  expect((await POST(req)).status).toBe(400);
  expect(revalidateTag).not.toHaveBeenCalled();
});

it.each(["published", "unpublished", "deleted"])("invalidates all language variants on %s", async (action) => {
  const response = await POST(request({ action, story_id: 123, full_slug: "pricing" }));
  expect(response.status).toBe(200);
  expect(revalidatePath).toHaveBeenCalledWith("/pricing");
  expect(revalidatePath).toHaveBeenCalledWith("/de/pricing");
  expect(revalidateTag).toHaveBeenCalledTimes(2);
  expect(revalidateTag).toHaveBeenCalledWith("storyblok:related-content", { expire: 0 });
  expect(revalidateTag).not.toHaveBeenCalledWith("storyblok", expect.anything());
});

it("expires the old and new paths when an editor moves a story", async () => {
  await POST(request({ action: "moved", full_slug: "campaigns/new", old_full_slug: "campaigns/old" }));
  expect(revalidatePath).toHaveBeenCalledWith("/campaigns/old");
  expect(revalidatePath).toHaveBeenCalledWith("/de/campaigns/new");
  expect(revalidateTag).toHaveBeenCalledTimes(3);
});

it("supports legacy story-id-only publish events with a collection invalidation", async () => {
  const response = await POST(request({ action: "published", story_id: 123 }));
  expect(response.status).toBe(200);
  expect(revalidateTag).toHaveBeenCalledWith("storyblok", { expire: 0 });
  expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
});

it("expires the collection when a move omits the old path", async () => {
  expect((await POST(request({ action: "moved", full_slug: "plans", story_id: 123 }))).status).toBe(200);
  expect(revalidateTag).toHaveBeenCalledWith("storyblok", { expire: 0 });
  expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
});

it("acknowledges unrelated events without invalidating published pages", async () => {
  const response = await POST(request({ action: "saved", story_id: 123 }));
  expect(response.status).toBe(200);
  expect(await response.json()).toMatchObject({ ignored: true });
  expect(revalidateTag).not.toHaveBeenCalled();
  expect(revalidatePath).not.toHaveBeenCalled();
});

it("refreshes the shared layout when the config story is published", async () => {
  const response = await POST(request({ action: "published", story_id: 7, full_slug: "config" }));
  expect(response.status).toBe(200);
  expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
  expect(revalidateTag).toHaveBeenCalledTimes(2);
});

it("refreshes the sitemap when a story is published", async () => {
  await POST(request({ action: "published", story_id: 9, full_slug: "how-it-works" }));
  expect(revalidatePath).toHaveBeenCalledWith("/sitemap.xml");
});

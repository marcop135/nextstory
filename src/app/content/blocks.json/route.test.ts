import { expect, it, vi, afterEach } from "vitest";
import { GET } from "./route";
import { fetchStory } from "@/lib/fetch-story";
import { mockStoryForSlug } from "@/lib/mock-story";

vi.mock("@/lib/fetch-story", () => ({ fetchStory: vi.fn() }));
afterEach(() => vi.resetAllMocks());

it("keeps the schema-only catalog independent of CMS availability", async () => {
  const response = await GET(new Request("https://example.com/content/blocks.json"));
  expect(response.status).toBe(200);
  expect(fetchStory).not.toHaveBeenCalled();
});

it("reads only published examples in both languages and omits editor metadata", async () => {
  const en = mockStoryForSlug("blocks")!;
  en.content.body[0]._editable = "private editor metadata";
  vi.mocked(fetchStory).mockResolvedValueOnce({ source: "mock", story: en })
    .mockResolvedValueOnce({ source: "mock", story: mockStoryForSlug("blocks", "de")! });
  const response = await GET(new Request("https://example.com/content/blocks.json?examples=blocks"));
  const body = await response.json();
  expect(fetchStory).toHaveBeenNthCalledWith(1, "blocks", undefined, { version: "published" });
  expect(fetchStory).toHaveBeenNthCalledWith(2, "blocks", "de", { version: "published" });
  expect(body.examples.en[0].fields.headline).toBe("Every block on this site");
  expect(body.examples.de[0].fields.headline).toBe("Jeder Block dieser Site");
  expect(JSON.stringify(body)).not.toContain("_editable");
});

it("does not replace CMS failures with seed examples", async () => {
  vi.mocked(fetchStory).mockRejectedValue(new Error("delivery failed"));
  const response = await GET(new Request("https://example.com/content/blocks.json?examples=blocks"));
  expect(response.status).toBe(503);
});

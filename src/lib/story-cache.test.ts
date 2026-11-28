import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";

import { relatedContentCacheTag, storyblokCacheTag, storyCacheTag } from "./story-cache";

describe("storyCacheTag", () => {
  it("is `storyblok:` plus the sha256 hex of the slug", () => {
    expect(storyCacheTag("blocks")).toBe(`storyblok:${createHash("sha256").update("blocks").digest("hex")}`);
  });

  it("stays within Next's 256-character tag limit for any slug length", () => {
    expect(storyCacheTag("a/".repeat(500)).length).toBeLessThanOrEqual(256);
  });

  it("differs per slug and is stable per slug", () => {
    expect(storyCacheTag("home")).not.toBe(storyCacheTag("blocks"));
    expect(storyCacheTag("home")).toBe(storyCacheTag("home"));
  });

  it("keeps the collection tags fixed", () => {
    expect(storyblokCacheTag).toBe("storyblok");
    expect(relatedContentCacheTag).toBe("storyblok:related-content");
  });
});

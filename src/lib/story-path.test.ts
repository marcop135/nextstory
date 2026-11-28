import { describe, expect, it } from "vitest";

import { defaultLocale } from "./i18n";
import { CONFIG_SLUG, isPageSlug, normalizeStorySlug, parseStorySegments, publicPathForSlug } from "./story-path";

describe("normalizeStorySlug", () => {
  it("trims one leading and trailing slash and defaults to home", () => {
    expect(normalizeStorySlug("/blocks/")).toBe("blocks");
    expect(normalizeStorySlug("a/b")).toBe("a/b");
    expect(normalizeStorySlug("")).toBe("home");
    expect(normalizeStorySlug("/")).toBe("home");
  });

  it.each([
    ["non-string", 5],
    ["protocol-relative", "//evil.example"],
    ["traversal", "../secret"],
    ["dot segment", "a/./b"],
    ["empty segment", "a//b"],
    ["query", "a?b=1"],
    ["fragment", "a#b"],
    ["percent", "a%2fb"],
    ["backslash", "a\\b"],
    ["colon", "https:evil"],
    ["whitespace", "a b"],
    ["control character", "a\u0000b"],
  ])("rejects %s", (_name, value) => {
    expect(normalizeStorySlug(value)).toBeNull();
  });
});

describe("parseStorySegments", () => {
  it("maps the root and locale roots to home", () => {
    expect(parseStorySegments(undefined)).toEqual({ locale: defaultLocale, slug: "home", pathname: "" });
    expect(parseStorySegments(["de"])).toEqual({ locale: "de", slug: "home", pathname: "de" });
  });

  it("splits a locale prefix from the slug", () => {
    expect(parseStorySegments(["de", "blocks", "x"])).toEqual({ locale: "de", slug: "blocks/x", pathname: "de/blocks/x" });
    expect(parseStorySegments(["blocks"])).toEqual({ locale: defaultLocale, slug: "blocks", pathname: "blocks" });
  });
});

describe("publicPathForSlug", () => {
  it("builds default and localized public paths", () => {
    expect(publicPathForSlug("home")).toBe("/");
    expect(publicPathForSlug("blocks")).toBe("/blocks");
    expect(publicPathForSlug("home", "de")).toBe("/de");
    expect(publicPathForSlug("blocks", "de")).toBe("/de/blocks");
    expect(publicPathForSlug(CONFIG_SLUG)).toBe("/");
  });
});

describe("isPageSlug", () => {
  it("excludes the config and pricing stories", () => {
    expect(isPageSlug("config")).toBe(false);
    expect(isPageSlug("pricing")).toBe(false);
    expect(isPageSlug("blocks")).toBe(true);
  });
});

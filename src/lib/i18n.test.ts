import { describe, expect, it } from "vitest";

import { localeForPathname, switchLocalePath } from "@/lib/i18n";
import { localizeContent } from "@/lib/localize";
import { isPageSlug, publicPathForSlug } from "@/lib/story-path";

describe("locale routing", () => {
  it.each([
    ["/", "en"],
    ["/blocks", "en"],
    ["/de", "de"],
    ["/de/blocks", "de"],
    ["/design", "en"],
  ])("reads the locale of %s as %s", (path, locale) => {
    expect(localeForPathname(path)).toBe(locale);
  });

  it.each([
    ["/", "de", "/de"],
    ["/blocks", "de", "/de/blocks"],
    ["/de", "en", "/"],
    ["/de/how-it-works", "en", "/how-it-works"],
    ["/privacy", "de", "/de"],
    ["/for-agents", "de", "/de"],
  ] as const)("switches %s to %s as %s", (path, locale, expected) => {
    expect(switchLocalePath(path, locale)).toBe(expected);
  });

  it("keeps the config story off the public routes", () => {
    expect(isPageSlug("config")).toBe(false);
    expect(isPageSlug("blocks")).toBe(true);
    expect(isPageSlug("pricing")).toBe(false);
    expect(publicPathForSlug("config", "de")).toBe("/de");
  });
});

describe("field-level translations", () => {
  const content = {
    headline: "Hello",
    headline__i18n__de: "Hallo",
    text: "Only English",
    text__i18n__de: "",
    items: [{ label: "One", label__i18n__de: "Eins" }],
  };

  it("resolves translated fields and falls back to the default for empty ones", () => {
    expect(localizeContent(content, "de")).toEqual({
      headline: "Hallo",
      text: "Only English",
      items: [{ label: "Eins" }],
    });
  });

  it("drops translation keys for the default language", () => {
    expect(localizeContent(content)).toEqual({
      headline: "Hello",
      text: "Only English",
      items: [{ label: "One" }],
    });
  });
});

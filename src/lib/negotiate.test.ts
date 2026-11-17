import { describe, expect, it } from "vitest";

import { preferredRepresentation } from "@/lib/negotiate";

describe("preferredRepresentation", () => {
  it.each([
    [null, "html"],
    ["", "html"],
    ["*/*", "html"],
    ["text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8", "html"],
    ["text/markdown", "markdown"],
    ["text/markdown, text/html;q=0.9", "markdown"],
    ["text/html, text/markdown;q=0.5", "html"],
    ["text/markdown, */*", "markdown"],
    ["text/*", "html"],
    ["text/markdown;q=0, text/html", "html"],
    ["image/png", "none"],
    ["application/json", "none"],
    ["text/html;q=0, text/markdown;q=0", "none"],
  ])("Accept %j -> %s", (accept, expected) => {
    expect(preferredRepresentation(accept)).toBe(expected);
  });
});

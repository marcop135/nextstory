import { describe, expect, it } from "vitest";

import { secretMatches } from "./secret";

describe("secretMatches", () => {
  it("accepts an identical secret", () => {
    expect(secretMatches("s3cret-value", "s3cret-value")).toBe(true);
  });

  it("rejects a different secret of any length", () => {
    expect(secretMatches("s3cret-valuf", "s3cret-value")).toBe(false);
    expect(secretMatches("s3cret", "s3cret-value")).toBe(false);
  });

  it("rejects a missing or empty secret on either side", () => {
    expect(secretMatches(null, "s3cret-value")).toBe(false);
    expect(secretMatches("", "s3cret-value")).toBe(false);
    expect(secretMatches("s3cret-value", undefined)).toBe(false);
    expect(secretMatches("", "")).toBe(false);
  });
});

import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const eslintRequire = createRequire(require.resolve("eslint/package.json"));
const minimatch = eslintRequire("minimatch").minimatch;

describe("legacy lint-plugin glob compatibility", () => {
  it("retains callable matching, braces, and negated patterns", () => {
    expect(minimatch("src/page.tsx", "src/*.{ts,tsx}")).toBe(true);
    expect(minimatch("src/page.css", "src/*.{ts,tsx}")).toBe(false);
    expect(minimatch("README.md", "!*.ts")).toBe(true);
  });

  it("retains the class, filter, and list-matching APIs", () => {
    expect(new minimatch.Minimatch("**/*.tsx").match("src/page.tsx")).toBe(true);
    expect(["page.tsx", "page.css"].filter(minimatch.filter("*.tsx"))).toEqual(["page.tsx"]);
    expect(minimatch.match(["page.tsx", "page.css"], "*.css")).toEqual(["page.css"]);
  });

  it("returns callable defaults without changing global matching options", () => {
    const insensitive = minimatch.defaults({ nocase: true });
    expect(insensitive("PAGE.TSX", "*.tsx")).toBe(true);
    expect(minimatch("PAGE.TSX", "*.tsx")).toBe(false);
    expect(insensitive.defaults({ dot: true })(".PAGE.TSX", "*.tsx")).toBe(true);
  });
});

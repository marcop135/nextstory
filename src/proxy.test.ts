import { describe, expect, it, vi } from "vitest";

import { proxy } from "@/proxy";

function run(path: string, headers: Record<string, string> = {}) {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 204 })));
  const request = {
    url: `https://nextstory.marcopontili.com${path}`,
    nextUrl: new URL(`https://nextstory.marcopontili.com${path}`),
    method: "GET",
    headers: new Headers({ "user-agent": "Mozilla/5.0 Chrome/141.0", ...headers }),
  };
  return proxy(request as never, { waitUntil: vi.fn() } as never);
}

describe("proxy content negotiation", () => {
  it("serves the Markdown twin when the request prefers text/markdown", () => {
    const res = run("/how-it-works", { accept: "text/markdown, text/html;q=0.9" });
    expect(res.headers.get("x-middleware-rewrite")).toBe("https://nextstory.marcopontili.com/content/how-it-works.md");
    expect(res.headers.get("vary")).toBe("Accept");
  });

  it("keeps HTML and links the Markdown twin for browsers", () => {
    const res = run("/de/blocks", { accept: "text/html,application/xhtml+xml,*/*;q=0.8" });
    expect(res.headers.get("x-middleware-rewrite")).toBeNull();
    expect(res.headers.get("link")).toMatch(/^<\/content\/de\/blocks\.md>; rel="alternate"; type="text\/markdown", <\/sitemap\.xml>; rel="sitemap"/);
    expect(res.headers.get("vary")).toBe("Accept");
  });

  it("answers 406 when neither HTML nor Markdown is acceptable", () => {
    const res = run("/", { accept: "image/png" });
    expect(res.status).toBe(406);
    expect(res.headers.get("vary")).toBe("Accept");
  });

  it("leaves routes without a Markdown twin and router requests alone", () => {
    expect(run("/privacy", { accept: "image/png" }).status).toBe(200);
    expect(run("/privacy").headers.get("link")).toBeNull();
    expect(run("/blocks", { accept: "image/png", rsc: "1" }).status).toBe(200);
  });
});

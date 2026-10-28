import { describe, expect, it, vi } from "vitest";

import {
  matomoTrackingUrl,
  shouldSkipPath,
  uaIsAiAssistant,
  UA_NEEDLES,
} from "@/lib/ai-assistant";

describe("uaIsAiAssistant", () => {
  it.each(UA_NEEDLES)("matches %s", (needle) => {
    expect(uaIsAiAssistant(`Mozilla/5.0 (compatible; ${needle}/1.0)`)).toBe(true);
  });

  it("matches case-insensitively", () => {
    expect(uaIsAiAssistant("chatgpt-user/1.0")).toBe(true);
  });

  it.each([
    "",
    null,
    undefined,
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/141.0",
    "GPTBot/1.2",
    "ClaudeBot/1.0",
    "Googlebot/2.1",
  ])("ignores %s", (ua) => {
    expect(uaIsAiAssistant(ua)).toBe(false);
  });
});

describe("shouldSkipPath", () => {
  it.each(["/", "/blocks", "/de/blocks", "/privacy", "/llms.txt", "/robots.txt", "/sitemap.xml", "/.well-known/security.txt"])(
    "keeps %s",
    (path) => {
      expect(shouldSkipPath(path)).toBe(false);
    },
  );

  it.each([
    "/_next/static/chunks/main.js",
    "/_next/image",
    "/matomo.js",
    "/og.png",
    "/fonts/a.woff2",
    "/icon.svg?x=1",
    "/app.css",
    "/app.js.map",
  ])("skips %s", (path) => {
    expect(shouldSkipPath(path)).toBe(true);
  });
});

describe("matomoTrackingUrl", () => {
  it("builds the recMode=1 tracking request", () => {
    const url = new URL(
      matomoTrackingUrl("https://nextstory.marcopontili.com/blocks?a=1", "ChatGPT-User/1.0"),
    );
    expect(url.origin + url.pathname).toBe("https://mt.marcopontili.com/m/matomo.php");
    expect(Object.fromEntries(url.searchParams)).toEqual({
      idsite: "5",
      rec: "1",
      recMode: "1",
      url: "https://nextstory.marcopontili.com/blocks?a=1",
      ua: "ChatGPT-User/1.0",
      source: "vercel-middleware",
    });
  });
});

describe("proxy", () => {
  async function run(ua: string, path: string) {
    const { proxy } = await import("@/proxy");
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);
    const waitUntil = vi.fn();
    const request = {
      url: `https://nextstory.marcopontili.com${path}`,
      nextUrl: new URL(`https://nextstory.marcopontili.com${path}`),
      headers: new Headers({ "user-agent": ua }),
    };
    const result = proxy(request as never, { waitUntil } as never);
    return { result, fetchMock, waitUntil };
  }

  it("reports AI-assistant page hits without touching the response", async () => {
    const { result, fetchMock, waitUntil } = await run("Claude-User/1.0", "/blocks");
    expect(result.headers.get("x-middleware-next")).toBe("1");
    expect(result.headers.get("x-middleware-rewrite")).toBeNull();
    expect(result.status).toBe(200);
    expect(waitUntil).toHaveBeenCalledOnce();
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("https://mt.marcopontili.com/m/matomo.php?idsite=5"),
      { method: "GET" },
    );
  });

  it("swallows tracker failures", async () => {
    const { proxy } = await import("@/proxy");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("403")));
    const waitUntil = vi.fn();
    proxy(
      {
        url: "https://nextstory.marcopontili.com/",
        nextUrl: new URL("https://nextstory.marcopontili.com/"),
        headers: new Headers({ "user-agent": "Perplexity-User/1.0" }),
      } as never,
      { waitUntil } as never,
    );
    await expect(waitUntil.mock.calls[0][0]).resolves.toBeUndefined();
  });

  it("passes the path locale to the root layout as a request header", async () => {
    const german = await run("Mozilla/5.0 Chrome/141.0", "/de/blocks");
    expect(german.result.headers.get("x-middleware-request-x-site-locale")).toBe("de");
    const english = await run("Mozilla/5.0 Chrome/141.0", "/denmark");
    expect(english.result.headers.get("x-middleware-request-x-site-locale")).toBe("en");
  });

  it("ignores browsers and static assets", async () => {
    const browser = await run("Mozilla/5.0 Chrome/141.0", "/");
    expect(browser.waitUntil).not.toHaveBeenCalled();
    const asset = await run("ChatGPT-User/1.0", "/og.png");
    expect(asset.waitUntil).not.toHaveBeenCalled();
    expect(asset.fetchMock).not.toHaveBeenCalled();
  });
});

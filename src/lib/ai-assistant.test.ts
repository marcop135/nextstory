import { describe, expect, it, vi } from "vitest";

import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";

import {
  matomoTrackingBody,
  reportAiAssistant,
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

describe("analytics signals", () => {
  it("loads the Matomo container when Do Not Track or Global Privacy Control is on", () => {
    const source = readFileSync(new URL("../../public/matomo.js", import.meta.url), "utf8");
    const load = (nav: { doNotTrack?: string | null; globalPrivacyControl?: boolean }) => {
      const created: string[] = [];
      runInNewContext(source, {
        navigator: nav,
        window: {},
        document: {
          createElement: () => ({ async: false, src: "" }),
          getElementsByTagName: () => [{ parentNode: { insertBefore: (node: { src: string }) => created.push(node.src) } }],
        },
        Date,
      });
      return created;
    };
    const container = ["https://mt.marcopontili.com/c/ZaEgDcKb.js"];
    expect(load({ doNotTrack: "1" })).toEqual(container);
    expect(load({ globalPrivacyControl: true })).toEqual(container);
    expect(load({ doNotTrack: "1", globalPrivacyControl: true })).toEqual(container);
    expect(load({})).toEqual(container);
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

describe("matomoTrackingBody", () => {
  it("builds the recMode=1 tracking request", () => {
    const body = matomoTrackingBody("https://nextstory.marcopontili.com/blocks?a=1", "ChatGPT-User/1.0");
    expect(Object.fromEntries(body)).toEqual({
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
  async function run(ua: string, path: string, extra?: Record<string, string>) {
    const { proxy } = await import("@/proxy");
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);
    const waitUntil = vi.fn();
    const request = {
      url: `https://nextstory.marcopontili.com${path}`,
      nextUrl: new URL(`https://nextstory.marcopontili.com${path}`),
      headers: new Headers({ "user-agent": ua, ...extra }),
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
      "https://mt.marcopontili.com/m/",
      expect.objectContaining({ method: "POST", body: expect.any(URLSearchParams) }),
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

  it("reports AI-assistant hits when Do Not Track or Global Privacy Control is sent", async () => {
    const dnt = await run("Claude-User/1.0", "/blocks", { dnt: "1" });
    expect(dnt.waitUntil).toHaveBeenCalledOnce();
    const gpc = await run("Claude-User/1.0", "/blocks", { "sec-gpc": "1" });
    expect(gpc.waitUntil).toHaveBeenCalledOnce();
    expect(gpc.fetchMock).toHaveBeenCalledOnce();
  });

  it("ignores browsers and static assets", async () => {
    const browser = await run("Mozilla/5.0 Chrome/141.0", "/");
    expect(browser.waitUntil).not.toHaveBeenCalled();
    const asset = await run("ChatGPT-User/1.0", "/og.png");
    expect(asset.waitUntil).not.toHaveBeenCalled();
    expect(asset.fetchMock).not.toHaveBeenCalled();
  });
});

describe("tracker failures", () => {
  it("reports HTTP failures without logging request data or rejecting", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 404 })));
    await expect(reportAiAssistant("https://example.test/?private=value", "ChatGPT-User/1.0")).resolves.toBeUndefined();
    expect(warn).toHaveBeenCalledWith("Matomo AI tracking failed", 404);
    expect(JSON.stringify(warn.mock.calls)).not.toContain("private");
    warn.mockRestore();
    vi.unstubAllGlobals();
  });
});

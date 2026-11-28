import { afterEach, describe, expect, it, vi } from "vitest";

import { TURNSTILE_ACTION, verifyTurnstile } from "./turnstile";

function stubFetch(impl: () => Promise<Response>) {
  const fn = vi.fn(impl);
  vi.stubGlobal("fetch", fn);
  return fn;
}

afterEach(() => vi.unstubAllGlobals());

describe("verifyTurnstile", () => {
  it("rejects an empty token without calling Cloudflare", async () => {
    const fn = stubFetch(async () => Response.json({ success: true }));
    expect(await verifyTurnstile("", "secret")).toBe(false);
    expect(fn).not.toHaveBeenCalled();
  });

  it("posts the secret, token, and a real client IP", async () => {
    const fn = stubFetch(async () => Response.json({ success: true, action: TURNSTILE_ACTION }));
    expect(await verifyTurnstile("tok", "secret", "203.0.113.9")).toBe(true);
    const body = (fn.mock.calls[0] as unknown as [string, RequestInit])[1].body as URLSearchParams;
    expect(body.get("secret")).toBe("secret");
    expect(body.get("response")).toBe("tok");
    expect(body.get("remoteip")).toBe("203.0.113.9");
  });

  it("omits remoteip for the unknown placeholder", async () => {
    const fn = stubFetch(async () => Response.json({ success: true }));
    await verifyTurnstile("tok", "secret", "unknown");
    expect(((fn.mock.calls[0] as unknown as [string, RequestInit])[1].body as URLSearchParams).has("remoteip")).toBe(false);
  });

  it("accepts an empty action (test keys) but rejects a different action", async () => {
    stubFetch(async () => Response.json({ success: true, action: "" }));
    expect(await verifyTurnstile("tok", "secret")).toBe(true);
    stubFetch(async () => Response.json({ success: true, action: "other-form" }));
    expect(await verifyTurnstile("tok", "secret")).toBe(false);
  });

  it("rejects failures, non-OK responses, and network errors", async () => {
    stubFetch(async () => Response.json({ success: false }));
    expect(await verifyTurnstile("tok", "secret")).toBe(false);
    stubFetch(async () => new Response("no", { status: 500 }));
    expect(await verifyTurnstile("tok", "secret")).toBe(false);
    stubFetch(async () => {
      throw new Error("offline");
    });
    expect(await verifyTurnstile("tok", "secret")).toBe(false);
  });
});

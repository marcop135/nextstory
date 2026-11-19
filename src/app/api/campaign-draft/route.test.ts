import { NextRequest } from "next/server";
import { beforeEach, expect, it, vi } from "vitest";

import { readCampaignDraft } from "@/lib/campaign-draft";
import { DELETE, POST } from "./route";

const ORIGIN = "https://nextstory.test";

function request(body: unknown, init: { method?: string; origin?: string | null; type?: string } = {}) {
  const headers: Record<string, string> = { "Content-Type": init.type ?? "application/json" };
  if (init.origin !== null) headers.origin = init.origin ?? ORIGIN;
  const payload = body === undefined ? undefined : typeof body === "string" ? body : JSON.stringify(body);
  return new NextRequest(`${ORIGIN}/api/campaign-draft`, { method: init.method ?? "POST", headers, body: payload });
}

const cookieValue = (response: Response) => /campaign-draft=([^;]*)/.exec(response.headers.get("set-cookie") ?? "")?.[1];

beforeEach(() => {
  vi.stubEnv("STORYBLOK_DELIVERY_API_TOKEN", "");
  vi.stubEnv("CAMPAIGN_DRAFT_SECRET", "draft-secret");
});

it("signs the selection into an httpOnly cookie", async () => {
  const response = await POST(request({ featureUids: ["workshop-feature-1"] }));
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({ ok: true, featureUids: ["workshop-feature-1"] });
  const header = response.headers.get("set-cookie")!;
  expect(header).toMatch(/HttpOnly/i);
  expect(header).toMatch(/SameSite=lax/i);
  expect(header).toMatch(/Secure/i);
  expect(readCampaignDraft(cookieValue(response), "draft-secret")).toEqual(["workshop-feature-1"]);
});

it("accepts the HTML form and redirects to the form on the page that posted it", async () => {
  const form = new URLSearchParams([["locale", "de"], ["featureUids", "workshop-feature-0"], ["featureUids", "workshop-feature-1"]]);
  const response = await POST(request(form.toString(), { type: "application/x-www-form-urlencoded" }));
  expect(response.status).toBe(303);
  expect(response.headers.get("location")).toBe(`${ORIGIN}/de/campaign-workshop?saved=1#workshop-benefits`);
  expect(readCampaignDraft(cookieValue(response), "draft-secret")).toEqual(["workshop-feature-0", "workshop-feature-1"]);
});

it("stores an empty selection when the form has nothing checked", async () => {
  const response = await POST(request("locale=en", { type: "application/x-www-form-urlencoded" }));
  expect(response.headers.get("location")).toBe(`${ORIGIN}/campaign-workshop?saved=1#workshop-benefits`);
  expect(readCampaignDraft(cookieValue(response), "draft-secret")).toEqual([]);
});

it.each([
  ["an unknown feature id", { featureUids: ["workshop-feature-0", "workshop-step-0"] }],
  ["a non-array", { featureUids: "workshop-feature-0" }],
  ["a non-string id", { featureUids: [1] }],
  ["too many ids", { featureUids: Array(11).fill("workshop-feature-0") }],
  ["invalid JSON", "{"],
])("rejects %s", async (_, body) => {
  const response = await POST(request(body));
  expect(response.status).toBe(400);
  expect(response.headers.get("set-cookie")).toBeNull();
});

it("rejects cross-origin and unsupported requests", async () => {
  expect((await POST(request({ featureUids: [] }, { origin: "https://evil.test" }))).status).toBe(403);
  expect((await POST(request({ featureUids: [] }, { origin: null }))).status).toBe(403);
  expect((await POST(request("x", { type: "text/plain" }))).status).toBe(400);
  expect((await DELETE(request(undefined, { method: "DELETE", origin: "https://evil.test" }))).status).toBe(403);
});

it("returns 503 without a signing secret", async () => {
  vi.stubEnv("CAMPAIGN_DRAFT_SECRET", "");
  const response = await POST(request({ featureUids: ["workshop-feature-0"] }));
  expect(response.status).toBe(503);
  expect(response.headers.get("set-cookie")).toBeNull();
});

it("clears the cookie on DELETE", async () => {
  const response = await DELETE(request(undefined, { method: "DELETE" }));
  expect(await response.json()).toEqual({ ok: true, featureUids: [] });
  expect(response.headers.get("set-cookie")).toMatch(/campaign-draft=;.*Max-Age=0/i);
});

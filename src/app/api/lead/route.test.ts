import { NextRequest } from "next/server";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import { resetRateLimit } from "@/lib/lead";
import { POST } from "./route";

const ORIGIN = "https://nextstory.test";
const DE_CONSENT = "Ich bin einverstanden, dass Next Story meine E-Mail-Adresse und Kampagnenquelle in HubSpot (USA) speichert, um diese Demo-Anmeldung zu erfassen. Ich kann die Einwilligung jederzeit widerrufen.";

const valid = {
  email: "reader@example.com",
  consent: true,
  campaign_id: "publishing-workshop",
  page_uri: `${ORIGIN}/de/campaign-workshop?utm_source=test`,
  page_name: "Kampagnen-Workshop",
  referrer: "https://news.example/",
  verification: "turnstile-token",
  utm_source: "test",
  utm_medium: "demo",
  utm_campaign: "alvenmoor",
};

function request(body: unknown, init: { ip?: string; cookie?: string; origin?: string | null; type?: string } = {}) {
  const headers: Record<string, string> = { "Content-Type": init.type ?? "application/json", "x-forwarded-for": init.ip ?? "203.0.113.1" };
  if (init.origin !== null) headers.origin = init.origin ?? ORIGIN;
  if (init.cookie) headers.cookie = init.cookie;
  return new NextRequest(`${ORIGIN}/api/lead`, { method: "POST", headers, body: typeof body === "string" ? body : JSON.stringify(body) });
}

const fetchMock = vi.fn<typeof fetch>();
const siteverify = (success: boolean, action = "campaign-lead") => Response.json({ success, action });
const hubspotCalls = () => fetchMock.mock.calls.filter(([url]) => String(url).startsWith("https://api.hsforms.com"));

beforeEach(() => {
  resetRateLimit();
  fetchMock.mockReset();
  fetchMock.mockImplementation(async (url) => String(url).includes("siteverify") ? siteverify(true) : new Response("{}", { status: 200 }));
  vi.stubGlobal("fetch", fetchMock);
  vi.stubEnv("STORYBLOK_DELIVERY_API_TOKEN", "");
  vi.stubEnv("HUBSPOT_PORTAL_ID", "48834697");
  vi.stubEnv("HUBSPOT_FORM_ID", "form-guid");
  vi.stubEnv("TURNSTILE_SECRET_KEY", "turnstile-secret");
});
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

it("verifies Turnstile and forwards the lead with server-side consent text and locale", async () => {
  const response = await POST(request(valid, { cookie: "hubspotutk=abc123" }));
  expect(await response.json()).toEqual({ ok: true, mode: "hubspot" });
  const [verifyUrl, verifyInit] = fetchMock.mock.calls[0];
  expect(verifyUrl).toBe("https://challenges.cloudflare.com/turnstile/v0/siteverify");
  expect(Object.fromEntries(verifyInit?.body as URLSearchParams)).toEqual({ secret: "turnstile-secret", response: "turnstile-token", remoteip: "203.0.113.1" });
  const [url, init] = hubspotCalls()[0];
  expect(url).toBe("https://api.hsforms.com/submissions/v3/integration/submit/48834697/form-guid");
  const sent = JSON.parse(String(init?.body));
  expect(Object.fromEntries(sent.fields.map((f: { name: string; value: string }) => [f.name, f.value]))).toEqual({
    email: "reader@example.com", campaign_id: "publishing-workshop", page_language: "de", referrer: "https://news.example/",
    utm_source: "test", utm_medium: "demo", utm_campaign: "alvenmoor",
  });
  expect(sent.context).toEqual({ hutk: "abc123", pageUri: valid.page_uri, pageName: valid.page_name });
  expect(sent.legalConsentOptions).toEqual({ consent: { consentToProcess: true, text: DE_CONSENT } });
});

it("ignores consent text and locale supplied by the browser", async () => {
  await POST(request({ ...valid, consent_text: "Anything goes", locale: "en" }));
  const sent = JSON.parse(String(hubspotCalls()[0][1]?.body));
  expect(sent.legalConsentOptions.consent.text).toBe(DE_CONSENT);
  expect(sent.fields).toContainEqual({ objectTypeId: "0-1", name: "page_language", value: "de" });
});

it("answers in demo mode without HubSpot settings and sends nothing to HubSpot", async () => {
  vi.stubEnv("HUBSPOT_FORM_ID", "");
  expect(await (await POST(request(valid))).json()).toEqual({ ok: true, mode: "demo" });
  expect(hubspotCalls()).toHaveLength(0);
});

it("refuses to forward real leads when Turnstile is not configured", async () => {
  vi.stubEnv("TURNSTILE_SECRET_KEY", "");
  const response = await POST(request(valid));
  expect(response.status).toBe(503);
  expect(fetchMock).not.toHaveBeenCalled();
});

it.each([
  ["failed", siteverify(false)],
  ["for another action", siteverify(true, "newsletter")],
  ["unreachable", null],
])("rejects a Turnstile check that is %s", async (_name, result) => {
  fetchMock.mockImplementation(async (url) => {
    if (!String(url).includes("siteverify")) return new Response("{}");
    if (!result) throw new Error("timeout");
    return result;
  });
  const response = await POST(request(valid));
  expect(response.status).toBe(400);
  expect(await response.json()).toEqual({ ok: false, error: "verification_failed" });
  expect(hubspotCalls()).toHaveLength(0);
});

it.each([
  ["a cross-site origin", { origin: "https://evil.example" }],
  ["a missing origin", { origin: null }],
])("rejects %s", async (_name, init) => {
  expect((await POST(request(valid, init))).status).toBe(403);
  expect(fetchMock).not.toHaveBeenCalled();
});

it("rejects non-JSON bodies", async () => {
  expect((await POST(request("email=a", { type: "application/x-www-form-urlencoded" }))).status).toBe(415);
});

it.each([
  ["missing consent", { ...valid, consent: false }, "consent_required"],
  ["invalid email", { ...valid, email: "not-an-email" }, "invalid_request"],
  ["malformed campaign", { ...valid, campaign_id: "Bad Campaign" }, "invalid_request"],
  ["unpublished campaign", { ...valid, campaign_id: "invented-campaign" }, "invalid_request"],
  ["page without the form", { ...valid, page_uri: `${ORIGIN}/how-it-works` }, "invalid_request"],
  ["page on another site", { ...valid, page_uri: "https://elsewhere.example/de/campaign-workshop" }, "invalid_request"],
  ["filled honeypot", { ...valid, website: "https://spam.example" }, "invalid_request"],
  ["non-http page", { ...valid, page_uri: "javascript:alert(1)" }, "invalid_request"],
  ["oversized utm", { ...valid, utm_term: "x".repeat(201) }, "invalid_request"],
  ["array body", [valid], "invalid_request"],
])("rejects %s without contacting HubSpot", async (_name, body, error) => {
  const response = await POST(request(body));
  expect(response.status).toBe(400);
  expect(await response.json()).toEqual({ ok: false, error });
  expect(hubspotCalls()).toHaveLength(0);
});

it("rejects malformed JSON", async () => {
  expect((await POST(request("{"))).status).toBe(400);
});

it("hides HubSpot error bodies", async () => {
  fetchMock.mockImplementation(async (url) => String(url).includes("siteverify") ? siteverify(true) : new Response(JSON.stringify({ message: "FIELD_NOT_IN_FORM_DEFINITION utm_term" }), { status: 400 }));
  const response = await POST(request(valid));
  expect(response.status).toBe(502);
  expect(await response.text()).not.toContain("FIELD_NOT_IN_FORM_DEFINITION");
});

it("reports HubSpot network failures as an upstream error", async () => {
  fetchMock.mockImplementation(async (url) => { if (String(url).includes("siteverify")) return siteverify(true); throw new Error("connect ECONNREFUSED"); });
  const response = await POST(request(valid));
  expect(response.status).toBe(502);
  expect(await response.json()).toEqual({ ok: false, error: "upstream_error" });
});

it("limits each client to five submissions per ten minutes", async () => {
  for (let i = 0; i < 5; i++) expect((await POST(request(valid))).status).toBe(200);
  const limited = await POST(request(valid));
  expect(limited.status).toBe(429);
  expect(Number(limited.headers.get("Retry-After"))).toBeGreaterThan(0);
  expect((await POST(request(valid, { ip: "203.0.113.2" }))).status).toBe(200);
});

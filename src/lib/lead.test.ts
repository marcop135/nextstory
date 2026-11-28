import { beforeEach, describe, expect, it } from "vitest";

import { RATE_LIMIT, hubspotSubmission, parseLead, rateLimit, resetRateLimit } from "./lead";

const valid = {
  email: "a@example.com",
  campaign_id: "spring-2026",
  page_uri: "https://example.com/campaign",
  consent: true,
};

describe("parseLead", () => {
  it("normalizes a valid payload and keeps non-empty UTM keys only", () => {
    const parsed = parseLead({ ...valid, email: "  a@example.com ", utm_source: "news", utm_term: "  " });
    expect(parsed).toEqual({
      input: {
        email: "a@example.com",
        campaign_id: "spring-2026",
        page_uri: "https://example.com/campaign",
        page_name: "",
        referrer: "",
        verification: "",
        utm_source: "news",
      },
    });
  });

  it.each([
    ["non-object", "x"],
    ["array", []],
    ["null", null],
    ["filled honeypot", { ...valid, website: "bot.example" }],
    ["bad email", { ...valid, email: "nope" }],
    ["bad campaign id", { ...valid, campaign_id: "Bad Id" }],
    ["missing page_uri", { ...valid, page_uri: "" }],
    ["non-http page_uri", { ...valid, page_uri: "javascript:alert(1)" }],
    ["non-http referrer", { ...valid, referrer: "ftp://x.example" }],
    ["non-string field", { ...valid, page_name: 5 }],
    ["oversized utm", { ...valid, utm_source: "x".repeat(201) }],
  ])("rejects %s", (_name, body) => {
    expect(parseLead(body)).toEqual({ error: "invalid_request" });
  });

  it("requires consent to be exactly true", () => {
    expect(parseLead({ ...valid, consent: "true" })).toEqual({ error: "consent_required" });
    expect(parseLead({ ...valid, consent: undefined })).toEqual({ error: "consent_required" });
  });
});

describe("hubspotSubmission", () => {
  const lead = {
    email: "a@example.com",
    campaign_id: "spring-2026",
    page_uri: "https://example.com/campaign",
    page_name: "Campaign",
    referrer: "",
    verification: "tok",
    locale: "de",
    consent_text: "I agree",
    utm_source: "news",
  };

  it("sends only non-empty fields and never the page URI or verification token", () => {
    const body = hubspotSubmission(lead, "hutk-1");
    expect(body.fields.map((field) => field.name)).toEqual(["email", "campaign_id", "page_language", "utm_source"]);
    expect(body.context).toEqual({ hutk: "hutk-1", pageName: "Campaign" });
    expect(JSON.stringify(body)).not.toContain("tok");
    expect(body.legalConsentOptions.consent).toEqual({ consentToProcess: true, text: "I agree" });
  });

  it("omits hutk and pageName when absent", () => {
    expect(hubspotSubmission({ ...lead, page_name: "" }).context).toEqual({});
  });
});

describe("rateLimit", () => {
  beforeEach(resetRateLimit);

  it("allows the quota, then returns seconds to wait", () => {
    for (let i = 0; i < RATE_LIMIT.requests; i++) expect(rateLimit("ip", 1000)).toBe(0);
    expect(rateLimit("ip", 1000)).toBe(Math.ceil(RATE_LIMIT.windowMs / 1000));
  });

  it("tracks keys independently and frees the window after it elapses", () => {
    for (let i = 0; i < RATE_LIMIT.requests; i++) rateLimit("ip", 0);
    expect(rateLimit("other", 0)).toBe(0);
    expect(rateLimit("ip", RATE_LIMIT.windowMs)).toBe(0);
  });
});

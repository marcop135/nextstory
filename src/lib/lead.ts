/** Campaign keys shared by Storyblok, HubSpot `campaign_id`, and the Matomo event name. */
export const CAMPAIGN_ID = /^[a-z0-9][a-z0-9-]{0,63}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;

export type LeadError = "invalid_request" | "consent_required" | "forbidden" | "rate_limited" | "verification_failed" | "unavailable" | "upstream_error";

/** Browser input after shape checks; consent text and locale are resolved on the server. */
export type LeadInput = {
  email: string;
  campaign_id: string;
  page_uri: string;
  page_name: string;
  referrer: string;
  verification: string;
} & Partial<Record<(typeof UTM_KEYS)[number], string>>;

export type Lead = LeadInput & { locale: string; consent_text: string };

function text(value: unknown, max: number): string | null {
  if (value === undefined || value === null) return "";
  if (typeof value !== "string" || value.length > max) return null;
  return value.trim();
}

function httpUrl(value: string): boolean {
  if (!value) return true;
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

/** Validate the browser payload. Returns an error code, or the normalized input. */
export function parseLead(body: unknown): { error: LeadError } | { input: LeadInput } {
  if (!body || typeof body !== "object" || Array.isArray(body)) return { error: "invalid_request" };
  const raw = body as Record<string, unknown>;
  // Honeypot: hidden from people, filled by naive bots.
  if (raw.website !== undefined && raw.website !== "") return { error: "invalid_request" };
  if (raw.consent !== true) return { error: "consent_required" };

  const email = text(raw.email, 254);
  const campaignId = text(raw.campaign_id, 64);
  const pageUri = text(raw.page_uri, 2000);
  const pageName = text(raw.page_name, 200);
  const referrer = text(raw.referrer, 2000);
  const verification = text(raw.verification, 2048);
  if (!email || !EMAIL.test(email) || !campaignId || !CAMPAIGN_ID.test(campaignId) || !pageUri) return { error: "invalid_request" };
  if (pageName === null || referrer === null || verification === null || !httpUrl(pageUri) || !httpUrl(referrer)) return { error: "invalid_request" };

  const input: LeadInput = { email, campaign_id: campaignId, page_uri: pageUri, page_name: pageName, referrer, verification };
  for (const key of UTM_KEYS) {
    const value = text(raw[key], 200);
    if (value === null) return { error: "invalid_request" };
    if (value) input[key] = value;
  }
  return { input };
}

/** HubSpot Forms API v3 submission body. Fields must exist on the form. */
export function hubspotSubmission(lead: Lead, hutk?: string) {
  const values: [string, string | undefined][] = [
    ["email", lead.email],
    ["campaign_id", lead.campaign_id],
    ["page_language", lead.locale],
    ["referrer", lead.referrer],
    ...UTM_KEYS.map((key) => [key, lead[key]] as [string, string | undefined]),
  ];
  return {
    submittedAt: Date.now(),
    fields: values.filter(([, value]) => value).map(([name, value]) => ({ objectTypeId: "0-1", name, value })),
    // HubSpot accepts but silently drops submissions whose context carries a pageUri
    // (verified 2026-11-06), so the page is identified by pageName and the UTM fields.
    context: {
      ...(hutk ? { hutk } : {}),
      ...(lead.page_name ? { pageName: lead.page_name } : {}),
    },
    legalConsentOptions: { consent: { consentToProcess: true, text: lead.consent_text } },
  };
}

export const RATE_LIMIT = { requests: 5, windowMs: 10 * 60 * 1000 };
const hits = new Map<string, number[]>();

/**
 * Per-instance, in-memory limit: 5 submissions per IP per 10 minutes. Serverless
 * instances do not share it, so it backs up Turnstile rather than enforcing a
 * global quota. Returns seconds to wait, or 0.
 */
export function rateLimit(key: string, now = Date.now()): number {
  const recent = (hits.get(key) ?? []).filter((time) => now - time < RATE_LIMIT.windowMs);
  if (recent.length >= RATE_LIMIT.requests) {
    hits.set(key, recent);
    return Math.ceil((recent[0] + RATE_LIMIT.windowMs - now) / 1000);
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 10_000) hits.delete(hits.keys().next().value!);
  return 0;
}

export function resetRateLimit() {
  hits.clear();
}

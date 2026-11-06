import type { NextRequest } from "next/server";

import { publishedCampaignForm } from "@/lib/campaigns";
import { hubspotSubmission, parseLead, rateLimit, type LeadError } from "@/lib/lead";
import { verifyTurnstile } from "@/lib/turnstile";

const HUBSPOT_SUBMIT = "https://api.hsforms.com/submissions/v3/integration/submit";
const noStore = { "Cache-Control": "no-store" };

function fail(error: LeadError, status: number, headers?: HeadersInit) {
  return Response.json({ ok: false, error }, { status, headers: { ...noStore, ...headers } });
}

function clientIp(request: NextRequest): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

/**
 * Campaign lead intake: same-origin JSON only, rate-limited, bot-checked with
 * Cloudflare Turnstile, then forwarded to the HubSpot Forms API. The consent
 * text and locale come from the published Storyblok form, not the browser.
 * Without HUBSPOT_PORTAL_ID and HUBSPOT_FORM_ID it validates and answers in
 * demo mode, storing nothing. Upstream error bodies are never echoed.
 */
export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin !== request.nextUrl.origin) return fail("forbidden", 403);
  if (!request.headers.get("content-type")?.startsWith("application/json")) return fail("invalid_request", 415);

  const ip = clientIp(request);
  const wait = rateLimit(ip);
  if (wait) return fail("rate_limited", 429, { "Retry-After": String(wait) });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail("invalid_request", 400);
  }
  const parsed = parseLead(body);
  if ("error" in parsed) return fail(parsed.error, 400);
  const { input } = parsed;

  const page = new URL(input.page_uri);
  if (page.origin !== request.nextUrl.origin) return fail("invalid_request", 400);
  let form: Awaited<ReturnType<typeof publishedCampaignForm>>;
  try {
    form = await publishedCampaignForm(page.pathname, input.campaign_id);
  } catch {
    return fail("unavailable", 503);
  }
  if (!form) return fail("invalid_request", 400);

  const portalId = process.env.HUBSPOT_PORTAL_ID?.trim();
  const formId = process.env.HUBSPOT_FORM_ID?.trim();
  const turnstileSecret = process.env.TURNSTILE_SECRET_KEY?.trim();
  if (turnstileSecret && !(await verifyTurnstile(input.verification, turnstileSecret, ip))) return fail("verification_failed", 400);
  if (!portalId || !formId) return Response.json({ ok: true, mode: "demo" }, { headers: noStore });
  // Never forward real leads without bot protection.
  if (!turnstileSecret) return fail("unavailable", 503);

  const lead = { ...input, locale: form.locale, consent_text: form.consentText };
  try {
    const response = await fetch(`${HUBSPOT_SUBMIT}/${encodeURIComponent(portalId)}/${encodeURIComponent(formId)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(hubspotSubmission(lead, request.cookies.get("hubspotutk")?.value)),
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return fail("upstream_error", 502);
  } catch {
    return fail("upstream_error", 502);
  }
  return Response.json({ ok: true, mode: "hubspot" }, { headers: noStore });
}

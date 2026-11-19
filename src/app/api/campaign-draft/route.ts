import { NextResponse, type NextRequest } from "next/server";

import {
  CAMPAIGN_DRAFT_COOKIE,
  CAMPAIGN_DRAFT_GRID,
  CAMPAIGN_DRAFT_MAX_AGE,
  CAMPAIGN_DRAFT_SLUG,
  campaignDraftSecret,
  campaignPath,
  publishedFeatureUids,
  signCampaignDraft,
} from "@/lib/campaign-draft";
import { fetchStory } from "@/lib/fetch-story";
import { defaultLocale, isLocale } from "@/lib/i18n";

const noStore = { "Cache-Control": "no-store" };
const MAX_IDS = 10;

function fail(error: string, status: number) {
  return Response.json({ ok: false, error }, { status, headers: noStore });
}

type Submission = { featureUids: unknown; locale?: string; form: boolean };

async function readSubmission(request: NextRequest): Promise<Submission | null> {
  const type = request.headers.get("content-type") ?? "";
  try {
    if (type.startsWith("application/json")) {
      const body = (await request.json()) as { featureUids?: unknown } | null;
      return { featureUids: body?.featureUids, form: false };
    }
    if (type.startsWith("application/x-www-form-urlencoded") || type.startsWith("multipart/form-data")) {
      const data = await request.formData();
      const locale = data.get("locale");
      return { featureUids: data.getAll("featureUids"), locale: typeof locale === "string" ? locale : undefined, form: true };
    }
  } catch {
    return null;
  }
  return null;
}

const cookieOptions = (request: NextRequest) => ({
  httpOnly: true,
  sameSite: "lax" as const,
  secure: request.nextUrl.protocol === "https:",
  path: "/",
});

/**
 * Store the campaign features a visitor chose in a signed httpOnly cookie.
 * Accepts same-origin JSON (`{ featureUids }`) or the campaign page's HTML
 * form, which is redirected back to the form on the page that posted it. Each id must be
 * a feature the published campaign story still has.
 */
export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== request.nextUrl.origin) return fail("forbidden", 403);
  const secret = campaignDraftSecret();
  if (!secret) return fail("unavailable", 503);

  const submission = await readSubmission(request);
  if (!submission) return fail("invalid_request", 400);
  const { featureUids } = submission;
  if (!Array.isArray(featureUids) || featureUids.length > MAX_IDS || featureUids.some((id) => typeof id !== "string")) {
    return fail("invalid_request", 400);
  }

  let published: string[];
  try {
    const result = await fetchStory(CAMPAIGN_DRAFT_SLUG, undefined, { version: "published" });
    if (!result) return fail("unavailable", 503);
    published = publishedFeatureUids(result.story.content);
  } catch {
    return fail("unavailable", 503);
  }
  const selected = [...new Set(featureUids as string[])];
  if (selected.some((id) => !published.includes(id))) return fail("invalid_request", 400);
  const locale = submission.locale && isLocale(submission.locale) ? submission.locale : defaultLocale;
  if (selected.length === 0) {
    if (!submission.form) return fail("invalid_request", 400);
    const response = NextResponse.redirect(new URL(`${campaignPath(locale)}?error=empty#${CAMPAIGN_DRAFT_GRID}`, request.nextUrl.origin), 303);
    response.headers.set("Cache-Control", "no-store");
    return response;
  }

  const value = signCampaignDraft(selected, secret);
  const response = submission.form
    ? NextResponse.redirect(new URL(`${campaignPath(locale)}?saved=1#${CAMPAIGN_DRAFT_GRID}`, request.nextUrl.origin), 303)
    : NextResponse.json({ ok: true, featureUids: published.filter((id) => selected.includes(id)) });
  response.headers.set("Cache-Control", "no-store");
  response.cookies.set(CAMPAIGN_DRAFT_COOKIE, value, { ...cookieOptions(request), maxAge: CAMPAIGN_DRAFT_MAX_AGE });
  return response;
}

/** Clear the selection. */
export async function DELETE(request: NextRequest) {
  if (request.headers.get("origin") !== request.nextUrl.origin) return fail("forbidden", 403);
  const response = NextResponse.json({ ok: true, featureUids: [] }, { headers: noStore });
  response.cookies.set(CAMPAIGN_DRAFT_COOKIE, "", { ...cookieOptions(request), maxAge: 0 });
  return response;
}

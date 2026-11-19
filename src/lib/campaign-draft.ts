import { createHmac, timingSafeEqual } from "node:crypto";

import type { FeatureBlok, FeatureGridBlok } from "@/components/types";
import type { Locale } from "@/lib/i18n";
import { publicPathForSlug } from "@/lib/story-path";

export const CAMPAIGN_DRAFT_COOKIE = "campaign-draft";
export const CAMPAIGN_DRAFT_ID = "publishing-workshop";
export const CAMPAIGN_DRAFT_SLUG = "campaign-workshop";
export const CAMPAIGN_DRAFT_GRID = "workshop-benefits";
export const CAMPAIGN_DRAFT_FEATURES: readonly string[] = ["workshop-feature-0", "workshop-feature-1"];
export const CAMPAIGN_DRAFT_MAX_AGE = 60 * 60 * 24 * 30;
/** Registered block name that renders the campaign grid as a checkbox form. */
export const CAMPAIGN_FEATURE_FORM = "campaign_feature_form";

type Blok = { _uid?: string; component?: string; [key: string]: unknown };
type Draft = { campaignId: string; featureUids: string[] };

export type CampaignFeatureFormBlok = Pick<FeatureGridBlok, "_uid" | "_editable" | "headline" | "features"> & {
  component: typeof CAMPAIGN_FEATURE_FORM;
  locale: Locale;
  selected: string[];
};

export function campaignDraftSecret(): string | null {
  return process.env.CAMPAIGN_DRAFT_SECRET?.trim() || null;
}

export const campaignPath = (locale: Locale) => publicPathForSlug(CAMPAIGN_DRAFT_SLUG, locale);
export const campaignDraftPath = (locale: Locale) => `${campaignPath(locale)}/draft`;

const sign = (payload: string, secret: string) => createHmac("sha256", secret).update(payload).digest("base64url");

/** Keep allow-listed ids only, deduplicated, in the order of the allow-list. */
export function allowedFeatureUids(ids: readonly string[]): string[] {
  return CAMPAIGN_DRAFT_FEATURES.filter((uid) => ids.includes(uid));
}

export function signCampaignDraft(featureUids: readonly string[], secret: string): string {
  const draft: Draft = { campaignId: CAMPAIGN_DRAFT_ID, featureUids: allowedFeatureUids(featureUids) };
  const payload = Buffer.from(JSON.stringify(draft)).toString("base64url");
  return `${payload}.${sign(payload, secret)}`;
}

/** The selected feature ids, or an empty selection for any missing, tampered, or foreign cookie. */
export function readCampaignDraft(value: string | null | undefined, secret: string | null): string[] {
  if (!value || !secret) return [];
  const [payload, signature, extra] = value.split(".");
  if (!payload || !signature || extra !== undefined) return [];
  const expected = Buffer.from(sign(payload, secret));
  const given = Buffer.from(signature);
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return [];
  let draft: unknown;
  try {
    draft = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    return [];
  }
  if (!draft || typeof draft !== "object") return [];
  const { campaignId, featureUids } = draft as Partial<Draft>;
  if (campaignId !== CAMPAIGN_DRAFT_ID || !Array.isArray(featureUids)) return [];
  if (featureUids.some((uid) => typeof uid !== "string" || !CAMPAIGN_DRAFT_FEATURES.includes(uid))) return [];
  return allowedFeatureUids(featureUids);
}

function findGrid(content: unknown): FeatureGridBlok | undefined {
  const body = (content as { body?: Blok[] } | null)?.body;
  return body?.find((blok) => blok._uid === CAMPAIGN_DRAFT_GRID && blok.component === "feature_grid") as FeatureGridBlok | undefined;
}

/** Allow-listed feature ids that the given story content actually publishes in the campaign grid. */
export function publishedFeatureUids(content: unknown): string[] {
  const features = findGrid(content)?.features ?? [];
  return allowedFeatureUids(features.map((feature: FeatureBlok) => feature._uid ?? ""));
}

function mapBody<T extends object>(content: T, map: (blok: Blok) => Blok | null): T {
  const source = (content as { body?: unknown }).body;
  const body = Array.isArray(source) ? (source as Blok[]) : [];
  return { ...content, body: body.map(map).filter((blok): blok is Blok => blok !== null) };
}

/** Campaign page: the benefits grid becomes a checkbox form that reflects the cookie. */
export function withCampaignFeatureForm<T extends object>(content: T, selected: string[], locale: Locale): T {
  return mapBody(content, (blok) =>
    blok._uid === CAMPAIGN_DRAFT_GRID && blok.component === "feature_grid"
      ? { ...blok, component: CAMPAIGN_FEATURE_FORM, selected, locale }
      : blok,
  );
}

/** Draft page: only the selected features, no grid without a selection, and no lead form. */
export function campaignDraftContent<T extends object>(content: T, selected: string[]): T {
  return mapBody(content, (blok) => {
    if (blok.component === "campaign_action") return null;
    if (blok._uid !== CAMPAIGN_DRAFT_GRID || blok.component !== "feature_grid") return blok;
    const features = ((blok as FeatureGridBlok).features ?? []).filter((feature) => selected.includes(feature._uid ?? ""));
    return features.length ? { ...blok, features } : null;
  });
}

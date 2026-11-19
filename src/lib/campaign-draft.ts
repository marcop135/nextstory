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
  saved?: boolean;
  /** The visitor submitted the form with no feature checked. */
  empty?: boolean;
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
export function withCampaignFeatureForm<T extends object>(content: T, selected: string[], locale: Locale, saved = false, empty = false): T {
  return mapBody(content, (blok) =>
    blok._uid === CAMPAIGN_DRAFT_GRID && blok.component === "feature_grid"
      ? { ...blok, component: CAMPAIGN_FEATURE_FORM, selected, locale, saved, empty }
      : blok,
  );
}

/** Titles of the selected features, in the published grid's order. */
export function selectedFeatureTitles(content: unknown, selected: string[]): string[] {
  return (findGrid(content)?.features ?? [])
    .filter((feature) => selected.includes(feature._uid ?? ""))
    .map((feature) => feature.title);
}

const draftHero = {
  en: { eyebrow: "Your workshop draft", headline: (topics: string) => `Your workshop: ${topics}`, join: " and ", lead: "Built from the features you picked on the campaign page." },
  de: { eyebrow: "Ihr Workshop-Entwurf", headline: (topics: string) => `Ihr Workshop: ${topics}`, join: " und ", lead: "Zusammengestellt aus den Inhalten, die Sie auf der Kampagnenseite gewählt haben." },
};

/**
 * Draft page: the hero names the selected features, the grid keeps only those
 * and moves up under the hero, and the lead form is dropped. Without a
 * selection the hero stays as published and the grid is removed.
 */
export function campaignDraftContent<T extends object>(content: T, selected: string[], locale: Locale): T {
  const titles = selectedFeatureTitles(content, selected);
  const copy = draftHero[locale];
  const mapped = mapBody(content, (blok) => {
    if (blok.component === "campaign_action") return null;
    if (blok.component === "hero" && titles.length) {
      return { ...blok, eyebrow: copy.eyebrow, headline: copy.headline(titles.join(copy.join)), subheadline: copy.lead };
    }
    if (blok._uid !== CAMPAIGN_DRAFT_GRID || blok.component !== "feature_grid") return blok;
    const features = ((blok as FeatureGridBlok).features ?? []).filter((feature) => selected.includes(feature._uid ?? ""));
    return features.length ? { ...blok, features } : null;
  });
  const body = (mapped as { body: Blok[] }).body;
  const grid = body.findIndex((blok) => blok._uid === CAMPAIGN_DRAFT_GRID);
  const hero = body.findIndex((blok) => blok.component === "hero");
  if (grid > hero + 1) body.splice(hero + 1, 0, ...body.splice(grid, 1));
  return mapped;
}

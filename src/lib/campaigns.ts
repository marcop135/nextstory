import type { CampaignActionBlok, CampaignBriefBlok } from "@/components/types";
import { fetchStory } from "@/lib/fetch-story";
import { locales, storyblokLanguage, type Locale } from "@/lib/i18n";
import { parseStorySegments } from "@/lib/story-path";
import { publishedPageSlugs } from "@/lib/published-slugs";
import { SITE_URL } from "@/lib/site";

export type CampaignSummary = {
  campaign_id: string;
  locale: string;
  page_url: string;
  audience: string;
  goal: string;
  measure: string;
};

function briefs(value: unknown): CampaignBriefBlok[] {
  if (Array.isArray(value)) return value.flatMap(briefs);
  if (!value || typeof value !== "object") return [];
  const node = value as Record<string, unknown>;
  const own = node.component === "campaign_brief" ? [node as CampaignBriefBlok] : [];
  return [...own, ...Object.values(node).flatMap(briefs)];
}

function actions(value: unknown): CampaignActionBlok[] {
  if (Array.isArray(value)) return value.flatMap(actions);
  if (!value || typeof value !== "object") return [];
  const node = value as Record<string, unknown>;
  const own = node.component === "campaign_action" ? [node as CampaignActionBlok] : [];
  return [...own, ...Object.values(node).flatMap(actions)];
}

/**
 * The published campaign form behind a page path: its locale and consent text.
 * Returns null when the page or a form with that campaign_id is not published,
 * so the browser can neither invent campaigns nor rewrite the consent record.
 */
export async function publishedCampaignForm(pathname: string, campaignId: string): Promise<{ locale: Locale; consentText: string } | null> {
  const { locale, slug } = parseStorySegments(pathname.split("/"));
  const result = await fetchStory(slug, storyblokLanguage(locale), { version: "published" });
  if (!result || result.story.content.component !== "page") return null;
  const form = actions(result.story.content.body).find((action) => action.campaign_id === campaignId);
  return form?.consent_label ? { locale, consentText: form.consent_label } : null;
}

/** Campaign briefs on published pages, in every site language. Drafts are never requested. */
export async function publishedCampaigns(): Promise<CampaignSummary[]> {
  const slugs = await publishedPageSlugs();
  const campaigns: CampaignSummary[] = [];
  for (const slug of slugs) {
    for (const locale of locales) {
      const result = await fetchStory(slug, storyblokLanguage(locale), { version: "published" });
      if (!result || result.story.content.component !== "page") continue;
      const path = `${locale === "en" ? "" : `/${locale}`}${slug === "home" ? "" : `/${slug}`}` || "/";
      for (const brief of briefs(result.story.content.body)) {
        if (!brief.campaign_id) continue;
        campaigns.push({ campaign_id: brief.campaign_id, locale, page_url: SITE_URL + path, audience: brief.audience, goal: brief.goal, measure: brief.measure });
      }
    }
  }
  return campaigns;
}

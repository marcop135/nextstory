import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";

import StoryRenderer from "@/components/StoryRenderer";
import {
  CAMPAIGN_DRAFT_COOKIE,
  CAMPAIGN_DRAFT_SLUG,
  campaignDraftContent,
  campaignDraftSecret,
  campaignPath,
  readCampaignDraft,
} from "@/lib/campaign-draft";
import { fetchStory } from "@/lib/fetch-story";
import { storyblokLanguage, type Locale } from "@/lib/i18n";

const copy = {
  en: {
    title: "Your campaign workshop draft | Next Story",
    empty: "No workshop features chosen yet.",
    back: "Choose them on the campaign page",
  },
  de: {
    title: "Ihr Kampagnen-Workshop-Entwurf | Next Story",
    empty: "Noch keine Workshop-Inhalte ausgewählt.",
    back: "Auf der Kampagnenseite auswählen",
  },
};

export function campaignDraftMetadata(locale: Locale): Metadata {
  return { title: { absolute: copy[locale].title }, robots: { index: false, follow: false } };
}

/** The campaign story, rendered per request with only the features in the visitor's cookie. */
export default async function CampaignDraftPage({ locale }: { locale: Locale }) {
  const result = await fetchStory(CAMPAIGN_DRAFT_SLUG, storyblokLanguage(locale), { version: "published" });
  if (!result) notFound();
  const selected = readCampaignDraft((await cookies()).get(CAMPAIGN_DRAFT_COOKIE)?.value, campaignDraftSecret());
  const story = { ...result.story, content: campaignDraftContent(result.story.content, selected) };
  return (
    <>
      {selected.length ? null : (
        <aside className="wrap toolbar" aria-label={copy[locale].empty}>
          <span>{copy[locale].empty}</span> <Link href={campaignPath(locale)}>{copy[locale].back}</Link>
        </aside>
      )}
      <StoryRenderer story={story} source={result.source} />
    </>
  );
}

import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";

import StoryRenderer from "@/components/StoryRenderer";
import {
  CAMPAIGN_DRAFT_COOKIE,
  CAMPAIGN_DRAFT_GRID,
  CAMPAIGN_DRAFT_SLUG,
  campaignDraftContent,
  campaignDraftSecret,
  campaignPath,
  readCampaignDraft,
  selectedFeatureTitles,
} from "@/lib/campaign-draft";
import { fetchStory } from "@/lib/fetch-story";
import { storyblokLanguage, type Locale } from "@/lib/i18n";

const copy = {
  en: {
    title: "Your campaign workshop draft | Next Story",
    label: "Your workshop draft",
    picked: "Built from the features you picked:",
    empty: "No workshop features chosen yet.",
    back: "Choose them on the campaign page",
    change: "Change your picks",
  },
  de: {
    title: "Ihr Kampagnen-Workshop-Entwurf | Next Story",
    label: "Ihr Workshop-Entwurf",
    picked: "Zusammengestellt aus Ihrer Auswahl:",
    empty: "Noch keine Workshop-Inhalte ausgewählt.",
    back: "Auf der Kampagnenseite auswählen",
    change: "Auswahl ändern",
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
  const titles = selectedFeatureTitles(result.story.content, selected);
  const story = { ...result.story, content: campaignDraftContent(result.story.content, selected, locale) };
  const text = copy[locale];
  const formPath = `${campaignPath(locale)}#${CAMPAIGN_DRAFT_GRID}`;
  return (
    <>
      <aside className="draft-banner" aria-label={text.label}>
        <div className="wrap draft-banner__inner">
          {titles.length ? (
            <>
              <p><strong>{text.label}.</strong> {text.picked} {titles.join(", ")}.</p>
              <Link href={formPath}>{text.change}</Link>
            </>
          ) : (
            <>
              <p>{text.empty}</p>
              <Link href={formPath}>{text.back}</Link>
            </>
          )}
        </div>
      </aside>
      <StoryRenderer story={story} source={result.source} />
    </>
  );
}

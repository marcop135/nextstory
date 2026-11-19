import type { ISbStoryData } from "@storyblok/react";
import {
  StoryblokServerComponent,
  StoryblokStory,
} from "@storyblok/react/rsc";

import { CAMPAIGN_DRAFT_SLUG, withCampaignFeatureForm } from "@/lib/campaign-draft";
import type { Locale } from "@/lib/i18n";
import { registerStoryblokComponents } from "@/lib/storyblok";

type Props = {
  story: ISbStoryData;
  source: "storyblok" | "mock";
  preview?: boolean;
  /** Campaign page only: render the benefits grid as a form with these features checked. */
  campaignSelection?: { selected: string[]; locale: Locale; saved?: boolean };
};

export default function StoryRenderer({ story, source, preview = false, campaignSelection }: Props) {
  registerStoryblokComponents();
  if (preview && source === "storyblok") return <StoryblokStory story={story} />;
  const content = campaignSelection && story.slug === CAMPAIGN_DRAFT_SLUG
    ? withCampaignFeatureForm(story.content, campaignSelection.selected, campaignSelection.locale, campaignSelection.saved)
    : story.content;
  // Public renders must not consume the SDK's process-wide live-editing cache.
  return <StoryblokServerComponent blok={content} />;
}

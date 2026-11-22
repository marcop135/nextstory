import { setComponents } from "@storyblok/react/rsc";

import Accordion from "@/components/blocks/Accordion";
import CampaignBrief from "@/components/campaign/CampaignBrief";
import CampaignAction from "@/components/campaign/CampaignAction";
import CampaignFeatureForm from "@/components/campaign/CampaignFeatureForm";
import AccordionItem from "@/components/blocks/AccordionItem";
import ComparisonTable from "@/components/blocks/ComparisonTable";
import CodeExample from "@/components/blocks/CodeExample";
import CtaBand from "@/components/blocks/CtaBand";
import Feature from "@/components/blocks/Feature";
import FeatureGrid from "@/components/blocks/FeatureGrid";
import Hero from "@/components/blocks/Hero";
import ImageText from "@/components/blocks/ImageText";
import Page from "@/components/blocks/Page";
import PullQuote from "@/components/blocks/PullQuote";
import RichText from "@/components/blocks/RichText";
import Step from "@/components/blocks/Step";
import Steps from "@/components/blocks/Steps";
import RelatedContent from "@/components/blocks/RelatedContent";
import LearningNote from "@/components/blocks/LearningNote";

export const storyblokComponents = {
  campaign_brief: CampaignBrief,
  campaign_action: CampaignAction,
  campaign_feature_form: CampaignFeatureForm,
  related_content: RelatedContent,
  learning_note: LearningNote,
  page: Page,
  hero: Hero,
  feature_grid: FeatureGrid,
  feature: Feature,
  steps: Steps,
  step: Step,
  rich_text: RichText,
  cta_band: CtaBand,
  image_text: ImageText,
  accordion: Accordion,
  accordion_item: AccordionItem,
  pull_quote: PullQuote,
  comparison_table: ComparisonTable,
  code_example: CodeExample,
};

export function hasStoryblokToken(): boolean {
  return Boolean(process.env.STORYBLOK_DELIVERY_API_TOKEN?.trim());
}

export function registerStoryblokComponents(): void {
  setComponents(storyblokComponents);
}

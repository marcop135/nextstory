import { setComponents } from "@storyblok/react/rsc";

import Accordion from "@/components/Accordion";
import AccordionItem from "@/components/AccordionItem";
import ComparisonTable from "@/components/ComparisonTable";
import CodeExample from "@/components/CodeExample";
import CtaBand from "@/components/CtaBand";
import Feature from "@/components/Feature";
import FeatureGrid from "@/components/FeatureGrid";
import Hero from "@/components/Hero";
import ImageText from "@/components/ImageText";
import Page from "@/components/Page";
import PullQuote from "@/components/PullQuote";
import RichText from "@/components/RichText";
import Step from "@/components/Step";
import Steps from "@/components/Steps";
import RelatedContent from "@/components/RelatedContent";
import LearningNote from "@/components/LearningNote";

export const storyblokComponents = {
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

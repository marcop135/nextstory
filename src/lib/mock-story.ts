import type { ISbStoryData } from "@storyblok/react";

import { localizeContent } from "@/lib/localize";
import blocks from "../../storyblok/stories/blocks.json";
import config from "../../storyblok/stories/config.json";
import home from "../../storyblok/stories/home.json";
import howItWorks from "../../storyblok/stories/how-it-works.json";
import pricing from "../../storyblok/stories/pricing.json";
import relationships from "../../storyblok/stories/content-relationships.json";
import invalidation from "../../storyblok/stories/cache-invalidation.json";
import { attachRelatedNotes } from "@/lib/related-content";

type SeedStory = { name: string; slug: string; uuid?: string; content: Record<string, unknown> };

/**
 * Offline stories so `npm run dev` works before a Storyblok space exists.
 * They are the same seed files `npm run storyblok:push` sends to the space.
 */
const seeds: SeedStory[] = [home, howItWorks, blocks, pricing, config, relationships, invalidation];

function toStory(seed: SeedStory, index: number, language?: string): ISbStoryData {
  const id = index + 1;
  const uuid = seed.uuid ?? `00000000-0000-0000-0000-${String(id).padStart(12, "0")}`;
  return {
    name: seed.name,
    created_at: "2026-10-09T00:00:00.000Z",
    published_at: null,
    id,
    uuid,
    slug: seed.slug,
    full_slug: seed.slug,
    sort_by_date: null,
    position: index,
    tag_list: [],
    is_startpage: false,
    parent_id: 0,
    meta_data: null,
    group_id: uuid,
    first_published_at: null,
    release_id: null,
    lang: language ?? "default",
    path: null,
    alternates: [],
    default_full_slug: null,
    translated_slugs: null,
    content: localizeContent(seed.content, language),
  } as unknown as ISbStoryData;
}

/** Slugs of the offline stories that render as pages. */
export const mockPageSlugs = seeds
  .filter((seed) => ["page", "learning_note"].includes(String(seed.content.component)))
  .map((seed) => seed.slug);

export function mockStoryForSlug(slug: string, language?: string): ISbStoryData | null {
  const path = slug === "" ? "home" : slug;
  const index = seeds.findIndex((seed) => seed.slug === path);
  if (index === -1) return null;
  const story = toStory(seeds[index], index, language);
  story.content = attachRelatedNotes(story.content, seeds.map((seed, i) => toStory(seed, i, language)), language);
  return story;
}

export const mockHomeStory = mockStoryForSlug("home")!;

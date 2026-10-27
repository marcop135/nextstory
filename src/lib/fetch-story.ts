import { draftMode } from "next/headers";
import type { ISbStoryData } from "@storyblok/react";

import { mockStoryForSlug } from "@/lib/mock-story";
import { hasStoryblokToken } from "@/lib/storyblok";
import { storyblokCacheTag, storyCacheTag, relatedContentCacheTag } from "@/lib/story-cache";
import { attachRelatedNotes, relatedUuids } from "@/lib/related-content";
import { normalizeStorySlug } from "@/lib/story-path";

export type StoryResult = {
  story: ISbStoryData;
  source: "storyblok" | "mock";
};

async function resolveVersion(): Promise<"draft" | "published"> {
  const { isEnabled } = await draftMode();
  if (isEnabled) return "draft";
  if (process.env.NODE_ENV === "production") return "published";
  return process.env.STORYBLOK_VERSION === "published" ? "published" : "draft";
}

export function cdnBaseUrl(): string {
  const region = (process.env.STORYBLOK_REGION || "eu").trim();
  // EU host is api.storyblok.com (not api-eu).
  const host =
    region === "eu" ? "api.storyblok.com" : `api-${region}.storyblok.com`;
  return `https://${host}/v2`;
}

export async function fetchStory(
  slug: string,
  language?: string,
  options?: { version: "draft" | "published" },
): Promise<StoryResult | null> {
  const path = normalizeStorySlug(slug);
  if (!path) return null;

  if (!hasStoryblokToken()) {
    const mock = mockStoryForSlug(path, language);
    return mock ? { story: mock, source: "mock" } : null;
  }

  const version = options?.version ?? (await resolveVersion());
  const token = process.env.STORYBLOK_DELIVERY_API_TOKEN!.trim();
  const params = new URLSearchParams({
    version,
    token,
  });
  if (language && language !== "default") {
    params.set("language", language);
  }

  const encodedPath = path.split("/").map(encodeURIComponent).join("/");
  const url = `${cdnBaseUrl()}/cdn/stories/${encodedPath}?${params}`;

  let res: Response;
  try {
    res = await fetch(url, {
      headers: { Accept: "application/json" },
      // Draft preview must stay fresh; published can be cached via revalidate route.
      cache: version === "draft" ? "no-store" : "force-cache",
      next: version === "published"
        ? { revalidate: 60, tags: [storyblokCacheTag, storyCacheTag(path)] }
        : undefined,
    });
  } catch {
    // Fetch errors can contain the request URL, including its delivery token.
    throw new Error("Storyblok request failed");
  }
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Storyblok request failed (${res.status})`);

  let data: { story?: ISbStoryData } | null;
  try {
    data = await res.json();
  } catch {
    throw new Error("Invalid Storyblok response");
  }
  if (!data?.story?.content || typeof data.story.full_slug !== "string") {
    throw new Error("Invalid Storyblok response");
  }
  const uuids = relatedUuids(data.story.content);
  if (uuids.length) {
    const stories = await fetchRelatedStories(uuids, language, version);
    data.story.content = attachRelatedNotes(data.story.content, stories, language);
  }
  return { story: data.story, source: "storyblok" };
}

/** Server-side resolver also used when live-editor input replaces the story payload. */
export async function fetchRelatedStories(uuids: string[], language?: string, requestedVersion?: "draft" | "published"): Promise<ISbStoryData[]> {
  if (!uuids.length || !hasStoryblokToken()) return [];
  const version = requestedVersion ?? await resolveVersion();
  const distinct = [...new Set(uuids)];
  const stories: ISbStoryData[] = [];
  for (let offset = 0; offset < distinct.length; offset += 100) {
    const relatedParams = new URLSearchParams({ version, token: process.env.STORYBLOK_DELIVERY_API_TOKEN!.trim() });
    if (language && language !== "default") relatedParams.set("language", language);
    relatedParams.set("by_uuids", distinct.slice(offset, offset + 100).join(","));
    relatedParams.set("per_page", "100");
    let related: Response;
    try {
      related = await fetch(`${cdnBaseUrl()}/cdn/stories?${relatedParams}`, {
        headers: { Accept: "application/json" },
        cache: version === "draft" ? "no-store" : "force-cache",
        next: version === "published" ? { revalidate: 60, tags: [storyblokCacheTag, relatedContentCacheTag] } : undefined,
      });
    } catch {
      throw new Error("Storyblok related-content request failed");
    }
    if (!related.ok) throw new Error(`Storyblok related-content request failed (${related.status})`);
    let relations: { stories?: ISbStoryData[] };
    try { relations = await related.json(); } catch { throw new Error("Invalid Storyblok related-content response"); }
    if (!relations || !Array.isArray(relations.stories) || relations.stories.some((story) => !story?.content || typeof story.uuid !== "string" || typeof story.full_slug !== "string")) throw new Error("Invalid Storyblok related-content response");
    stories.push(...relations.stories);
  }
  return stories;
}

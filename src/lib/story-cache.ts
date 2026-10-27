import { createHash } from "node:crypto";

export const storyblokCacheTag = "storyblok";
export const relatedContentCacheTag = "storyblok:related-content";

/** One tag per story across languages, bounded to Next's 256-character limit. */
export function storyCacheTag(slug: string): string {
  return `${storyblokCacheTag}:${createHash("sha256").update(slug).digest("hex")}`;
}

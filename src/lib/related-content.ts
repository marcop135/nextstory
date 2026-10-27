import type { ISbStoryData } from "@storyblok/react";
import { publicPathForSlug, normalizeStorySlug, isPageSlug } from "@/lib/story-path";

export type RelatedNote = { uuid: string; title: string; summary: string; href: string };
type Block = Record<string, unknown>;

export function relatedUuids(content: Block): string[] {
  if (!Array.isArray(content.body)) return [];
  return [...new Set(content.body.flatMap((block: Block) =>
    block.component === "related_content" && Array.isArray(block.stories)
      ? block.stories.filter((value): value is string => typeof value === "string" && /^[a-f0-9-]{36}$/i.test(value))
      : [],
  ))];
}

/** Keep editorial order; unresolved, deleted and non-note references are omitted. */
export function attachRelatedNotes(content: Block, stories: ISbStoryData[], language?: string): Block {
  if (!Array.isArray(content.body)) return content;
  const notes = new Map<string, RelatedNote>();
  for (const story of stories) {
    const fullSlug = normalizeStorySlug(story.full_slug);
    const slug = language === "de" && fullSlug?.startsWith("de/") ? fullSlug.slice(3) : fullSlug;
    if (story.content.component !== "learning_note" || !slug || !isPageSlug(slug) || typeof story.content.title !== "string") continue;
    notes.set(story.uuid, {
      uuid: story.uuid, title: story.content.title,
      summary: typeof story.content.summary === "string" ? story.content.summary : "",
      href: publicPathForSlug(slug, language === "de" ? "de" : "en"),
    });
  }
  return { ...content, body: content.body.map((block: Block) => block.component === "related_content"
    ? { ...block, resolved_notes: (Array.isArray(block.stories) ? block.stories : []).flatMap((uuid) => notes.has(uuid) ? [notes.get(uuid)!] : []) }
    : block) };
}

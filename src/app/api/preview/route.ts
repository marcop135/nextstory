import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";

import { normalizeStorySlug, parseStorySegments, publicPathForSlug } from "@/lib/story-path";
import { defaultLocale, isLocale, storyblokLanguage } from "@/lib/i18n";
import { fetchStory, type StoryResult } from "@/lib/fetch-story";

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");

  const expected = process.env.STORYBLOK_PREVIEW_SECRET?.trim();
  if (!expected || secret !== expected) {
    return new Response("Invalid preview secret", { status: 401 });
  }

  const slug = normalizeStorySlug(request.nextUrl.searchParams.get("slug") ?? "home");
  const locale = request.nextUrl.searchParams.get("lang") || defaultLocale;
  if (!slug || !isLocale(locale)) {
    return new Response("Invalid preview path or language", { status: 400 });
  }

  let result: StoryResult | null;
  try {
    result = await fetchStory(slug, storyblokLanguage(locale), { version: "draft" });
  } catch {
    return new Response("Preview content unavailable", { status: 503 });
  }
  if (!result) return new Response("Story not found", { status: 404 });
  const targetSlug = normalizeStorySlug(result.story.full_slug);
  if (!targetSlug) return new Response("Invalid story path", { status: 502 });

  const draft = await draftMode();
  draft.enable();

  const { slug: canonicalSlug } = parseStorySegments(targetSlug.split("/"));
  redirect(publicPathForSlug(canonicalSlug, locale));
}

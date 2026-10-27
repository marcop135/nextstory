import { revalidatePath, revalidateTag } from "next/cache";
import type { NextRequest } from "next/server";

import { CONFIG_SLUG, normalizeStorySlug, publicPathForSlug } from "@/lib/story-path";
import { locales } from "@/lib/i18n";
import { storyblokCacheTag, storyCacheTag, relatedContentCacheTag } from "@/lib/story-cache";

// Expire immediately: a publish must show on the next request, not after a stale serve.
const expireNow = { expire: 0 };

const contentActions = new Set(["published", "unpublished", "deleted", "moved"]);

function invalidPayload() {
  return Response.json({ ok: false, error: "Invalid webhook payload" }, { status: 400 });
}

export async function POST(request: NextRequest) {
  const secret =
    request.nextUrl.searchParams.get("secret") ||
    request.headers.get("x-revalidate-secret");
  const expected = process.env.STORYBLOK_REVALIDATE_SECRET?.trim();

  if (!expected || secret !== expected) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    const value: unknown = await request.json();
    if (!value || typeof value !== "object" || Array.isArray(value)) return invalidPayload();
    body = value as Record<string, unknown>;
  } catch {
    return invalidPayload();
  }

  if (body.action !== undefined) {
    if (typeof body.action !== "string") return invalidPayload();
    if (!contentActions.has(body.action)) {
      return Response.json({ ok: true, ignored: true });
    }
  }

  const slugs = new Set<string>();
  const currentSlug = body.full_slug === undefined ? body.slug : body.full_slug;
  if (currentSlug === undefined && body.old_full_slug !== undefined) return invalidPayload();
  for (const value of [currentSlug, body.old_full_slug]) {
    if (value === undefined) continue;
    const slug = normalizeStorySlug(value);
    if (!slug) return invalidPayload();
    slugs.add(slug);
  }

  const hasStoryId = typeof body.story_id === "number"
    && Number.isSafeInteger(body.story_id) && body.story_id > 0;
  if (!slugs.size && !hasStoryId) return invalidPayload();

  // Legacy ID-only events and moves without an old path must also expire old URLs.
  if (!slugs.size || (body.action === "moved" && body.old_full_slug === undefined)) {
    revalidateTag(storyblokCacheTag, expireNow);
    revalidatePath("/", "layout");
    return Response.json({ ok: true, revalidated: ["/"], scope: "all-stories" });
  }

  const paths = new Set<string>();
  // Reference consumers have a separate dependency tag, not a global page flush.
  revalidateTag(relatedContentCacheTag, expireNow);
  for (const slug of slugs) {
    revalidateTag(storyCacheTag(slug), expireNow);
    for (const locale of locales) paths.add(publicPathForSlug(slug, locale));
  }
  for (const path of paths) revalidatePath(path);
  // A new, removed, or moved story changes the published page list.
  revalidatePath("/sitemap.xml");
  // The config story feeds the shared header and footer on every route.
  if (slugs.has(CONFIG_SLUG)) revalidatePath("/", "layout");

  return Response.json({ ok: true, revalidated: [...paths], scope: "stories" });
}

import { cdnBaseUrl } from "@/lib/fetch-story";
import { mockPageSlugs } from "@/lib/mock-story";
import { hasStoryblokToken } from "@/lib/storyblok";
import { storyblokCacheTag } from "@/lib/story-cache";
import { isPageSlug, normalizeStorySlug } from "@/lib/story-path";

type StoryblokLink = { slug: string; is_folder: boolean; published: boolean; published_at?: string | null };

export type PublishedPage = { slug: string; publishedAt?: string };

/** Published page slugs from the Storyblok Links API; the seed stories offline or on failure. */
export async function publishedPageSlugs(): Promise<string[]> {
  return (await publishedPages()).map(({ slug }) => slug);
}

const seedPages = (): PublishedPage[] => mockPageSlugs.map((slug) => ({ slug }));

/** Published pages with their Storyblok `published_at`; seed pages carry no date. */
export async function publishedPages(): Promise<PublishedPage[]> {
  if (!hasStoryblokToken()) return seedPages();
  const params = new URLSearchParams({
    version: "published",
    token: process.env.STORYBLOK_DELIVERY_API_TOKEN!.trim(),
    per_page: "1000",
  });
  try {
    const res = await fetch(`${cdnBaseUrl()}/cdn/links?${params}`, {
      next: { revalidate: 3600, tags: [storyblokCacheTag] },
    });
    if (!res.ok) return seedPages();
    const data = (await res.json()) as { links?: Record<string, StoryblokLink> };
    return Object.values(data.links ?? {})
      .filter((link) => !link.is_folder && link.published)
      .flatMap((link) => {
        const slug = normalizeStorySlug(link.slug);
        if (slug === null || !isPageSlug(slug)) return [];
        return [link.published_at ? { slug, publishedAt: link.published_at } : { slug }];
      });
  } catch {
    // Fetch errors can contain the request URL, including its delivery token.
    return seedPages();
  }
}

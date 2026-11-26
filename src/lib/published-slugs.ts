import { cdnBaseUrl } from "@/lib/fetch-story";
import { mockPageSlugs } from "@/lib/mock-story";
import { hasStoryblokToken } from "@/lib/storyblok";
import { storyblokCacheTag } from "@/lib/story-cache";
import { isPageSlug, normalizeStorySlug } from "@/lib/story-path";

const linksPerPage = 1000;
/** Safety stop for the page loop; 50 pages is 50,000 stories. */
const maxLinkPages = 50;

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
    per_page: String(linksPerPage),
    // Without this the Links API omits published_at.
    include_dates: "1",
  });
  try {
    const links: StoryblokLink[] = [];
    for (let page = 1; page <= maxLinkPages; page++) {
      params.set("page", String(page));
      const res = await fetch(`${cdnBaseUrl()}/cdn/links?${params}`, {
        next: { revalidate: 3600, tags: [storyblokCacheTag] },
      });
      if (!res.ok) return seedPages();
      const data = (await res.json()) as { links?: Record<string, StoryblokLink> };
      links.push(...Object.values(data.links ?? {}));
      // The `total` header counts every link; stop once the pages fetched cover it.
      const total = Number(res.headers.get("total"));
      if (!Number.isFinite(total) || page * linksPerPage >= total) break;
    }
    return links
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

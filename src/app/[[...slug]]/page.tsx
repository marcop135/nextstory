import type { Metadata } from "next";
import { cookies, draftMode } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";

import JsonLd from "@/components/JsonLd";
import StoryRenderer from "@/components/StoryRenderer";
import type { PageBlok } from "@/components/types";
import { CAMPAIGN_DRAFT_COOKIE, CAMPAIGN_DRAFT_SLUG, campaignDraftSecret, readCampaignDraft } from "@/lib/campaign-draft";
import { fetchStory } from "@/lib/fetch-story";
import { hreflangAlternates, storyblokLanguage } from "@/lib/i18n";
import { INDEX_ROBOTS, SITE_NAME, notFoundTitle, ogImageFor, pageJsonLd } from "@/lib/site";
import { isPageSlug, parseStorySegments } from "@/lib/story-path";
import { markdownPathForPage } from "@/lib/agent-paths";

type PageProps = {
  params: Promise<{ slug?: string[] }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug: segments } = await params;
  const { locale, slug, pathname } = parseStorySegments(segments);
  const result = isPageSlug(slug)
    ? await fetchStory(slug, storyblokLanguage(locale))
    : null;
  if (!result) {
    return { title: { absolute: notFoundTitle(locale) } };
  }

  const content = result.story.content as PageBlok;
  const title =
    content.seo_title || result.story.name || "Next Story";
  const description = content.seo_description || undefined;

  const canonical = pathname ? `/${pathname}` : "/";

  return {
    title: { absolute: title },
    description,
    robots: INDEX_ROBOTS,
    alternates: {
      canonical,
      languages: hreflangAlternates(slug),
      types: { "text/markdown": markdownPathForPage(canonical) || "/content/index.md" },
    },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: locale === "de" ? "de_DE" : "en_US",
      title,
      description,
      url: canonical,
      images: [ogImageFor(locale)],
    },
  };
}

export default async function StoryPage({ params, searchParams }: PageProps) {
  const { slug: segments } = await params;
  const { locale, slug, pathname } = parseStorySegments(segments);
  if (!isPageSlug(slug)) notFound();
  const result = await fetchStory(slug, storyblokLanguage(locale));
  if (!result) notFound();
  const content = result.story.content as PageBlok;

  const { isEnabled: preview } = await draftMode();
  // Only the campaign page reads the request cookie, so other pages stay cacheable.
  const draftSecret = slug === CAMPAIGN_DRAFT_SLUG && !preview ? campaignDraftSecret() : null;
  const query = await searchParams;
  const campaignSelection = draftSecret
    ? {
        selected: readCampaignDraft((await cookies()).get(CAMPAIGN_DRAFT_COOKIE)?.value, draftSecret),
        locale,
        saved: query?.saved === "1",
        empty: query?.error === "empty",
      }
    : undefined;

  return (
    <>
      {preview || locale !== "en" ? <aside className="wrap toolbar" aria-label={locale === "de" ? "Seiteninformationen" : "Page information"}>
        {preview ? (
          <Link className="source-badge" href="/api/exit-preview">
            exit preview
          </Link>
        ) : null}
        {locale !== "en" ? (
          <span className="source-badge">locale: {locale}</span>
        ) : null}
      </aside> : null}
      <StoryRenderer story={result.story} source={result.source} preview={preview} campaignSelection={campaignSelection} />
      <JsonLd
        data={pageJsonLd({
          path: pathname ? `/${pathname}` : "/",
          name: content.seo_title || result.story.name || SITE_NAME,
          description: content.seo_description || undefined,
          locale,
        })}
      />
    </>
  );
}

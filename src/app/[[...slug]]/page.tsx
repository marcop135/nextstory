import type { Metadata } from "next";
import { draftMode } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";

import StoryRenderer from "@/components/StoryRenderer";
import type { PageBlok } from "@/components/types";
import { fetchStory } from "@/lib/fetch-story";
import { hreflangAlternates, storyblokLanguage } from "@/lib/i18n";
import { OG_IMAGE, SITE_NAME } from "@/lib/site";
import { isPageSlug, parseStorySegments } from "@/lib/story-path";
import { markdownPathForPage } from "@/lib/agent-paths";

type PageProps = {
  params: Promise<{ slug?: string[] }>;
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
    return { title: "Not found" };
  }

  const content = result.story.content as PageBlok;
  const title =
    content.seo_title || result.story.name || "Next Story";
  const description = content.seo_description || undefined;

  const canonical = pathname ? `/${pathname}` : "/";

  return {
    title: { absolute: title },
    description,
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
      images: [OG_IMAGE],
    },
  };
}

export default async function StoryPage({ params }: PageProps) {
  const { slug: segments } = await params;
  const { locale, slug } = parseStorySegments(segments);
  if (!isPageSlug(slug)) notFound();
  const result = await fetchStory(slug, storyblokLanguage(locale));
  if (!result) notFound();

  const { isEnabled: preview } = await draftMode();

  return (
    <>
      {preview || locale !== "en" ? <div className="wrap toolbar">
        {preview ? (
          <Link className="source-badge" href="/api/exit-preview">
            exit preview
          </Link>
        ) : null}
        {locale !== "en" ? (
          <span className="source-badge">locale: {locale}</span>
        ) : null}
      </div> : null}
      <StoryRenderer story={result.story} source={result.source} preview={preview} />
    </>
  );
}

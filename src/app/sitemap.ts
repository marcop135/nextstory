import type { MetadataRoute } from "next";

import { locales } from "@/lib/i18n";
import { publishedPageSlugs } from "@/lib/published-slugs";
import { SITE_URL } from "@/lib/site";
import { publicPathForSlug } from "@/lib/story-path";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await publishedPageSlugs();
  const paths = slugs.flatMap((slug) =>
    locales.map((locale) => publicPathForSlug(slug, locale)),
  );
  return [...new Set([...paths, "/privacy", "/for-agents"])].map((path) => ({
    url: path === "/" ? `${SITE_URL}/` : `${SITE_URL}${path}`,
  }));
}

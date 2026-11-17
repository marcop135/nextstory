import type { MetadataRoute } from "next";

import { locales } from "@/lib/i18n";
import { publishedPages } from "@/lib/published-slugs";
import { SITE_URL } from "@/lib/site";
import { publicPathForSlug } from "@/lib/story-path";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

const absolute = (path: string) => (path === "/" ? `${SITE_URL}/` : `${SITE_URL}${path}`);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = await publishedPages();
  const seen = new Set<string>();
  const entries: MetadataRoute.Sitemap = [];
  for (const { slug, publishedAt } of pages) {
    const languages = Object.fromEntries(
      locales.map((locale) => [locale, absolute(publicPathForSlug(slug, locale))]),
    );
    for (const locale of locales) {
      const path = publicPathForSlug(slug, locale);
      if (seen.has(path)) continue;
      seen.add(path);
      entries.push({
        url: absolute(path),
        ...(publishedAt ? { lastModified: publishedAt } : {}),
        alternates: { languages },
      });
    }
  }
  // English-only app routes: no German alternate.
  for (const path of ["/privacy", "/for-agents"]) {
    if (!seen.has(path)) entries.push({ url: absolute(path) });
  }
  return entries;
}

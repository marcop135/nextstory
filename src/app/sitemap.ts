import type { MetadataRoute } from "next";

import { defaultLocale, locales } from "@/lib/i18n";
import { publishedPages } from "@/lib/published-slugs";
import { PRIVACY_UPDATED, SITE_URL } from "@/lib/site";
import { publicPathForSlug } from "@/lib/story-path";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

const absolute = (path: string) => (path === "/" ? `${SITE_URL}/` : `${SITE_URL}${path}`);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = await publishedPages();
  const seen = new Set<string>();
  const entries: MetadataRoute.Sitemap = [];
  for (const { slug, publishedAt } of pages) {
    const languages = {
      ...Object.fromEntries(locales.map((locale) => [locale, absolute(publicPathForSlug(slug, locale))])),
      "x-default": absolute(publicPathForSlug(slug, defaultLocale)),
    };
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
  if (!seen.has("/privacy")) entries.push({ url: absolute("/privacy"), lastModified: PRIVACY_UPDATED });
  if (!seen.has("/for-agents")) entries.push({ url: absolute("/for-agents") });
  return entries;
}

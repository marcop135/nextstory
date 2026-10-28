import { defaultLocale, isLocale, type Locale } from "@/lib/i18n";

/** Global settings story (navigation, footer); never served as a page. */
export const CONFIG_SLUG = "config";

export function isPageSlug(slug: string): boolean {
  return slug !== CONFIG_SLUG && slug !== "pricing";
}

export type ParsedStoryPath = {
  locale: Locale;
  /** Storyblok story slug, e.g. `home` or `blocks`. */
  slug: string;
  /** Public pathname without leading slash (`""` for home). */
  pathname: string;
};

/** Accept CMS slugs, not URLs, query strings, or traversal segments. */
export function normalizeStorySlug(value: unknown): string | null {
  if (typeof value !== "string" || value.startsWith("//")) return null;
  if (/[\\?#%:\s\u0000-\u001f\u007f]/u.test(value)) return null;
  const slug = value.replace(/^\/|\/$/g, "") || "home";
  if (slug.split("/").some((part) => !part || part === "." || part === "..")) {
    return null;
  }
  return slug;
}

/**
 * Parse optional catch-all segments.
 * `/` → home · `/blocks` → blocks · `/de` → home (de) · `/de/blocks` → blocks (de)
 */
export function parseStorySegments(
  segments: string[] | undefined,
): ParsedStoryPath {
  const parts = segments?.filter(Boolean) ?? [];

  if (parts.length === 0) {
    return { locale: defaultLocale, slug: "home", pathname: "" };
  }

  if (isLocale(parts[0])) {
    const locale = parts[0];
    const rest = parts.slice(1);
    if (rest.length === 0) {
      return { locale, slug: "home", pathname: locale };
    }
    const slug = rest.join("/");
    return { locale, slug, pathname: [locale, ...rest].join("/") };
  }

  const slug = parts.join("/");
  return { locale: defaultLocale, slug, pathname: slug };
}

export function publicPathForSlug(slug: string, locale: Locale = defaultLocale): string {
  const base = slug === "home" || slug === "" || slug === CONFIG_SLUG ? "" : slug;
  if (locale === defaultLocale) {
    return base ? `/${base}` : "/";
  }
  return base ? `/${locale}/${base}` : `/${locale}`;
}

/** Site locales; `de` content comes from Storyblok field-level translations. */
export const locales = ["en", "de"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

/** Request header the proxy sets from the first path segment. */
export const LOCALE_HEADER = "x-site-locale";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/** Map site locale → Storyblok `language` query (default space language omitted). */
export function storyblokLanguage(locale: Locale): string | undefined {
  if (locale === defaultLocale) return undefined;
  return locale;
}

export function hreflangAlternates(path: string): Record<string, string> {
  const normalized = path === "home" || path === "" ? "" : `/${path}`;
  return {
    en: normalized || "/",
    de: normalized ? `/de${normalized}` : "/de",
    "x-default": normalized || "/",
  };
}

/** Locale from the first path segment: `/de/blocks` → `de`, anything else → default. */
export function localeForPathname(pathname: string): Locale {
  const first = pathname.split("/")[1] ?? "";
  return isLocale(first) ? first : defaultLocale;
}

/** English-only app routes outside the Storyblok story tree. */
const APP_ROUTES = ["/privacy", "/for-agents"];

/** The same page in the other language; routes outside the story tree fall back to that locale's home. */
export function switchLocalePath(pathname: string, target: Locale): string {
  const current = localeForPathname(pathname);
  const rest = current === defaultLocale ? pathname : pathname.slice(current.length + 1) || "/";
  const isStoryRoute = !APP_ROUTES.some((route) => rest.startsWith(route));
  const base = isStoryRoute ? rest : "/";
  if (target === defaultLocale) return base;
  return base === "/" ? `/${target}` : `/${target}${base}`;
}

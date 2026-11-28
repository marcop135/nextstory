export const SITE_URL = "https://nextstory.marcopontili.com";
export const SITE_NAME = "Next Story";
export const REPO_URL = "https://github.com/marcop135/nextstory";
export const NEXTFOLD_URL = "https://nextfold.marcopontili.com";
/** Shown on the privacy page and sent as its sitemap lastmod. */
export const PRIVACY_UPDATED = "2026-11-22";

/** Document title for a missing page. Long enough for the metadata bound, and noindex. */
export const notFoundTitle = (locale: string) =>
  locale === "de" ? "Seite nicht gefunden · Next Story" : "Page not found · Next Story demo";
export const SITE_DESCRIPTION =
  "Explore Storyblok blocks in Next.js App Router: server rendering, draft preview, publish webhooks, localized caching, and read-only content access.";
export const SITE_DESCRIPTION_DE =
  "Storyblok-Blöcke im Next.js App Router: Server-Rendering, Entwurfsvorschau, Publish-Webhooks, lokalisierter Cache und lesender Zugriff auf Inhalte.";

export const siteDescription = (locale: string) =>
  locale === "de" ? SITE_DESCRIPTION_DE : SITE_DESCRIPTION;

export const OG_IMAGE = {
  url: "/og.jpg",
  width: 1200,
  height: 630,
  alt: "Next Story: Next.js and Storyblok headless CMS demo",
};

export const OG_IMAGE_DE = {
  ...OG_IMAGE,
  alt: "Next Story: Headless-CMS-Demo mit Next.js und Storyblok",
};

export const ogImageFor = (locale: string) => (locale === "de" ? OG_IMAGE_DE : OG_IMAGE);

/** Indexable pages set this themselves, so a 404 carries only Next's `noindex`. */
export const INDEX_ROBOTS = {
  index: true,
  follow: true,
  "max-snippet": -1,
  "max-image-preview": "large",
  "max-video-preview": -1,
} as const;

export const AUTHOR = {
  name: "Marco Pontili",
  url: "https://marcopontili.com",
  email: "marco.pontili@gmail.com",
};

export const jsonLdFor = (inLanguage: string, description = siteDescription(inLanguage)) => ({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: `${SITE_URL}/`,
      name: SITE_NAME,
      description,
      inLanguage,
      publisher: { "@id": `${SITE_URL}/#author` },
      about: { "@id": `${SITE_URL}/#code` },
    },
    {
      "@type": "SoftwareSourceCode",
      "@id": `${SITE_URL}/#code`,
      name: "Next Story",
      description: SITE_DESCRIPTION,
      url: `${SITE_URL}/`,
      codeRepository: REPO_URL,
      programmingLanguage: "TypeScript",
      runtimePlatform: "Next.js",
      license: "https://opensource.org/license/mit",
      author: { "@id": `${SITE_URL}/#author` },
    },
    {
      "@type": "Person",
      "@id": `${SITE_URL}/#author`,
      name: AUTHOR.name,
      url: AUTHOR.url,
      sameAs: ["https://github.com/marcop135"],
    },
  ],
});

const absoluteUrl = (path: string) => (path === "/" ? `${SITE_URL}/` : `${SITE_URL}${path}`);

/**
 * Per-page JSON-LD: a WebPage linked to the site graph's `#website`, plus a
 * BreadcrumbList (locale home > page) on every page except a locale home.
 */
export function pageJsonLd({
  path,
  name,
  description,
  locale,
}: {
  path: string;
  name: string;
  description?: string;
  locale: string;
}) {
  const url = absoluteUrl(path);
  const homePath = locale === "de" ? "/de" : "/";
  const isHome = path === homePath;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name,
        description,
        inLanguage: locale,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        ...(isHome ? {} : { breadcrumb: { "@id": `${url}#breadcrumb` } }),
      },
      ...(isHome
        ? []
        : [
            {
              "@type": "BreadcrumbList",
              "@id": `${url}#breadcrumb`,
              itemListElement: [
                { "@type": "ListItem", position: 1, name: SITE_NAME, item: absoluteUrl(homePath) },
                { "@type": "ListItem", position: 2, name, item: url },
              ],
            },
          ]),
    ],
  };
}

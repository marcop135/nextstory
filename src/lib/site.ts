export const SITE_URL = "https://nextstory.marcopontili.com";
export const SITE_NAME = "Next Story";
export const REPO_URL = "https://github.com/marcop135/nextstory";
export const SITE_DESCRIPTION =
  "Explore Storyblok blocks in Next.js App Router: server rendering, draft preview, publish webhooks, localized caching, and read-only content access.";
export const SITE_DESCRIPTION_DE =
  "Storyblok-Blöcke im Next.js App Router: Server-Rendering, Entwurfsvorschau, Publish-Webhooks, lokalisierter Cache und lesender Zugriff auf Inhalte.";

export const siteDescription = (locale: string) =>
  locale === "de" ? SITE_DESCRIPTION_DE : SITE_DESCRIPTION;

export const OG_IMAGE = {
  url: "/og.png",
  width: 1200,
  height: 630,
  alt: "Next Story: Next.js and Storyblok headless CMS demo",
};

export const OG_IMAGE_DE = {
  ...OG_IMAGE,
  alt: "Next Story: Headless-CMS-Demo mit Next.js und Storyblok",
};

export const ogImageFor = (locale: string) => (locale === "de" ? OG_IMAGE_DE : OG_IMAGE);

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

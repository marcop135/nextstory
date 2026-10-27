import type { Metadata } from "next";
import { Source_Sans_3 } from "next/font/google";
import Script from "next/script";
import type { ReactNode } from "react";

import MatomoRouteTracker from "@/components/MatomoRouteTracker";
import AgentTools from "@/components/AgentTools";
import { SiteFooter, SiteHeader, type ChromeCopy } from "@/components/SiteChrome";
import StoryblokProvider from "@/components/StoryblokProvider";
import {
  OG_IMAGE,
  REPO_URL,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  jsonLdFor,
} from "@/lib/site";
import { defaultLocale, locales, type Locale } from "@/lib/i18n";
import { fetchSiteConfig, requestLocale } from "@/lib/site-config";

import "./globals.css";

const sans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Next Story: Next.js and Storyblok headless CMS demo",
    template: "%s · Next Story",
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: "Marco Pontili", url: "https://marcopontili.com" }],
  robots: {
    index: true,
    follow: true,
    "max-snippet": -1,
    "max-image-preview": "large",
    "max-video-preview": -1,
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_US",
    title: "Next Story: Next.js and Storyblok headless CMS demo",
    description: SITE_DESCRIPTION,
    url: "/",
    images: [OG_IMAGE],
  },
  twitter: { card: "summary_large_image" },
};

const fallbackNav = [
  { _uid: "nav-how", label: "How it works", de: "So funktioniert es", href: "/how-it-works" },
  { _uid: "nav-blocks", label: "Blocks", de: "Blöcke", href: "/blocks" },
  { _uid: "nav-pricing", label: "Pricing", de: "Preise", href: "/pricing" },
];

const fallbackFooterNav = [
  { _uid: "footer-source", label: "View the source", de: "Quellcode ansehen", href: REPO_URL },
  { _uid: "footer-docs", label: "Documentation", de: "Dokumentation", href: `${REPO_URL}/tree/main/docs` },
  { _uid: "footer-license", label: "MIT license", de: "MIT-Lizenz", href: `${REPO_URL}/blob/main/LICENSE` },
  { _uid: "footer-privacy", label: "Privacy", de: "Datenschutz", href: "/privacy" },
  { _uid: "footer-agents", label: "For agents", de: "Für Agents", href: "/for-agents" },
  { _uid: "footer-llms", label: "llms.txt", de: "llms.txt", href: "/llms.txt" },
];

/** Header and footer copy for every locale, so client navigation can switch language without a reload. */
async function chromeCopy(): Promise<Record<Locale, ChromeCopy>> {
  const entries = await Promise.all(
    locales.map(async (locale) => {
      const config = await fetchSiteConfig(locale);
      const prefix = locale === defaultLocale ? "" : `/${locale}`;
      const nav = config?.header_nav?.length
        ? config.header_nav.map(({ _uid, label, href }) => ({ _uid, label, href }))
        : fallbackNav.map(({ _uid, label, de, href }) => ({
            _uid, label: locale === "de" ? de : label, href: prefix + href,
          }));
      const footerNav = config?.footer_nav?.length
        ? config.footer_nav.map(({ _uid, label, href }) => ({ _uid, label, href }))
        : fallbackFooterNav.map(({ _uid, label, de, href }) => ({
            _uid, label: locale === "de" ? de : label, href,
          }));
      const footerNote = config?.footer_note || "Next Story demo · Next.js App Router · Storyblok";
      return [locale, { nav, footerNote, footerNav }] as const;
    }),
  );
  return Object.fromEntries(entries) as Record<Locale, ChromeCopy>;
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = await requestLocale();
  const copy = await chromeCopy();
  return (
    <StoryblokProvider>
      <html lang={locale} data-scroll-behavior="smooth" className={sans.variable}>
        <body>
          <SiteHeader copy={copy} />
          {children}
          <SiteFooter copy={copy} />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFor(locale)) }}
          />
          <Script src="/matomo.js" strategy="afterInteractive" />
          <MatomoRouteTracker />
          <AgentTools />
        </body>
      </html>
    </StoryblokProvider>
  );
}
